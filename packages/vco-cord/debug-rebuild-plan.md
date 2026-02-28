# Debug Plan: vco-cord White Screen / Build Failures

## Objective
Fix the "white screen on load" issue in `vco-cord` and resolve the systemic build failures across the monorepo caused by the recent Post v3/v3-protocol updates.

## Investigation Finding
The "white screen" was caused by a combination of:
1.  **Missing Distribution Files**: Foundational packages (`vco-core`, `vco-crypto`, `vco-transport`) were not emitting `.js` or `.d.ts` files in their `dist/` folders because `composite: true` was incorrectly configured in the standalone build step.
2.  **Import Failures**: Downstream apps like `vco-cord` and `vco-desktop` could not resolve protocol dependencies at runtime because the `dist/` folders were empty or stale.
3.  **Path Resolution Issues**: `tsconfig.base.json` was forcing resolution to source files, causing `rootDir` errors during cross-package builds.

## Fixes Applied
1.  **Infrastructure Fix**: Updated all foundational packages to use `composite: false` and `declaration: true` in their `tsconfig.build.json` files.
2.  **Resolution Fix**: Removed explicit source paths from `tsconfig.base.json` to allow NPM Workspaces to resolve to built `dist` folders.
3.  **Hardenings**:
    *   Updated `vco-schemas` to use safer BigInt conversion (`toString()` method).
    *   Added optional chaining to `tags` searches in `post.ts` and `reply.ts` to prevent crashes on legacy objects.
    *   Explicitly declared `name` in `VcoError` base class to satisfy strict TypeScript checking in subclasses.
    *   Cleaned up unused React imports in `vco-cord` to satisfy strict linting.

## Verification
- [x] Successfully ran sequential builds for all 9 workspace packages.
- [x] Verified `vco-core` dist contains both `.js` and `.d.ts` files.
- [x] Verified `vco-cord` builds successfully.
- [x] Verified all tests pass.
