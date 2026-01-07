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
import type { Client } from "./client"
import type { RouterDef } from "./router"

type InferInput<T> = T extends { input: any }
    ? T["input"] extends { _output: infer O }
    ? O
    : never
    : never

type InferOutput<T> = T extends { output: any }
    ? T["output"] extends { _output: infer O }
    ? O
    : never
    : never

type TanstackExtension<T extends RouterDef<any>> = {
    queryClient?: QueryClient
} & {
    [K in keyof T]: {
        useQuery: (
            input: InferInput<T[K]>,
            opts?: UseQueryOptions<
                InferOutput<T[K]>,
                DefaultError,
                InferOutput<T[K]>,
                [string, InferInput<T[K]>]
            >
        ) => UseQueryResult<InferOutput<T[K]>, DefaultError>
        useMutation: (
            opts?: UseMutationOptions<
                InferOutput<T[K]>,
                DefaultError,
                InferInput<T[K]>
            >
        ) => UseMutationResult<InferOutput<T[K]>, DefaultError, InferInput<T[K]>>
        getQueryKey: (input: InferInput<T[K]>) => [string, InferInput<T[K]>]
    }
}

type TanstackConfig = {
    queryClient?: QueryClient
}

export function tanstack<T extends RouterDef<any>>(
    client: Client<T>
): TanstackExtension<T>
export function tanstack(
    config: TanstackConfig
): <T extends RouterDef<any>>(client: Client<T>) => TanstackExtension<T>
export function tanstack<T extends RouterDef<any>>(
    arg: Client<T> | TanstackConfig
): any {
    const createExtension = (
        client: Client<T>,
        config?: TanstackConfig
    ): TanstackExtension<T> => {
        return new Proxy(
            {
                queryClient: config?.queryClient,
            },
            {
                get(target, key: string) {
                    if (key === "queryClient") return target.queryClient

                    return {
                        useQuery: (
                            input: any,
                            opts?: UseQueryOptions<any, DefaultError, any, any>
                        ) => {
                            return useQuery(
                                {
                                    ...opts,
                                    queryKey: [key, input],
                                    queryFn: () => (client as any)[key](input),
                                },
                                config?.queryClient
                            )
                        },
                        useMutation: (
                            opts?: UseMutationOptions<any, DefaultError, any>
                        ) => {
                            return useMutation(
                                {
                                    ...opts,
                                    mutationFn: (input) => (client as any)[key](input),
                                },
                                config?.queryClient
                            )
                        },
                        getQueryKey: (input: any) => [key, input],
                    }
                },
            }
        ) as any
    }

    if ("extend" in arg && typeof (arg as any).extend === "function") {
        return createExtension(arg as Client<T>)
    }

    return (client: Client<T>) => createExtension(client, arg as TanstackConfig)
}
