import { build } from "esbuild";

await build({
  bundle: true,
  entryPoints: ["src/index.ts"],
  external: ["node:*"],
  format: "esm",
  keepNames: true,
  minify: false,
  outdir: "dist",
  packages: "bundle",
  // bundle for node https://esbuild.github.io/getting-started/#bundling-for-node
  platform: "node",
  sourcemap: true,
  target: "node20.17.0",
});
