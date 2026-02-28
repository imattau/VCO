# Design: VCO Extended Application-Layer Schemas

**Date:** 2026-02-28
**Status:** APPROVED

---

## Goal

Extend the `vco-schemas` package with a standard library of application-layer schemas across four domains: social, marketplace, file sharing, and coordination. These schemas are designed for developer adoption — each is independently usable, independently versioned, and gracefully skippable by consumers that don't recognise the schema URI.

---

## Architecture

### Schema Taxonomy

**Primitive schemas** carry a single `target_cid: bytes` anchor referencing another envelope by its content address. They are self-describing via their `schema: string` URI field. Consumers that don't understand a primitive schema skip it gracefully.

**Container schemas** carry an ordered `entries[]` list of `{ cid: bytes, schema_uri: string }` pairs. This enables partial rendering even when child schemas are unknown — a consumer can enumerate entries and render what it understands.

**Shared conventions across all schemas:**
- `schema: string` — URI identifying schema version (e.g. `vco://schemas/social/reaction/v1`)
- `previous_cid: bytes` — optional pointer to prior version of this record, enabling mutable resolution (same pattern as `Profile.previous_manifest`)
- Timestamps use `int64 timestamp_ms` (Unix epoch ms) — informational only; canonical ordering uses envelope `header_hash` PoW score

### Proto File Layout

```
proto/vco/schemas/
  social/
    reaction.proto
    reply.proto
    follow.proto
    tombstone.proto
    thread.proto
  marketplace/
    listing.proto
    offer.proto
    receipt.proto
  files/
    file-descriptor.proto
    directory.proto
  coordination/
    poll.proto
    vote.proto
    event.proto
    rsvp.proto
    announcement.proto
```

### Schema URI Namespace

```
vco://schemas/social/reaction/v1
vco://schemas/social/reply/v1
vco://schemas/social/follow/v1
vco://schemas/social/tombstone/v1
vco://schemas/social/thread/v1
vco://schemas/marketplace/listing/v1
vco://schemas/marketplace/offer/v1
vco://schemas/marketplace/receipt/v1
vco://schemas/files/file-descriptor/v1
vco://schemas/files/directory/v1
vco://schemas/coordination/poll/v1
vco://schemas/coordination/vote/v1
vco://schemas/coordination/event/v1
vco://schemas/coordination/rsvp/v1
vco://schemas/coordination/announcement/v1
```

---

## Schema Definitions

### Social

#### `reaction.proto`
```protobuf
message Reaction {
  string schema = 1;        // "vco://schemas/social/reaction/v1"
  bytes target_cid = 2;     // CID of the envelope being reacted to
  string emoji = 3;         // Unicode emoji string, e.g. "👍"
  int64 timestamp_ms = 4;
}
```

#### `reply.proto`
```protobuf
message Reply {
  string schema = 1;        // "vco://schemas/social/reply/v1"
  bytes parent_cid = 2;     // CID of the parent Post or Reply
  string content = 3;       // UTF-8 text body
  repeated bytes media_cids = 4;
  int64 timestamp_ms = 5;
  string channel_id = 6;
}
```

#### `follow.proto`
```protobuf
message Follow {
  string schema = 1;        // "vco://schemas/social/follow/v1"
  bytes subject_key = 2;    // Multikey-encoded Ed25519 public key of the followed peer
  string action = 3;        // "follow" | "unfollow"
  int64 timestamp_ms = 4;
}
```

#### `tombstone.proto`
```protobuf
message Tombstone {
  string schema = 1;        // "vco://schemas/social/tombstone/v1"
  bytes target_cid = 2;     // CID of the envelope being retracted
  string reason = 3;        // optional human-readable reason
  int64 timestamp_ms = 4;
}
```

#### `thread.proto` (Container)
```protobuf
message ThreadEntry {
  bytes cid = 1;
  string schema_uri = 2;
}
message Thread {
  string schema = 1;        // "vco://schemas/social/thread/v1"
  string title = 2;         // optional thread subject
  repeated ThreadEntry entries = 3;
  int64 timestamp_ms = 4;
}
```

---

### Marketplace

#### `listing.proto`
```protobuf
message Listing {
  string schema = 1;        // "vco://schemas/marketplace/listing/v1"
  string title = 2;
  string description = 3;
  int64 price_sats = 4;     // price in satoshis (0 = free / negotiable)
  repeated bytes media_cids = 5;
  int64 expiry_ms = 6;      // 0 = no expiry
  bytes previous_cid = 7;   // for edits
}
```

#### `offer.proto`
```protobuf
message Offer {
  string schema = 1;        // "vco://schemas/marketplace/offer/v1"
  bytes listing_cid = 2;
  int64 offer_sats = 3;
  string message = 4;       // optional buyer message
  int64 timestamp_ms = 5;
}
```

#### `receipt.proto`
```protobuf
message Receipt {
  string schema = 1;        // "vco://schemas/marketplace/receipt/v1"
  bytes listing_cid = 2;
  bytes offer_cid = 3;
  string tx_id = 4;         // payment transaction ID (chain-agnostic string)
  int64 timestamp_ms = 5;
}
```

---

### File Sharing

#### `file-descriptor.proto`
```protobuf
message FileDescriptor {
  string schema = 1;            // "vco://schemas/files/file-descriptor/v1"
  string name = 2;              // filename, e.g. "photo.jpg"
  string mime_type = 3;
  uint64 size = 4;              // total bytes
  bytes root_manifest_cid = 5;  // CID of a SequenceManifest envelope
  bytes previous_cid = 6;       // for revisions
  int64 timestamp_ms = 7;
}
```

#### `directory.proto` (Container)
```protobuf
message DirectoryEntry {
  bytes cid = 1;
  string schema_uri = 2;
  string name = 3;          // display name hint
}
message Directory {
  string schema = 1;        // "vco://schemas/files/directory/v1"
  string name = 2;
  repeated DirectoryEntry entries = 3;
  bytes previous_cid = 4;
  int64 timestamp_ms = 5;
}
```

---

### Coordination

#### `poll.proto`
```protobuf
message Poll {
  string schema = 1;        // "vco://schemas/coordination/poll/v1"
  string question = 2;
  repeated string options = 3;
  int64 closes_at_ms = 4;   // 0 = never closes
  int64 timestamp_ms = 5;
}
```

#### `vote.proto`
```protobuf
message Vote {
  string schema = 1;        // "vco://schemas/coordination/vote/v1"
  bytes poll_cid = 2;
  uint32 option_index = 3;
  int64 timestamp_ms = 4;
}
```

#### `event.proto`
```protobuf
message Event {
  string schema = 1;        // "vco://schemas/coordination/event/v1"
  string title = 2;
  string description = 3;
  int64 start_ms = 4;
  int64 end_ms = 5;         // 0 = open-ended
  string location = 6;      // free-text or URI
  bytes previous_cid = 7;
}
```

#### `rsvp.proto`
```protobuf
message Rsvp {
  string schema = 1;        // "vco://schemas/coordination/rsvp/v1"
  bytes event_cid = 2;
  string status = 3;        // "yes" | "no" | "maybe"
  int64 timestamp_ms = 4;
}
```

#### `announcement.proto`
```protobuf
message Announcement {
  string schema = 1;        // "vco://schemas/coordination/announcement/v1"
  string content = 2;
  string priority = 3;      // "info" | "warning" | "urgent"
  repeated bytes media_cids = 4;
  int64 timestamp_ms = 5;
}
```

---

## TypeScript Helpers Pattern

Each schema gets an encode/decode helper module in `packages/vco-schemas/src/` following the established pattern:

```
packages/vco-schemas/src/
  social/
    reaction.ts     ← encodeReaction / decodeReaction / REACTION_SCHEMA_URI
    reply.ts
    follow.ts
    tombstone.ts
    thread.ts
  marketplace/
    listing.ts
    offer.ts
    receipt.ts
  files/
    file-descriptor.ts
    directory.ts
  coordination/
    poll.ts
    vote.ts
    event.ts
    rsvp.ts
    announcement.ts
  index.ts          ← re-exports all
```

The `generate-proto.mjs` script is extended with targets for all 15 new proto files, each using a unique `$protobuf.roots["vco-schemas-<name>"]` to avoid namespace collision.

---

## Testing

Each schema gets a roundtrip test (`<name>-roundtrip.test.ts`) covering:
1. Full encode → decode with all fields populated
2. Minimal encode → decode (empty/zero optional fields)
3. CID fields roundtrip as `Uint8Array`

Container schemas additionally test partial rendering (entries with unknown `schema_uri` values are preserved).

---

## Versioning & Compatibility

- Schema URIs are immutable once published. Breaking changes require a new version (`/v2`).
- The `previous_cid` convention enables mutable records without breaking the append-only envelope model.
- Consumers MUST ignore envelopes with unknown schema URIs (per VCO spec §4 fallback rendering).
