
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const toAbsolute = (p) => path.resolve(__dirname, p)

const manifest = JSON.parse(
    fs.readFileSync(toAbsolute('dist/static/.vite/manifest.json'), 'utf-8'),
)
const template = fs.readFileSync(toAbsolute('dist/static/index.html'), 'utf-8')
const { render } = await import('./dist/server/prerender-entry.js')

const { html, helmet } = render()

const helmetTitle = helmet.title.toString()
const helmetMeta = helmet.meta.toString()
const helmetLink = helmet.link.toString()
const helmetScript = helmet.script.toString()

const appHead = helmetTitle + helmetMeta + helmetLink + helmetScript
const appHtml = html

const finalHtml = template
    .replace(`<!--app-head-->`, appHead)
    .replace(`<!--app-html-->`, appHtml)

const filePath = `dist/static/index.html`
fs.writeFileSync(toAbsolute(filePath), finalHtml)
console.log('pre-rendered:', filePath)
