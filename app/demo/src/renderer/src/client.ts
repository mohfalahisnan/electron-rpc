
import { createClient } from "@mavolostudio/electron-rpc/client"
import type { userRouter } from "../../main/user.rpc"

import { tanstack } from "@mavolostudio/electron-rpc/tanstack"

import { queryClient } from "./query-client"

export const client = createClient<typeof userRouter>("rpc", (payload) =>
    window.rpc.invoke("rpc", payload)
).extend(tanstack({ queryClient }))
