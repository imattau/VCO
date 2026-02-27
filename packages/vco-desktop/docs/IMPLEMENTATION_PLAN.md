# Implementation Plan: VCO v3.2 Protocol Updates in Desktop App

This plan details how the protocol specification updates from `VCO_SPEC_v3.2_UPDATES.md` will be simulated and integrated into the current `vco-desktop` prototype.

## 1. Standardized Manifest "Sub-Types"
**Goal:** Transition from `type: "post"` to a URI-based `schema` field.
**Action:**
- Update `NewPostModal` to generate manifests with `schema: "vco://schemas/social/post/v1"` instead of `type: "post"`.
- Update `ProfileEditorModal` to generate manifests with `schema: "vco://schemas/identity/profile/v1"` instead of `type: "profile"`.
- Update `FeedItem` and `IdentitySection` parsers to check `manifest.schema` instead of `manifest.type`.

## 2. Progressive Assembly States
**Goal:** Formalize the UI states for partial data loading.
**Action:**
- In `FeedItem`, introduce an explicit `assemblyState` variable (`PENDING`, `PARTIAL`, `COMPLETE`).
- `COMPLETE`: Manifest, Content, and all Media are resolved.
- `PARTIAL`: Content is resolved, but some Media is missing.
- `PENDING`: Content is missing.
- Update the UI in `FeedItem` and the "Inspect Tree" modal to display the explicit `assemblyState`.

## 3. Head-Hash Pointer Stability
**Goal:** Simulate sequence linking for identity updates.
**Action:**
- In `ProfileEditorModal`, before creating a new Profile Manifest, find the most recent Profile Manifest by the current user.
- If found, add a `previous_manifest: oldHash` field to the new Profile Manifest payload.
- This creates a cryptographically linked history of profile changes.

## 4. Interest Vector Prioritization
**Goal:** Visualize priority levels in the Discovery Hub.
**Action:**
- Update the `discoveryLog` simulation in `AppContent` to assign and display a `priority` level (CRITICAL, HIGH, LOW) for different types of lookups (e.g., DHT lookups are CRITICAL, Content Provider searches are HIGH/LOW).

## 5. Chunking Threshold (Simulated Warning)
**Goal:** Acknowledge the payload size limit.
**Action:**
- In `NewPostModal`, add a simple size check on the raw payload (simulating a 1MB limit). If a payload is too large, display a warning or automatically mock a "Sequence Manifest" generation log, although full binary chunking is beyond the scope of this React prototype.
