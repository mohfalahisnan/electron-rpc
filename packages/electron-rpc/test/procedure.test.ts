import { describe, expect, it } from "vitest";
import { z } from "zod";
import { createProcedure } from "../src/procedure-builder";

describe("createProcedure", () => {
  it("should create a basic procedure with input and output", () => {
    const proc = createProcedure()
      .input(z.string())
      .output(z.number())
      .use()
      .build();

    expect(proc).toBeDefined();
    expect(proc.input).toBeInstanceOf(z.ZodString);
    expect(proc.output).toBeInstanceOf(z.ZodNumber);
    expect(proc.middlewares).toEqual([]);
  });

  it("should support middleware chaining", () => {
    const middleware1 = async ({ ctx, input }: any, next: any) => next();
    const middleware2 = async ({ ctx, input }: any, next: any) => next();

    const proc = createProcedure()
      .input(z.void())
      .output(z.void())
      .use(middleware1, middleware2)
      .build();

    expect(proc.middlewares).toHaveLength(2);
    expect(proc.middlewares[0]).toBe(middleware1);
    expect(proc.middlewares[1]).toBe(middleware2);
  });

  it("should infer types correctly", () => {
    const inputSchema = z.object({ name: z.string() });
    const outputSchema = z.object({ id: z.number() });

    const proc = createProcedure()
      .input(inputSchema)
      .output(outputSchema)
      .use()
      .build();

    // Verify schemas are correctly assigned
    expect(proc.input).toBe(inputSchema);
    expect(proc.output).toBe(outputSchema);
  });

  it("should allow chaining use() and query()", () => {
    const middleware = async ({ ctx, input }: any, next: any) => next();
    const handler = async (ctx: any, input: any) => 123;

    const proc = createProcedure()
      .input(z.string())
      .output(z.number())
      .use(middleware)
      .query(handler);

    expect(proc.middlewares).toHaveLength(1);
    expect(proc.middlewares[0]).toBe(middleware);
    expect(proc.handler).toBe(handler);
  });
});
