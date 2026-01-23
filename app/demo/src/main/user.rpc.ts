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
 * User router with procedure definitions
 */
export const userRouter = {
  // Basic procedure with logging
  getById: t
    .input(z.object({ id: z.string() }))
    .output(z.object({ id: z.string(), email: z.string() }))
    .use(loggingMiddleware),

  // Admin-only procedure
  deleteUser: t
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .use(loggingMiddleware, requireAdmin)
}

/**
 * Handler implementations
 */
export const userHandlers = {
  getById: async (ctx: AppContext, input: { id: string }) => {
    return ctx.db.user.findById(input.id)
  },

  deleteUser: async (_ctx: AppContext, input: { id: string }) => {
    console.log(`[Admin] Deleting user ${input.id}`)
    return { success: true }
  }
}

export type AppRouter = typeof userRouter

/**
 * Client-side API type (callable functions without context)
 */
export type AppApi = {
  getById: (input: { id: string }) => Promise<{ id: string; email: string }>
  deleteUser: (input: { id: string }) => Promise<{ success: boolean }>
}
