# Debug Plan: vco-cord Posted Messages Disappearing

## Objective
Identify why messages posted in the `vco-cord` UI do not appear in the message list and implement a fix (e.g., optimistic updates or fixing the echo loop).

## Strategy
1.  **Reproduction**:
    -   Create a unit test for the `useMessages` hook to simulate sending a message and check if it appears in the `messages` state.
    -   Since `useMessages` uses `subscribe` and `publish` from `transport.ts`, I'll need to mock those or check their behavior.
2.  **Audit**:
    -   Examine the interaction between `useMessages.ts` and `transport.ts`.
    -   Check if `useMessages` should implement optimistic updates to avoid dependency on sidecar echo.
3.  **Fix**:
    -   Implement optimistic updates in `useMessages.ts`.
    -   Add error handling in the `subscribe` callback to prevent the listener from dying if a single message fails to decode.

## Tasks

- [x] **Task 1: Reproduction with Unit Test**
    - [x] Create `packages/vco-cord/src/features/messages/__tests__/useMessages.test.ts`.
    - [x] Mock `../../lib/transport.js` and `../../lib/vco.js`.
    - [x] Verify that `send` calls `publish` but doesn't update state.

- [x] **Task 2: Implement Optimistic Updates**
    - [x] Update `useMessages.ts` to append the newly built `VcoMessage` to the `messages` state immediately after a successful `publish`.
    - [x] Add a deduplication mechanism (by `msg.id`) in the `subscribe` callback to handle the case where the sidecar *does* echo the message back later.

- [x] **Task 3: Harden Decoder Logic**
    - [x] Add `try/catch` around `decodeMessage` in the `subscribe` callback.
    - [x] Log decoding errors to the console instead of letting them kill the listener.

- [x] **Task 4: Verification**
    - [x] Run the new unit test and existing tests.
    - [x] Build the package to ensure no TS errors.
