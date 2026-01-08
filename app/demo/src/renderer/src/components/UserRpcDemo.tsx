
import { client } from "../client"

export function UserRpcDemo() {
    console.log("Query Key:", client.getById.getQueryKey({ id: "123" }))
    const { data, error, isLoading } = client.getById.useQuery({
        id: "123e4567-e89b-12d3-a456-426614174000",
    })
    console.log("Data:", data)
    if (isLoading) return <div>Loading user...</div>
    if (error) return <div className="text-red-500">Error: {(error as any).message}</div>
    return (
        <div className="p-4 border rounded bg-gray-800 text-white">
            <h2 className="text-xl font-bold mb-2">RPC Demo</h2>
            <div className="space-y-2">
                <div>ID: {data?.id}</div>
                <div>Email: {data?.email}</div>
            </div>
        </div>
    )
}
