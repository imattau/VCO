# Implementation Plan: Native Android libp2p Node

## Objective
Ensure the Tauri Android app can natively compile and run the embedded Rust libp2p node on the device, eliminating any reliance on a host PC (such as external sidecars or host-bound local networking).

## Key Files & Context
- `src-tauri/Cargo.toml`
- `src-tauri/gen/android/app/src/main/AndroidManifest.xml`
- `src-tauri/src/vco_node.rs`

## Proposed Solution
The application already has an embedded Rust libp2p node (`vco_node.rs`) which is initiated via Tauri's async runtime. However, to ensure it compiles and operates correctly on an Android device without sidecars:
1. **Fix Cross-Compilation for Mobile:** Ensure `libp2p` and `quinn` use the `ring` crypto provider instead of `aws-lc-rs`. `aws-lc-rs` often fails to compile for Android NDK targets without complex CMake configurations, causing developers to skip mobile node builds or rely on PC-hosted nodes.
2. **Add Network Permissions:** Add `ACCESS_NETWORK_STATE` and `ACCESS_WIFI_STATE` to the Android Manifest to allow `libp2p` to query active network interfaces and manage P2P connections reliably.

## Implementation Steps
1. **Update `Cargo.toml`**: 
   - Add `rustls = { version = "0.23", default-features = false, features = ["ring"] }` to ensure `ring` is used.
   - Configure `libp2p` features if needed to enforce `ring` across `noise` and `quic`.
2. **Update `AndroidManifest.xml`**:
   - Add `<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />`
   - Add `<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />`

## Verification & Testing
- Run `cargo tauri android dev` or build the APK and verify in Android Studio Logcat that `VCO: Starting libp2p node...` succeeds and the swarm binds successfully.
- Verify the frontend UI switches to "Swarm Connected" when running natively on the emulator/device without the host PC node running.