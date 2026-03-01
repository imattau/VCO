# Brainstorming: VCO Podcaster App

**Objective**: Create a decentralized podcast player application that leverages the new `MediaManifest` and `MediaChannel` schemas, demonstrating parallel fetching, sequential history, and rich metadata on the VCO v3.2 protocol.

## Expert Consultations
- **UI/UX Expert**: The app should use a "Mobile-First" responsive design, employing the project's existing "Zinc" dark theme (Tailwind v4) and `lucide-react` icons. High contrast is needed for audio player controls. Accessibility (ARIA labels for play/pause, volume sliders) is paramount.
- **Security Expert**: The primary threat model involves handling untrusted CIDs (potential for malicious payloads or SSRF if pointing to local resources) and parsing untrusted Markdown (`show_notes`). The player must sanitize all Markdown inputs to prevent XSS and ensure the audio player only decodes valid media types to prevent buffer overflow attacks.

## Approach Options

### Option 1: Mocked Web Prototype (Fastest)
Build a React/Vite web application that simulates the VCO network. It uses a `DiscoveryService` to "fetch" mock `MediaChannel` and `MediaManifest` data and plays hardcoded audio files to simulate the `contentCid`.
- **Pros**: Fastest time to market. Easy to style and iterate on the UI.
- **Cons**: Doesn't actually demonstrate libp2p or true parallel fetching.
- **UI/UX**: Standard web player interface.
- **Security**: Low risk, as data is mocked.

### Option 2: Full Tauri Desktop App (Recommended)
Build a Tauri desktop application (like `vco-cord` and `vco-desktop`). The React frontend handles the UI, while a mocked Rust/TypeScript sidecar simulates complex network behavior like parallel chunk fetching and caching.
- **Pros**: Matches the architecture of existing flagship apps. Can simulate local caching and persistent storage natively.
- **Cons**: Heavier setup. Requires managing Tauri IPC for state.
- **UI/UX**: Desktop-class experience, persistent mini-player.
- **Security**: Must handle IPC sanitization.

### Option 3: Integration with `vco-node` (Most Authentic)
Build a web or desktop app that actually spins up a `@vco/vco-node` instance in the browser/background and attempts to fetch real test payloads over libp2p.
- **Pros**: Proves the protocol in a real-world scenario.
- **Cons**: High complexity. Requires bootstrapping a test network and seeding it with real chunked audio data, which may be out of scope for a UI showcase.

## Chosen Strategy: Option A (Mocked Web Prototype -> Path to Tauri)
Given the immediate goal is to showcase the *schema*, we will start with a high-fidelity React/Vite web app (similar to `vco-discovery`) that implements the UI and State Management (Contexts). The "Network Layer" will be heavily abstracted so it can easily be swapped for Tauri IPC or a real `vco-node` later.

## UI Architecture (UI Expert)
- **Framework**: React 19 + Vite.
- **Styling**: Tailwind CSS v4 (Zinc palette, Mobile-first).
- **Icons**: `lucide-react`.
- **Components**:
  - `MiniPlayer`: Persistent bottom bar for playback control.
  - `FeedView`: Lists episodes from a `MediaChannel`.
  - `EpisodeDetail`: Shows `MediaManifest` metadata (notes, transcript).

## Security & Hardening (Security Expert)
- **XSS Prevention**: Must use a robust Markdown parser (like `react-markdown` or `marked`) and explicitly sanitize HTML for the `show_notes` field.
- **Media Validation**: Ensure the `contentType` matches the expected audio formats before passing to the HTML5 `<audio>` element.
- **Trust Boundaries**: The `PodcastContext` must treat all incoming `MediaManifest` data as untrusted until validated against the schema decoder.
