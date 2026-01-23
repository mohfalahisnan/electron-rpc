import { ipcMain } from "electron";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { error } from "../src/error";
import { createProcedure } from "../src/procedure-builder";
import { registerIpcRouter } from "../src/register";

// Mock Electron ipcMain
const ipcHandlers = new Map<string, Function>();
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn((channel, handler) => {
      ipcHandlers.set(channel, handler);
    }),
  },
}));

describe("registerIpcRouter", () => {
  beforeEach(() => {
    ipcHandlers.clear();
    vi.clearAllMocks();
  });

  const mockContext = { user: "test-user" };
  const createContext = vi.fn().mockResolvedValue(mockContext);

  const t = createProcedure<typeof mockContext>();

  const testRouter = {
    getUser: t
      .input(z.object({}))
      .output(z.object({ name: z.string() }))
      .use()
      .build(),
    greet: t
      .input(z.object({ name: z.string() }))
      .output(z.string())
      .use()
      .build(),
    adminOnly: t
      .input(z.object({}))
      .output(z.void())
      .use(async ({ ctx }, next) => {
        if (ctx.user !== "admin") throw error.forbidden();
        return next();
      })
      .build(),
  };

  const handlers = {
    getUser: async (ctx: any) => ({ name: ctx.user }),
    greet: async (_: any, input: { name: string }) => `Hello ${input.name}`,
    adminOnly: async () => {},
  };

  it("should register ipc handler", () => {
    registerIpcRouter<typeof testRouter, typeof mockContext>(
      "test-channel",
      testRouter,
      handlers,
      createContext,
    );

    expect(ipcMain.handle).toHaveBeenCalledWith(
      "test-channel",
      expect.any(Function),
    );
  });

  it("should handle successful request", async () => {
    registerIpcRouter<typeof testRouter, typeof mockContext>(
      "test-channel",
      testRouter,
      handlers,
      createContext,
    );
    const handle = ipcHandlers.get("test-channel");
    expect(handle).toBeDefined();

    const result = await handle!(
      {},
      { key: "greet", input: { name: "World" } },
    );
    expect(result).toEqual({ data: "Hello World" });
  });

  it("should handle context creation", async () => {
    registerIpcRouter<typeof testRouter, typeof mockContext>(
      "test-channel",
      testRouter,
      handlers,
      createContext,
    );
    const handle = ipcHandlers.get("test-channel");

    const result = await handle!({}, { key: "getUser", input: {} });
    expect(result).toEqual({ data: { name: "test-user" } });
    expect(createContext).toHaveBeenCalled();
  });

  it("should return error for unknown key", async () => {
    registerIpcRouter<typeof testRouter, typeof mockContext>(
      "test-channel",
      testRouter,
      handlers,
      createContext,
    );
    const handle = ipcHandlers.get("test-channel");

    const result = await handle!({}, { key: "unknown", input: {} });
    expect(result.error.code).toBe("INTERNAL");
    expect(result.error.message).toBe("Internal server error");
  });

  it("should return Zod validation error for invalid input", async () => {
    registerIpcRouter<typeof testRouter, typeof mockContext>(
      "test-channel",
      testRouter,
      handlers,
      createContext,
    );
    const handle = ipcHandlers.get("test-channel");

    const result = await handle!({}, { key: "greet", input: { name: 123 } });
    expect(result.error.code).toBe("INVALID_INPUT");
    expect(result.error.issues).toBeDefined();
  });

  it("should handle middleware errors (e.g., forbidden)", async () => {
    registerIpcRouter<typeof testRouter, typeof mockContext>(
      "test-channel",
      testRouter,
      handlers,
      createContext,
    );
    const handle = ipcHandlers.get("test-channel");

    const result = await handle!({}, { key: "adminOnly", input: {} });
    expect(result.error.code).toBe("FORBIDDEN");
  });

  it("should handle plugin hooks", async () => {
    const plugin = {
      name: "test-plugin",
      onRequest: vi.fn(),
      onResponse: vi.fn(),
    };

    registerIpcRouter<typeof testRouter, typeof mockContext>(
      "test-channel",
      testRouter,
      handlers,
      createContext,
      [plugin],
    );
    const handle = ipcHandlers.get("test-channel");

    await handle!({}, { key: "greet", input: { name: "Plugin" } });

    expect(plugin.onRequest).toHaveBeenCalledWith({
      key: "greet",
      input: { name: "Plugin" },
    });
    expect(plugin.onResponse).toHaveBeenCalledWith({
      key: "greet",
      input: { name: "Plugin" },
      output: "Hello Plugin",
    });
  });
  it("should mask internal server errors", async () => {
    const secretRouter = {
      secret: t
        .input(z.object({}))
        .output(z.void())
        .use(async () => {
          throw new Error("Database password check failed");
        })
        .build(),
    };

    const secretHandlers = {
      secret: async () => {},
    };

    registerIpcRouter<typeof secretRouter, typeof mockContext>(
      "test-channel-secret",
      secretRouter,
      secretHandlers,
      createContext,
    );
    const handle = ipcHandlers.get("test-channel-secret");

    // Spy on console.error to avoid polluting output and verify logging
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await handle!({}, { key: "secret", input: {} });

    expect(result.error.code).toBe("INTERNAL");
    expect(result.error.message).toBe("Internal server error");
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
