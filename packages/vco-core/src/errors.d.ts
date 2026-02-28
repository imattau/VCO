/**
 * Standard error codes for the Verifiable Content Object protocol.
 * Used for programmatic handling of specific failure modes across the ecosystem.
 */
export declare enum VcoErrorCode {
    GENERIC_ERROR = "VCO_GENERIC_ERROR",
    INVALID_ENVELOPE = "VCO_INVALID_ENVELOPE",
    CRYPTO_UNAVAILABLE = "VCO_CRYPTO_UNAVAILABLE",
    INVALID_MULTIFORMAT = "VCO_INVALID_MULTIFORMAT",
    INVALID_POW = "VCO_INVALID_POW",
    INVALID_PAYLOAD = "VCO_INVALID_PAYLOAD",
    TRANSPORT_ERROR = "VCO_TRANSPORT_ERROR",
    SYNC_ERROR = "VCO_SYNC_ERROR"
}
/**
 * Base error class for all VCO protocol-related failures.
 * Provides structured error codes and optional metadata for diagnostic purposes.
 */
export declare class VcoError extends Error {
    /** The standard error code for programmatic handling. */
    readonly code: VcoErrorCode;
    /** Optional structured metadata describing the error context. */
    readonly details?: Record<string, unknown>;
    constructor(message: string, code?: VcoErrorCode, details?: Record<string, unknown>);
}
/**
 * Thrown when a VCO envelope fails protocol-level validation or integrity checks.
 */
export declare class EnvelopeValidationError extends VcoError {
    constructor(message: string, details?: Record<string, unknown>);
}
/**
 * Thrown when a multihash or multicodec multiformat value is invalid or unsupported.
 */
export declare class MultiformatError extends VcoError {
    constructor(message: string, details?: Record<string, unknown>);
}
/**
 * Thrown when a required cryptographic operation fails or a provider is missing.
 */
export declare class CryptoProviderError extends VcoError {
    constructor(message: string, details?: Record<string, unknown>);
}
/**
 * Thrown when Proof-of-Work validation or generation fails.
 */
export declare class PoWError extends VcoError {
    constructor(message: string, details?: Record<string, unknown>);
}
