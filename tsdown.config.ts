import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ['./src/index.ts'],
  external: ['react', 'react/jsx-runtime'],
  format: ["esm", "cjs"],
  platform: 'browser',
  outDir: "dist",
  tsconfig: './tsconfig.json',
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  hash: true,
});

