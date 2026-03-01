![VCO Logo](../../VCO_Logo.png)

# @vco/vco-schemas

Standard protocol schemas and encoders for the Verifiable Content Object (VCO) protocol. This package defines the application-layer structures that live inside the `payload` of a VCO Envelope.

## Features

- **Domain-Specific Schemas**: Standardized formats for Social, Marketplace, Files, and Coordination.
- **Protobuf-Backed**: High-performance binary serialization with strict typing.
- **Manifest Support**: Native support for sequence and collection manifests for large data sets.
- **Cross-Platform**: Consistent encoding/decoding logic for web, mobile, and server environments.

## Installation

```bash
npm install @vco/vco-schemas @vco/vco-core
```

## Schema Domains

The package organizes schemas into logical domains to support diverse application use cases:

### 📱 Social
- **Post**: The primary unit of social content (text, media references, hashtags).
- **Profile**: Identity metadata (display name, bio, avatar CID).
- **Reaction**: Lightweight interactions (likes, emojis) targeting other CIDs.
- **Reply**: Threaded conversation support.
- **Follow**: Cryptographically verifiable relationship graphs.
- **Thread**: Collection-based management for long-form content or discussions.
- **Tombstone**: Standardized "soft-delete" notifications for content revocation.

### 🛒 Marketplace
- **Listing**: Product/Service descriptions with price, category, and availability.
- **Offer**: Intent to purchase or negotiate on a listing.
- **Receipt**: Verifiable proof of transaction or interaction.

### 📂 Files
- **FileDescriptor**: Metadata for individual files (name, size, MIME type, hash).
- **Directory**: Structure for organizing multiple file descriptors into a tree.

### 🗳️ Coordination
- **Poll**: Multi-choice surveys with verifiable results.
- **Vote**: Individual participation in a poll.
- **Event**: Calendar-based coordination (time, location, description).
- **RSVP**: Status updates for event participation.
- **Announcement**: Broadcasted messages for specific coordination contexts.

### 🧩 Base
- **Manifest**: Sequential or collection-based indices for large content (e.g., video chunks, large datasets).
- **Assembly**: Instructions for reassembling fragmented payloads.

## Usage

### Encoding and Decoding a Post

```typescript
import { encodePost, decodePost, POST_V3_SCHEMA_URI } from '@vco/vco-schemas';

// 1. Prepare post data
const postData = {
  schema: POST_V3_SCHEMA_URI,
  content: "Hello #VCO world! This is a verifiable post.",
  mediaCids: [], // Uint8Array[] of IPFS/libp2p CIDs
  timestampMs: BigInt(Date.now()),
  tags: ["vco", "protocol"]
};

// 2. Encode to binary (Protobuf)
const encoded = encodePost(postData);

// 3. Decode back to object
const decoded = decodePost(encoded);
console.log(decoded.content); // "Hello #VCO world! This is a verifiable post."
```

### Wrapping in a VCO Envelope

Schemas are intended to be wrapped in a `@vco/vco-core` Envelope for transport and verification.

```typescript
import { createEnvelope, PriorityLevel, MULTICODEC_PROTOBUF } from '@vco/vco-core';
import { encodePost, POST_V3_SCHEMA_URI } from '@vco/vco-schemas';

const payload = encodePost({
  schema: POST_V3_SCHEMA_URI,
  content: "Verifiable content in an envelope!",
  mediaCids: [],
  timestampMs: BigInt(Date.now())
});

const envelope = await createEnvelope({
  payload,
  payloadType: MULTICODEC_PROTOBUF, // 0x50
  creatorId: myMultikeyId,
  privateKey: myPrivateKey,
  priorityHint: PriorityLevel.NORMAL
}, myCryptoProvider);

// The envelope is now signed and ready for relaying.
```

## Code Generation

Schemas are defined using Protocol Buffers (`.proto`) in the root `proto/vco/schemas/` directory. The TypeScript/JavaScript source code is generated using `protobufjs`.

### Running Generation

If you modify the `.proto` files, you must regenerate the library:

```bash
# From the project root
npm run generate:proto
```

This runs `scripts/generate-proto.mjs`, which:
1. Compiles `.proto` to static ESM modules.
2. Generates TypeScript definition files (`.pb.d.ts`).
3. Patches imports for ESM compatibility.
4. Appends domain re-exports for better ergonomics.

## Development

```bash
# Build the package
npm run build

# Run tests
npm test

# Typecheck
npm run typecheck
```

## License

MIT - See [LICENSE](../../LICENSE) for details.
