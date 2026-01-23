import { ipcMain } from "electron";
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
 * @param handlers - Object mapping procedure names to handler implementations
 * @param createContext - Function to create context for each request
 * @param plugins - Optional array of plugins for lifecycle hooks
 */
export function registerIpcRouter<
  TRouter extends Record<string, Procedure<TContext, any, any>>,
  TContext = unknown,
>(
  channel: string,
  router: TRouter,
  handlers: {
    [K in keyof TRouter]: (
      ctx: TContext,
      input: TRouter[K] extends Procedure<any, infer TInput, any>
        ? TInput
        : never,
    ) => Promise<
      TRouter[K] extends Procedure<any, any, infer TOutput> ? TOutput : never
    >;
  },
  createContext: () => Promise<TContext> | TContext,
  plugins: Plugin[] = [],
) {
  ipcMain.handle(channel, async (event, { key, input }) => {
    try {
      // Check if the key exists in the router
      const procedure = router[key];
      if (!procedure) {
        throw new Error(`Procedure "${key}" not found`);
      }

      // Call plugin onRequest hooks
      for (const plugin of plugins) {
        await plugin.onRequest?.({ key, input });
      }

      // Create context
      const ctx = await createContext();

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

      // Get the handler
      const handler = handlers[key];
      if (!handler) {
        throw new Error(`Handler for "${key}" not found`);
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
      for (const plugin of plugins) {
        await plugin.onResponse?.({
          key,
          input: validatedInput,
          output: validatedOutput,
        });
      }

      return { data: validatedOutput };
    } catch (err: any) {
      // Call plugin onError hooks
      for (const plugin of plugins) {
        await plugin.onError?.({ key, error: err });
      }

      // Handle known error types
      if (err && typeof err === "object" && "code" in err) {
        const ipcError = err as IpcError;
        return { error: ipcError };
      }

      // Log internal errors but don't expose details to client
      console.error(`[Electron RPC] Error in procedure "${key}":`, err);

      const error: IpcError = {
        code: "INTERNAL",
        message: "Internal server error",
      };
      return { error };
    }
  });
}
