import { QueryClientProvider } from '@tanstack/react-query'
import { HashRouter } from 'react-router'
import MainRoute from './route'
import { queryClient } from './query-client'

function App() {
  return (
    <HashRouter>
      <QueryClientProvider client={queryClient}>
        <MainRoute />
      </QueryClientProvider>
    </HashRouter>
  )
}

export default App
