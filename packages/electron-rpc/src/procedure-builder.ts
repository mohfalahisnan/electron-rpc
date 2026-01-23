import type { z } from "zod";

/**
 * Middleware function type
 * Receives context and input, and a next() function to continue the chain
 */
export type Middleware<TContext = unknown, TInput = unknown> = (
  opts: { ctx: TContext; input: TInput },
  next: () => Promise<unknown>,
) => Promise<unknown>;

/**
 * Handler function type
 */
export type Handler<TContext, TInput, TOutput> = (
  ctx: TContext,
  input: TInput,
) => Promise<TOutput> | TOutput;

/**
 * Procedure definition with input/output schemas and middleware chain
 */
export interface Procedure<
  TContext = unknown,
  TInput = unknown,
  TOutput = unknown,
> {
  input: z.ZodType<TInput>;
  output: z.ZodType<TOutput>;
  middlewares: Middleware<TContext, TInput>[];
  handler?: Handler<TContext, TInput, TOutput>;
}

/**
 * Procedure builder class for defining RPC procedures with type safety
 * Similar to TRPC's procedure builder pattern
 */
export class ProcedureBuilder<
  TContext = unknown,
  TInput = unknown,
  TOutput = unknown,
> {
  private _input?: z.ZodType<TInput>;
  private _output?: z.ZodType<TOutput>;
  private _middlewares: Middleware<TContext, TInput>[] = [];

  /**
   * Define the input schema for this procedure
   */
  input<TNewInput>(
    schema: z.ZodType<TNewInput>,
  ): ProcedureBuilder<TContext, TNewInput, TOutput> {
    const builder = new ProcedureBuilder<TContext, TNewInput, TOutput>();
    builder._input = schema;
    builder._output = this._output as any;
    builder._middlewares = this._middlewares as any;
    return builder;
  }

  /**
   * Define the output schema for this procedure
   */
  output<TNewOutput>(
    schema: z.ZodType<TNewOutput>,
  ): ProcedureBuilder<TContext, TInput, TNewOutput> {
    const builder = new ProcedureBuilder<TContext, TInput, TNewOutput>();
    builder._input = this._input;
    builder._output = schema;
    builder._middlewares = this._middlewares;
    return builder;
  }

  /**
   * Add middleware(s) to this procedure and finalize it
   */
  use(
    ...middlewares: Middleware<TContext, TInput>[]
  ): Procedure<TContext, TInput, TOutput> {
    if (!this._input) {
      throw new Error("Input schema must be defined before calling use()");
    }
    if (!this._output) {
      throw new Error("Output schema must be defined before calling use()");
    }

    return {
      input: this._input,
      output: this._output,
      middlewares: [...this._middlewares, ...middlewares],
    };
  }

  /**
   * Define a query procedure with inline handler (like tRPC)
   */
  query(
    handler: Handler<TContext, TInput, TOutput>,
  ): Procedure<TContext, TInput, TOutput> & {
    handler: Handler<TContext, TInput, TOutput>;
  } {
    if (!this._input) {
      throw new Error("Input schema must be defined before calling query()");
    }
    if (!this._output) {
      throw new Error("Output schema must be defined before calling query()");
    }

    return {
      input: this._input,
      output: this._output,
      middlewares: this._middlewares,
      handler,
    };
  }

  /**
   * Define a mutation procedure with inline handler (like tRPC)
   * Alias for query() - both work the same way
   */
  mutation(
    handler: Handler<TContext, TInput, TOutput>,
  ): Procedure<TContext, TInput, TOutput> & {
    handler: Handler<TContext, TInput, TOutput>;
  } {
    return this.query(handler);
  }
}

/**
 * Factory function to create a new procedure builder
 * Usage: const t = createProcedure<MyContext>()
 */
export function createProcedure<TContext = unknown>(): ProcedureBuilder<
  TContext,
  unknown,
  unknown
> {
  return new ProcedureBuilder<TContext, unknown, unknown>();
}
