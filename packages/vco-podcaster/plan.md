# VCO Podcaster Implementation Plan

## Objective
Create a high-fidelity React/Vite application (`vco-podcaster`) that showcases the `MediaManifest` and `MediaChannel` schemas by simulating a decentralized podcast player.

## Strategy
Build a mocked web prototype utilizing Tailwind CSS v4 and React Context for state management. The app will simulate network fetching and schema decoding, presenting a "Feed" view and a "Player" view. Security and UI best practices will be integrated from the start.

## Tasks

### 1. Project Initialization & Tooling [DONE]
- [x] Task 1.1: Create package structure (`packages/vco-podcaster`).
- [x] Task 1.2: Configure `package.json` with React, Vite, Tailwind v4, and `@vco/vco-schemas`.
- [x] Task 1.3: Set up `tsconfig.json`, `vite.config.ts`, and core entry points (`index.html`, `src/main.tsx`).

### 2. Research & Audit [DONE]
- [x] Task 2.1: UI/UX Audit: Define the color palette (Zinc), typography, and accessible player controls (focus rings, ARIA labels).
- [x] Task 2.2: Security Surface Mapping: Identify trust boundaries around `MediaManifest` decoding and `show_notes` Markdown rendering.

### 3. State Management & Mock Network [DONE]
- [x] Task 3.1: Create `MockMediaService.ts` to generate and serialize mock `MediaChannel` and `MediaManifest` data using the actual schemas.
- [x] Task 3.2: Implement `PodcastContext.tsx` to handle active channel, current episode, and playback state.

### 4. UI Implementation [DONE]
- [x] Task 4.1: Scaffold the main layout (Sidebar, Main Content, Bottom Player Bar).
- [x] Task 4.2: Implement `ChannelFeed` component (lists episodes from the `MediaChannel`).
- [x] Task 4.3: Implement `EpisodeDetail` component (safely renders `show_notes` and metadata).
- [x] Task 4.4: Implement `MiniPlayer` component (audio controls simulating playback of `content_cid`).

### 5. Verification & Hardening [DONE]
- [x] Task 5.1: Verify accessible focus states and screen-reader compatibility for player controls.
- [x] Task 5.2: Perform security review of the Markdown rendering to ensure XSS protection.
- [x] Task 5.3: Build and typecheck the application (`npm run build`).
