
# @mavolo/electron-rpc

> **⚠️ WARNING: EARLY DEVELOPMENT**
>
> This package is currently in early development and is primarily intended for internal use within our applications. API signatures and features may change without notice. Please use with caution in production environments.

A completely type-safe RPC (Remote Procedure Call) library for Electron applications, inspired by tRPC. It eliminates the need for manual IPC event handling and ensures that your main and renderer processes stay in sync with strict TypeScript validation.

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
import { createProcedure } from "@mavolo/electron-rpc"

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
import { registerIpcRouter } from "@mavolo/electron-rpc"
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
import { exposeRpc } from "@mavolo/electron-rpc/expose"

// Whitelist only the channels you registered
exposeRpc({ whitelist: ["rpc-channel"] })
```

### 4. Use in Renderer

Create a type-safe client in your renderer process.

```typescript
// src/renderer/client.ts
import { createClient } from "@mavolo/electron-rpc/client"
import type { AppRouter } from "../main/router"

// Create the client (no Node.js code imported here)
export const client = createClient<AppRouter>("rpc-channel", (payload) => 
    window.ipc.invoke("rpc-channel", payload)
)

// Use it!
const user = await client.getUser({ id: "123" })
console.log(user.name) // Type-safe result
```
