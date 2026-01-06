export type MiddlewareCtx<Ctx, Input = unknown> = {
    ctx: Ctx
    input: Input
}

export type MiddlewareNext<Output> = () => Promise<Output>

export type Middleware<Ctx, Input = unknown, Output = unknown> =
    (opts: MiddlewareCtx<Ctx, Input>, next: MiddlewareNext<Output>) => Promise<Output>
