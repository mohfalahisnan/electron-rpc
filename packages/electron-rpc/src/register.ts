import { ipcMain } from "electron"

export function registerIpcMain<T>(channel: string, api: T) {
    ipcMain.handle(channel, async (event, { path, args }) => {
        try {
            let current: any = api
            for (const segment of path) {
                if (typeof current !== "object" || current === null) {
                    throw new Error(`Path ${path.join(".")} not found`)
                }
                current = current[segment]
            }

            if (typeof current !== "function") {
                throw new Error(`Path ${path.join(".")} is not a function`)
            }

            const result = await current(...args)
            return { data: result }
        } catch (err: any) {
            console.error(`[Electron RPC] Error at ${path?.join(".")}:`, err)
            // Serialize error if possible, or return a standard error object
            return {
                error: {
                    message: err.message,
                    code: err.code,
                    issues: err.issues, // For ZodError compatibility
                    // Add other properties as needed
                },
            }
        }
    })
}
