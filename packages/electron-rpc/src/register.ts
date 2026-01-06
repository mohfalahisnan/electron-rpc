import { ipcMain } from "electron"
import { ZodError } from "zod"

import type { RouterDef, RouterHandlers } from "./router"
import type { ContextFactory } from "./context"
import { Plugin } from "./types"
import { executeMiddlewares } from "./execute"


export function registerIpcRouter<
    T extends RouterDef<Ctx>,
    Ctx,
>(
    channel: string,
    router: T,
    handlers: RouterHandlers<T, Ctx>,
    createContext: ContextFactory<Ctx>,
    plugins: Plugin[] = []
) {
    ipcMain.handle(channel, async (event, payload) => {
        const { key, input } = payload ?? {}
        const proc = router[key]
        const handler = handlers[key]

        if (!proc || !handler) {
            return { error: { code: "INTERNAL" } }
        }

        for (const p of plugins) {
            await p.onRequest?.({ key, input })
        }

        try {
            const parsedInput = proc.input.parse(input)
            const ctx = await createContext(event)

            const data = await executeMiddlewares(
                proc.middlewares,
                ctx,
                parsedInput,
                () => handler(ctx, parsedInput)
            )

            const parsedOutput = proc.output.parse(data)

            for (const p of plugins) {
                await p.onResponse?.({ key, input, output: parsedOutput })
            }

            return { data: parsedOutput }
        } catch (err) {
            for (const p of plugins) {
                await p.onError?.({ key, error: err })
            }

            if (err instanceof ZodError) {
                return { error: { code: "INVALID_INPUT", issues: err.issues } }
            }

            // Check if it's a known IpcError-like object (simple duck typing or instance check if class existed)
            // For now, assuming only ZodError is safe to return fully, or explicit safe errors.
            // But looking at error.ts, IpcError is just a type alias for plain objects.
            // We need a way to distinguish safe errors.

            // Actually, let's look at `error.ts` content I just read.
            // It has distinct codes. If the error thrown matches that shape, pass it through?
            // Often thrown errors are instances of Error.

            // Simplest safe approach:
            // If it looks like one of our structured errors (has a valid 'code'), pass it.
            // Otherwise, mask it.

            const isSafeError = (e: any): boolean => {
                return e && typeof e === 'object' && 'code' in e &&
                    ['UNAUTHORIZED', 'FORBIDDEN', 'INVALID_INPUT', 'INTERNAL'].includes(e.code)
            }

            if (isSafeError(err)) {
                return { error: err }
            }

            // Log the actual error for the backend developer
            console.error('[Electron RPC] Internal Error:', err)

            // Return safe generic error to frontend
            return { error: { code: "INTERNAL", message: "Internal server error" } }
        }
    })
}
