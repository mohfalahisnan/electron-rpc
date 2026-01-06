import type { ZodTypeAny } from "zod"
import type { Middleware } from "./middleware"

export type BuiltProcedure<I extends ZodTypeAny, O extends ZodTypeAny, Ctx> = {
    input: I
    output: O
    middlewares: Middleware<Ctx, any, any>[]
}

export function createProcedure<Ctx>() {
    return {
        input<I extends ZodTypeAny>(input: I) {
            return {
                output<O extends ZodTypeAny>(output: O) {
                    return {
                        use(...middlewares: Middleware<Ctx>[]) {
                            return {
                                input,
                                output,
                                middlewares,
                            } satisfies BuiltProcedure<I, O, Ctx>
                        },
                    }
                },
            }
        },
    }
}
