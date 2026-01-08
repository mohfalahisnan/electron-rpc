import {
    type DefaultError,
    type QueryClient,
    type UseMutationOptions,
    type UseMutationResult,
    type UseQueryOptions,
    type UseQueryResult,
    useMutation,
    useQuery,
} from "@tanstack/react-query"
import type { RemoteClient } from "./client"

type Promisify<T> = T extends Promise<any> ? T : Promise<T>
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T

export type TanstackExtension<T> = {
    [K in keyof T]: T[K] extends (...args: infer Args) => infer R
    ? T[K] & {
        useQuery: (
            input: Args extends [infer A, ...any[]] ? A : void,
            opts?: UseQueryOptions<
                UnwrapPromise<R>,
                DefaultError,
                UnwrapPromise<R>,
                [string[], Args extends [infer A, ...any[]] ? A : void]
            >
        ) => UseQueryResult<UnwrapPromise<R>, DefaultError>
        useMutation: (
            opts?: UseMutationOptions<
                UnwrapPromise<R>,
                DefaultError,
                Args extends [infer A, ...any[]] ? A : void
            >
        ) => UseMutationResult<
            UnwrapPromise<R>,
            DefaultError,
            Args extends [infer A, ...any[]] ? A : void
        >
        getQueryKey: (
            input: Args extends [infer A, ...any[]] ? A : void
        ) => [string[], Args extends [infer A, ...any[]] ? A : void]
    }
    : T[K] extends object
    ? TanstackExtension<T[K]>
    : T[K]
}

export function tanstack<T>(
    client: RemoteClient<T>,
    queryClient?: QueryClient
): TanstackExtension<T> {
    const createRecursiveProxy = (path: string[] = []): any => {
        return new Proxy(() => { }, {
            get(_, prop) {
                if (typeof prop === "string") {
                    if (prop === "useQuery") {
                        return (input: any, opts: any) => {
                            const queryKey = [path, input]
                            const queryFn = () => {
                                let current: any = client
                                for (const segment of path) {
                                    current = current[segment]
                                }
                                return current(input)
                            }
                            return useQuery(
                                {
                                    ...opts,
                                    queryKey,
                                    queryFn,
                                },
                                queryClient
                            )
                        }
                    }

                    if (prop === "useMutation") {
                        return (opts: any) => {
                            const mutationFn = (input: any) => {
                                let current: any = client
                                for (const segment of path) {
                                    current = current[segment]
                                }
                                return current(input)
                            }
                            return useMutation(
                                {
                                    ...opts,
                                    mutationFn,
                                },
                                queryClient
                            )
                        }
                    }

                    if (prop === "getQueryKey") {
                        return (input: any) => [path, input]
                    }

                    return createRecursiveProxy([...path, prop])
                }
            },
            apply(_, __, args) {
                let current: any = client
                for (const segment of path) {
                    current = current[segment]
                }
                return current(...args)
            },
        })
    }

    return createRecursiveProxy()
}
