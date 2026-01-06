import type { ZodTypeAny } from "zod"

export type Procedure<I extends ZodTypeAny, O extends ZodTypeAny> = {
    input: I
    output: O
}

export const procedure = <
    I extends ZodTypeAny,
    O extends ZodTypeAny,
>(def: Procedure<I, O>) => def
