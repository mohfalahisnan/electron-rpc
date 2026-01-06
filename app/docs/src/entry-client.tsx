import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App'

hydrateRoot(
    document.getElementById('root')!,
    <StrictMode>
        <HelmetProvider>
            <Helmet>
                <title>@mavolo/electron-rpc - Type-safe IPC for Electron</title>
                <meta name="description" content="Complete documentation for @mavolo/electron-rpc. Type-safe IPC for Electron with Zod validation." />
                <meta name="keywords" content="electron, rpc, ipc, typescript, zod, type-safe, library, documentation" />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content="@mavolo/electron-rpc - Type-safe IPC for Electron" />
                <meta property="og:description" content="Complete documentation for @mavolo/electron-rpc. Type-safe IPC for Electron with Zod validation." />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="@mavolo/electron-rpc - Type-safe IPC for Electron" />
                <meta name="twitter:description" content="Complete documentation for @mavolo/electron-rpc. Type-safe IPC for Electron with Zod validation." />
            </Helmet>
            <App />
        </HelmetProvider>
    </StrictMode>
)
