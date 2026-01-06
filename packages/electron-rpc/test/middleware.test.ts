import { describe, it, expect, vi } from 'vitest'
import { executeMiddlewares } from '../src/execute'

describe('executeMiddlewares', () => {
    it('should execute handler when no middlewares exist', async () => {
        const handler = vi.fn().mockResolvedValue('result')
        const result = await executeMiddlewares([], {}, undefined, handler)

        expect(result).toBe('result')
        expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should execute middleware chain in order', async () => {
        const sequence: string[] = []

        const mw1 = async (_: any, next: any) => {
            sequence.push('mw1 start')
            const result = await next()
            sequence.push('mw1 end')
            return result
        }

        const mw2 = async (_: any, next: any) => {
            sequence.push('mw2 start')
            const result = await next()
            sequence.push('mw2 end')
            return result
        }

        const handler = async () => {
            sequence.push('handler')
            return 'done'
        }

        const result = await executeMiddlewares([mw1, mw2], {}, undefined, handler)

        expect(result).toBe('done')
        expect(sequence).toEqual([
            'mw1 start',
            'mw2 start',
            'handler',
            'mw2 end',
            'mw1 end',
        ])
    })

    it('should allow middleware to modify context or input (if mutable)', async () => {
        const ctx = { user: 'guest' }

        const mw = async (opts: any, next: any) => {
            opts.ctx.user = 'admin'
            return next()
        }

        const handler = async (c: any) => c.user

        // Note: In strict implementation handler logic might rely on the passed context, 
        // but here we are checking if the object reference passes through.
        // executeMiddlewares passes the SAME ctx object.

        // We need to capture the context seen by handler
        let handlerCtx: any
        const finalHandler = async () => {
            handlerCtx = ctx
            return 'ok'
        }

        await executeMiddlewares([mw], ctx, undefined, finalHandler)
        expect(ctx.user).toBe('admin')
        expect(handlerCtx.user).toBe('admin')
    })

    it('should fail if next() is called multiple times', async () => {
        const mw = async (_: any, next: any) => {
            await next()
            await next()
        }

        const handler = vi.fn().mockResolvedValue('ok')

        await expect(executeMiddlewares([mw], {}, undefined, handler))
            .rejects.toThrow('next() called multiple times')
    })
})
