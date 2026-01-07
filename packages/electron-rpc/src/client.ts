
import type { z } from "zod"
import type { RouterDef } from "./router"

type InferInput<T> = T extends { input: z.ZodTypeAny }
    ? z.infer<T["input"]>
    : never

type InferOutput<T> = T extends { output: z.ZodTypeAny }
    ? z.infer<T["output"]>
    : never

export type Client<T extends RouterDef<any>> = {
    [K in keyof T]: (input: InferInput<T[K]>) => Promise<InferOutput<T[K]>>
} & {
    extend: <R>(fn: (client: Client<T>) => R) => R
}

export function createClient<T extends RouterDef<any>>(
    _channel: string,
    invoker: (payload: { key: keyof T; input: any }) => Promise<any>
): Client<T> {
    const client = new Proxy({} as Client<T>, {
        get(_, prop) {
            if (prop === "extend") {
                return (fn: (client: Client<T>) => any) => fn(client)
            }

            return async (input: any) => {
                const result = await invoker({
                    key: prop as keyof T,
                    input,
                })

                if (result.error) {
                    throw result.error
                }

                return result.data
            }
        },
    })

    return client
}
