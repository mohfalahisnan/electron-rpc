import { z } from "zod"

// Mock DB
const db = {
    user: {
        findById: async (id: string) => ({ id, email: `user-${id}@example.com` }),
    },
}

export const userRouter = {
    getById: async (input: { id: string }) => {
        const schema = z.object({ id: z.string() })
        const { id } = schema.parse(input)
        return db.user.findById(id)
    },
}

export type AppApi = typeof userRouter
