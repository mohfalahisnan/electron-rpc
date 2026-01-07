
# @mavolostudio/electron-rpc

> **⚠️ WARNING: EARLY DEVELOPMENT**
>
> This package is currently in early development and is primarily intended for internal use within our applications. API signatures and features may change without notice. Please use with caution in production environments.

A completely type-safe RPC (Remote Procedure Call) library for Electron applications, inspired by tRPC. It eliminates the need for manual IPC event handling and ensures that your main and renderer processes stay in sync with strict TypeScript validation.

## Installation

```bash
pnpm add @mavolostudio/electron-rpc
```

## Features

- 🔒 **End-to-End Type Safety**: Automatic type inference from your router definition to the client.
- 🛡️ **Zod Validation**: Built-in runtime input and output validation using Zod.
- ⚡ **Secure**: Channel whitelisting and error sanitization to prevent unauthorized access and information leakage.
- 🔌 **Middleware Support**: Easily add authentication, logging, or context injection to your procedures.

## Note on Architecture

> **Not gRPC, Just IPC**
>
> Unlike gRPC, RMI, or remote object proxies, this library **does not** give the renderer direct access to Node.js functions or objects. It strictly uses Electron's standard IPC to pass serializable messages (JSON).
>
> This design ensures that **no backend code is executed directly by the renderer**. The renderer simply requests a predefined procedure by name (string), and the main process decides how to handle it. This architecture maintains the security isolation model of Electron, preventing arbitrary code execution vulnerabilities common in "remote object" patterns.

## Quick Start

### 1. Define your Router

Create a router definition (usually in a shared file or main process).

```typescript
// src/main/router.ts
import { z } from "zod"
import { createProcedure } from "@mavolostudio/electron-rpc"

type Context = { user?: { id: string } }
const t = createProcedure<Context>()

export const appRouter = {
    getUser: t
        .input(z.object({ id: z.string() }))
        .output(z.object({ id: z.string(), name: z.string() }))
        .use(async ({ ctx, next }) => {
            console.log("User access:", ctx.user?.id)
            return next()
        }),
}

export type AppRouter = typeof appRouter
```

### 2. Register in Main Process

Register the router with the actual implementation handlers.

```typescript
// src/main/index.ts
import { registerIpcRouter } from "@mavolostudio/electron-rpc"
import { appRouter } from "./router"

const handlers = {
    getUser: async (ctx, input) => {
        // Your database logic here
        return { id: input.id, name: "Alice" }
    }
}

registerIpcRouter(
    "rpc-channel", 
    appRouter, 
    handlers, 
    async (event) => ({ user: { id: "admin" } }) // Context factory
)
```

### 3. Expose in Preload

Use the secure `exposeRpc` utility to enable IPC access for specific channels.

```typescript
// src/preload/index.ts
import { exposeRpc } from "@mavolostudio/electron-rpc/expose"

// Whitelist only the channels you registered
exposeRpc({ whitelist: ["rpc-channel"] })
```

### 4. Use in Renderer

Create a type-safe client in your renderer process.

```typescript
// src/renderer/client.ts
import { createClient } from "@mavolostudio/electron-rpc/client"
import type { AppRouter } from "../main/router"

// Create the client (no Node.js code imported here)
export const client = createClient<AppRouter>("rpc-channel", (payload) => 
    window.ipc.invoke("rpc-channel", payload)
)

// Use it!
const user = await client.getUser({ id: "123" })
console.log(user.name) // Type-safe result
```

## Advanced Usage

### Extensions

The client can be extended with additional functionality using the `.extend()` method. This is useful for adding integrations with state management libraries, logging, or custom helpers.

```typescript
const extendedClient = client.extend((c) => ({
    ...c,
    log: (msg: string) => console.log(msg)
}))

extendedClient.log("Hello")
```

### TanStack Query Integration

This package comes with a built-in extension for [TanStack Query](https://tanstack.com/query) (React Query). It automatically generates `useQuery` and `useMutation` hooks for your procedures.

#### Setup

1. Install dependencies:

   ```bash
   npm install @tanstack/react-query
   ```

2. Extend your client:

   ```typescript
   // src/renderer/client.ts
   import { createClient } from "@mavolostudio/electron-rpc/client"
   import { tanstack } from "@mavolostudio/electron-rpc/tanstack"
   import { QueryClient } from "@tanstack/react-query"
   
   const queryClient = new QueryClient()

   export const client = createClient<AppRouter>("rpc-channel", (payload) => 
       window.ipc.invoke("rpc-channel", payload)
   ).extend(tanstack({ queryClient }))
   ```

#### Usage

Now you can use the generated hooks in your components. The hooks are fully type-safe!

```typescript
function UserProfile({ id }: { id: string }) {
    // Automatic type inference for input and output
    const { data, isLoading, error } = client.getUser.useQuery({ id })
    
    // Access the query key for invalidation or manual updates
    // Key format: ['getUser', { id: "..." }]
    const queryKey = client.getUser.getQueryKey({ id })

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>

    return <div>User: {data.name}</div>
}
```

For mutations:

```typescript
const mutation = client.updateUser.useMutation({
    onSuccess: () => {
        console.log("User updated!")
    }
})

mutation.mutate({ id: "123", name: "Bob" })
```
