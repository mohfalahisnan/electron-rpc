export type Plugin = {
    name: string
    onRequest?: (opts: {
        key: string
        input: unknown
    }) => void | Promise<void>

    onResponse?: (opts: {
        key: string
        input: unknown
        output: unknown
    }) => void | Promise<void>

    onError?: (opts: {
        key: string
        error: unknown
    }) => void | Promise<void>
}
