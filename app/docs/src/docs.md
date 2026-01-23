# @mavolostudio/electron-rpc

## Introduction

A type-safe RPC (Remote Procedure Call) library for Electron applications. It simplifies communication between the main process and renderer process by ensuring type safety and code completion using a natural, proxy-based API.

> **Not gRPC, Just IPC**
>
> Unlike gRPC, RMI, or remote object proxies, this library **does not** give the renderer direct access to Node.js functions or objects. It strictly uses Electron's standard IPC to pass serializable messages (JSON).
>
> This design ensures that **no backend code is executed directly by the renderer**. The renderer simply requests a predefined procedure by name (string), and the main process decides how to handle it.

> **⚠️ WARNING: EARLY DEVELOPMENT**
>
> This package is currently in early development. API signatures and features may change without notice.

## Features

- 🔒 **Type-Safe**: End-to-end type safety from main to renderer.
- 🚀 **Proxy-Based**: Call server methods as if they were local functions.
- 🧩 **Flexible**: Supports nested API structures (e.g. `api.users.get(...)`).
- 🛡️ **Secure**: Built-in channel whitelisting and context isolation support.

## Installation

```bash
pnpm add @mavolostudio/electron-rpc
```

## Usage

### 1. Define Context (Shared/Main)

Define the context that will be available to all procedures.

```typescript
// src/main/context.ts
import { IpcMainInvokeEvent } from 'electron';

export type AppContext = {
  user: { id: string; role: 'admin' | 'user' };
};

export async function createContext(event: IpcMainInvokeEvent): Promise<AppContext> {
  return {
    user: { id: 'user-1', role: 'admin' }, // Load from session/token
  };
}
```

### 2. Define Procedures (Shared/Main)

Use the `ProcedureBuilder` to define your API with validation and middleware.

```typescript
// src/main/router.ts
import { createProcedure, z } from '@mavolostudio/electron-rpc';
import type { AppContext } from './context';

const t = createProcedure<AppContext>();

// Middleware example
const logger = t.use(async ({ input }, next) => {
  console.log('Request:', input);
  return next();
});

export const router = {
  greeting: t
    .input(z.object({ name: z.string() }))
    .output(z.string())
    .use(async ({ ctx }, next) => {
      // Access context before handler
      console.log('User:', ctx.user.id);
      return next();
    })
    .query(async (ctx, input) => {
      return `Hello, ${input.name}!`;
    }),
    
  deleteData: t
    .input(z.object({ id: z.string() }))
    .output(z.boolean())
    .use(async ({ ctx }, next) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      return next();
    })
    .mutation(async (ctx, input) => {
      // Perform dangerous action
      return true;
    })
};

export type AppRouter = typeof router;
```

### 3. Register Router (Main Process)

Register the router with the IPC channel.

```typescript
// src/main/ipc.ts
import { registerIpcRouter } from '@mavolostudio/electron-rpc';
import { router } from './router';
import { createContext } from './context';

// Listen on "rpc" channel
registerIpcRouter('rpc', router, createContext);
```

### 4. Create Client (Renderer Process)

#### Option A: TanStack Query (Recommended)

Wrap the proxy with our TanStack Query adapter for auto-generated hooks.

```typescript
// src/renderer/client.ts
import { createProxy } from '@mavolostudio/electron-rpc/client';
import { tanstackProcedures } from '@mavolostudio/electron-rpc/tanstack-procedures';
import { QueryClient } from '@tanstack/react-query';
import type { AppRouter } from '../../main/router';

const queryClient = new QueryClient();

// Create base proxy
const rpc = createProxy<AppRouter>((path, args) => 
  window.rpc.invoke('rpc', { key: path[0], input: args[0] })
);

// Create TanStack wrapper
export const client = tanstackProcedures(rpc, queryClient);
```

**Usage in React:**

```tsx
function App() {
  const { data, isLoading } = client.greeting.useQuery({ name: 'Alice' });
  const mutation = client.deleteData.useMutation();

  if (isLoading) return <div>Loading...</div>;

  return (
    <button onClick={() => mutation.mutate({ id: '123' })}>
      {data}
    </button>
  );
}
```

#### Option B: Direct RPC

You can also use the RPC client directly.

```typescript
// src/renderer/client.ts
import { createProxy } from '@mavolostudio/electron-rpc/client';
import type { AppRouter } from '../../main/router';

export const rpc = createProxy<AppRouter>((path, args) => 
  window.rpc.invoke('rpc', { key: path[0], input: args[0] })
);

// Usage
const result = await rpc.greeting({ name: 'Bob' });
```

## API Reference

### `createProcedure<Context>()`
Creates a builder for defining procedures with input/output validation and middleware.

### `registerIpcRouter(channel, router, createContext, plugins?)`
Registers a router object to handle IPC requests.
- `channel`: IPC channel name.
- `router`: Object containing procedures.
- `createContext`: Function generating context for each request.
- `plugins`: Optional array of lifecycle plugins.

### `tanstackProcedures(client, queryClient)`
Wraps the RPC client to provide `useQuery`, `useMutation`, and `getQueryKey`.

### `exposeRpc(config)`
Exposes the secure bridge in the preload script.
- `config.name`: Global variable name (e.g., "rpc").
- `config.whitelist`: Allowed channels.
