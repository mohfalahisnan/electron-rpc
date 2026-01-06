import type { Middleware } from "./middleware"

export async function executeMiddlewares<Ctx, Input, Output>(
    middlewares: Middleware<Ctx, Input, Output>[],
    ctx: Ctx,
    input: Input,
    handler: () => Promise<Output>
): Promise<Output> {
    let index = -1

    async function dispatch(i: number): Promise<Output> {
        if (i <= index) {
            throw new Error("next() called multiple times")
        }
        index = i

        const mw = middlewares[i]
        if (!mw) return handler()

        return mw(
            { ctx, input },
            () => dispatch(i + 1)
        )
    }

    return dispatch(0)
}
