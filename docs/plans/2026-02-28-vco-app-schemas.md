# Plan: VCO Application-Layer Schemas

**Date:** 2026-02-28
**Status:** PENDING

---

## Goal

Define and implement the application-layer schema system for VCO v3.2. This introduces three canonical protobuf schemas (`post.proto`, `profile.proto`, `manifest.proto`) encoded as protobuf payloads inside VCO envelopes, a new `vco-schemas` package with TypeScript encode/decode helpers, an assembly state machine for tracking asynchronous chunk resolution, and updated `vco-cord` message encoding that uses `Post` schema objects instead of raw `TextEncoder` bytes.

---

## Architecture

```
proto/vco/schemas/
  post.proto        → Post { schema, content, media_cids[], timestamp }
  profile.proto     → Profile { schema, display_name, avatar_cid, previous_manifest }
  manifest.proto    → SequenceManifest { schema, chunk_cids[], total_size, mime_type, previous_manifest }

packages/vco-schemas/
  src/
    generated/        ← proto codegen output (post.pb.js, profile.pb.js, manifest.pb.js)
    post.ts           ← encodePost / decodePost helpers
    profile.ts        ← encodeProfile / decodeProfile helpers
    manifest.ts       ← encodeManifest / decodeManifest helpers
    assembly.ts       ← AssemblyState enum + assemblyStateMachine()
    index.ts          ← re-exports

packages/vco-cord/src/lib/
  vco.ts            ← updated: buildMessage uses encodePost from @vco/vco-schemas
```

Payload multicodec: `MULTICODEC_PROTOBUF` (`0x50`) for all schema objects. The `schema` field carries the URI (`vco://schemas/social/post/v1` etc.) so peers that do not understand a schema can fall back gracefully.

The `SequenceManifest` uses `MULTICODEC_VCO_SEQUENCE` (`0x04`) as the envelope payload type to distinguish it from other protobuf payloads; Post and Profile use `MULTICODEC_PROTOBUF` (`0x50`).

---

## Tech Stack

- **Protobuf:** `protobufjs` (already used by `vco-core`) — same generator script pattern
- **Codegen:** `scripts/generate-proto.mjs` extended to handle `proto/vco/schemas/*.proto`
- **Runtime:** `protobufjs/minimal` (tree-shakeable, same as existing generated files)
- **Tests:** `vitest` with deterministic byte-array fixtures
- **Package manager:** npm workspaces

---

## Task 1 — Create application-layer proto schemas

### Files

- `proto/vco/schemas/post.proto` (new)
- `proto/vco/schemas/profile.proto` (new)
- `proto/vco/schemas/manifest.proto` (new)

### Steps

**1.1 Write failing smoke test to confirm proto files are absent or malformed**

Create `packages/vco-schemas/src/__tests__/proto-files-exist.test.ts` (before the package itself exists, this test will fail at import stage — that is intentional):

```typescript
// packages/vco-schemas/src/__tests__/proto-files-exist.test.ts
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

const root = resolve(import.meta.dirname, "../../../../../");

describe("proto schema files", () => {
  it("post.proto exists", () => {
    expect(existsSync(resolve(root, "proto/vco/schemas/post.proto"))).toBe(true);
  });
  it("profile.proto exists", () => {
    expect(existsSync(resolve(root, "proto/vco/schemas/profile.proto"))).toBe(true);
  });
  it("manifest.proto exists", () => {
    expect(existsSync(resolve(root, "proto/vco/schemas/manifest.proto"))).toBe(true);
  });
});
```

**1.2 Run the test (expected: FAIL)**

```bash
npm run test --workspace=packages/vco-schemas
# Expected: 3 failures — proto files do not exist
```

**1.3 Create the directory and proto files**

```bash
mkdir -p proto/vco/schemas
```

`proto/vco/schemas/post.proto`:

```protobuf
syntax = "proto3";
package vco.schemas;

// Post — payload type MULTICODEC_PROTOBUF (0x50)
// Envelope schema URI: vco://schemas/social/post/v1
message Post {
  // URI identifying the schema version, e.g. "vco://schemas/social/post/v1"
  string schema = 1;
  // UTF-8 text body of the post
  string content = 2;
  // Ordered list of media CIDs (multihash bytes) attached to this post.
  // Each element is the raw bytes of a Multihash-encoded BLAKE3-256 CID.
  // If any CID exceeds 1 MB of payload, a SequenceManifest envelope is used
  // and its CID appears here instead of the raw media CID.
  repeated bytes media_cids = 3;
  // Unix epoch milliseconds — informational only; canonical ordering uses
  // the envelope header_hash PoW score.
  int64 timestamp_ms = 4;
  // Optional: channel or topic identifier (application-level routing)
  string channel_id = 5;
}
```

`proto/vco/schemas/profile.proto`:

```protobuf
syntax = "proto3";
package vco.schemas;

// Profile — payload type MULTICODEC_PROTOBUF (0x50)
// Envelope schema URI: vco://schemas/identity/profile/v1
message Profile {
  // URI identifying the schema version
  string schema = 1;
  // Human-readable display name
  string display_name = 2;
  // Optional avatar: raw bytes of a Multihash-encoded BLAKE3-256 CID.
  // May point to a SequenceManifest if avatar image > 1 MB.
  bytes avatar_cid = 3;
  // Pointer to the previous Profile manifest CID, enabling mutable resolution.
  // Raw bytes of a Multihash-encoded BLAKE3-256 CID, or empty if first version.
  bytes previous_manifest = 4;
  // Short biography or status string
  string bio = 5;
}
```

`proto/vco/schemas/manifest.proto`:

```protobuf
syntax = "proto3";
package vco.schemas;

// SequenceManifest — payload type MULTICODEC_VCO_SEQUENCE (0x04)
// Envelope schema URI: vco://schemas/core/sequence-manifest/v1
//
// Used when a single logical media object exceeds the 1 MB envelope payload
// limit. Clients resolve chunk_cids in order, verify each chunk against its
// CID (BLAKE3-256), and assemble in memory before rendering.
message SequenceManifest {
  // URI identifying the schema version
  string schema = 1;
  // Ordered list of chunk CIDs. Each element is the raw bytes of a
  // Multihash-encoded BLAKE3-256 CID of a raw-payload envelope (<= 1 MB).
  repeated bytes chunk_cids = 2;
  // Total byte length of the reassembled content
  uint64 total_size = 3;
  // MIME type of the reassembled content, e.g. "image/jpeg"
  string mime_type = 4;
  // Pointer to the previous SequenceManifest CID (for profile avatar history).
  // Empty bytes if this is the first version.
  bytes previous_manifest = 5;
}
```

**1.4 Run the test (expected: PASS)**

```bash
npm run test --workspace=packages/vco-schemas
# Expected: 3 passing
```

**1.5 Commit**

```bash
git add proto/vco/schemas/
git add packages/vco-schemas/src/__tests__/proto-files-exist.test.ts
git commit -m "feat(schemas): add post, profile, and sequence-manifest proto schemas"
```

---

## Task 2 — Bootstrap vco-schemas package and run proto codegen

### Files

- `packages/vco-schemas/package.json` (new)
- `packages/vco-schemas/tsconfig.json` (new)
- `packages/vco-schemas/src/generated/post.pb.js` (generated)
- `packages/vco-schemas/src/generated/post.pb.d.ts` (generated)
- `packages/vco-schemas/src/generated/profile.pb.js` (generated)
- `packages/vco-schemas/src/generated/profile.pb.d.ts` (generated)
- `packages/vco-schemas/src/generated/manifest.pb.js` (generated)
- `packages/vco-schemas/src/generated/manifest.pb.d.ts` (generated)
- `scripts/generate-proto.mjs` (modified — add new schema targets)

### Steps

**2.1 Write failing test for generated files**

```typescript
// packages/vco-schemas/src/__tests__/generated-files-exist.test.ts
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

const gen = resolve(import.meta.dirname, "../generated/");

describe("generated protobuf stubs", () => {
  for (const name of ["post", "profile", "manifest"]) {
    it(`${name}.pb.js exists`, () => {
      expect(existsSync(resolve(gen, `${name}.pb.js`))).toBe(true);
    });
    it(`${name}.pb.d.ts exists`, () => {
      expect(existsSync(resolve(gen, `${name}.pb.d.ts`))).toBe(true);
    });
  }
});
```

**2.2 Run the test (expected: FAIL)**

```bash
npm run test --workspace=packages/vco-schemas
# Expected: 6 failures — generated files do not exist
```

**2.3 Create the package scaffold**

`packages/vco-schemas/package.json`:

```json
{
  "name": "@vco/vco-schemas",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@vco/vco-core": "*",
    "protobufjs": "^7.4.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vitest": "^1.6.0"
  }
}
```

`packages/vco-schemas/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**2.4 Extend `scripts/generate-proto.mjs` to generate schema stubs**

Open `scripts/generate-proto.mjs` and locate the existing codegen loop. Add the three new schema targets after the existing vco.proto generation block:

```javascript
// Add to the targets array in scripts/generate-proto.mjs:
{
  protoFile: "proto/vco/schemas/post.proto",
  outDir: "packages/vco-schemas/src/generated",
  outBase: "post",
},
{
  protoFile: "proto/vco/schemas/profile.proto",
  outDir: "packages/vco-schemas/src/generated",
  outBase: "profile",
},
{
  protoFile: "proto/vco/schemas/manifest.proto",
  outDir: "packages/vco-schemas/src/generated",
  outBase: "manifest",
},
```

**2.5 Run codegen**

```bash
npm run proto:gen
# Expected: generates packages/vco-schemas/src/generated/{post,profile,manifest}.pb.{js,d.ts}
```

**2.6 Install workspace deps**

```bash
npm install
```

**2.7 Run the test (expected: PASS)**

```bash
npm run test --workspace=packages/vco-schemas
# Expected: 6 passing
```

**2.8 Commit**

```bash
git add packages/vco-schemas/
git add scripts/generate-proto.mjs
git commit -m "feat(vco-schemas): bootstrap package and generate protobuf stubs for post, profile, manifest"
```

---

## Task 3 — TypeScript encode/decode helpers with roundtrip tests

### Files

- `packages/vco-schemas/src/post.ts` (new)
- `packages/vco-schemas/src/profile.ts` (new)
- `packages/vco-schemas/src/manifest.ts` (new)
- `packages/vco-schemas/src/index.ts` (new)
- `packages/vco-schemas/src/__tests__/post-roundtrip.test.ts` (new)
- `packages/vco-schemas/src/__tests__/profile-roundtrip.test.ts` (new)
- `packages/vco-schemas/src/__tests__/manifest-roundtrip.test.ts` (new)

### Steps

**3.1 Write failing roundtrip tests**

`packages/vco-schemas/src/__tests__/post-roundtrip.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { encodePost, decodePost, POST_SCHEMA_URI } from "../post.js";

describe("Post encode/decode roundtrip", () => {
  it("encodes and decodes a minimal post", () => {
    const original = {
      schema: POST_SCHEMA_URI,
      content: "Hello VCO world",
      mediaCids: [],
      timestampMs: 1_700_000_000_000n,
      channelId: "general",
    };
    const bytes = encodePost(original);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(0);
    const decoded = decodePost(bytes);
    expect(decoded.schema).toBe(POST_SCHEMA_URI);
    expect(decoded.content).toBe("Hello VCO world");
    expect(decoded.channelId).toBe("general");
    expect(decoded.mediaCids).toHaveLength(0);
  });

  it("roundtrips media_cids as Uint8Array elements", () => {
    const cid = new Uint8Array(34).fill(0xab);
    const bytes = encodePost({
      schema: POST_SCHEMA_URI,
      content: "with media",
      mediaCids: [cid],
      timestampMs: 0n,
      channelId: "",
    });
    const decoded = decodePost(bytes);
    expect(decoded.mediaCids).toHaveLength(1);
    expect(decoded.mediaCids[0]).toEqual(cid);
  });

  it("rejects bytes with wrong schema URI", () => {
    const bytes = encodePost({
      schema: "vco://schemas/wrong/v99",
      content: "bad schema",
      mediaCids: [],
      timestampMs: 0n,
      channelId: "",
    });
    expect(() => decodePost(bytes, { strict: true })).toThrow(/schema/i);
  });
});
```

`packages/vco-schemas/src/__tests__/profile-roundtrip.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { encodeProfile, decodeProfile, PROFILE_SCHEMA_URI } from "../profile.js";

describe("Profile encode/decode roundtrip", () => {
  it("roundtrips a full profile", () => {
    const avatarCid = new Uint8Array(34).fill(0x12);
    const prevManifest = new Uint8Array(34).fill(0x34);
    const bytes = encodeProfile({
      schema: PROFILE_SCHEMA_URI,
      displayName: "Alice",
      avatarCid,
      previousManifest: prevManifest,
      bio: "Building on VCO",
    });
    const decoded = decodeProfile(bytes);
    expect(decoded.displayName).toBe("Alice");
    expect(decoded.avatarCid).toEqual(avatarCid);
    expect(decoded.previousManifest).toEqual(prevManifest);
    expect(decoded.bio).toBe("Building on VCO");
  });

  it("roundtrips a minimal profile with no avatar or previous manifest", () => {
    const bytes = encodeProfile({
      schema: PROFILE_SCHEMA_URI,
      displayName: "Bob",
      avatarCid: new Uint8Array(0),
      previousManifest: new Uint8Array(0),
      bio: "",
    });
    const decoded = decodeProfile(bytes);
    expect(decoded.displayName).toBe("Bob");
    expect(decoded.avatarCid.length).toBe(0);
    expect(decoded.previousManifest.length).toBe(0);
  });
});
```

`packages/vco-schemas/src/__tests__/manifest-roundtrip.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  encodeSequenceManifest,
  decodeSequenceManifest,
  SEQUENCE_MANIFEST_SCHEMA_URI,
} from "../manifest.js";

describe("SequenceManifest encode/decode roundtrip", () => {
  it("roundtrips a manifest with two chunks", () => {
    const chunk0 = new Uint8Array(34).fill(0x01);
    const chunk1 = new Uint8Array(34).fill(0x02);
    const bytes = encodeSequenceManifest({
      schema: SEQUENCE_MANIFEST_SCHEMA_URI,
      chunkCids: [chunk0, chunk1],
      totalSize: 2_000_000n,
      mimeType: "image/jpeg",
      previousManifest: new Uint8Array(0),
    });
    const decoded = decodeSequenceManifest(bytes);
    expect(decoded.chunkCids).toHaveLength(2);
    expect(decoded.chunkCids[0]).toEqual(chunk0);
    expect(decoded.chunkCids[1]).toEqual(chunk1);
    expect(decoded.totalSize).toBe(2_000_000n);
    expect(decoded.mimeType).toBe("image/jpeg");
  });

  it("roundtrips an empty chunk list", () => {
    const bytes = encodeSequenceManifest({
      schema: SEQUENCE_MANIFEST_SCHEMA_URI,
      chunkCids: [],
      totalSize: 0n,
      mimeType: "application/octet-stream",
      previousManifest: new Uint8Array(0),
    });
    const decoded = decodeSequenceManifest(bytes);
    expect(decoded.chunkCids).toHaveLength(0);
  });
});
```

**3.2 Run the tests (expected: FAIL — source files don't exist yet)**

```bash
npm run test --workspace=packages/vco-schemas
# Expected: import errors for ../post.js, ../profile.js, ../manifest.js
```

**3.3 Implement `packages/vco-schemas/src/post.ts`**

```typescript
// packages/vco-schemas/src/post.ts
import { Post } from "./generated/post.pb.js";

export const POST_SCHEMA_URI = "vco://schemas/social/post/v1";

export interface PostData {
  schema: string;
  content: string;
  mediaCids: Uint8Array[];
  timestampMs: bigint;
  channelId: string;
}

export interface DecodePostOptions {
  /** When true, throws if schema URI does not match POST_SCHEMA_URI */
  strict?: boolean;
}

export function encodePost(data: PostData): Uint8Array {
  const msg = Post.create({
    schema: data.schema,
    content: data.content,
    mediaCids: data.mediaCids,
    timestampMs: data.timestampMs,
    channelId: data.channelId,
  });
  return Post.encode(msg).finish();
}

export function decodePost(
  bytes: Uint8Array,
  options: DecodePostOptions = {},
): PostData {
  const msg = Post.decode(bytes);
  if (options.strict && msg.schema !== POST_SCHEMA_URI) {
    throw new Error(
      `Unexpected schema URI: expected "${POST_SCHEMA_URI}", got "${msg.schema}"`,
    );
  }
  return {
    schema: msg.schema,
    content: msg.content,
    mediaCids: msg.mediaCids.map((c) => new Uint8Array(c)),
    timestampMs: msg.timestampMs,
    channelId: msg.channelId,
  };
}
```

**3.4 Implement `packages/vco-schemas/src/profile.ts`**

```typescript
// packages/vco-schemas/src/profile.ts
import { Profile } from "./generated/profile.pb.js";

export const PROFILE_SCHEMA_URI = "vco://schemas/identity/profile/v1";

export interface ProfileData {
  schema: string;
  displayName: string;
  avatarCid: Uint8Array;
  previousManifest: Uint8Array;
  bio: string;
}

export function encodeProfile(data: ProfileData): Uint8Array {
  const msg = Profile.create({
    schema: data.schema,
    displayName: data.displayName,
    avatarCid: data.avatarCid,
    previousManifest: data.previousManifest,
    bio: data.bio,
  });
  return Profile.encode(msg).finish();
}

export function decodeProfile(bytes: Uint8Array): ProfileData {
  const msg = Profile.decode(bytes);
  return {
    schema: msg.schema,
    displayName: msg.displayName,
    avatarCid: new Uint8Array(msg.avatarCid),
    previousManifest: new Uint8Array(msg.previousManifest),
    bio: msg.bio,
  };
}
```

**3.5 Implement `packages/vco-schemas/src/manifest.ts`**

```typescript
// packages/vco-schemas/src/manifest.ts
import { SequenceManifest } from "./generated/manifest.pb.js";

export const SEQUENCE_MANIFEST_SCHEMA_URI =
  "vco://schemas/core/sequence-manifest/v1";

export interface SequenceManifestData {
  schema: string;
  chunkCids: Uint8Array[];
  totalSize: bigint;
  mimeType: string;
  previousManifest: Uint8Array;
}

export function encodeSequenceManifest(data: SequenceManifestData): Uint8Array {
  const msg = SequenceManifest.create({
    schema: data.schema,
    chunkCids: data.chunkCids,
    totalSize: data.totalSize,
    mimeType: data.mimeType,
    previousManifest: data.previousManifest,
  });
  return SequenceManifest.encode(msg).finish();
}

export function decodeSequenceManifest(
  bytes: Uint8Array,
): SequenceManifestData {
  const msg = SequenceManifest.decode(bytes);
  return {
    schema: msg.schema,
    chunkCids: msg.chunkCids.map((c) => new Uint8Array(c)),
    totalSize: msg.totalSize,
    mimeType: msg.mimeType,
    previousManifest: new Uint8Array(msg.previousManifest),
  };
}
```

**3.6 Create `packages/vco-schemas/src/index.ts`**

```typescript
// packages/vco-schemas/src/index.ts
export * from "./post.js";
export * from "./profile.js";
export * from "./manifest.js";
export * from "./assembly.js";
```

**3.7 Run the tests (expected: PASS)**

```bash
npm run test --workspace=packages/vco-schemas
# Expected: all roundtrip tests passing
```

**3.8 Run typecheck**

```bash
npm run typecheck --workspace=packages/vco-schemas
# Expected: no errors
```

**3.9 Commit**

```bash
git add packages/vco-schemas/src/post.ts
git add packages/vco-schemas/src/profile.ts
git add packages/vco-schemas/src/manifest.ts
git add packages/vco-schemas/src/index.ts
git add packages/vco-schemas/src/__tests__/
git commit -m "feat(vco-schemas): implement Post, Profile, SequenceManifest encode/decode helpers with roundtrip tests"
```

---

## Task 4 — Assembly state machine with tests

### Files

- `packages/vco-schemas/src/assembly.ts` (new)
- `packages/vco-schemas/src/__tests__/assembly.test.ts` (new)

### Steps

**4.1 Write failing state machine tests**

`packages/vco-schemas/src/__tests__/assembly.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  AssemblyState,
  computeAssemblyState,
  type AssemblyInput,
} from "../assembly.js";

describe("computeAssemblyState", () => {
  const mockCid = (fill: number) => new Uint8Array(34).fill(fill);

  it("returns PENDING when manifest received but no chunks resolved", () => {
    const input: AssemblyInput = {
      chunkCids: [mockCid(1), mockCid(2)],
      resolvedChunks: new Map(),
      corruptedCids: new Set(),
    };
    expect(computeAssemblyState(input)).toBe(AssemblyState.PENDING);
  });

  it("returns PARTIAL when some but not all chunks are resolved", () => {
    const cid0 = mockCid(1);
    const cid1 = mockCid(2);
    const input: AssemblyInput = {
      chunkCids: [cid0, cid1],
      resolvedChunks: new Map([[cid0.toString(), new Uint8Array(16)]]),
      corruptedCids: new Set(),
    };
    expect(computeAssemblyState(input)).toBe(AssemblyState.PARTIAL);
  });

  it("returns COMPLETE when all chunks are resolved and none corrupted", () => {
    const cid0 = mockCid(1);
    const cid1 = mockCid(2);
    const chunks = new Map([
      [cid0.toString(), new Uint8Array(16).fill(0xaa)],
      [cid1.toString(), new Uint8Array(16).fill(0xbb)],
    ]);
    const input: AssemblyInput = {
      chunkCids: [cid0, cid1],
      resolvedChunks: chunks,
      corruptedCids: new Set(),
    };
    expect(computeAssemblyState(input)).toBe(AssemblyState.COMPLETE);
  });

  it("returns CORRUPTED when any chunk fails verification", () => {
    const cid0 = mockCid(1);
    const cid1 = mockCid(2);
    const chunks = new Map([
      [cid0.toString(), new Uint8Array(16).fill(0xaa)],
      [cid1.toString(), new Uint8Array(16).fill(0xbb)],
    ]);
    const input: AssemblyInput = {
      chunkCids: [cid0, cid1],
      resolvedChunks: chunks,
      corruptedCids: new Set([cid1.toString()]),
    };
    expect(computeAssemblyState(input)).toBe(AssemblyState.CORRUPTED);
  });

  it("returns CORRUPTED even if only some chunks resolved and one is corrupted", () => {
    const cid0 = mockCid(1);
    const cid1 = mockCid(2);
    const input: AssemblyInput = {
      chunkCids: [cid0, cid1],
      resolvedChunks: new Map([[cid0.toString(), new Uint8Array(8)]]),
      corruptedCids: new Set([cid0.toString()]),
    };
    expect(computeAssemblyState(input)).toBe(AssemblyState.CORRUPTED);
  });

  it("returns COMPLETE for a zero-chunk manifest (empty sequence)", () => {
    const input: AssemblyInput = {
      chunkCids: [],
      resolvedChunks: new Map(),
      corruptedCids: new Set(),
    };
    expect(computeAssemblyState(input)).toBe(AssemblyState.COMPLETE);
  });
});
```

**4.2 Run the tests (expected: FAIL)**

```bash
npm run test --workspace=packages/vco-schemas
# Expected: import error for ../assembly.js
```

**4.3 Implement `packages/vco-schemas/src/assembly.ts`**

```typescript
// packages/vco-schemas/src/assembly.ts

/**
 * Assembly states for a SequenceManifest tree, per VCO v3.2 spec §6.
 *
 * PENDING   — Manifest received; no leaf chunks are locally available yet.
 * PARTIAL   — At least one chunk received, but the set is incomplete.
 * COMPLETE  — All chunks resolved and verified against their CIDs.
 * CORRUPTED — At least one chunk failed BLAKE3 hash verification.
 */
export enum AssemblyState {
  PENDING = "PENDING",
  PARTIAL = "PARTIAL",
  COMPLETE = "COMPLETE",
  CORRUPTED = "CORRUPTED",
}

/**
 * Inputs required to compute the assembly state of a SequenceManifest.
 *
 * CID keys in the maps/sets are produced by `cid.toString()` (string form of
 * the raw Uint8Array, matching how callers identify chunks).  A simple
 * `Array.prototype.join` or `Buffer.toString()` approach is fine as long as
 * the same method is used consistently by the caller — the state machine
 * itself is key-format agnostic.
 */
export interface AssemblyInput {
  /** Ordered chunk CIDs from the SequenceManifest */
  chunkCids: Uint8Array[];
  /**
   * Map of CID key → resolved chunk bytes for every chunk that has been
   * fetched and stored locally.
   */
  resolvedChunks: Map<string, Uint8Array>;
  /**
   * Set of CID keys that failed BLAKE3 hash verification against their CID.
   * A CID appearing here takes precedence over everything else.
   */
  corruptedCids: Set<string>;
}

/**
 * Pure function — derives the current AssemblyState from the given inputs.
 * Transition order (highest priority first):
 *   CORRUPTED > COMPLETE > PARTIAL > PENDING
 */
export function computeAssemblyState(input: AssemblyInput): AssemblyState {
  const { chunkCids, resolvedChunks, corruptedCids } = input;

  // CORRUPTED takes unconditional precedence.
  if (corruptedCids.size > 0) {
    return AssemblyState.CORRUPTED;
  }

  // Empty manifests are trivially complete.
  if (chunkCids.length === 0) {
    return AssemblyState.COMPLETE;
  }

  const resolvedCount = chunkCids.filter((cid) =>
    resolvedChunks.has(cid.toString()),
  ).length;

  if (resolvedCount === 0) {
    return AssemblyState.PENDING;
  }

  if (resolvedCount < chunkCids.length) {
    return AssemblyState.PARTIAL;
  }

  return AssemblyState.COMPLETE;
}
```

**4.4 Run the tests (expected: PASS)**

```bash
npm run test --workspace=packages/vco-schemas
# Expected: all assembly + roundtrip tests passing
```

**4.5 Run typecheck**

```bash
npm run typecheck --workspace=packages/vco-schemas
# Expected: no errors
```

**4.6 Commit**

```bash
git add packages/vco-schemas/src/assembly.ts
git add packages/vco-schemas/src/__tests__/assembly.test.ts
git commit -m "feat(vco-schemas): add AssemblyState enum and computeAssemblyState pure function with tests"
```

---

## Task 5 — Update vco-cord to encode messages as Posts

### Files

- `packages/vco-cord/package.json` (modified — add `@vco/vco-schemas` dep)
- `packages/vco-cord/src/lib/vco.ts` (modified — use `encodePost` / `decodePost`)
- `packages/vco-cord/src/__tests__/vco-build-message.test.ts` (new)

### Steps

**5.1 Write failing integration test**

`packages/vco-cord/src/__tests__/vco-build-message.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { buildMessage, decodeMessage, generateIdentity } from "../lib/vco.js";
import { decodePost, POST_SCHEMA_URI } from "@vco/vco-schemas";
import { decodeEnvelopeProto } from "@vco/vco-core";

describe("buildMessage / decodeMessage with Post schema", () => {
  it("buildMessage encodes payload as a valid Post protobuf", async () => {
    const identity = generateIdentity("TestUser");
    const msg = await buildMessage("general", "Hello schema world", identity);

    // The raw envelope payload must decode as a Post
    const envelope = decodeEnvelopeProto(msg.rawEnvelope);
    const post = decodePost(envelope.payload);
    expect(post.schema).toBe(POST_SCHEMA_URI);
    expect(post.content).toBe("Hello schema world");
    expect(post.channelId).toBe("general");
  });

  it("decodeMessage extracts content from Post payload", async () => {
    const identity = generateIdentity("TestUser");
    const built = await buildMessage("general", "Roundtrip content", identity);
    const authors = new Map([[built.authorId, "TestUser"]]);
    const decoded = decodeMessage("general", built.rawEnvelope, authors);
    expect(decoded.content).toBe("Roundtrip content");
    expect(decoded.authorName).toBe("TestUser");
    expect(decoded.verified).toBe(true);
    expect(decoded.tampered).toBe(false);
  });
});
```

**5.2 Run the test (expected: FAIL)**

```bash
npm run test --workspace=packages/vco-cord
# Expected: assertion failure — payload decodes as plain UTF-8, not a Post protobuf
```

**5.3 Add `@vco/vco-schemas` to vco-cord's dependencies**

Edit `packages/vco-cord/package.json` — add to `"dependencies"`:

```json
"@vco/vco-schemas": "*"
```

Then install:

```bash
npm install
```

**5.4 Update `packages/vco-cord/src/lib/vco.ts`**

Replace the current file with the updated version that uses `encodePost` / `decodePost`:

```typescript
// packages/vco-cord/src/lib/vco.ts

import {
  createEnvelope,
  encodeEnvelopeProto,
  decodeEnvelopeProto,
  assertEnvelopeIntegrity,
  getPowScore,
  MULTICODEC_PROTOBUF,
} from "@vco/vco-core";
import {
  createNobleCryptoProvider,
  deriveEd25519Multikey,
  deriveEd25519PublicKey,
} from "@vco/vco-crypto";
import {
  encodePost,
  decodePost,
  POST_SCHEMA_URI,
} from "@vco/vco-schemas";
import type { Identity, VcoMessage } from "../types/index.js";

const crypto = createNobleCryptoProvider();

export function generateIdentity(displayName: string): Identity {
  const privateKey = globalThis.crypto.getRandomValues(new Uint8Array(32));
  const publicKey = deriveEd25519PublicKey(privateKey);
  const creatorId = deriveEd25519Multikey(privateKey);
  return { privateKey, publicKey, creatorId, displayName };
}

export function uint8ArrayToHex(arr: Uint8Array): string {
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const POW_DIFFICULTY = 4;

export async function buildMessage(
  channelId: string,
  content: string,
  identity: Identity,
): Promise<VcoMessage> {
  // Encode the message content as a Post schema object.
  const payload = encodePost({
    schema: POST_SCHEMA_URI,
    content,
    mediaCids: [],
    timestampMs: BigInt(Date.now()),
    channelId,
  });

  const envelope = createEnvelope(
    {
      payload,
      payloadType: MULTICODEC_PROTOBUF,
      creatorId: identity.creatorId,
      privateKey: identity.privateKey,
      powDifficulty: POW_DIFFICULTY,
    },
    crypto,
  );
  const rawEnvelope = encodeEnvelopeProto(envelope);
  const powScore = getPowScore(envelope.headerHash);
  return {
    id: uint8ArrayToHex(envelope.headerHash),
    channelId,
    authorId: uint8ArrayToHex(identity.creatorId),
    authorName: identity.displayName,
    content,
    timestamp: Date.now(),
    powScore,
    flags: envelope.header.flags,
    rawEnvelope,
    verified: true,
    tampered: false,
  };
}

export function decodeMessage(
  channelId: string,
  encoded: Uint8Array,
  knownAuthors: Map<string, string>,
): VcoMessage {
  const envelope = decodeEnvelopeProto(encoded);
  let verified = false;
  let tampered = false;
  try {
    assertEnvelopeIntegrity(envelope, crypto);
    verified = true;
  } catch {
    tampered = true;
  }
  const authorId = uint8ArrayToHex(envelope.header.creatorId);

  // Attempt to decode payload as a Post; fall back to raw UTF-8 for legacy
  // or unknown schema envelopes per v3.2 fallback rendering requirement.
  let content: string;
  try {
    const post = decodePost(envelope.payload);
    content = post.content;
  } catch {
    content = new TextDecoder().decode(envelope.payload);
  }

  return {
    id: uint8ArrayToHex(envelope.headerHash),
    channelId,
    authorId,
    authorName: knownAuthors.get(authorId) ?? authorId.slice(0, 8) + "…",
    content,
    timestamp: Date.now(),
    powScore: getPowScore(envelope.headerHash),
    flags: envelope.header.flags,
    rawEnvelope: encoded,
    verified,
    tampered,
  };
}
```

**5.5 Run the tests (expected: PASS)**

```bash
npm run test --workspace=packages/vco-cord
# Expected: both integration tests passing
```

**5.6 Run full workspace typecheck**

```bash
npm run typecheck
# Expected: no errors across all packages
```

**5.7 Run full test suite**

```bash
npm run test
# Expected: all tests passing across all workspaces
```

**5.8 Commit**

```bash
git add packages/vco-cord/package.json
git add packages/vco-cord/src/lib/vco.ts
git add packages/vco-cord/src/__tests__/vco-build-message.test.ts
git commit -m "feat(vco-cord): encode messages as Post schema objects using @vco/vco-schemas"
```

---

## Completion Checklist

- [ ] Task 1: `post.proto`, `profile.proto`, `manifest.proto` created under `proto/vco/schemas/`
- [ ] Task 2: `packages/vco-schemas` package scaffolded; generated stubs present after `npm run proto:gen`
- [ ] Task 3: `encodePost`/`decodePost`, `encodeProfile`/`decodeProfile`, `encodeSequenceManifest`/`decodeSequenceManifest` implemented and roundtrip-tested
- [ ] Task 4: `AssemblyState` enum and `computeAssemblyState` implemented and tested for all four states
- [ ] Task 5: `vco-cord/vco.ts` updated to produce and consume `Post`-schema payloads; legacy UTF-8 fallback preserved
- [ ] `npm run typecheck` clean across all workspaces
- [ ] `npm run test` green across all workspaces
