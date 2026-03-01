# Plan: Automate TypeScript Definition Generation for Protobufs

## Objective
Remove hardcoded TypeScript definitions from `scripts/generate-proto.mjs` and replace them with automated generation using `pbts`. This ensures that TypeScript types stay in sync with the `.proto` schemas without manual updates.

## Tasks

- [x] Task 1: Refactor `generate-proto.mjs`
    - [x] Remove hardcoded `dts` template string for `vco.v3`.
    - [x] Remove hardcoded `dts` template strings for application-layer schemas in `schemaTargets`.
    - [x] Implement a helper function `generateDts(jsPath, dtsPath)` that:
        - Runs `npx pbts -o <dtsPath> <jsPath>`.
        - Fixes the `protobufjs` import in the generated `.d.ts` to be ESM-compatible (`protobufjs/minimal.js`).
        - Appends any necessary re-exports (like `export const Post = vco.schemas.Post;`).
    - [x] Update the main script and the `schemaTargets` loop to use `generateDts`.

- [x] Task 2: Verification
    - [x] Run `npm run proto:gen` to generate the new definitions.
    - [x] Verify the content of `packages/vco-core/src/generated/vco.pb.d.ts` and one of the schema files (e.g., `packages/vco-schemas/src/generated/post.pb.d.ts`).
    - [x] Run a full workspace build (`npm run build`) to ensure no type regressions.
