import type { IpcMainInvokeEvent } from 'electron'
import { tokens } from '../..'

/**
 * A typed IPC handler function
 */
export type IpcHandler<Args = unknown, Result = unknown> = (
  event: IpcMainInvokeEvent,
  args: Args
) => Promise<Result> | Result

/**
 * Middleware that can transform the result type
 */
export type IpcMiddleware<Args = unknown, InResult = unknown, OutResult = InResult> = (
  handler: IpcHandler<Args, InResult>
) => IpcHandler<Args, OutResult>

/**
 * Compose multiple middlewares
 */
export function applyMiddlewares<Args, Result>(...middlewares: IpcMiddleware<Args, any, any>[]) {
  return (handler: IpcHandler<Args, Result>): IpcHandler<Args, any> =>
    middlewares.reduceRight((acc, mw) => mw(acc), handler)
}

/**
 * Token middleware: ensures sender has valid token
 */
export function withToken<Args, Result>(): IpcMiddleware<
  Args,
  Result,
  Result | { success: false; error: string }
> {
  return (handler) => async (event, args) => {
    const token = tokens.get(event.sender.id)
    if (!token) {
      return { success: false, error: 'Unauthorized: no token provided' }
    }
    return handler(event, args)
  }
}

/**
 * Auth middleware: ensures session matches token
 */
export function withAuth<Args extends { sessionId?: string }, Result>(): IpcMiddleware<
  Args,
  Result,
  Result | { success: false; error: string }
> {
  return (handler) => async (event, args) => {
    const token = tokens.get(event.sender.id)
    if (!token) {
      return { success: false, error: 'Unauthorized: no token provided' }
    }

    const session = getSession(token, args.sessionId || '')
    console.log('withAuth', session)
    if (!session) {
      return { success: false, error: 'Unauthorized: invalid session' }
    }

    return handler(event, args)
  }
}

const getSession = (token: string, sessionId: string) => {
  if (token !== sessionId) {
    return null
  }
  return { success: true, sessionId }
}
