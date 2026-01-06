import type { IpcMainInvokeEvent } from "electron"

export type ContextFactory<Ctx> =
    (event: IpcMainInvokeEvent) => Promise<Ctx>
