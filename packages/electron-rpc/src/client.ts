
export type Promisify<T> = T extends Promise<any> ? T : Promise<T>

export type RemoteClient<T> = {
    [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => Promisify<R>
    : T[K] extends object
    ? RemoteClient<T[K]>
    : never
}

export function createProxy<T>(
    invoker: (path: string[], args: any[]) => Promise<any>
): RemoteClient<T> {
    const createRecursiveProxy = (path: string[] = []): any => {
        return new Proxy(() => { }, {
            get(_, prop) {
                if (typeof prop === "string") {
                    if (prop === "then") return undefined
                    return createRecursiveProxy([...path, prop])
                }
                return undefined
            },
            async apply(_, __, args) {
                const result = await invoker(path, args)
                if (result?.error) {
                    throw result.error
                }
                return result?.data
            },
        })
    }

    return createRecursiveProxy()
}
