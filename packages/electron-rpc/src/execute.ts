import type { Middleware } from "./procedure-builder";

/**
 * Execute a chain of middlewares followed by the final handler
 * Middlewares are executed in order, with each calling next() to continue
 *
 * @param middlewares - Array of middleware functions to execute
 * @param ctx - Context object passed to all middlewares and handler
 * @param input - Input data passed to all middlewares and handler
 * @param handler - Final handler function to execute after all middlewares
 * @returns The result from the handler
 */
export async function executeMiddlewares<TContext, TInput, TOutput>(
  middlewares: Middleware<TContext, TInput>[],
  ctx: TContext,
  input: TInput,
  handler: (ctx: TContext, input: TInput) => Promise<TOutput>,
): Promise<TOutput> {
  let index = -1;

  const dispatch = async (i: number): Promise<TOutput> => {
    if (i <= index) {
      throw new Error("next() called multiple times");
    }
    index = i;

    // If we've exhausted all middlewares, call the handler
    if (i === middlewares.length) {
      return handler(ctx, input);
    }

    const middleware = middlewares[i];
    return middleware({ ctx, input }, () =>
      dispatch(i + 1),
    ) as Promise<TOutput>;
  };

  return dispatch(0);
}
