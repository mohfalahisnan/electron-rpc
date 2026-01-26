import {
  type DefaultError,
  type QueryClient,
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import type { RemoteClient } from "./client";

type Promisify<T> = T extends Promise<any> ? T : Promise<T>;
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

import type { ZodType } from "zod";

// ... (existing imports from react-query and client)

/**
 * Tanstack extension for procedure-based routers
 * Adds useQuery, useMutation, and getQueryKey to each RPC method
 */
export type TanstackProcedureExtension<T> = {
  [K in keyof T]: T[K] extends {
    input: any;
    output: any;
  }
    ? {
        useQuery: (
          input: T[K]["input"] extends ZodType<infer I> ? I : never,
          opts?: UseQueryOptions<
            T[K]["output"] extends ZodType<infer O> ? O : never,
            DefaultError,
            T[K]["output"] extends ZodType<infer O> ? O : never,
            [string, T[K]["input"] extends ZodType<infer I> ? I : never]
          >,
        ) => UseQueryResult<
          T[K]["output"] extends ZodType<infer O> ? O : never,
          DefaultError
        >;
        useMutation: (
          opts?: UseMutationOptions<
            T[K]["output"] extends ZodType<infer O> ? O : never,
            DefaultError,
            T[K]["input"] extends ZodType<infer I> ? I : never
          >,
        ) => UseMutationResult<
          T[K]["output"] extends ZodType<infer O> ? O : never,
          DefaultError,
          T[K]["input"] extends ZodType<infer I> ? I : never
        >;
        getQueryKey: (
          input: T[K]["input"] extends ZodType<infer I> ? I : never,
        ) => [string, T[K]["input"] extends ZodType<infer I> ? I : never];
      }
    : T[K] extends (...args: infer Args) => infer R
      ? T[K] & {
          useQuery: (
            input: Args extends [infer A, ...any[]] ? A : void,
            opts?: UseQueryOptions<
              UnwrapPromise<R>,
              DefaultError,
              UnwrapPromise<R>,
              [string, Args extends [infer A, ...any[]] ? A : void]
            >,
          ) => UseQueryResult<UnwrapPromise<R>, DefaultError>;
          useMutation: (
            opts?: UseMutationOptions<
              UnwrapPromise<R>,
              DefaultError,
              Args extends [infer A, ...any[]] ? A : void
            >,
          ) => UseMutationResult<
            UnwrapPromise<R>,
            DefaultError,
            Args extends [infer A, ...any[]] ? A : void
          >;
          getQueryKey: (
            input: Args extends [infer A, ...any[]] ? A : void,
          ) => [string, Args extends [infer A, ...any[]] ? A : void];
        }
      : T[K] extends object
        ? TanstackProcedureExtension<T[K]>
        : T[K];
};

/**
 * Wrap a procedure-based RPC client with Tanstack Query hooks
 *
 * @param client - RPC client created with createProxy
 * @param queryClient - Optional QueryClient instance
 * @returns Client with useQuery, useMutation, and getQueryKey methods
 */
export function tanstackProcedures<T>(
  client: RemoteClient<T>,
  queryClient?: QueryClient,
): TanstackProcedureExtension<T> {
  const createRecursiveProxy = (path: string[] = []): any => {
    return new Proxy(() => {}, {
      get(_, prop) {
        if (typeof prop === "string") {
          if (prop === "useQuery") {
            return (input: any, opts: any) => {
              const queryKey = [path.join("."), input];
              const queryFn = () => {
                let current: any = client;
                for (const segment of path) {
                  current = current[segment];
                }
                return current(input);
              };
              return useQuery(
                {
                  ...opts,
                  queryKey,
                  queryFn,
                },
                queryClient,
              );
            };
          }

          if (prop === "useMutation") {
            return (opts: any) => {
              const mutationFn = (input: any) => {
                let current: any = client;
                for (const segment of path) {
                  current = current[segment];
                }
                return current(input);
              };
              return useMutation(
                {
                  ...opts,
                  mutationFn,
                },
                queryClient,
              );
            };
          }

          if (prop === "getQueryKey") {
            return (input: any) => [path.join("."), input];
          }

          return createRecursiveProxy([...path, prop]);
        }
      },
      apply(_, __, args) {
        let current: any = client;
        for (const segment of path) {
          current = current[segment];
        }
        return current(...args);
      },
    });
  };

  return createRecursiveProxy();
}
