export type IpcError =
    | { code: "UNAUTHORIZED" }
    | { code: "FORBIDDEN" }
    | { code: "INVALID_INPUT"; issues: unknown }
    | { code: "INTERNAL"; message?: string }

export const error = {
    unauthorized(): IpcError {
        return { code: "UNAUTHORIZED" }
    },
    forbidden(): IpcError {
        return { code: "FORBIDDEN" }
    },
}
