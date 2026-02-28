# Debug Plan: vco-cord Blank Screen on Message Click

## Objective
Identify and fix the issue where clicking a message in `vco-cord` causes the screen to go blank (likely a React render crash in `VcoInspector`).

## Strategy
1.  **Harden VcoInspector**: Add defensive checks and a `try/catch` block within the `VcoInspector` component to catch any rendering errors and display a graceful error message instead of crashing the app.
2.  **Fix Component Imports**: Ensure `React` and `ReactNode` are correctly imported in `VcoInspector.tsx` and `Badge.tsx`.
3.  **Audit Data Usage**: Ensure all fields accessed from the `envelope` and `header` are handled safely, especially when passing to `hex()` or `TextDecoder`.
4.  **Verification**: Update the unit test to verify that the component handles malformed data without crashing.

## Tasks

- [x] **Task 1: Harden VcoInspector.tsx**
    - [x] Wrap the decoding and rendering logic in a `try/catch`.
    - [x] Add checks for `message.rawEnvelope` validity.
    - [x] Ensure all data passed to `hex()` is a `Uint8Array`.

- [x] **Task 2: Fix Badge.tsx Imports**
    - [x] Add `import React from 'react'` or specific type imports to `Badge.tsx`.

- [x] **Task 3: Update VcoInspector Test**
    - [x] Fix the test imports to avoid the `exports` error.
    - [x] Verify that the component doesn't crash when `decodeEnvelopeProto` throws.

- [x] **Task 4: Final Verification**
    - [x] Run `npm run build --workspace=@vco/vco-cord`.
