
import { createClient } from "@mavolo/electron-rpc/client"
import type { userRouter } from "../../main/user.rpc"

export const client = createClient<typeof userRouter>("rpc", (payload) =>
    window.rpc.invoke(payload)
)
