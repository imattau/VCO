# Plan: Comprehensive README for vco-relay

## Objective
Update `packages/vco-relay/README.md` to be a comprehensive guide for developers and operators, covering architectural details, configuration, and latest protocol alignment features.

## Tasks

- [x] Task 1: Research and Drafting
    - [x] Review recent `vco-relay` changes:
        - Persistent nullifier store (ADR 0005).
        - Blind context routing/indexing (ADR 0004).
        - Priority-aware QoS and eviction.
        - Sync filtering logging.
    - [x] Draft content sections:
        - **Introduction**: Unified purpose of the relay.
        - **Key Features**: List the core protocol features supported.
        - **Architecture**: Tech stack (libp2p, LevelDB, Protobuf).
        - **Configuration**: Detail the environment variables and JSON config schema.
        - **Storage & Eviction**: Explain the priority-aware composite index.
        - **Sync Protocol**: Explain blind routing and interest vectors.
        - **Development/Deployment**: How to build, run, and install as a service.

- [x] Task 2: Implementation
    - [x] Rewrite `packages/vco-relay/README.md` with the drafted content.
    - [x] Ensure formatting follows project standards.

- [x] Task 3: Verification
    - [x] Verify that all internal links and paths in the README are correct.
    - [x] Verify that the configuration options match `src/config.ts`.
