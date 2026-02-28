# VCO Extended Application-Layer Schemas — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 15 application-layer protobuf schemas across four domains (social, marketplace, files, coordination) to `packages/vco-schemas`, following the same TDD pattern established by Post/Profile/SequenceManifest.

**Architecture:** Each domain lives in a subdirectory (`proto/vco/schemas/social/`, etc.). The existing `generate-proto.mjs` is extended with targets for all 15 protos, each using a unique `$protobuf.roots["vco-schemas-<name>"]` to avoid namespace collision. TypeScript helpers follow the `encode<X>` / `decode<X>` pattern with explicit `bigint ↔ number` conversion for `int64`/`uint64` fields.

**Tech Stack:** protobufjs (static-module ES6), vitest, TypeScript NodeNext, npm workspaces.

**Design doc:** `docs/plans/2026-02-28-vco-extended-schemas-design.md`

---

## Task 1 — Proto files + generator extension

### Files
- `proto/vco/schemas/social/{reaction,reply,follow,tombstone,thread}.proto` (new)
- `proto/vco/schemas/marketplace/{listing,offer,receipt}.proto` (new)
- `proto/vco/schemas/files/{file-descriptor,directory}.proto` (new)
- `proto/vco/schemas/coordination/{poll,vote,event,rsvp,announcement}.proto` (new)
- `scripts/generate-proto.mjs` (modified)

### Step 1.1 — Create domain directories and proto files

```bash
mkdir -p proto/vco/schemas/social proto/vco/schemas/marketplace proto/vco/schemas/files proto/vco/schemas/coordination
```

`proto/vco/schemas/social/reaction.proto`:
```protobuf
syntax = "proto3";
package vco.schemas;
message Reaction {
  string schema = 1;
  bytes target_cid = 2;
  string emoji = 3;
  int64 timestamp_ms = 4;
}
```

`proto/vco/schemas/social/reply.proto`:
```protobuf
syntax = "proto3";
package vco.schemas;
message Reply {
  string schema = 1;
  bytes parent_cid = 2;
  string content = 3;
  repeated bytes media_cids = 4;
  int64 timestamp_ms = 5;
  string channel_id = 6;
}
```

`proto/vco/schemas/social/follow.proto`:
```protobuf
syntax = "proto3";
package vco.schemas;
message Follow {
  string schema = 1;
  bytes subject_key = 2;
  string action = 3;
  int64 timestamp_ms = 4;
}
```

`proto/vco/schemas/social/tombstone.proto`:
```protobuf
syntax = "proto3";
package vco.schemas;
message Tombstone {
  string schema = 1;
  bytes target_cid = 2;
  string reason = 3;
  int64 timestamp_ms = 4;
}
```

`proto/vco/schemas/social/thread.proto`:
```protobuf
syntax = "proto3";
package vco.schemas;
message ThreadEntry {
  bytes cid = 1;
  string schema_uri = 2;
}
message Thread {
  string schema = 1;
  string title = 2;
  repeated ThreadEntry entries = 3;
  int64 timestamp_ms = 4;
}
```

`proto/vco/schemas/marketplace/listing.proto`:
```protobuf
syntax = "proto3";
package vco.schemas;
message Listing {
  string schema = 1;
  string title = 2;
  string description = 3;
  int64 price_sats = 4;
  repeated bytes media_cids = 5;
  int64 expiry_ms = 6;
  bytes previous_cid = 7;
}
```

`proto/vco/schemas/marketplace/offer.proto`:
```protobuf
syntax = "proto3";
package vco.schemas;
message Offer {
  string schema = 1;
  bytes listing_cid = 2;
  int64 offer_sats = 3;
  string message = 4;
  int64 timestamp_ms = 5;
}
```

`proto/vco/schemas/marketplace/receipt.proto`:
```protobuf
syntax = "proto3";
package vco.schemas;
message Receipt {
  string schema = 1;
  bytes listing_cid = 2;
  bytes offer_cid = 3;
  string tx_id = 4;
  int64 timestamp_ms = 5;
}
```

`proto/vco/schemas/files/file-descriptor.proto`:
```protobuf
syntax = "proto3";
package vco.schemas;
message FileDescriptor {
  string schema = 1;
  string name = 2;
  string mime_type = 3;
  uint64 size = 4;
  bytes root_manifest_cid = 5;
  bytes previous_cid = 6;
  int64 timestamp_ms = 7;
}
```

`proto/vco/schemas/files/directory.proto`:
```protobuf
syntax = "proto3";
package vco.schemas;
message DirectoryEntry {
  bytes cid = 1;
  string schema_uri = 2;
  string name = 3;
}
message Directory {
  string schema = 1;
  string name = 2;
  repeated DirectoryEntry entries = 3;
  bytes previous_cid = 4;
  int64 timestamp_ms = 5;
}
```

`proto/vco/schemas/coordination/poll.proto`:
```protobuf
syntax = "proto3";
package vco.schemas;
message Poll {
  string schema = 1;
  string question = 2;
  repeated string options = 3;
  int64 closes_at_ms = 4;
  int64 timestamp_ms = 5;
}
```

`proto/vco/schemas/coordination/vote.proto`:
```protobuf
syntax = "proto3";
package vco.schemas;
message Vote {
  string schema = 1;
  bytes poll_cid = 2;
  uint32 option_index = 3;
  int64 timestamp_ms = 4;
}
```

`proto/vco/schemas/coordination/event.proto`:
```protobuf
syntax = "proto3";
package vco.schemas;
message Event {
  string schema = 1;
  string title = 2;
  string description = 3;
  int64 start_ms = 4;
  int64 end_ms = 5;
  string location = 6;
  bytes previous_cid = 7;
}
```

`proto/vco/schemas/coordination/rsvp.proto`:
```protobuf
syntax = "proto3";
package vco.schemas;
message Rsvp {
  string schema = 1;
  bytes event_cid = 2;
  string status = 3;
  int64 timestamp_ms = 4;
}
```

`proto/vco/schemas/coordination/announcement.proto`:
```protobuf
syntax = "proto3";
package vco.schemas;
message Announcement {
  string schema = 1;
  string content = 2;
  string priority = 3;
  repeated bytes media_cids = 4;
  int64 timestamp_ms = 5;
}
```

### Step 1.2 — Extend `scripts/generate-proto.mjs`

Locate the `schemaTargets` array at the bottom of the file. Replace it with the expanded version below (keeping the existing `post`, `profile`, `manifest` entries and adding the 15 new ones).

Also add domain subdirectory creation before the loop:

```javascript
// After: const schemasOutDir = ...
// Add:
for (const domain of ["social", "marketplace", "files", "coordination"]) {
  await fs.mkdir(path.join(schemasOutDir, domain), { recursive: true });
}
```

Then extend `schemaTargets` with these additional entries (append after manifest entry):

```javascript
// ── Social ────────────────────────────────────────────────────────────────────
{
  protoFile: "proto/vco/schemas/social/reaction.proto",
  outBase: "social/reaction",
  reExport: "export const Reaction = vco.schemas.Reaction;",
  dts: `import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IReaction { schema?: string|null; targetCid?: Uint8Array|null; emoji?: string|null; timestampMs?: number|null; }
  class Reaction implements IReaction {
    constructor(p?: IReaction); schema: string; targetCid: Uint8Array; emoji: string; timestampMs: number;
    static create(p?: IReaction): Reaction;
    static encode(m: IReaction, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Reaction;
  }
} }
export const Reaction: typeof vco.schemas.Reaction;
`,
},
{
  protoFile: "proto/vco/schemas/social/reply.proto",
  outBase: "social/reply",
  reExport: "export const Reply = vco.schemas.Reply;",
  dts: `import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IReply { schema?: string|null; parentCid?: Uint8Array|null; content?: string|null; mediaCids?: Uint8Array[]|null; timestampMs?: number|null; channelId?: string|null; }
  class Reply implements IReply {
    constructor(p?: IReply); schema: string; parentCid: Uint8Array; content: string; mediaCids: Uint8Array[]; timestampMs: number; channelId: string;
    static create(p?: IReply): Reply;
    static encode(m: IReply, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Reply;
  }
} }
export const Reply: typeof vco.schemas.Reply;
`,
},
{
  protoFile: "proto/vco/schemas/social/follow.proto",
  outBase: "social/follow",
  reExport: "export const Follow = vco.schemas.Follow;",
  dts: `import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IFollow { schema?: string|null; subjectKey?: Uint8Array|null; action?: string|null; timestampMs?: number|null; }
  class Follow implements IFollow {
    constructor(p?: IFollow); schema: string; subjectKey: Uint8Array; action: string; timestampMs: number;
    static create(p?: IFollow): Follow;
    static encode(m: IFollow, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Follow;
  }
} }
export const Follow: typeof vco.schemas.Follow;
`,
},
{
  protoFile: "proto/vco/schemas/social/tombstone.proto",
  outBase: "social/tombstone",
  reExport: "export const Tombstone = vco.schemas.Tombstone;",
  dts: `import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface ITombstone { schema?: string|null; targetCid?: Uint8Array|null; reason?: string|null; timestampMs?: number|null; }
  class Tombstone implements ITombstone {
    constructor(p?: ITombstone); schema: string; targetCid: Uint8Array; reason: string; timestampMs: number;
    static create(p?: ITombstone): Tombstone;
    static encode(m: ITombstone, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Tombstone;
  }
} }
export const Tombstone: typeof vco.schemas.Tombstone;
`,
},
{
  protoFile: "proto/vco/schemas/social/thread.proto",
  outBase: "social/thread",
  reExport: "export const ThreadEntry = vco.schemas.ThreadEntry;\nexport const Thread = vco.schemas.Thread;",
  dts: `import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IThreadEntry { cid?: Uint8Array|null; schemaUri?: string|null; }
  class ThreadEntry implements IThreadEntry {
    constructor(p?: IThreadEntry); cid: Uint8Array; schemaUri: string;
    static create(p?: IThreadEntry): ThreadEntry;
    static encode(m: IThreadEntry, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): ThreadEntry;
  }
  interface IThread { schema?: string|null; title?: string|null; entries?: IThreadEntry[]|null; timestampMs?: number|null; }
  class Thread implements IThread {
    constructor(p?: IThread); schema: string; title: string; entries: ThreadEntry[]; timestampMs: number;
    static create(p?: IThread): Thread;
    static encode(m: IThread, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Thread;
  }
} }
export const ThreadEntry: typeof vco.schemas.ThreadEntry;
export const Thread: typeof vco.schemas.Thread;
`,
},
// ── Marketplace ───────────────────────────────────────────────────────────────
{
  protoFile: "proto/vco/schemas/marketplace/listing.proto",
  outBase: "marketplace/listing",
  reExport: "export const Listing = vco.schemas.Listing;",
  dts: `import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IListing { schema?: string|null; title?: string|null; description?: string|null; priceSats?: number|null; mediaCids?: Uint8Array[]|null; expiryMs?: number|null; previousCid?: Uint8Array|null; }
  class Listing implements IListing {
    constructor(p?: IListing); schema: string; title: string; description: string; priceSats: number; mediaCids: Uint8Array[]; expiryMs: number; previousCid: Uint8Array;
    static create(p?: IListing): Listing;
    static encode(m: IListing, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Listing;
  }
} }
export const Listing: typeof vco.schemas.Listing;
`,
},
{
  protoFile: "proto/vco/schemas/marketplace/offer.proto",
  outBase: "marketplace/offer",
  reExport: "export const Offer = vco.schemas.Offer;",
  dts: `import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IOffer { schema?: string|null; listingCid?: Uint8Array|null; offerSats?: number|null; message?: string|null; timestampMs?: number|null; }
  class Offer implements IOffer {
    constructor(p?: IOffer); schema: string; listingCid: Uint8Array; offerSats: number; message: string; timestampMs: number;
    static create(p?: IOffer): Offer;
    static encode(m: IOffer, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Offer;
  }
} }
export const Offer: typeof vco.schemas.Offer;
`,
},
{
  protoFile: "proto/vco/schemas/marketplace/receipt.proto",
  outBase: "marketplace/receipt",
  reExport: "export const Receipt = vco.schemas.Receipt;",
  dts: `import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IReceipt { schema?: string|null; listingCid?: Uint8Array|null; offerCid?: Uint8Array|null; txId?: string|null; timestampMs?: number|null; }
  class Receipt implements IReceipt {
    constructor(p?: IReceipt); schema: string; listingCid: Uint8Array; offerCid: Uint8Array; txId: string; timestampMs: number;
    static create(p?: IReceipt): Receipt;
    static encode(m: IReceipt, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Receipt;
  }
} }
export const Receipt: typeof vco.schemas.Receipt;
`,
},
// ── Files ─────────────────────────────────────────────────────────────────────
{
  protoFile: "proto/vco/schemas/files/file-descriptor.proto",
  outBase: "files/file-descriptor",
  reExport: "export const FileDescriptor = vco.schemas.FileDescriptor;",
  dts: `import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IFileDescriptor { schema?: string|null; name?: string|null; mimeType?: string|null; size?: number|null; rootManifestCid?: Uint8Array|null; previousCid?: Uint8Array|null; timestampMs?: number|null; }
  class FileDescriptor implements IFileDescriptor {
    constructor(p?: IFileDescriptor); schema: string; name: string; mimeType: string; size: number; rootManifestCid: Uint8Array; previousCid: Uint8Array; timestampMs: number;
    static create(p?: IFileDescriptor): FileDescriptor;
    static encode(m: IFileDescriptor, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): FileDescriptor;
  }
} }
export const FileDescriptor: typeof vco.schemas.FileDescriptor;
`,
},
{
  protoFile: "proto/vco/schemas/files/directory.proto",
  outBase: "files/directory",
  reExport: "export const DirectoryEntry = vco.schemas.DirectoryEntry;\nexport const Directory = vco.schemas.Directory;",
  dts: `import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IDirectoryEntry { cid?: Uint8Array|null; schemaUri?: string|null; name?: string|null; }
  class DirectoryEntry implements IDirectoryEntry {
    constructor(p?: IDirectoryEntry); cid: Uint8Array; schemaUri: string; name: string;
    static create(p?: IDirectoryEntry): DirectoryEntry;
    static encode(m: IDirectoryEntry, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): DirectoryEntry;
  }
  interface IDirectory { schema?: string|null; name?: string|null; entries?: IDirectoryEntry[]|null; previousCid?: Uint8Array|null; timestampMs?: number|null; }
  class Directory implements IDirectory {
    constructor(p?: IDirectory); schema: string; name: string; entries: DirectoryEntry[]; previousCid: Uint8Array; timestampMs: number;
    static create(p?: IDirectory): Directory;
    static encode(m: IDirectory, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Directory;
  }
} }
export const DirectoryEntry: typeof vco.schemas.DirectoryEntry;
export const Directory: typeof vco.schemas.Directory;
`,
},
// ── Coordination ──────────────────────────────────────────────────────────────
{
  protoFile: "proto/vco/schemas/coordination/poll.proto",
  outBase: "coordination/poll",
  reExport: "export const Poll = vco.schemas.Poll;",
  dts: `import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IPoll { schema?: string|null; question?: string|null; options?: string[]|null; closesAtMs?: number|null; timestampMs?: number|null; }
  class Poll implements IPoll {
    constructor(p?: IPoll); schema: string; question: string; options: string[]; closesAtMs: number; timestampMs: number;
    static create(p?: IPoll): Poll;
    static encode(m: IPoll, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Poll;
  }
} }
export const Poll: typeof vco.schemas.Poll;
`,
},
{
  protoFile: "proto/vco/schemas/coordination/vote.proto",
  outBase: "coordination/vote",
  reExport: "export const Vote = vco.schemas.Vote;",
  dts: `import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IVote { schema?: string|null; pollCid?: Uint8Array|null; optionIndex?: number|null; timestampMs?: number|null; }
  class Vote implements IVote {
    constructor(p?: IVote); schema: string; pollCid: Uint8Array; optionIndex: number; timestampMs: number;
    static create(p?: IVote): Vote;
    static encode(m: IVote, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Vote;
  }
} }
export const Vote: typeof vco.schemas.Vote;
`,
},
{
  protoFile: "proto/vco/schemas/coordination/event.proto",
  outBase: "coordination/event",
  reExport: "export const Event = vco.schemas.Event;",
  dts: `import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IEvent { schema?: string|null; title?: string|null; description?: string|null; startMs?: number|null; endMs?: number|null; location?: string|null; previousCid?: Uint8Array|null; }
  class Event implements IEvent {
    constructor(p?: IEvent); schema: string; title: string; description: string; startMs: number; endMs: number; location: string; previousCid: Uint8Array;
    static create(p?: IEvent): Event;
    static encode(m: IEvent, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Event;
  }
} }
export const Event: typeof vco.schemas.Event;
`,
},
{
  protoFile: "proto/vco/schemas/coordination/rsvp.proto",
  outBase: "coordination/rsvp",
  reExport: "export const Rsvp = vco.schemas.Rsvp;",
  dts: `import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IRsvp { schema?: string|null; eventCid?: Uint8Array|null; status?: string|null; timestampMs?: number|null; }
  class Rsvp implements IRsvp {
    constructor(p?: IRsvp); schema: string; eventCid: Uint8Array; status: string; timestampMs: number;
    static create(p?: IRsvp): Rsvp;
    static encode(m: IRsvp, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Rsvp;
  }
} }
export const Rsvp: typeof vco.schemas.Rsvp;
`,
},
{
  protoFile: "proto/vco/schemas/coordination/announcement.proto",
  outBase: "coordination/announcement",
  reExport: "export const Announcement = vco.schemas.Announcement;",
  dts: `import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IAnnouncement { schema?: string|null; content?: string|null; priority?: string|null; mediaCids?: Uint8Array[]|null; timestampMs?: number|null; }
  class Announcement implements IAnnouncement {
    constructor(p?: IAnnouncement); schema: string; content: string; priority: string; mediaCids: Uint8Array[]; timestampMs: number;
    static create(p?: IAnnouncement): Announcement;
    static encode(m: IAnnouncement, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Announcement;
  }
} }
export const Announcement: typeof vco.schemas.Announcement;
`,
},
```

### Step 1.3 — Run codegen

```bash
npm run proto:gen
```

Expected output: 30 lines of `Generated packages/vco-schemas/src/generated/social/reaction.pb.js` etc. (2 files × 15 schemas).

### Step 1.4 — Verify generated files exist

```bash
ls packages/vco-schemas/src/generated/social/ packages/vco-schemas/src/generated/marketplace/ packages/vco-schemas/src/generated/files/ packages/vco-schemas/src/generated/coordination/
```

Expected: 10 `.pb.js` + 10 `.pb.d.ts` files across the four subdirectories (thread and directory each generate 2 classes, but one file each).

### Step 1.5 — Commit

```bash
git add proto/vco/schemas/social/ proto/vco/schemas/marketplace/ proto/vco/schemas/files/ proto/vco/schemas/coordination/ scripts/generate-proto.mjs packages/vco-schemas/src/generated/
git commit -m "feat(schemas): add 15 extended application-layer proto schemas with codegen"
```

---

## Task 2 — Social TypeScript helpers + roundtrip tests

### Files
- `packages/vco-schemas/src/social/reaction.ts` (new)
- `packages/vco-schemas/src/social/reply.ts` (new)
- `packages/vco-schemas/src/social/follow.ts` (new)
- `packages/vco-schemas/src/social/tombstone.ts` (new)
- `packages/vco-schemas/src/social/thread.ts` (new)
- `packages/vco-schemas/src/__tests__/social-roundtrip.test.ts` (new)

### Step 2.1 — Write failing roundtrip tests

`packages/vco-schemas/src/__tests__/social-roundtrip.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { encodeReaction, decodeReaction, REACTION_SCHEMA_URI } from "../social/reaction.js";
import { encodeReply, decodeReply, REPLY_SCHEMA_URI } from "../social/reply.js";
import { encodeFollow, decodeFollow, FOLLOW_SCHEMA_URI } from "../social/follow.js";
import { encodeTombstone, decodeTombstone, TOMBSTONE_SCHEMA_URI } from "../social/tombstone.js";
import { encodeThread, decodeThread, THREAD_SCHEMA_URI } from "../social/thread.js";

const cid = () => new Uint8Array(34).fill(0xab);

describe("Reaction roundtrip", () => {
  it("roundtrips all fields", () => {
    const bytes = encodeReaction({ schema: REACTION_SCHEMA_URI, targetCid: cid(), emoji: "👍", timestampMs: 1_700_000_000_000n });
    const d = decodeReaction(bytes);
    expect(d.schema).toBe(REACTION_SCHEMA_URI);
    expect(d.targetCid).toEqual(cid());
    expect(d.emoji).toBe("👍");
    expect(d.timestampMs).toBe(1_700_000_000_000n);
  });
});

describe("Reply roundtrip", () => {
  it("roundtrips all fields", () => {
    const bytes = encodeReply({ schema: REPLY_SCHEMA_URI, parentCid: cid(), content: "hello", mediaCids: [], timestampMs: 0n, channelId: "general" });
    const d = decodeReply(bytes);
    expect(d.content).toBe("hello");
    expect(d.parentCid).toEqual(cid());
    expect(d.channelId).toBe("general");
  });
});

describe("Follow roundtrip", () => {
  it("roundtrips follow action", () => {
    const key = new Uint8Array(34).fill(0x12);
    const bytes = encodeFollow({ schema: FOLLOW_SCHEMA_URI, subjectKey: key, action: "follow", timestampMs: 0n });
    const d = decodeFollow(bytes);
    expect(d.subjectKey).toEqual(key);
    expect(d.action).toBe("follow");
  });
});

describe("Tombstone roundtrip", () => {
  it("roundtrips target cid and reason", () => {
    const bytes = encodeTombstone({ schema: TOMBSTONE_SCHEMA_URI, targetCid: cid(), reason: "spam", timestampMs: 0n });
    const d = decodeTombstone(bytes);
    expect(d.targetCid).toEqual(cid());
    expect(d.reason).toBe("spam");
  });
});

describe("Thread roundtrip", () => {
  it("roundtrips entries", () => {
    const bytes = encodeThread({
      schema: THREAD_SCHEMA_URI,
      title: "My thread",
      entries: [{ cid: cid(), schemaUri: "vco://schemas/social/post/v1" }],
      timestampMs: 0n,
    });
    const d = decodeThread(bytes);
    expect(d.title).toBe("My thread");
    expect(d.entries).toHaveLength(1);
    expect(d.entries[0].schemaUri).toBe("vco://schemas/social/post/v1");
    expect(d.entries[0].cid).toEqual(cid());
  });

  it("roundtrips empty entries", () => {
    const bytes = encodeThread({ schema: THREAD_SCHEMA_URI, title: "", entries: [], timestampMs: 0n });
    const d = decodeThread(bytes);
    expect(d.entries).toHaveLength(0);
  });
});
```

### Step 2.2 — Run tests (expected: FAIL — import errors)

```bash
npm run test --workspace=packages/vco-schemas 2>&1 | grep "FAIL\|Cannot find"
```

### Step 2.3 — Implement social helpers

```bash
mkdir -p packages/vco-schemas/src/social
```

`packages/vco-schemas/src/social/reaction.ts`:
```typescript
import { Reaction } from "../generated/social/reaction.pb.js";
export const REACTION_SCHEMA_URI = "vco://schemas/social/reaction/v1";
export interface ReactionData { schema: string; targetCid: Uint8Array; emoji: string; timestampMs: bigint; }
export function encodeReaction(d: ReactionData): Uint8Array {
  return Reaction.encode(Reaction.create({ schema: d.schema, targetCid: d.targetCid, emoji: d.emoji, timestampMs: Number(d.timestampMs) })).finish();
}
export function decodeReaction(bytes: Uint8Array): ReactionData {
  const m = Reaction.decode(bytes);
  return { schema: m.schema, targetCid: new Uint8Array(m.targetCid), emoji: m.emoji, timestampMs: BigInt(m.timestampMs as number) };
}
```

`packages/vco-schemas/src/social/reply.ts`:
```typescript
import { Reply } from "../generated/social/reply.pb.js";
export const REPLY_SCHEMA_URI = "vco://schemas/social/reply/v1";
export interface ReplyData { schema: string; parentCid: Uint8Array; content: string; mediaCids: Uint8Array[]; timestampMs: bigint; channelId: string; }
export function encodeReply(d: ReplyData): Uint8Array {
  return Reply.encode(Reply.create({ schema: d.schema, parentCid: d.parentCid, content: d.content, mediaCids: d.mediaCids, timestampMs: Number(d.timestampMs), channelId: d.channelId })).finish();
}
export function decodeReply(bytes: Uint8Array): ReplyData {
  const m = Reply.decode(bytes);
  return { schema: m.schema, parentCid: new Uint8Array(m.parentCid), content: m.content, mediaCids: m.mediaCids.map(c => new Uint8Array(c)), timestampMs: BigInt(m.timestampMs as number), channelId: m.channelId };
}
```

`packages/vco-schemas/src/social/follow.ts`:
```typescript
import { Follow } from "../generated/social/follow.pb.js";
export const FOLLOW_SCHEMA_URI = "vco://schemas/social/follow/v1";
export interface FollowData { schema: string; subjectKey: Uint8Array; action: "follow" | "unfollow"; timestampMs: bigint; }
export function encodeFollow(d: FollowData): Uint8Array {
  return Follow.encode(Follow.create({ schema: d.schema, subjectKey: d.subjectKey, action: d.action, timestampMs: Number(d.timestampMs) })).finish();
}
export function decodeFollow(bytes: Uint8Array): FollowData {
  const m = Follow.decode(bytes);
  return { schema: m.schema, subjectKey: new Uint8Array(m.subjectKey), action: m.action as "follow" | "unfollow", timestampMs: BigInt(m.timestampMs as number) };
}
```

`packages/vco-schemas/src/social/tombstone.ts`:
```typescript
import { Tombstone } from "../generated/social/tombstone.pb.js";
export const TOMBSTONE_SCHEMA_URI = "vco://schemas/social/tombstone/v1";
export interface TombstoneData { schema: string; targetCid: Uint8Array; reason: string; timestampMs: bigint; }
export function encodeTombstone(d: TombstoneData): Uint8Array {
  return Tombstone.encode(Tombstone.create({ schema: d.schema, targetCid: d.targetCid, reason: d.reason, timestampMs: Number(d.timestampMs) })).finish();
}
export function decodeTombstone(bytes: Uint8Array): TombstoneData {
  const m = Tombstone.decode(bytes);
  return { schema: m.schema, targetCid: new Uint8Array(m.targetCid), reason: m.reason, timestampMs: BigInt(m.timestampMs as number) };
}
```

`packages/vco-schemas/src/social/thread.ts`:
```typescript
import { Thread, ThreadEntry } from "../generated/social/thread.pb.js";
export const THREAD_SCHEMA_URI = "vco://schemas/social/thread/v1";
export interface ThreadEntryData { cid: Uint8Array; schemaUri: string; }
export interface ThreadData { schema: string; title: string; entries: ThreadEntryData[]; timestampMs: bigint; }
export function encodeThread(d: ThreadData): Uint8Array {
  return Thread.encode(Thread.create({
    schema: d.schema, title: d.title,
    entries: d.entries.map(e => ThreadEntry.create({ cid: e.cid, schemaUri: e.schemaUri })),
    timestampMs: Number(d.timestampMs),
  })).finish();
}
export function decodeThread(bytes: Uint8Array): ThreadData {
  const m = Thread.decode(bytes);
  return { schema: m.schema, title: m.title, entries: m.entries.map(e => ({ cid: new Uint8Array(e.cid), schemaUri: e.schemaUri })), timestampMs: BigInt(m.timestampMs as number) };
}
```

### Step 2.4 — Run tests (expected: PASS)

```bash
npm run test --workspace=packages/vco-schemas 2>&1 | tail -10
```

Expected: all social tests passing, all prior tests still passing.

### Step 2.5 — Commit

```bash
git add packages/vco-schemas/src/social/ packages/vco-schemas/src/__tests__/social-roundtrip.test.ts
git commit -m "feat(vco-schemas): add social schema helpers with roundtrip tests (reaction, reply, follow, tombstone, thread)"
```

---

## Task 3 — Marketplace TypeScript helpers + roundtrip tests

### Files
- `packages/vco-schemas/src/marketplace/listing.ts` (new)
- `packages/vco-schemas/src/marketplace/offer.ts` (new)
- `packages/vco-schemas/src/marketplace/receipt.ts` (new)
- `packages/vco-schemas/src/__tests__/marketplace-roundtrip.test.ts` (new)

### Step 3.1 — Write failing tests

`packages/vco-schemas/src/__tests__/marketplace-roundtrip.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { encodeListing, decodeListing, LISTING_SCHEMA_URI } from "../marketplace/listing.js";
import { encodeOffer, decodeOffer, OFFER_SCHEMA_URI } from "../marketplace/offer.js";
import { encodeReceipt, decodeReceipt, RECEIPT_SCHEMA_URI } from "../marketplace/receipt.js";

const cid = () => new Uint8Array(34).fill(0xcd);

describe("Listing roundtrip", () => {
  it("roundtrips all fields", () => {
    const bytes = encodeListing({ schema: LISTING_SCHEMA_URI, title: "Widget", description: "A widget", priceSats: 1000n, mediaCids: [cid()], expiryMs: 0n, previousCid: new Uint8Array(0) });
    const d = decodeListing(bytes);
    expect(d.title).toBe("Widget");
    expect(d.priceSats).toBe(1000n);
    expect(d.mediaCids).toHaveLength(1);
    expect(d.mediaCids[0]).toEqual(cid());
  });
});

describe("Offer roundtrip", () => {
  it("roundtrips all fields", () => {
    const bytes = encodeOffer({ schema: OFFER_SCHEMA_URI, listingCid: cid(), offerSats: 900n, message: "Deal?", timestampMs: 0n });
    const d = decodeOffer(bytes);
    expect(d.offerSats).toBe(900n);
    expect(d.listingCid).toEqual(cid());
    expect(d.message).toBe("Deal?");
  });
});

describe("Receipt roundtrip", () => {
  it("roundtrips all fields", () => {
    const bytes = encodeReceipt({ schema: RECEIPT_SCHEMA_URI, listingCid: cid(), offerCid: cid(), txId: "abc123", timestampMs: 0n });
    const d = decodeReceipt(bytes);
    expect(d.txId).toBe("abc123");
    expect(d.listingCid).toEqual(cid());
  });
});
```

### Step 3.2 — Run tests (expected: FAIL)

```bash
npm run test --workspace=packages/vco-schemas 2>&1 | grep "FAIL"
```

### Step 3.3 — Implement marketplace helpers

```bash
mkdir -p packages/vco-schemas/src/marketplace
```

`packages/vco-schemas/src/marketplace/listing.ts`:
```typescript
import { Listing } from "../generated/marketplace/listing.pb.js";
export const LISTING_SCHEMA_URI = "vco://schemas/marketplace/listing/v1";
export interface ListingData { schema: string; title: string; description: string; priceSats: bigint; mediaCids: Uint8Array[]; expiryMs: bigint; previousCid: Uint8Array; }
export function encodeListing(d: ListingData): Uint8Array {
  return Listing.encode(Listing.create({ schema: d.schema, title: d.title, description: d.description, priceSats: Number(d.priceSats), mediaCids: d.mediaCids, expiryMs: Number(d.expiryMs), previousCid: d.previousCid })).finish();
}
export function decodeListing(bytes: Uint8Array): ListingData {
  const m = Listing.decode(bytes);
  return { schema: m.schema, title: m.title, description: m.description, priceSats: BigInt(m.priceSats as number), mediaCids: m.mediaCids.map(c => new Uint8Array(c)), expiryMs: BigInt(m.expiryMs as number), previousCid: new Uint8Array(m.previousCid) };
}
```

`packages/vco-schemas/src/marketplace/offer.ts`:
```typescript
import { Offer } from "../generated/marketplace/offer.pb.js";
export const OFFER_SCHEMA_URI = "vco://schemas/marketplace/offer/v1";
export interface OfferData { schema: string; listingCid: Uint8Array; offerSats: bigint; message: string; timestampMs: bigint; }
export function encodeOffer(d: OfferData): Uint8Array {
  return Offer.encode(Offer.create({ schema: d.schema, listingCid: d.listingCid, offerSats: Number(d.offerSats), message: d.message, timestampMs: Number(d.timestampMs) })).finish();
}
export function decodeOffer(bytes: Uint8Array): OfferData {
  const m = Offer.decode(bytes);
  return { schema: m.schema, listingCid: new Uint8Array(m.listingCid), offerSats: BigInt(m.offerSats as number), message: m.message, timestampMs: BigInt(m.timestampMs as number) };
}
```

`packages/vco-schemas/src/marketplace/receipt.ts`:
```typescript
import { Receipt } from "../generated/marketplace/receipt.pb.js";
export const RECEIPT_SCHEMA_URI = "vco://schemas/marketplace/receipt/v1";
export interface ReceiptData { schema: string; listingCid: Uint8Array; offerCid: Uint8Array; txId: string; timestampMs: bigint; }
export function encodeReceipt(d: ReceiptData): Uint8Array {
  return Receipt.encode(Receipt.create({ schema: d.schema, listingCid: d.listingCid, offerCid: d.offerCid, txId: d.txId, timestampMs: Number(d.timestampMs) })).finish();
}
export function decodeReceipt(bytes: Uint8Array): ReceiptData {
  const m = Receipt.decode(bytes);
  return { schema: m.schema, listingCid: new Uint8Array(m.listingCid), offerCid: new Uint8Array(m.offerCid), txId: m.txId, timestampMs: BigInt(m.timestampMs as number) };
}
```

### Step 3.4 — Run tests (expected: PASS)

```bash
npm run test --workspace=packages/vco-schemas 2>&1 | tail -10
```

### Step 3.5 — Commit

```bash
git add packages/vco-schemas/src/marketplace/ packages/vco-schemas/src/__tests__/marketplace-roundtrip.test.ts
git commit -m "feat(vco-schemas): add marketplace schema helpers with roundtrip tests (listing, offer, receipt)"
```

---

## Task 4 — Files TypeScript helpers + roundtrip tests

### Files
- `packages/vco-schemas/src/files/file-descriptor.ts` (new)
- `packages/vco-schemas/src/files/directory.ts` (new)
- `packages/vco-schemas/src/__tests__/files-roundtrip.test.ts` (new)

### Step 4.1 — Write failing tests

`packages/vco-schemas/src/__tests__/files-roundtrip.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { encodeFileDescriptor, decodeFileDescriptor, FILE_DESCRIPTOR_SCHEMA_URI } from "../files/file-descriptor.js";
import { encodeDirectory, decodeDirectory, DIRECTORY_SCHEMA_URI } from "../files/directory.js";

const cid = () => new Uint8Array(34).fill(0xef);

describe("FileDescriptor roundtrip", () => {
  it("roundtrips all fields", () => {
    const bytes = encodeFileDescriptor({ schema: FILE_DESCRIPTOR_SCHEMA_URI, name: "photo.jpg", mimeType: "image/jpeg", size: 2_000_000n, rootManifestCid: cid(), previousCid: new Uint8Array(0), timestampMs: 0n });
    const d = decodeFileDescriptor(bytes);
    expect(d.name).toBe("photo.jpg");
    expect(d.mimeType).toBe("image/jpeg");
    expect(d.size).toBe(2_000_000n);
    expect(d.rootManifestCid).toEqual(cid());
  });
});

describe("Directory roundtrip", () => {
  it("roundtrips entries with schema hints", () => {
    const bytes = encodeDirectory({
      schema: DIRECTORY_SCHEMA_URI,
      name: "photos",
      entries: [{ cid: cid(), schemaUri: FILE_DESCRIPTOR_SCHEMA_URI, name: "photo.jpg" }],
      previousCid: new Uint8Array(0),
      timestampMs: 0n,
    });
    const d = decodeDirectory(bytes);
    expect(d.name).toBe("photos");
    expect(d.entries).toHaveLength(1);
    expect(d.entries[0].name).toBe("photo.jpg");
    expect(d.entries[0].schemaUri).toBe(FILE_DESCRIPTOR_SCHEMA_URI);
  });

  it("roundtrips empty directory", () => {
    const bytes = encodeDirectory({ schema: DIRECTORY_SCHEMA_URI, name: "empty", entries: [], previousCid: new Uint8Array(0), timestampMs: 0n });
    const d = decodeDirectory(bytes);
    expect(d.entries).toHaveLength(0);
  });
});
```

### Step 4.2 — Run tests (expected: FAIL)

```bash
npm run test --workspace=packages/vco-schemas 2>&1 | grep "FAIL"
```

### Step 4.3 — Implement files helpers

```bash
mkdir -p packages/vco-schemas/src/files
```

`packages/vco-schemas/src/files/file-descriptor.ts`:
```typescript
import { FileDescriptor } from "../generated/files/file-descriptor.pb.js";
export const FILE_DESCRIPTOR_SCHEMA_URI = "vco://schemas/files/file-descriptor/v1";
export interface FileDescriptorData { schema: string; name: string; mimeType: string; size: bigint; rootManifestCid: Uint8Array; previousCid: Uint8Array; timestampMs: bigint; }
export function encodeFileDescriptor(d: FileDescriptorData): Uint8Array {
  return FileDescriptor.encode(FileDescriptor.create({ schema: d.schema, name: d.name, mimeType: d.mimeType, size: Number(d.size), rootManifestCid: d.rootManifestCid, previousCid: d.previousCid, timestampMs: Number(d.timestampMs) })).finish();
}
export function decodeFileDescriptor(bytes: Uint8Array): FileDescriptorData {
  const m = FileDescriptor.decode(bytes);
  return { schema: m.schema, name: m.name, mimeType: m.mimeType, size: BigInt(m.size as number), rootManifestCid: new Uint8Array(m.rootManifestCid), previousCid: new Uint8Array(m.previousCid), timestampMs: BigInt(m.timestampMs as number) };
}
```

`packages/vco-schemas/src/files/directory.ts`:
```typescript
import { Directory, DirectoryEntry } from "../generated/files/directory.pb.js";
export const DIRECTORY_SCHEMA_URI = "vco://schemas/files/directory/v1";
export interface DirectoryEntryData { cid: Uint8Array; schemaUri: string; name: string; }
export interface DirectoryData { schema: string; name: string; entries: DirectoryEntryData[]; previousCid: Uint8Array; timestampMs: bigint; }
export function encodeDirectory(d: DirectoryData): Uint8Array {
  return Directory.encode(Directory.create({
    schema: d.schema, name: d.name,
    entries: d.entries.map(e => DirectoryEntry.create({ cid: e.cid, schemaUri: e.schemaUri, name: e.name })),
    previousCid: d.previousCid, timestampMs: Number(d.timestampMs),
  })).finish();
}
export function decodeDirectory(bytes: Uint8Array): DirectoryData {
  const m = Directory.decode(bytes);
  return { schema: m.schema, name: m.name, entries: m.entries.map(e => ({ cid: new Uint8Array(e.cid), schemaUri: e.schemaUri, name: e.name })), previousCid: new Uint8Array(m.previousCid), timestampMs: BigInt(m.timestampMs as number) };
}
```

### Step 4.4 — Run tests (expected: PASS)

```bash
npm run test --workspace=packages/vco-schemas 2>&1 | tail -10
```

### Step 4.5 — Commit

```bash
git add packages/vco-schemas/src/files/ packages/vco-schemas/src/__tests__/files-roundtrip.test.ts
git commit -m "feat(vco-schemas): add file sharing schema helpers with roundtrip tests (file-descriptor, directory)"
```

---

## Task 5 — Coordination TypeScript helpers + roundtrip tests

### Files
- `packages/vco-schemas/src/coordination/poll.ts` (new)
- `packages/vco-schemas/src/coordination/vote.ts` (new)
- `packages/vco-schemas/src/coordination/event.ts` (new)
- `packages/vco-schemas/src/coordination/rsvp.ts` (new)
- `packages/vco-schemas/src/coordination/announcement.ts` (new)
- `packages/vco-schemas/src/__tests__/coordination-roundtrip.test.ts` (new)

### Step 5.1 — Write failing tests

`packages/vco-schemas/src/__tests__/coordination-roundtrip.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { encodePoll, decodePoll, POLL_SCHEMA_URI } from "../coordination/poll.js";
import { encodeVote, decodeVote, VOTE_SCHEMA_URI } from "../coordination/vote.js";
import { encodeEvent, decodeEvent, EVENT_SCHEMA_URI } from "../coordination/event.js";
import { encodeRsvp, decodeRsvp, RSVP_SCHEMA_URI } from "../coordination/rsvp.js";
import { encodeAnnouncement, decodeAnnouncement, ANNOUNCEMENT_SCHEMA_URI } from "../coordination/announcement.js";

const cid = () => new Uint8Array(34).fill(0x77);

describe("Poll roundtrip", () => {
  it("roundtrips question and options", () => {
    const bytes = encodePoll({ schema: POLL_SCHEMA_URI, question: "Favourite colour?", options: ["red", "blue"], closesAtMs: 0n, timestampMs: 0n });
    const d = decodePoll(bytes);
    expect(d.question).toBe("Favourite colour?");
    expect(d.options).toEqual(["red", "blue"]);
  });
});

describe("Vote roundtrip", () => {
  it("roundtrips poll cid and option index", () => {
    const bytes = encodeVote({ schema: VOTE_SCHEMA_URI, pollCid: cid(), optionIndex: 1, timestampMs: 0n });
    const d = decodeVote(bytes);
    expect(d.pollCid).toEqual(cid());
    expect(d.optionIndex).toBe(1);
  });
});

describe("Event roundtrip", () => {
  it("roundtrips all fields", () => {
    const bytes = encodeEvent({ schema: EVENT_SCHEMA_URI, title: "Meetup", description: "VCO devs", startMs: 1_700_000_000_000n, endMs: 1_700_003_600_000n, location: "online", previousCid: new Uint8Array(0) });
    const d = decodeEvent(bytes);
    expect(d.title).toBe("Meetup");
    expect(d.startMs).toBe(1_700_000_000_000n);
    expect(d.location).toBe("online");
  });
});

describe("RSVP roundtrip", () => {
  it("roundtrips status values", () => {
    for (const status of ["yes", "no", "maybe"] as const) {
      const bytes = encodeRsvp({ schema: RSVP_SCHEMA_URI, eventCid: cid(), status, timestampMs: 0n });
      expect(decodeRsvp(bytes).status).toBe(status);
    }
  });
});

describe("Announcement roundtrip", () => {
  it("roundtrips priority and content", () => {
    const bytes = encodeAnnouncement({ schema: ANNOUNCEMENT_SCHEMA_URI, content: "Server update", priority: "urgent", mediaCids: [], timestampMs: 0n });
    const d = decodeAnnouncement(bytes);
    expect(d.content).toBe("Server update");
    expect(d.priority).toBe("urgent");
  });
});
```

### Step 5.2 — Run tests (expected: FAIL)

```bash
npm run test --workspace=packages/vco-schemas 2>&1 | grep "FAIL"
```

### Step 5.3 — Implement coordination helpers

```bash
mkdir -p packages/vco-schemas/src/coordination
```

`packages/vco-schemas/src/coordination/poll.ts`:
```typescript
import { Poll } from "../generated/coordination/poll.pb.js";
export const POLL_SCHEMA_URI = "vco://schemas/coordination/poll/v1";
export interface PollData { schema: string; question: string; options: string[]; closesAtMs: bigint; timestampMs: bigint; }
export function encodePoll(d: PollData): Uint8Array {
  return Poll.encode(Poll.create({ schema: d.schema, question: d.question, options: d.options, closesAtMs: Number(d.closesAtMs), timestampMs: Number(d.timestampMs) })).finish();
}
export function decodePoll(bytes: Uint8Array): PollData {
  const m = Poll.decode(bytes);
  return { schema: m.schema, question: m.question, options: m.options, closesAtMs: BigInt(m.closesAtMs as number), timestampMs: BigInt(m.timestampMs as number) };
}
```

`packages/vco-schemas/src/coordination/vote.ts`:
```typescript
import { Vote } from "../generated/coordination/vote.pb.js";
export const VOTE_SCHEMA_URI = "vco://schemas/coordination/vote/v1";
export interface VoteData { schema: string; pollCid: Uint8Array; optionIndex: number; timestampMs: bigint; }
export function encodeVote(d: VoteData): Uint8Array {
  return Vote.encode(Vote.create({ schema: d.schema, pollCid: d.pollCid, optionIndex: d.optionIndex, timestampMs: Number(d.timestampMs) })).finish();
}
export function decodeVote(bytes: Uint8Array): VoteData {
  const m = Vote.decode(bytes);
  return { schema: m.schema, pollCid: new Uint8Array(m.pollCid), optionIndex: m.optionIndex, timestampMs: BigInt(m.timestampMs as number) };
}
```

`packages/vco-schemas/src/coordination/event.ts`:
```typescript
import { Event } from "../generated/coordination/event.pb.js";
export const EVENT_SCHEMA_URI = "vco://schemas/coordination/event/v1";
export interface EventData { schema: string; title: string; description: string; startMs: bigint; endMs: bigint; location: string; previousCid: Uint8Array; }
export function encodeEvent(d: EventData): Uint8Array {
  return Event.encode(Event.create({ schema: d.schema, title: d.title, description: d.description, startMs: Number(d.startMs), endMs: Number(d.endMs), location: d.location, previousCid: d.previousCid })).finish();
}
export function decodeEvent(bytes: Uint8Array): EventData {
  const m = Event.decode(bytes);
  return { schema: m.schema, title: m.title, description: m.description, startMs: BigInt(m.startMs as number), endMs: BigInt(m.endMs as number), location: m.location, previousCid: new Uint8Array(m.previousCid) };
}
```

`packages/vco-schemas/src/coordination/rsvp.ts`:
```typescript
import { Rsvp } from "../generated/coordination/rsvp.pb.js";
export const RSVP_SCHEMA_URI = "vco://schemas/coordination/rsvp/v1";
export interface RsvpData { schema: string; eventCid: Uint8Array; status: "yes" | "no" | "maybe"; timestampMs: bigint; }
export function encodeRsvp(d: RsvpData): Uint8Array {
  return Rsvp.encode(Rsvp.create({ schema: d.schema, eventCid: d.eventCid, status: d.status, timestampMs: Number(d.timestampMs) })).finish();
}
export function decodeRsvp(bytes: Uint8Array): RsvpData {
  const m = Rsvp.decode(bytes);
  return { schema: m.schema, eventCid: new Uint8Array(m.eventCid), status: m.status as "yes" | "no" | "maybe", timestampMs: BigInt(m.timestampMs as number) };
}
```

`packages/vco-schemas/src/coordination/announcement.ts`:
```typescript
import { Announcement } from "../generated/coordination/announcement.pb.js";
export const ANNOUNCEMENT_SCHEMA_URI = "vco://schemas/coordination/announcement/v1";
export interface AnnouncementData { schema: string; content: string; priority: "info" | "warning" | "urgent"; mediaCids: Uint8Array[]; timestampMs: bigint; }
export function encodeAnnouncement(d: AnnouncementData): Uint8Array {
  return Announcement.encode(Announcement.create({ schema: d.schema, content: d.content, priority: d.priority, mediaCids: d.mediaCids, timestampMs: Number(d.timestampMs) })).finish();
}
export function decodeAnnouncement(bytes: Uint8Array): AnnouncementData {
  const m = Announcement.decode(bytes);
  return { schema: m.schema, content: m.content, priority: m.priority as "info" | "warning" | "urgent", mediaCids: m.mediaCids.map(c => new Uint8Array(c)), timestampMs: BigInt(m.timestampMs as number) };
}
```

### Step 5.4 — Run tests (expected: PASS)

```bash
npm run test --workspace=packages/vco-schemas 2>&1 | tail -10
```

### Step 5.5 — Commit

```bash
git add packages/vco-schemas/src/coordination/ packages/vco-schemas/src/__tests__/coordination-roundtrip.test.ts
git commit -m "feat(vco-schemas): add coordination schema helpers with roundtrip tests (poll, vote, event, rsvp, announcement)"
```

---

## Task 6 — Update index.ts + full suite verification

### Files
- `packages/vco-schemas/src/index.ts` (modified)

### Step 6.1 — Update index.ts to re-export all domains

Replace the current contents of `packages/vco-schemas/src/index.ts`:

```typescript
// Core schemas
export * from "./post.js";
export * from "./profile.js";
export * from "./manifest.js";
export * from "./assembly.js";

// Social
export * from "./social/reaction.js";
export * from "./social/reply.js";
export * from "./social/follow.js";
export * from "./social/tombstone.js";
export * from "./social/thread.js";

// Marketplace
export * from "./marketplace/listing.js";
export * from "./marketplace/offer.js";
export * from "./marketplace/receipt.js";

// Files
export * from "./files/file-descriptor.js";
export * from "./files/directory.js";

// Coordination
export * from "./coordination/poll.js";
export * from "./coordination/vote.js";
export * from "./coordination/event.js";
export * from "./coordination/rsvp.js";
export * from "./coordination/announcement.js";
```

### Step 6.2 — Run full vco-schemas test suite

```bash
npm run test --workspace=packages/vco-schemas 2>&1 | tail -15
```

Expected: all test files passing (10 test files, 40+ tests).

### Step 6.3 — Run full workspace tests

```bash
npm run test 2>&1 | tail -20
```

Expected: all workspaces passing.

### Step 6.4 — Commit and push

```bash
git add packages/vco-schemas/src/index.ts
git commit -m "feat(vco-schemas): update index exports for all 4 schema domains"
git push
```

---

## Completion Checklist

- [ ] Task 1: All 15 proto files created + generator extended + codegen run
- [ ] Task 2: Social helpers (reaction, reply, follow, tombstone, thread) + tests passing
- [ ] Task 3: Marketplace helpers (listing, offer, receipt) + tests passing
- [ ] Task 4: Files helpers (file-descriptor, directory) + tests passing
- [ ] Task 5: Coordination helpers (poll, vote, event, rsvp, announcement) + tests passing
- [ ] Task 6: `index.ts` updated + `npm run test` green across all workspaces
