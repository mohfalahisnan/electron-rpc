import type { BuiltProcedure } from "./procedure-builder"

export type RouterDef<Ctx> = Record<
    string,
    BuiltProcedure<any, any, Ctx>
>

export type RouterHandlers<T extends RouterDef<any>, Ctx> = {
    [K in keyof T]:
    (ctx: Ctx, input: any) => Promise<any>
}
