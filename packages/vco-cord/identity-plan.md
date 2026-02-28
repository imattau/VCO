# Plan: Persistent Identity Management for vco-cord

## Objective
Refactor the `vco-cord` application to support persistent cryptographic identities, allowing users to save their display names and keypairs across sessions, view their public keys, and rotate their identity when needed.

## Strategy
1.  **Persistence**: Update the `IdentityContext` to load and save identity data (private key and display name) from `localStorage`.
2.  **Schema Alignment**: Ensure the identity handling is consistent with the `vco-crypto` and `vco-core` packages used in `vco-desktop`.
3.  **UI/UX**: Implement a "User Settings" modal reachable from the `ChannelList` footer to manage the identity (edit name, view keys, rotate identity).

## Tasks

- [x] **Task 1: Update Identity Helpers**
    - [x] Modify `packages/vco-cord/src/lib/vco.ts` to support initializing an identity from an existing private key and name.
    - [x] Ensure `uint8ArrayToHex` and `hexToUint8Array` utilities are available for storage.

- [x] **Task 2: Refactor IdentityContext for Persistence**
    - [x] Update `IdentityContext.tsx` to check `localStorage` on initialization.
    - [x] Implement `saveIdentity` and `updateDisplayName` functions in the context.
    - [x] Replace the automatic random regeneration on load with a persistent load-or-create logic.

- [x] **Task 3: Scaffold Settings UI Components**
    - [x] Create a `Modal` primitive if one doesn't exist.
    - [x] Implement `IdentitySettings.tsx` to display the Public Key, Creator ID, and a toggleable Private Key field.
    - [x] Add an input field for the user to change their `displayName`.

- [x] **Task 4: Integrate Settings into Layout**
    - [x] Add a "Settings" (gear) icon to the `ChannelList` footer next to the user profile.
    - [x] Connect the icon to open the `IdentitySettings` modal.

- [x] **Task 5: Verification and Testing**
    - [x] Verify that changing the display name updates it in the UI and `localStorage`.
    - [x] Verify that refreshing the page restores the same Public Key/Identity.
    - [x] Test the "Rotate Identity" functionality to ensure a clean state.
