# Plan: VCO Podcaster Channel Management

## Objective
Implement a "Creator Studio" allowing users to manage their `MediaChannel` profile and publish real, playable media files using the `MediaManifest` schema.

## Tasks

### 1. Service & State Hardening
- [ ] Task 1.1: Update `MockMediaService.ts` to support media blob storage and retrieval by CID.
- [ ] Task 1.2: Add `updateChannel` and `publishEpisode` methods to `MockMediaService.ts`.
- [ ] Task 1.3: Update `PodcastContext.tsx` to expose management functions.

### 2. UI Implementation: Creator Studio
- [ ] Task 2.1: Create `StudioView.tsx` component.
- [ ] Task 2.2: Implement "Edit Profile" form (Zinc style, validation).
- [ ] Task 2.3: Implement "Upload Episode" form with real file selection and preview.
- [ ] Task 2.4: Integrate Studio view into `App.tsx` navigation.

### 3. Media Integration
- [ ] Task 3.1: Update `MiniPlayer.tsx` to handle real `blob:` URLs resolved from `contentCid`.
- [ ] Task 3.2: Implement file size/type validation in the upload form.

### 4. Verification & Hardening
- [ ] Task 4.1: Verify XSS sanitization for show notes and channel bio.
- [ ] Task 4.2: Verify playback of a newly "published" episode.
- [ ] Task 4.3: Final build and typecheck.

## References
- `packages/vco-podcaster/brainstorm-management.md`
- `packages/vco-schemas/src/media/manifest.ts`
