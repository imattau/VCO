import type { VcoEnvelope, VcoZkpExtension } from "./types.js";
interface CreateEnvelopeInputBase {
    payload: Uint8Array;
    payloadType: number;
    flags?: number;
    version?: number;
    nonce?: number;
    powDifficulty?: number;
}
/**
 * Input for creating a signed VCO envelope.
 * Requires the creator's ID and private key.
 */
export interface CreateSignedEnvelopeInput extends CreateEnvelopeInputBase {
    /** Multikey-encoded public key or identifier of the creator. */
    creatorId: Uint8Array;
    /** Ed25519 private key for signing the envelope. */
    privateKey: Uint8Array;
}
/**
 * Input for creating a ZKP-authenticated VCO envelope.
 * Requires a ZKP extension and optional creator/private key for dual auth.
 */
export interface CreateZkpEnvelopeInput extends CreateEnvelopeInputBase {
    /** The ZKP extension with proof and public inputs. */
    zkpExtension: VcoZkpExtension;
    /** Optional multikey creator identifier. */
    creatorId?: Uint8Array;
    /** Optional Ed25519 private key. */
    privateKey?: Uint8Array;
}
/**
 * Union of possible inputs for creating a VCO envelope.
 */
export type CreateEnvelopeInput = CreateSignedEnvelopeInput | CreateZkpEnvelopeInput;
/**
 * Pluggable crypto provider for performing cryptographic operations.
 * Allows core to remain library-agnostic while ensuring consistent behavior.
 */
export interface EnvelopeCryptoProvider {
    /** Compute a hash (e.g., Blake3) of the given bytes. */
    digest(payload: Uint8Array): Uint8Array;
    /** Sign the given message using the provided private key. */
    sign(message: Uint8Array, privateKey: Uint8Array): Uint8Array;
    /** Verify the signature of a message against a public key. */
    verify(message: Uint8Array, signature: Uint8Array, publicKey: Uint8Array): boolean;
}
/**
 * Creates a new Verifiable Content Object (VCO) envelope from the given input.
 * Handles signing, payload hashing, and Proof of Work (PoW) computation.
 *
 * @param input The data and configuration for the envelope (e.g., payload, creator keys).
 * @param crypto The cryptographic provider for hashes and signatures.
 * @returns A fully constructed and verified VcoEnvelope object.
 * @throws {EnvelopeValidationError} If input parameters are invalid or cryptographic operations fail.
 */
export declare function createEnvelope(input: CreateEnvelopeInput, crypto: EnvelopeCryptoProvider): VcoEnvelope;
/**
 * Asserts the full cryptographic integrity and validity of an envelope.
 * Verifies payload hashes, signatures, and header hashes.
 *
 * @param envelope The envelope to verify.
 * @param crypto The cryptographic provider for hashes and signatures.
 * @throws {EnvelopeValidationError} If any cryptographic verification fails.
 */
export declare function assertEnvelopeIntegrity(envelope: VcoEnvelope, crypto: EnvelopeCryptoProvider): void;
/**
 * Verifies the integrity of an envelope and returns a boolean.
 *
 * @param envelope The envelope to verify.
 * @param crypto The cryptographic provider for hashes and signatures.
 * @returns True if the envelope is valid and integrity is verified.
 */
export declare function verifyEnvelope(envelope: VcoEnvelope, crypto: EnvelopeCryptoProvider): boolean;
export {};
//# sourceMappingURL=envelope.d.ts.map