# Code Audit Checklist

When reviewing code for fixes or improvements, use these categories as a guide:

## 1. Type Safety (TypeScript)
- [ ] No `any` types or loose casts.
- [ ] Proper error handling (e.g., `try/catch`, `Result` types).
- [ ] Null/undefined checks for external data.
- [ ] Discriminated unions for state management.

## 2. API Integrity
- [ ] Follows project conventions (e.g., `vco-core` multicodec codes).
- [ ] No breaking changes to established interfaces.
- [ ] Proper JSDoc/documentation for new functions.
- [ ] Validates inputs at boundaries.

## 3. Performance & Resources
- [ ] No unnecessary renders in React (e.g., in `vco-cord`).
- [ ] Proper use of `useMemo`/`useCallback` for expensive operations.
- [ ] Efficient data serialization (e.g., `vco-schemas` Protobuf).
- [ ] No memory leaks in background processes.

## 4. Security & Privacy
- [ ] No secrets or keys logged or stored insecurely.
- [ ] Private keys are toggleable/hidden in UI (as in `IdentitySettings.tsx`).
- [ ] Proper permission checks for filesystem/Tauri API.
- [ ] Cryptographically sound random generation.

## 5. Testing
- [ ] Regression test included for fixed bug.
- [ ] Unit tests for all new utility functions.
- [ ] Integration test for full system behavior.
