## VCO Protocol Specification v3.2

### 1. Fundamental Design

VCO v3.2 remains a Layer 3.5 protocol with three modules:

- **VCO-Core:** envelope, validation, hash/signature/PoW integrity.
- **VCO-Sync:** range-based set reconciliation.
- **VCO-Transport (TOL):** transport/session abstraction and obfuscation.

VCO is object-agnostic and library-first. Wire compatibility is shared across web, relay, and native clients.

---

## 2. Serialization Requirement (Protocol Buffers)

All implementations **MUST** serialize envelope and sync data with **Protocol Buffers (proto3)** using:
- `proto/vco/v3/vco.proto`

Manual byte-slicing/parsing of envelope or sync wire format is non-compliant.

Normative schema excerpt:

```proto
syntax = "proto3";
package vco.v3;

message ZKPExtension {
  uint32 circuit_id = 1;
  uint32 proof_length = 2;
  bytes proof = 3;
  uint32 inputs_length = 4;
  bytes public_inputs = 5;
  reserved 6; // nullifier moved to top-level Envelope
}

message Envelope {
  bytes header_hash = 1;
  uint32 version = 2;      // MUST be 3
  uint32 flags = 3;        // unsigned byte
  uint32 payload_type = 4; // multicodec id
  bytes creator_id = 5;    // Multikey
  bytes payload_hash = 6;  // Multihash
  bytes signature = 7;
  bytes payload = 8;
  ZKPExtension zkp_extension = 9;
  uint32 nonce = 10;       // PoW nonce (uint32)
  bytes context_id = 11;   // Optional 8-byte blind context identifier
  bytes nullifier = 12;    // 32-byte uniqueness nullifier
}

enum PriorityLevel {
  PRIORITY_LOW = 0;
  PRIORITY_NORMAL = 1;
  PRIORITY_HIGH = 2;
  PRIORITY_CRITICAL = 3;
}

message InterestVector {
  repeated bytes target_cids = 1;
  PriorityLevel priority = 2;
}

message PowChallenge {
  uint32 min_difficulty = 1;
  uint32 ttl_seconds = 2;
  string reason = 3;
}

message SyncControl {
  oneof message {
    SyncMessage sync_message = 1;
    PowChallenge pow_challenge = 2;
    InterestVector interest_vector = 3;
  }
}
```

### 2.1 Flag Bits

- Bit 7: `EPHEMERAL`
- Bit 6: `OBFUSCATED`
- Bit 5: `POW_ACTIVE`
- Bit 4: `ZKP_AUTH`
- Bits 2-3: reserved and **MUST** be zero.
- Bits 0-1: `PRIORITY_HINT` (0=LOW, 1=NORMAL, 2=HIGH, 3=CRITICAL).

### 2.2 Envelope Constraints

- `version` MUST be `3`.
- `flags` MUST be `0..255` and respect reserved bits.
- `payload_type` MUST be a valid multicodec identifier.
- `header_hash` MUST be 32 bytes.
- `payload_hash` MUST be valid Multihash.
- `nonce` MUST be uint32 (`0..4294967295`).
- `context_id` MUST be 8 bytes if present.
- `nullifier` MUST be 32 bytes if present.
- `payload` MUST respect `MAX_VCO_SIZE` unless fragmented.

`ZKP_AUTH = 0`:
- `creator_id` MUST be valid Multikey.
- `signature` MUST be valid for `creator_id` codec (Ed25519 baseline).
- `zkp_extension` MUST be omitted.

`ZKP_AUTH = 1`:
- `creator_id` MUST be empty or zeroed.
- `signature` MUST be empty or zeroed.
- `nullifier` MUST be present and verified for uniqueness.
- `zkp_extension` MUST be present and validated (`proof_length`, `inputs_length`).

### 2.3 Deterministic Derivation Rules

Implementations MUST use canonical derivation messages in `vco.proto`:

1. `payload_hash = Multihash(BLAKE3(payload))` (default profile).
2. Signature-auth mode only: sign `EnvelopeSigningMaterial`.
3. Compute `header_hash = BLAKE3(EnvelopeHeaderHashMaterial)` where `nonce`, `context_id`, and `nullifier` are included.
4. Serialize final `Envelope` with Protobuf.

Custom concatenation and custom wire parsers are non-compliant.

---

## 3. Blind Context Routing (v3.2)

`Envelope.context_id` is an optional 8-byte field used for "Blind Dispatching".

- It SHOULD be derived from an HMAC of the Topic/Group ID.
- Relays MUST support routing and filtering based on BCID without content inspection.
- BCID allows nodes to drop irrelevant traffic before expensive decryption or ZKP verification.

---

## 4. ZKP-Agnostic Extension (v3.1)

`ZKPExtension` is a blind slot for application-defined proof systems.

Library responsibilities:
- carry `zkp_extension` bytes,
- dispatch by `circuit_id` via app-registered verifier interface,
- enforce nullifier replay protection (using the top-level `nullifier`).

Application responsibilities:
- generate proof bytes and public inputs,
- register circuit-specific verification logic.

---

## 5. PoW Extension (v3.2)

### 4.1 Purpose

PoW is a rate-limiting and priority signal, not global consensus mining. Difficulty is contextual and determined by the receiver policy.

### 4.2 Nonce and Signaling

- `Envelope.nonce` is the deterministic PoW nonce field.
- If `FLAGS.POW_ACTIVE = 1`, receivers MUST validate PoW before processing payload.
- If `FLAGS.POW_ACTIVE = 0`, nonce may still carry entropy.

### 4.3 Verification Rule

PoW uses leading-zero-bit threshold on `header_hash`:

`verifyPoW(header_hash, D) == (leading_zero_bits(header_hash) >= D)`

Difficulty range: `0..256`.

Equivalent target form:

`Target = 2^(256 - D)` and valid iff `header_hash < Target`.

### 4.4 Sender Solve Rule

For difficulty `D > 0`, sender iterates nonce and recomputes header hash until threshold is met.
`nonce` iteration space is uint32.

### 4.5 Receiver Backpressure Policy

Receivers MAY enforce dynamic minimum difficulty based on load and reject envelopes below threshold.
Transport/session layers MAY communicate this via `SyncControl.pow_challenge`.

`PowChallenge.min_difficulty` indicates required leading-zero-bit threshold.
`PowChallenge.ttl_seconds` indicates challenge validity window.

`SyncControl` messages MUST contain exactly one of `sync_message`, `pow_challenge`, or `interest_vector`.

### 4.6 Priority and Retention Guidance

Nodes MUST use `PriorityHint` (primary) and PoW score (`leading_zero_bits(header_hash)`) (secondary) for:
- request prioritization in sync/fetch queues,
- cache/storage eviction (lower priority/work evicted first).

---

## 6. VCO-Sync

State flow:
1. INIT
2. COMPARE
3. BISECT
4. RECURSE
5. EXCHANGE (`header_hash` lists and envelope fetch)

`SyncMessage` wire format MUST use `proto/vco/v3/vco.proto`.

### 6.1 Filtered Sync (Interest Vectors)

Nodes MAY signal their interest in specific topics or priority levels using `SyncControl.interest_vector`.

- `InterestVector.target_cids`: A list of BCIDs the node wants to synchronize.
- `InterestVector.priority`: The minimum priority level the node is interested in.

Relays SHOULD apply these filters to the outbound sync stream to conserve bandwidth.

---

## 7. Transport

Current library baseline uses libp2p adapters:
- QUIC: `@chainsafe/libp2p-quic`
- Noise: `@chainsafe/libp2p-noise`
- Mux: `@chainsafe/libp2p-yamux`

Active profile in codebase: `Noise_XX_25519_ChaChaPoly_SHA256`.

---

## 8. Constants

| Constant | Value | Description |
| --- | --- | --- |
| `MAX_VCO_SIZE` | `4,194,304` | Payload limit before fragmentation. |
| `RECON_THRESHOLD` | `16` | Sync list-exchange threshold. |
| `IDLE_TIMEOUT` | `300s` | Inactive session timeout. |
| `MAGIC_BYTES` | `0x56434F03` | Discovery marker in non-obfuscated contexts. |
| `BCID_LENGTH` | `8 bytes` | Blind Context Identifier length. |
| `NULLIFIER_LENGTH` | `32 bytes` | Uniqueness nullifier length. |

---

## 9. Compliance Notes

- Protobuf schema is the canonical envelope/sync wire contract.
- Multikey/Multihash are mandatory for algorithm agility.
- PoW, BCID, and ZKP are optional features but normative when their flags are active.
- Any custom replacement for crypto/serialization/transport primitives requires ADR in `docs/adr/`.
