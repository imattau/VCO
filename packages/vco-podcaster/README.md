# 🎙️ VCO Podcaster

A decentralized, high-fidelity podcast and media delivery application built on the **VCO v3.2 Protocol**. 

`vco-podcaster` demonstrates how the Verifiable Content Object protocol enables a "healthy swarm" for large-scale media delivery without central servers, RSS feeds, or surveillance-based subscriptions.

---

## 🌟 Vision: The Healthy Swarm

Traditional media delivery relies on centralized CDNs or fragile RSS feeds. VCO Podcaster leverages the protocol's core strengths to rethink streaming:

- **Parallel Fetching**: The `MediaManifest` schema is designed to support multi-peer chunk resolution, allowing your device to pull different segments of an episode from multiple peers simultaneously.
- **Deduplication**: Intro music, ads, and common segments are hashed and stored once. Different manifests can point to the same CIDs, saving massive network bandwidth.
- **Unblockable History**: By using **Sequential Linking** (`previousItemCid`), a show's history is a verifiable chain of cryptographic objects. There is no central point of failure.
- **Blind Subscriptions**: Listeners can "follow" a show's hash range without the relay or the network knowing exactly which show they are consuming.

---

## ✨ Key Features

### 🎧 For Consumers
- **High-Fidelity UI**: A modern, "Zinc" dark-themed interface built for developer-class aesthetics.
- **Verifiable Feeds**: Browse episodes directly from the VCO network topology.
- **Seamless Playback**: Integrated media player supporting real-time streaming of content CIDs.
- **Deep Metadata**: Rich, sanitized Markdown show notes and time-coded transcripts (coming soon).

### 🛠️ For Creators (Studio)
- **Identity Initialization**: Establish your decentralized media channel with a unique show name and Creator DID.
- **Profile Management**: Update your channel's metadata (bio, categories, avatar) across the network.
- **Media Publishing**: Upload real audio/video files. The app automatically hashes the media, generates a `MediaManifest`, and links it to your channel's history.

---

## 🔧 Protocol Integration

This application utilizes the following **VCO schemas**:

| Schema | URI | Purpose |
| --- | --- | --- |
| **MediaChannel** | `vco://schemas/media/channel/v1` | Head of the show; holds identity and latest episode pointer. |
| **MediaManifest** | `vco://schemas/media/manifest/v1` | The episode "Header"; stores metadata, content CIDs, and sequential links. |
| **Transcript** | `vco://schemas/media/transcript/v1` | Time-coded accessibility data bound to a manifest. |

### Sequential History Chain
Every new episode published through the Creator Studio includes a `previousItemCid` pointing to the previous manifest. This creates a cryptographically verifiable "feed" that clients reconstruct by walking the chain.

---

## 🛡️ Security & Hardening

As a protocol-first application, security is built into the architecture:

- **XSS Prevention**: All user-provided Markdown (show notes, bio) is sanitized using `react-markdown` and `@tailwindcss/typography` before rendering.
- **Content Validation**: The application strictly decodes Protobuf binary payloads using `@vco/vco-schemas`, ensuring data integrity before it reaches the UI.
- **Resource Integrity**: Media playback utilizes secure `blob:` URL management with proper memory revocation.
- **Trust Boundaries**: All incoming manifests are treated as untrusted until their cryptographic hashes and schema structures are verified.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v20+
- A built version of `@vco/vco-schemas`

### Installation
From the project root:
```bash
npm install
```

### Development
Start the development server:
```bash
npm run --workspace @vco/vco-podcaster dev
```

### Build & Typecheck
Verify the application:
```bash
npm run --workspace @vco/vco-podcaster build
npm run --workspace @vco/vco-podcaster typecheck
```

---

## 🏗️ Architecture
- **Frontend**: React 19, Vite 7
- **Styling**: Tailwind CSS v4 (Zinc palette)
- **State**: React Context (`PodcastProvider`)
- **Schema**: Protocol Buffers (proto3) via `protobufjs`

---

*Part of the Verifiable Content Object (VCO) Ecosystem.*
