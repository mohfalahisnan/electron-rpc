import { registerIpcMain } from "@mavolostudio/electron-rpc"
import { userRouter } from "./user.rpc"

registerIpcMain("rpc", userRouter)
