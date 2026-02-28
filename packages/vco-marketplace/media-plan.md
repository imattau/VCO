# Plan: Implement Media Support for Marketplace Listings

## Objective
Enable attaching and viewing media (images) in the `vco-marketplace` application by integrating the VCO file and sequence-manifest schemas.

## Strategy
1.  **Schema Support**: Implement helper functions in `lib/vco.ts` to build `FileDescriptor` and `SequenceManifest` envelopes.
2.  **File Processing**: Create a utility to split local files into signed VCO chunks.
3.  **UI Updates**:
    *   Add a file input to `CreateListingModal`.
    *   Display attached images in `ListingCard` and `ListingDetail`.
    *   Create a `VcoImage` component that handles the asynchronous reassembly of chunks into a viewable blob.

## Tasks

- [x] **Task 1: Extend vco.ts with File Logic**
    - [x] Import `FILE_DESCRIPTOR_SCHEMA_URI` and `SEQUENCE_MANIFEST_SCHEMA_URI`.
    - [x] Implement `buildVcoFile(file: File, identity: Identity): Promise<string>` which returns the `FileDescriptor` CID after creating chunks and manifest.

- [x] **Task 2: Implement File Reassembly Logic**
    - [x] Create `packages/vco-marketplace/src/lib/files.ts`.
    - [x] Implement `reassembleVcoFile(descriptorCid: string): Promise<Blob>`.

- [x] **Task 3: Update CreateListingModal UI**
    - [x] Add an image upload area.
    - [x] Store a list of "prepared" media CIDs.
    - [x] Update `onSubmit` to include these CIDs in the `buildListing` call.

- [x] **Task 4: Implement VcoImage Component**
    - [x] Create `packages/vco-marketplace/src/components/ui/VcoImage.tsx`.
    - [x] Component takes a `cid`, calls reassembly, and displays an `<img>` tag with the resulting Blob URL.

- [x] **Task 5: Display Media in Feed**
    - [x] Update `ListingCard` and `ListingDetail` to use the `VcoImage` component for items in `mediaCids`.

- [x] **Task 6: Verification**
    - [x] Unit test the chunking and reassembly logic.
    - [x] Verify that an attached image survives a page refresh (CIDs should persist in `localStorage`).
