import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts', 'src/client.ts', 'src/expose.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    minify: true,
});
