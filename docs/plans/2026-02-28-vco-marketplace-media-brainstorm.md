# Brainstorming: Media & File Support in VCO Marketplace

## Objective
Enable users to attach verifiable media (images, documents) to marketplace listings using the VCO file and manifest schemas.

## Technical Architecture

### 1. File Representation
- **Small Files (<64KB)**: Could theoretically be a single payload, but standardizing on the manifest pattern is better.
- **Large Files**: Broken into chunks.
    - **Chunks**: Generic VCO envelopes with raw data payloads.
    - **SequenceManifest**: A VCO object listing the chunk CIDs.
    - **FileDescriptor**: A metadata object (name, size, type) pointing to the `rootManifestCid`.

### 2. Linking to Listings
- The `ListingData` interface has a `mediaCids` field (`Uint8Array[]`).
- These CIDs should point to `FileDescriptor` envelopes.

### 3. Application Flow (Upload)
1. **Selection**: User selects an image in the UI.
2. **Chunking**: The app (or a helper) splits the file into ~16KB chunks.
3. **Envelope Generation**: Each chunk is wrapped in a VCO envelope and signed.
4. **Manifest Creation**: A `SequenceManifest` envelope is created listing all chunk CIDs.
5. **Descriptor Creation**: A `FileDescriptor` envelope is created with file metadata and the manifest CID.
6. **Listing Finalization**: The listing is created with the `FileDescriptor` CID in `mediaCids`.

### 4. Application Flow (Display)
1. **Resolution**: The app sees a CID in `mediaCids`.
2. **Fetch Descriptor**: Retrieve the `FileDescriptor` envelope.
3. **Fetch Manifest**: Retrieve the `SequenceManifest` linked by the descriptor.
4. **Reassembly**: Fetch all chunk CIDs, concatenate their payloads, and create a `Blob` URL for the browser.

## UI Requirements
- **CreateListing**: Add a file picker or dropzone. Show thumbnails of "uploaded" (prepared) images.
- **ListingCard/Detail**: Display the resolved images. Show a "loading" state while reassembling chunks.

## Proposed MVP Strategy (Simulation)
Implementing full chunking and reassembly in the UI is complex for an MVP. 
- **Phase 1**: Add the logic to `buildListing` to accept `mediaCids`.
- **Phase 2**: Implement a `useFile` hook that handles the VCO reassembly logic.
- **Phase 3**: Add UI components for image display.

---
*Brainstorming conducted by Gemini CLI on 2026-02-28.*
