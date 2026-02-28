# Debug Plan: Fix vco-schemas Build and Import Resolution

## Objective
Fix the `vco-schemas` build process to ensure generated Protobuf files are correctly located in `dist/generated/`, allowing Vite and other packages to resolve imports successfully.

## Strategy
The current build script `cp -r src/generated dist/generated` incorrectly creates a nested `dist/generated/generated` directory structure if `dist/generated` already exists or due to how `cp -r` handles existing targets. This breaks imports like `../generated/marketplace/receipt.pb.js` which expect files directly under `dist/generated/`.

I will:
1. Update `packages/vco-schemas/package.json` to use a more robust copy command.
2. Clean and rebuild the `vco-schemas` package.
3. Verify the resulting directory structure in `dist/`.

## Tasks

- [x] **Task 1: Update vco-schemas Build Script**
    - [x] Modify `packages/vco-schemas/package.json` to use `mkdir -p dist && cp -r src/generated dist/` which reliably places the `generated` folder under `dist/`.

- [x] **Task 2: Clean and Rebuild**
    - [x] Run `npm run proto:gen` from root to restore `src/generated`.
    - [x] Run `npm run clean --workspace=@vco/vco-schemas`.
    - [x] Run `npm run build --workspace=@vco/vco-schemas`.

- [x] **Task 3: Verification**
    - [x] Verify that `packages/vco-schemas/dist/generated/marketplace/receipt.pb.js` exists.
    - [x] Verify that `packages/vco-schemas/dist/generated/generated/` does NOT exist.
    - [x] Run a build of `vco-cord` to ensure imports are now resolved.
