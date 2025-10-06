import { SessionStore } from './protected/session-store'
import { IpcHandler } from './router'

export type IpcMiddleware<Args = unknown, Result = unknown, Out = Result> = (
  next: IpcHandler<Args, Result>
) => IpcHandler<Args, Out>

export function applyMiddlewares<Args, Result>(...middlewares: IpcMiddleware<Args, any, any>[]) {
  return <FinalResult = Result>(handler: IpcHandler<Args, FinalResult>): IpcHandler<Args, any> => {
    return middlewares.reduceRight(
      (acc, mw) => mw(acc as IpcHandler<Args, any>),
      handler as IpcHandler<Args, any>
    )
  }
}

export const withError: IpcMiddleware<any, any> = (next) => async (ctx, args) => {
  try {
    return await next(ctx, args)
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}

export const withSession =
  <Args, Result>(
    sessionStore: SessionStore
  ): IpcMiddleware<Args & { token?: string }, Result, Result | { success: false; error: string }> =>
  (handler) =>
  async (ctx, args) => {
    const token = (args as any)?.token
    if (!token) return { success: false, error: 'no token provided' }
    const session = sessionStore.get(token)
    if (!session) return { success: false, error: 'invalid or expired session' }
    ctx.session = session
    ctx.user = { id: session.userId }
    return handler(ctx, args)
  }
