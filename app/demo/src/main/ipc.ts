
import { registerIpcRouter } from "@mavolostudio/electron-rpc"
import { createContext } from "./context"
import { userRouter } from "./user.rpc"

registerIpcRouter(
    "rpc",
    userRouter,
    {
        async getById(ctx, input) {
            return ctx.db.user.findById(input.id)
        },
    },
    createContext
)
