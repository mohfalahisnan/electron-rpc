import { createProcedure, error, type Middleware } from '@mavolostudio/electron-rpc'
import { z } from 'zod'
import type { AppContext } from './context'

// Create procedure builder with context type
const t = createProcedure<AppContext>()

// Logging middleware example
const loggingMiddleware: Middleware<AppContext, any> = async ({ input }, next) => {
  console.log('[RPC] Request:', input)
  const result = await next()
  console.log('[RPC] Response:', result)
  return result
}

// Auth middleware example
const requireAdmin: Middleware<AppContext, any> = async ({ ctx }, next) => {
  if (ctx.user.role !== 'admin') {
    throw error.forbidden()
  }
  return next()
}

/**
 * User router with inline handlers (like tRPC)
 */
export const userRouter = {
  // Query with inline handler
  getById: t
    .input(z.object({ id: z.string() }))
    .output(z.object({ id: z.string(), email: z.string() }))
    .use(loggingMiddleware)
    .query(async (ctx, input) => {
      console.log('[RPC] getById called with:', input)
      return ctx.db.user.findById(input.id)
    }),

  // Mutation with inline handler and middleware
  deleteUser: t
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .use(loggingMiddleware, requireAdmin)
    .mutation(async (_ctx, input) => {
      console.log(`[Admin] Deleting user ${input.id}`)
      return { success: true }
    })
}

export type AppRouter = typeof userRouter
