# Plan: VCO Media Schema Implementation

**Goal**: Standardize and implement the podcasting and media delivery schemas for the VCO protocol.

## Tasks

### 1. Protobuf Definitions [DONE]
- [x] Create `proto/vco/schemas/media/manifest.proto`
- [x] Create `proto/vco/schemas/media/channel.proto`
- [x] Create `proto/vco/schemas/media/transcript.proto` (for time-coded text)

### 2. Tooling & Codegen [DONE]
- [x] Update `scripts/generate-proto.mjs` to support the `media` domain
- [x] Execute `node scripts/generate-proto.mjs` to generate TypeScript types

### 3. TypeScript Wrappers [DONE]
- [x] Implement `packages/vco-schemas/src/media/manifest.ts`
- [x] Implement `packages/vco-schemas/src/media/channel.ts`
- [x] Implement `packages/vco-schemas/src/media/transcript.ts`
- [x] Export all from `packages/vco-schemas/src/index.ts`

### 4. Verification & Testing [DONE]
- [x] Create `packages/vco-schemas/src/__tests__/media-schemas.test.ts`
- [x] Verify round-trip encoding/decoding for all new types
- [x] Run `npm run test` in `packages/vco-schemas`

### 5. Integration Showcase [TODO]
- [ ] Update `vco-discovery` or create a new `vco-media` mock app to demonstrate parallel chunk fetching logic (Optional/Future)

## References
- `docs/plans/2026-03-01-vco-media-schema-brainstorm.md`
- `packages/vco-schemas/src/manifest.ts` (SequenceManifest reference)
