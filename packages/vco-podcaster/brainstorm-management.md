# Brainstorming: VCO Podcaster Channel Management & Media Uploads

**Objective**: Extend `vco-podcaster` with a management suite for creators to update their channel profiles and publish real audio/video content that is playable within the app.

## Expert Consultations

### UI/UX Expert
- **Studio View**: Add a new "Creator Studio" section in the sidebar.
- **Form Design**: Use consistent Zinc styling for the profile editor and episode uploader.
- **Media Feedback**: Show upload progress and a preview of the media before "publishing" (encoding to schema).
- **Accessibility**: Ensure the file input is keyboard-accessible and has clear focus states.

### Security Expert
- **File Validation**: Restrict uploads to specific MIME types (`audio/*`, `video/*`) and enforce a maximum file size (e.g., 50MB for this prototype).
- **Sanitization**: Metadata (title, bio, show notes) MUST be sanitized before being encoded into the Protobuf manifest to prevent persistent XSS when other users view the feed.
- **Resource Management**: Use `URL.revokeObjectURL` to prevent memory leaks when managing local blobs for playback.

## Technical Approach

### 1. Media Storage (Simulation)
Since this is a web prototype, we will use a `Map<string, Blob>` in `MockMediaService` to store "published" content.
- When a user uploads a file, it is assigned a mock CID.
- The `MediaManifest` is created pointing to this CID.
- The player will resolve the CID by checking the `Map` and creating a `blob:` URL for the `<audio>` element.

### 2. Channel Management
- A new `StudioView.tsx` component will allow editing the `MediaChannel` fields (Name, Bio, Categories).
- On "Save", a new `MediaChannel` Protobuf is encoded and updated in the `MockMediaService`.

### 3. Publishing Flow
1. Select file -> Read metadata (duration).
2. Enter Episode Info (Title, Summary, Notes).
3. "Publish" -> 
   - Store file Blob in `MockMediaService`.
   - Create and encode `MediaManifest`.
   - Update `MediaChannel.latestItemCid` to point to the new manifest.
   - Update the sequential `previousItemCid` link.

## Risks & Constraints
- **Persistence**: Using `localStorage` for blobs is not feasible (size limits). For this version, uploaded media will be session-only or we can use IndexedDB for larger payloads if required.
- **Memory**: Managing many `blob:` URLs can saturate memory if not revoked.

**Recommendation**: Proceed with an IndexedDB-backed `MockMediaService` for "real" media storage and implement the "Creator Studio" UI.
