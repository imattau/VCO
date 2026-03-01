# VCO Discovery App Implementation Plan

**Goal**: Implement a React-based application showcasing the new `KeywordIndex` (search) and `Report` (moderation) schema capabilities, using the architectural patterns from `vco-cord`.

## Tasks

### 1. Project Initialization [DONE]
- [x] Create package structure (`packages/vco-discovery`)
- [x] Configure `package.json` with dependencies (React, Vite, vco-schemas)
- [x] Set up `tsconfig.json` and `vite.config.ts`
- [x] Create basic `index.html` and `src/main.tsx` entry points

### 2. UI Components & Features [DONE]
- [x] Implement Search Feature:
    - [x] `SearchInput` component
    - [x] `SearchResultList` displaying `KeywordIndex` entries
    - [x] Mock search provider using `vco-schemas` encoding/decoding
- [x] Implement Moderation Feature:
    - [x] `ReportForm` component for flagging content
    - [x] Layout and Styling:
        - [x] Main dashboard with navigation between Search and Reports
        - [x] Tailwind CSS integration

### 3. Integration & Verification [DONE]
- [x] Build and verify type safety
- [x] Added `DiscoveryService` for round-trip serialization in the UI
- [x] Verified build success and typecheck passing

### 4. UI/UX Refinement [DONE]
- [x] Implemented sidebar-based layout matching `vco-cord` architecture
- [x] Switched to dark theme (`zinc` colors) to align with project identity
- [x] Configured PostCSS and Tailwind v4 properly for Vite
- [x] Added responsive layout with distinct navigation and scrollable areas

## References
- `packages/vco-cord`: For React/Tailwind/Vite patterns
- `packages/vco-schemas`: For `KeywordIndex` and `Report` logic
