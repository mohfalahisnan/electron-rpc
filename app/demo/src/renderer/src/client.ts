import { createProxy } from "@mavolostudio/electron-rpc/client"
import { tanstack } from "@mavolostudio/electron-rpc/tanstack"
import type { AppApi } from "../../main/user.rpc"
import { queryClient } from "./query-client"

const proxy = createProxy<AppApi>((path, args) =>
    window.rpc.invoke("rpc", { path, args })
)

export const client = tanstack(proxy, queryClient)
