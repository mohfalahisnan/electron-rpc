import { z } from "zod"
import { createProcedure } from "@mavolo/electron-rpc"

export type AppContext = {
    user?: { id: string; role: "admin" | "user" }
    db: {
        user: {
            findById(id: string): Promise<{ id: string; email: string }>
        }
    }
}

const procedure = createProcedure<AppContext>()

export const userRouter = {
    getById: procedure
        .input(z.object({ id: z.string().uuid() }))
        .output(
            z.object({
                id: z.string(),
                email: z.string().email(),
            })
        )
        .use(),
}
