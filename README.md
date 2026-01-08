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

### 1. Define your API (Shared/Main)

Define your API implementation as a plain object or class in the main process.

```typescript
// src/main/api.ts
const db = {
    users: {
        find: (id: string) => ({ id, name: "Alice" })
    }
}

export const api = {
    // Nested routes supported
    users: {
        get: async (id: string) => {
            return db.users.find(id)
        },
        create: async (name: string) => {
            return { id: "123", name }
        }
    },
    // Top-level methods supported
    version: async () => "1.0.0"
}

// Export the type for the client
export type AppApi = typeof api
```

### 2. Register Handler (Main Process)

Register the API object to handle IPC requests.

```typescript
// src/main/ipc.ts
import { registerIpcMain } from "@mavolostudio/electron-rpc"
import { api } from "./api"

// Listen on "rpc" channel
registerIpcMain("rpc", api)
```

### 3. Expose Bridge (Preload Script)

Expose the RPC bridge to the renderer process safely.

```typescript
// src/preload/index.ts
import { exposeRpc } from "@mavolostudio/electron-rpc/expose"

exposeRpc({
  name: "rpc",      // Window object key (window.rpc)
  whitelist: ["rpc"] // Allow only this channel
})
```

### 4. Create Client (Renderer Process)

Create the type-safe client in your frontend.

```typescript
// src/renderer/client.ts
import { createProxy } from "@mavolostudio/electron-rpc/client"
import type { AppApi } from "../../main/api"

// Create the proxy
export const client = createProxy<AppApi>((path, args) => 
    // Send request to main process
    window.rpc.invoke("rpc", { path, args })
)
```

### 5. Call API

Use the client naturally. Types are inferred automatically!

```typescript
// src/renderer/App.tsx
import { client } from "./client"

async function loadUser() {
    // Looks like valid local function call!
    const user = await client.users.get("123")
    console.log(user.name) // Typed as string
    
    const ver = await client.version()
}
```

## Integration

### TanStack Query (React Query)

We provide a built-in adapter for TanStack Query that adds `useQuery`, `useMutation`, and `getQueryKey` methods to every function in your API.

#### Setup

```typescript
// src/renderer/client.ts
import { createProxy } from "@mavolostudio/electron-rpc/client"
import { tanstack } from "@mavolostudio/electron-rpc/tanstack"
import { QueryClient } from "@tanstack/react-query"
import type { AppApi } from "../../main/api"

const queryClient = new QueryClient()

const baseClient = createProxy<AppApi>((path, args) => 
    window.rpc.invoke("rpc", { path, args })
)

// Extend with TanStack capabilities
export const client = tanstack(baseClient, queryClient)
```

#### Usage

You can now use `useQuery` hooks directly on your API methods.

```typescript
function UserProfile({ id }: { id: string }) {
    // 1. Data Fetching
    const { data, isLoading } = client.users.get.useQuery(id)

    // 2. Mutations
    const mutation = client.users.create.useMutation({
        onSuccess: () => {
           // Invalidate queries using getQueryKey
           const key = client.users.get.getQueryKey(id)
           queryClient.invalidateQueries({ queryKey: key })
        }
    })

    if (isLoading) return <div>Loading...</div>

    return (
        <div onClick={() => mutation.mutate("Bob")}>
            User: {data?.name}
        </div>
    )
}
```

The extension preserves the ability to call the function directly if needed:

```typescript
// Still works!
const user = await client.users.get("123")
```

## API Reference

### `registerIpcMain(channel, api)`

Registers an API object to handle requests on a specific IPC channel.

- `channel`: string - The IPC channel name.
- `api`: object - The implementation object.

### `createProxy<ApiType>(invoker)`

Creates a recursive proxy client.

- `invoker`: `(path: string[], args: any[]) => Promise<any>` - Function that handles transporting the call to the backend.

### `exposeRpc(config)`

Exposes the secure bridge in the preload script.

- `config.name`: string - Name of the global variable (default "ipc").
- `config.whitelist`: string[] - List of allowed IPC channels.

### `tanstack(client, queryClient?)`

Wraps a proxy client to add TanStack Query hooks.

- `client`: The proxy client.
- `queryClient`: Optional QueryClient instance (for internal usages).
