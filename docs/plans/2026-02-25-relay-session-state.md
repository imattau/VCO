# VCO Relay Implementation - Session State

## Branch
vco-relay

## Completed Tasks
- Task 1: Package scaffold (commit c55b636) - DONE
- Task 2: Config module (commit 952932b) - DONE  
- Task 3: Store module - IN PROGRESS (store.ts written, tests failing)

## Current Blocker: Store test failure
File: packages/vco-relay/test/store.test.ts
Test: "put and get roundtrip" 
Error: "expected Buffer[ 1 ] to deeply equal Uint8Array[ 1 ]"

Root cause: decodeEnvelopeProto returns Buffer for payload field.
toUint8Array fix attempted in packages/vco-core/src/protobuf.ts line 71:
  Changed: `value instanceof Uint8Array ? value : Uint8Array.from(value)`
  To:      `value.constructor === Uint8Array ? value as Uint8Array : Uint8Array.from(value)`
But still failing - need to investigate why. 

Check: maybe decodeEnvelopeProto doesn't go through fromProtoEnvelope for payload,
or maybe the issue is that the VcoEnvelope returned from createEnvelope already has
a Buffer payload from the test's Uint8Array input.

Alternative fix: In store.ts get() method, wrap result payload:
  return { ...env, payload: new Uint8Array(env.payload) };
  
OR: Check if the issue is that env.payload from createEnvelope is already a Buffer
(meaning the test itself creates a Buffer payload). The test has:
  createEnvelope({ payload: new Uint8Array([payloadByte]), ... })
  env.payload should be Uint8Array([payloadByte])
  retrieved.payload should also be Uint8Array after decode

BEST FIX: Revert the protobuf.ts change (it's speculative). Instead, look at what
decodeEnvelopeProto actually does with payload - check if fromProtoEnvelope is
actually being called, and trace where the Buffer comes from.

## Remaining Tasks
- Task 3 store module: Fix test + export + commit
- Task 4: Admission module (packages/vco-relay/src/admission.ts + test)
  NOTE: EnvelopeAdmissionOptions does NOT have 'core' field.
  Use custom interface:
    export interface RelayAdmissionOptions extends EnvelopeAdmissionOptions {
      core: VCOCore;
    }
    export function createRelayAdmission(options: RelayAdmissionOptions): RelayAdmitFn {
      return (encoded) => admitInboundEnvelope(encoded, options.core, options);
    }
- Task 5: Sync handler (packages/vco-relay/src/sync-handler.ts) - typecheck only
- Task 6: RelayServer class (packages/vco-relay/src/server.ts)
  NOTE: Use DEFAULT_VCO_SYNC_PROTOCOL from @vco/vco-transport ("/vco/sync/3.2.0")
  NOT "/vco/sync/1.0.0" as in plan
  Use handleSyncSessionChannels from @vco/vco-transport instead of raw node.handle
- Task 7: Main entry point (packages/vco-relay/src/main.ts)
- Task 8: Integration test
- Task 9: Final cleanup and push

## Key Files Written
- packages/vco-relay/package.json
- packages/vco-relay/tsconfig.json
- packages/vco-relay/tsconfig.build.json
- packages/vco-relay/src/index.ts (exports config so far)
- packages/vco-relay/src/config.ts (COMPLETE)
- packages/vco-relay/src/store.ts (written, needs test fix)
- packages/vco-relay/test/config.test.ts (PASSING)
- packages/vco-relay/test/store.test.ts (FAILING - see above)

## API Notes (from source investigation)
- getPowScore: exported from @vco/vco-core ✓
- admitInboundEnvelope(encoded, core, options): core is 2nd param NOT in options
- EnvelopeAdmissionOptions: { powPolicy?, requiredDifficulty? } - NO core field
- DEFAULT_VCO_SYNC_PROTOCOL = "/vco/sync/3.2.0" (in packages/vco-transport/src/sync-channel.ts)
- Libp2pSessionChannel: exported from @vco/vco-transport
- handleSyncSessionChannels: exported from @vco/vco-transport
- SyncMessageChannel: interface in @vco/vco-sync protocol.ts
- SyncRangeProofProtocol: class in @vco/vco-sync protocol.ts

## Plan File
docs/plans/2026-02-24-vco-relay.md
