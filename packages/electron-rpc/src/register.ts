import { ipcMain, type IpcMainInvokeEvent } from "electron";
import { ZodError } from "zod";
import type { IpcError } from "./error";
import { executeMiddlewares } from "./execute";
import type { Procedure } from "./procedure-builder";
import type { Plugin } from "./types";

export function registerIpcMain<T>(channel: string, api: T) {
  ipcMain.handle(channel, async (event, { path, args }) => {
    try {
      let current: any = api;
      for (const segment of path) {
        if (typeof current !== "object" || current === null) {
          throw new Error(`Path ${path.join(".")} not found`);
        }
        current = current[segment];
      }

      if (typeof current !== "function") {
        throw new Error(`Path ${path.join(".")} is not a function`);
      }

      const result = await current(...args);
      return { data: result };
    } catch (err: any) {
      console.error(`[Electron RPC] Error at ${path?.join(".")}:`, err);
      // Serialize error if possible, or return a standard error object
      return {
        error: {
          message: err.message,
          code: err.code,
          issues: err.issues, // For ZodError compatibility
          // Add other properties as needed
        },
      };
    }
  });
}

/**
 * Register a router with procedures that support context, middleware, and validation
 *
 * @param channel - IPC channel name
 * @param router - Object mapping procedure names to procedure definitions
 * @param handlersOrContext - Either handlers object or context creation function (if using inline handlers)
 * @param createContextOrPlugins - Context creation function or plugins array
 * @param plugins - Optional array of plugins for lifecycle hooks
 */
export type ProcedureRouterRecord<TContext = unknown> = {
  [key: string]:
    | Procedure<TContext, any, any>
    | ProcedureRouterRecord<TContext>;
};

export function registerIpcRouter<
  TRouter extends ProcedureRouterRecord<TContext>,
  TContext = unknown,
>(
  channel: string,
  router: TRouter,
  handlersOrContext:
    | Record<string, any>
    | ((
        event: IpcMainInvokeEvent,
        input: unknown,
      ) => Promise<TContext> | TContext),
  createContextOrPlugins?:
    | ((
        event: IpcMainInvokeEvent,
        input: unknown,
      ) => Promise<TContext> | TContext)
    | Plugin[],
  plugins?: Plugin[],
) {
  // Determine the actual parameters based on what was passed
  let handlers: any;
  let createContext: (
    event: IpcMainInvokeEvent,
    input: any,
  ) => Promise<TContext> | TContext;
  let pluginList: Plugin[];

  if (typeof handlersOrContext === "function") {
    // handlersOrContext is createContext, no separate handlers
    handlers = {};
    createContext = handlersOrContext as (
      event: IpcMainInvokeEvent,
      input: any,
    ) => Promise<TContext> | TContext;
    pluginList = (createContextOrPlugins as Plugin[]) || [];
  } else {
    // handlersOrContext is handlers object
    handlers = handlersOrContext;
    createContext = createContextOrPlugins as (
      event: IpcMainInvokeEvent,
      input: any,
    ) => Promise<TContext> | TContext;
    pluginList = plugins || [];
  }

  ipcMain.handle(channel, async (event, { path, input }) => {
    try {
      // Traverse the router to find the procedure
      let current: any = router;
      const keyPath = Array.isArray(path) ? path : [path]; // Handle string or array path

      for (const segment of keyPath) {
        if (!current || typeof current !== "object") {
          throw new Error(`Path "${keyPath.join(".")}" not found`);
        }
        current = current[segment];
      }

      const procedure = current as Procedure<TContext, any, any>;

      if (!procedure || !procedure.input || !procedure.output) {
        throw new Error(`Path "${keyPath.join(".")}" is not a valid procedure`);
      }

      // Call plugin onRequest hooks
      const key = keyPath.join(".");
      for (const plugin of pluginList) {
        await plugin.onRequest?.({ key, input });
      }

      // Create context with input - passing raw input before validation
      const ctx = await createContext(event, input);

      // Validate input
      let validatedInput: any;
      try {
        validatedInput = procedure.input.parse(input);
      } catch (err) {
        if (err instanceof ZodError) {
          const error: IpcError = {
            code: "INVALID_INPUT",
            issues: err.issues,
          };
          return { error };
        }
        throw err;
      }

      // Get the handler - either from inline handler or handlers object (handlers support flattened or nested? complex)
      // For now, assume inline handlers
      const handler = procedure.handler;
      if (!handler) {
        throw new Error(
          `Handler for "${key}" not found (inline handlers required for nested routers)`,
        );
      }

      // Execute middlewares and handler
      const result = await executeMiddlewares(
        procedure.middlewares,
        ctx,
        validatedInput,
        handler,
      );

      // Validate output
      const validatedOutput = procedure.output.parse(result);

      // Call plugin onResponse hooks
      for (const plugin of pluginList) {
        await plugin.onResponse?.({
          key,
          input: validatedInput,
          output: validatedOutput,
        });
      }

      return { data: validatedOutput };
    } catch (err: any) {
      const key = Array.isArray(path) ? path.join(".") : path;
      // ... (existing error handling)
      // Call plugin onError hooks
      for (const plugin of pluginList) {
        await plugin.onError?.({ key, error: err });
      }

      // Handle known error types
      if (err && typeof err === "object" && "code" in err) {
        const ipcError = err as IpcError;
        return { error: ipcError };
      }

      console.error(`[Electron RPC] Error in procedure "${key}":`, err);

      const error: IpcError = {
        code: "INTERNAL",
        message: "Internal server error",
      };
      return { error };
    }
  });
}
