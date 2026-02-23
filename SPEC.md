## VCO Protocol Specification v3.0

### 1. Fundamental Design

VCO v3 is a **Layer 3.5** protocol. It sits above the transport layer (QUIC/TCP/UDP) but below the application layer. It is defined by two sub-protocols:

* **VCO-Core:** The immutable data container.
* **VCO-Sync:** The range-based set reconciliation protocol.
* **VCO-Transport (TOL):** The Noise-based obfuscation wrapper.

---

## 2. The VCO v3 Envelope (ABNF Definition)

To ensure interoperability, the header is fixed-length, using **Big-Endian** (Network Byte Order) for all numeric fields.

```abnf
VCO_ENVELOPE = HEADER PAYLOAD
HEADER       = HEADER_HASH VERSION FLAGS PAYLOAD_TYPE CREATOR_ID PAYLOAD_HASH SIGNATURE
HEADER_HASH  = 32BYTE ; BLAKE3 hash of (VERSION through SIGNATURE)
VERSION      = %x03    ; Protocol Version 3
FLAGS        = BYTE    ; [7: Ephemeral, 6: Obfuscated, 5: Fragmented, 4: Encrypted, 0-3: Reserved]
PAYLOAD_TYPE = 2BYTE   ; Multicodec ID (e.g., 0x50 = JSON, 0x81 = MessagePack)
CREATOR_ID   = 32BYTE  ; Ed25519 Public Key (Multikey format)
PAYLOAD_HASH = 32BYTE  ; Multihash (default: BLAKE3)
SIGNATURE    = 64BYTE  ; Schnorr Signature
PAYLOAD      = *BYTE   ; Raw data

```

---

## 3. Cryptographic Standards

* **Hashing:** BLAKE3 is the default. If a different hash is used, the `FLAGS` bit for "Extended Header" must be set to accommodate variable-length Multihashes.
* **Signatures:** Schnorr signatures over Ed25519 curves.
* **Key Derivation:** HKDF (HMAC-based Extract-and-Expand Key Derivation Function) using SHA-256.

---

## 4. VCO-Sync: Range-Based Reconciliation

Instead of a simple "request-response," VCO v3 uses a state machine to synchronize object stores between peers.

### The Reconciliation State Machine

1. **INIT:** The *Initiator* sends a `RangeProof` containing a Merkle Root of their entire local hash set `[0x00... to 0xFF...]`.
2. **COMPARE:** The *Responder* compares the root with their own.
* If **Match**: The sets are identical. Terminate.
* If **Mismatch**: Move to **BISECT**.


3. **BISECT:** The range is split into two (e.g., `[0x00... to 0x7F...]` and `[0x80... to 0xFF...]`). The *Responder* sends roots for both.
4. **RECURSE:** The *Initiator* identifies which sub-range mismatches and requests a further split.
5. **EXCHANGE:** Once a range contains  items (threshold, usually 16), the peers exchange the actual `Header Hashes`. Missing VCOs are then requested via `GET`.

---

## 5. Transport Obfuscation Layer (TOL)

TOL implements the **Noise_IK_25519_ChaChaPoly_BLAKE3** handshake.

* **Static Key Discovery:** Peers find static keys via a DHT or out-of-band (e.g., a Nostr profile).
* **Zero-RTT Data:** The initiator can send the first VCO in the first packet.
* **Frame Padding:** All TOL packets are padded to exactly **1440 bytes**.
* *Payload < 1440:* Padded with random bytes (chaff).
* *Payload > 1440:* Split into `Fragmented` VCOs.



---

## 6. Implementation Constants

| Constant | Value | Description |
| --- | --- | --- |
| `MAX_VCO_SIZE` | `4,194,304` (4MB) | Objects larger than this MUST be fragmented. |
| `RECON_THRESHOLD` | `16` | Number of items in a range before switching from Merkle to List. |
| `IDLE_TIMEOUT` | `300s` | Time before an inactive TOL session is dropped. |
| `MAGIC_BYTES` | `0x56434F03` | Used only in non-obfuscated discovery. |

---

## 7. Networking Impact Analysis

* **DPI Resistance:** In TOL mode, there are no static magic bytes. The first 1440 bytes are indistinguishable from high-entropy noise.
* **Congestion Control:** Implementations SHOULD use **BBR** or **Cubic** congestion control over QUIC to ensure the "Object-Agnostic" nature doesn't saturate the local link.
* **In-Network Caching:** Only permitted for VCOs where `FLAGS:Obfuscated == 0`. Intermediate nodes SHOULD verify the `Header Hash` before caching to prevent poisoning.
