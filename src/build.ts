import path from "node:path";
import { build } from "esbuild";
import { generateDtsBundle } from "dts-bundle-generator";
import fs from "fs-extra";

async function esbuild(): Promise<void> {
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
}

async function dtsBundleGenerator(): Promise<void> {
  const [types] = await generateDtsBundle(
    [
      {
        filePath: "src/index.ts",
        output: {
          noBanner: true,
          exportReferencedTypes: false,
          inlineDeclareGlobals: true,
          inlineDeclareExternals: true,
        },
      },
    ],
    {
      preferredConfigPath: path.resolve("tsconfig.json"),
    }
  );
  await fs.outputFile("dist/index.d.ts", types);
}

await Promise.all([esbuild(), dtsBundleGenerator()]);
