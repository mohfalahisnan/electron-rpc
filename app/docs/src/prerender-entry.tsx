import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import App from './App'

export function render() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const helmetContext: any = {};
    const html = renderToString(
        <StrictMode>
            <HelmetProvider context={helmetContext}>
                <Helmet>
                    <title>@mavolostudio/electron-rpc - Type-safe IPC for Electron</title>
                    <meta name="description" content="Complete documentation for @mavolostudio/electron-rpc. Type-safe IPC for Electron with Zod validation." />
                    <meta name="keywords" content="electron, rpc, ipc, typescript, zod, type-safe, library, documentation" />

                    {/* Open Graph / Facebook */}
                    <meta property="og:type" content="website" />
                    <meta property="og:title" content="@mavolostudio/electron-rpc - Type-safe IPC for Electron" />
                    <meta property="og:description" content="Complete documentation for @mavolostudio/electron-rpc. Type-safe IPC for Electron with Zod validation." />

                    {/* Twitter */}
                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="twitter:title" content="@mavolostudio/electron-rpc - Type-safe IPC for Electron" />
                    <meta name="twitter:description" content="Complete documentation for @mavolostudio/electron-rpc. Type-safe IPC for Electron with Zod validation." />
                </Helmet>
                <App />
            </HelmetProvider>
        </StrictMode>
    )
    return { html, helmet: helmetContext.helmet }
}
