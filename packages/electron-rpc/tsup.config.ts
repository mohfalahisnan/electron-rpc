import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/client.ts",
    "src/expose.ts",
    "src/tanstack.ts",
    "src/tanstack-procedures.ts",
  ],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  minify: true,
});
