# VCO Protocol v3.2 Update Specification

Based on insights from the desktop application development, the VCO v3.2 protocol requires several expansions to handle real-world usage safely, efficiently, and consistently across diverse client implementations.

## 1. The "Chunking" Threshold (Layer 3 Media)
Storing rich media (images/videos) as single VCO objects strains both local storage and P2P message buffers. 

**Specification Update:**
- **Max Payload Size:** A single VCO envelope MUST NOT exceed `1MB` in payload size to ensure fast set reconciliation and network transfer.
- **Sequence Manifests:** Any media exceeding `1MB` MUST be chunked. The client will generate a `Sequence Manifest` (Payload Type `0x04`) that contains an ordered array of Chunk CIDs. 
- **Assembly:** Clients requesting the media will resolve the Sequence Manifest and retrieve the chunks in parallel, assembling them in memory before rendering.

## 2. Standardized Manifest "Sub-Types" (MIME-like Registry)
Hardcoded `type: "post"` or `type: "profile"` limits the protocol's agnosticism.

**Specification Update:**
- **Schema Field:** Manifest VCOs MUST use a URI-based `schema` field instead of a simple `type` string.
- **Examples:**
  - `vco://schemas/social/post/v1`
  - `vco://schemas/identity/profile/v1`
- **Fallback Rendering:** If a client does not understand a schema, it should fallback to rendering the raw JSON or a generic "Unsupported Manifest" view, rather than crashing.

## 3. Interest Vector Prioritization
During the "pop-in" rendering of posts, it is critical that text/structure arrives before heavy media.

**Specification Update:**
- **Priority Bit:** Interest Vectors broadcasted to the DHT or local swarm MUST include a priority level:
  - `CRITICAL` (0): Structure/Manifests, Identity changes.
  - `HIGH` (1): Text content.
  - `LOW` (2): Heavy media (Images/Video).
- Nodes should allocate bandwidth and connection slots to fulfill `CRITICAL` and `HIGH` demands before serving `LOW` priority chunks.

## 4. Head-Hash Pointer Stability
When a user updates their profile, the Manifest CID changes, making discovery difficult if peers only have the old CID.

**Specification Update:**
- **Head Sequences:** A new Profile Manifest MUST include a `previous_manifest` field pointing to the old CID.
- **Mutable Resolution:** When querying a peer for a user's identity (by `creatorId`), the peer should return the latest known Manifest in the sequence, allowing the network to maintain a verifiable, chronological audit log of the user's state.

## 5. Deduplication Mandates
Deduplication at the client level prevents the swarm from bloating with duplicate viral media.

**Specification Update:**
- **Payload Collision Check:** Before signing a new VCO, clients MUST hash the raw payload and check their local vault (and potentially query nearest neighbors) for an existing envelope with the exact same payload hash.
- If found, the client MUST reuse the existing CID in their new Manifest rather than publishing a duplicate.

## 6. Progressive Assembly States
Clients need a formalized way to handle the asynchronous nature of distributed content.

**Specification Update:**
- **Standard UI States:** Clients should implement the following assembly states for any Manifest tree:
  - `PENDING`: Manifest received, but leaf nodes (Content/Media) are unknown.
  - `PARTIAL`: Content received, but some or all Media chunks are missing.
  - `COMPLETE`: Entire tree is resolved and verified in local storage.
  - `CORRUPTED`: A leaf node failed BLAKE3 hash verification against the CID in the Manifest.
