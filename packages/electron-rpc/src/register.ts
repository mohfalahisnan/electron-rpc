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
    plugins: Plugin<Ctx>[] = []
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

            return { error: err }
        }
    })
}
