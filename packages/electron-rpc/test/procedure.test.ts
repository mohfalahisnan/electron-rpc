import { describe, it, expect, expectTypeOf } from 'vitest'
import { z } from 'zod'
import { createProcedure } from '../src/procedure-builder'

describe('createProcedure', () => {
    it('should create a basic procedure with input and output', () => {
        const proc = createProcedure()
            .input(z.string())
            .output(z.number())
            .use()

        expect(proc).toBeDefined()
        expect(proc.input).toBeInstanceOf(z.ZodString)
        expect(proc.output).toBeInstanceOf(z.ZodNumber)
        expect(proc.middlewares).toEqual([])
    })

    it('should support middleware chaining', () => {
        const middleware1 = async ({ ctx, input }: any, next: any) => next()
        const middleware2 = async ({ ctx, input }: any, next: any) => next()

        const proc = createProcedure()
            .input(z.void())
            .output(z.void())
            .use(middleware1, middleware2)

        expect(proc.middlewares).toHaveLength(2)
        expect(proc.middlewares[0]).toBe(middleware1)
        expect(proc.middlewares[1]).toBe(middleware2)
    })

    it('should infer types correctly', () => {
        const inputSchema = z.object({ name: z.string() })
        const outputSchema = z.object({ id: z.number() })

        const proc = createProcedure()
            .input(inputSchema)
            .output(outputSchema)
            .use()

        expectTypeOf(proc.input).toMatchTypeOf(inputSchema)
        expectTypeOf(proc.output).toMatchTypeOf(outputSchema)
    })
})
