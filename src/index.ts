// reference
// - https://github.com/cloudflare/workerd/issues/854#issuecomment-1677550792
// - https://github.com/cloudflare/next-on-pages/blob/7a18efb5cab4d86c8e3e222fc94ea88ac05baffd/packages/next-on-pages/src/buildApplication/processVercelFunctions/build.ts#L86-L112

import type { Plugin } from "esbuild";
import { builtinModules, isBuiltin } from "node:module";

const allBuiltinModules = [
  ...builtinModules,
  ...builtinModules.map((builtinModule) => `node:${builtinModule}`),
];

const allBuiltinModulesRegex = new RegExp(
  `^(?:${allBuiltinModules.join("|")})$`
);

// Chunks can contain `require("node:*")`, this is not allowed and breaks at runtime
// the following fixes this by updating the require to a standard esm import from "node:*"
const esbuildPluginNodeProtocolImports: Plugin = {
  name: "esbuild-plugin-node-protocol-imports",
  setup(build) {
    build.onResolve({ filter: allBuiltinModulesRegex }, ({ kind, path }) => {
      if (
        path.startsWith("node:") &&
        isBuiltin(path) &&
        kind === "import-statement"
      ) {
        return;
      }
      // this plugin converts `require("node:*")` calls, those are the only ones that
      // need updating (esm imports to "node:*" are totally valid), so here we tag with the
      // node-buffer namespace only imports that are require calls
      return [
        "dynamic-import",
        "import-statement",
        "require-call",
        "require-resolve",
      ].includes(kind)
        ? { namespace: "node-built-in-modules", path }
        : undefined;
    });

    // we convert the imports we tagged with the node-built-in-modules namespace so that instead of `require("node:*")`
    // they import from `export * from "node:*";`
    build.onLoad(
      { filter: /.*/, namespace: "node-built-in-modules" },
      ({ path }) => ({
        contents: `export * from '${
          path.startsWith("node:") ? path : `node:${path}`
        }'`,
        loader: "js",
      })
    );
  },
};

export default esbuildPluginNodeProtocolImports;
