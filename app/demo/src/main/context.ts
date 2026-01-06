import type { IpcMainInvokeEvent } from "electron"

export async function createContext(
    _event: IpcMainInvokeEvent
) {
    return {
        user: { id: "u1", role: "admin" as const }, // from session
        db: {
            user: {
                async findById(id: string) {
                    return { id, email: "admin@example.com" }
                },
            },
        },
    }
}
