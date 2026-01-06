import { UserRpcDemo } from "../components/UserRpcDemo"

function HomePage() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-4">
      <h1>Home</h1>
      <UserRpcDemo />
    </div>
  )
}

export default HomePage
