import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      // Point workspace deps to their TypeScript source so vitest uses a
      // single module graph and a single protobufjs root instance.
      "@vco/vco-core": resolve(
        __dirname,
        "../../packages/vco-core/src/index.ts",
      ),
      "@vco/vco-crypto": resolve(
        __dirname,
        "../../packages/vco-crypto/src/index.ts",
      ),
      "@vco/vco-schemas": resolve(
        __dirname,
        "../../packages/vco-schemas/src/index.ts",
      ),
    },
  },
  test: {
    environment: "node",
    deps: {
      // Inline protobufjs so vite does not split it across CJS/ESM boundaries,
      // ensuring a single $protobuf.roots["default"] instance in tests.
      inline: ["protobufjs"],
    },
  },
});
