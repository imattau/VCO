/**
 * Represesnts the header of a Verifiable Content Object (VCO) envelope.
 * Contains protocol version, flags, payload type, creator information, and cryptographic proof of integrity.
 */
export interface VcoHeader {
  /** The protocol version (currently 3). */
  version: number;
  /** Bitmask flags for features like PoW or ZKP authentication. */
  flags: number;
  /** The type of payload contained in the envelope (multicodec-style). */
  payloadType: number;
  /** Multikey-encoded public key or identifier of the creator. */
  creatorId: Uint8Array;
  /** Multihash of the payload bytes. */
  payloadHash: Uint8Array;
  /** Ed25519 signature of the signing material, or empty if using ZKP auth. */
  signature: Uint8Array;
  /** Number used once for Proof of Work (PoW). */
  nonce: number;
}

/**
 * Extension for Zero-Knowledge Proof (ZKP) based authentication.
 * Used when the FLAG_ZKP_AUTH is set in the header flags.
 */
export interface VcoZkpExtension {
  /** Identifier of the circuit used for the proof. */
  circuitId: number;
  /** Length of the proof in bytes. */
  proofLength: number;
  /** The proof bytes (e.g. Groth16 proof). */
  proof: Uint8Array;
  /** Length of the public inputs in bytes. */
  inputsLength: number;
  /** The public inputs for the ZKP circuit. */
  publicInputs: Uint8Array;
  /** Nullifier to prevent replay attacks in ZKP auth. */
  nullifier: Uint8Array;
}

/**
 * The full Verifiable Content Object (VCO) envelope.
 * Combines the header, payload, and optional ZKP extension into a verifiable unit.
 */
export interface VcoEnvelope {
  /** Cryptographic hash of the entire header material including signature and nonce. */
  headerHash: Uint8Array;
  /** The header metadata. */
  header: VcoHeader;
  /** The actual content bytes of the object. */
  payload: Uint8Array;
  /** Optional ZKP extension for privacy-preserving authentication. */
  zkpExtension?: VcoZkpExtension;
}
