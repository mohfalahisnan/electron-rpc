# @mavolostudio/electron-rpc

## Introduction

A type-safe RPC (Remote Procedure Call) library for Electron applications, built with Zod and TypeScript. It simplifies communication between the main process and renderer process by ensuring type safety and code completion.

> **Not gRPC, Just IPC**
>
> Unlike gRPC, RMI, or remote object proxies, this library **does not** give the renderer direct access to Node.js functions or objects. It strictly uses Electron's standard IPC to pass serializable messages (JSON).
>
> This design ensures that **no backend code is executed directly by the renderer**. The renderer simply requests a predefined procedure by name (string), and the main process decides how to handle it. This architecture maintains the security isolation model of Electron, preventing arbitrary code execution vulnerabilities common in "remote object" patterns.

> **⚠️ WARNING: EARLY DEVELOPMENT**
>
> This package is currently in early development and is primarily intended for internal use within our applications. API signatures and features may change without notice. Please use with caution in production environments.

## Features

- 🔒 **Type-Safe**: End-to-end type safety from main to renderer.
- ✅ **Validation**: Runtime input/output validation using Zod.
- 🧩 **Modular**: Router-based architecture similar to tRPC.
- 🛡️ **Secure**: Built-in channel whitelisting and context isolation support.

## Installation

```bash
pnpm add @mavolostudio/electron-rpc
```

## Usage

### 1. Define your Router (Shared)

Create a shared file (e.g., `packages/shared/src/api.ts`) that defines your RPC router.

```typescript
import { z } from "zod";
import { createProcedure, type RouterHandlers } from "@mavolostudio/electron-rpc";

// Define procedures
export const appRouter = {
  getSystemInfo: createProcedure()
    .input(z.void())
    .output(z.object({ platform: z.string(), version: z.string() })),
    
  echo: createProcedure()
    .input(z.object({ message: z.string() }))
    .output(z.string())
    .use(async ({ next, input }) => {
      console.log("Middleware received:", input);
      return next();
    })
};

export type AppRouter = typeof appRouter;
```

### 2. Implement Handlers (Main Process)

In your Electron main process, implement the logic for the router.

```typescript
import { registerIpcRouter } from "@mavolostudio/electron-rpc";
import { appRouter, type AppRouter } from "./shared/api";

const handlers: RouterHandlers<AppRouter, {}> = {
  getSystemInfo: async () => {
    return {
      platform: process.platform,
      version: process.versions.electron
    };
  },
  
  echo: async ({}, input) => {
    return `Echo: ${input.message}`;
  }
};

// Register the router
registerIpcRouter("ipc-channel", appRouter, handlers, () => ({}));
```

### 3. Expose API (Preload Script)

Expose the RPC client to the renderer process safely.

```typescript
import { exposeRpc } from "@mavolostudio/electron-rpc/expose";

exposeRpc({
  name: "api", // Window object key (window.api)
  whitelist: ["ipc-channel"] // Security whitelist
});
```

### 4. Call from Renderer

Use the type-safe client in your React/Vue/Svelte app.

```typescript
import { createClient } from "@mavolostudio/electron-rpc/client";
import type { AppRouter } from "./shared/api";

// Create client
const client = createClient<AppRouter>("ipc-channel", (payload) => 
  window.api.invoke("ipc-channel", payload)
);

// Use client
const info = await client.getSystemInfo();
console.log(info.platform); // Typed as string

const response = await client.echo({ message: "Hello" });
console.log(response); // "Echo: Hello"
```

## API Reference

### `createProcedure()`

Builder for defining an RPC procedure.

- `.input(schema)`: Sets the Zod schema for input validation.
- `.output(schema)`: Sets the Zod schema for output validation.
- `.use(middleware)`: Adds middleware to the procedure.

### `registerIpcRouter(channel, router, handlers, createContext, plugins?)`

Registers the router handlers in the main process.

- `channel`: The IPC channel name.
- `router`: The router definition object.
- `handlers`: Implementation of the router methods.
- `createContext`: Function to create context for each request.

### `exposeRpc(config)`

Exposes the `invoke` method to the renderer via `contextBridge`.

- `config.name`: The name of the global object (default: "ipc").
- `config.whitelist`: Optional array of allowed channels.

### `createClient<Router>(channel, invoker)`

Creates a proxy client for the renderer.

- `channel`: The IPC channel to communicate with.
- `invoker`: Function that actually sends the IPC message (usually `window.api.invoke`).
