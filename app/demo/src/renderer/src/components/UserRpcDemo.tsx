import { useState } from 'react'
import { client, rpc } from '../client'

export function UserRpcDemo() {
  const [userId, setUserId] = useState('user-123')
  const [deleteResult, setDeleteResult] = useState<string>('')

  // ===== TANSTACK QUERY EXAMPLE =====
  // Using the tanstack-wrapped client with useQuery hook
  const { data, error, isLoading, refetch } = client.getById.useQuery({
    id: userId
  })

  // ===== NESTED API EXAMPLE =====
  // Testing nested router support
  const { data: patients } = client.patient.list.useQuery({ page: 1 })

  // ===== DIRECT RPC EXAMPLE =====
  // Using direct RPC call (no hooks)
  const handleDelete = async () => {
    try {
      setDeleteResult('Deleting...')
      const result = await rpc.deleteUser({ id: userId })
      setDeleteResult(`✅ Success: ${JSON.stringify(result)}`)
    } catch (err: any) {
      setDeleteResult(`❌ Error: ${err.code || err.message}`)
    }
  }

  if (isLoading) return <div className="p-4">Loading user...</div>

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      {/* Tanstack Query Example */}
      <div className="p-4 border rounded bg-gray-800 text-white">
        <h2 className="text-xl font-bold mb-4">🔍 Tanstack Query Example (useQuery)</h2>

        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">User ID:</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="px-3 py-2 bg-gray-700 rounded w-full"
            />
          </div>

          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Fetch User
          </button>

          {error && (
            <div className="p-3 bg-red-900/50 border border-red-500 rounded">
              Error: {(error as any).message || JSON.stringify(error)}
            </div>
          )}

          {data && (
            <div className="p-3 bg-green-900/30 border border-green-500 rounded">
              <div>
                <strong>ID:</strong> {data.id}
              </div>
              <div>
                <strong>Email:</strong> {data.email}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-400 mt-2">
            Using: <code>client.getById.useQuery()</code>
          </div>
        </div>
      </div>

      {/* Nested Router Example */}
      <div className="p-4 border rounded bg-gray-800 text-white">
        <h2 className="text-xl font-bold mb-4">🏥 Nested Router Example</h2>
        <div className="space-y-2">
          {patients?.result?.map((p) => (
            <div key={p.id} className="p-2 bg-gray-700/50 rounded flex justify-between">
              <span>{p.name}</span>
              <span className="font-mono text-xs">{p.medicalRecordNumber}</span>
            </div>
          ))}
          <div className="text-xs text-gray-400 mt-2">
            Using: <code>client.patient.list.useQuery()</code>
          </div>
        </div>
      </div>

      {/* Direct RPC Example */}
      <div className="p-4 border rounded bg-gray-800 text-white">
        <h2 className="text-xl font-bold mb-4">🔒 Direct RPC Example (Admin Only)</h2>

        <div className="space-y-3">
          <p className="text-sm text-gray-400">
            This procedure has both logging and auth middleware. It will succeed because context has
            role: ADMIN.
          </p>

          <button onClick={handleDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded">
            Delete User
          </button>

          {deleteResult && (
            <div className="p-3 bg-gray-700 rounded font-mono text-sm">{deleteResult}</div>
          )}

          <div className="text-xs text-gray-400 mt-2">
            Using: <code>await rpc.deleteUser()</code>
          </div>
        </div>
      </div>

      {/* Plugin Info */}
      <div className="p-4 border rounded bg-gray-700 text-white text-sm">
        <h3 className="font-bold mb-2">ℹ️ Features Demo</h3>
        <ul className="space-y-1 list-disc list-inside">
          <li>
            <strong>Plugins:</strong> loggingPlugin + metricsPlugin (check console)
          </li>
          <li>
            <strong>Middleware:</strong> logging + admin auth
          </li>
          <li>
            <strong>Tanstack:</strong> <code>client.getById.useQuery()</code>
          </li>
          <li>
            <strong>Direct RPC:</strong> <code>await rpc.deleteUser()</code>
          </li>
          <li>
            <strong>Context:</strong> <code>{`{ user: { role: "admin" } }`}</code>
          </li>
        </ul>
      </div>
    </div>
  )
}
