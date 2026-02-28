/**
 * Standard error codes for the Verifiable Content Object protocol.
 * Used for programmatic handling of specific failure modes across the ecosystem.
 */
export var VcoErrorCode;
(function (VcoErrorCode) {
    VcoErrorCode["GENERIC_ERROR"] = "VCO_GENERIC_ERROR";
    VcoErrorCode["INVALID_ENVELOPE"] = "VCO_INVALID_ENVELOPE";
    VcoErrorCode["CRYPTO_UNAVAILABLE"] = "VCO_CRYPTO_UNAVAILABLE";
    VcoErrorCode["INVALID_MULTIFORMAT"] = "VCO_INVALID_MULTIFORMAT";
    VcoErrorCode["INVALID_POW"] = "VCO_INVALID_POW";
    VcoErrorCode["INVALID_PAYLOAD"] = "VCO_INVALID_PAYLOAD";
    VcoErrorCode["TRANSPORT_ERROR"] = "VCO_TRANSPORT_ERROR";
    VcoErrorCode["SYNC_ERROR"] = "VCO_SYNC_ERROR";
})(VcoErrorCode || (VcoErrorCode = {}));
/**
 * Base error class for all VCO protocol-related failures.
 * Provides structured error codes and optional metadata for diagnostic purposes.
 */
export class VcoError extends Error {
    /** The standard error code for programmatic handling. */
    code;
    /** Optional structured metadata describing the error context. */
    details;
    /** Explicitly override the name property. */
    name;
    constructor(message, code = VcoErrorCode.GENERIC_ERROR, details) {
        super(message);
        this.name = "VcoError";
        this.code = code;
        this.details = details;
        // Ensure proper stack trace in environments that support it
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
/**
 * Thrown when a VCO envelope fails protocol-level validation or integrity checks.
 */
export class EnvelopeValidationError extends VcoError {
    constructor(message, details) {
        super(message, VcoErrorCode.INVALID_ENVELOPE, details);
        this.name = "EnvelopeValidationError";
    }
}
/**
 * Thrown when a multihash or multicodec multiformat value is invalid or unsupported.
 */
export class MultiformatError extends VcoError {
    constructor(message, details) {
        super(message, VcoErrorCode.INVALID_MULTIFORMAT, details);
        this.name = "MultiformatError";
    }
}
/**
 * Thrown when a required cryptographic operation fails or a provider is missing.
 */
export class CryptoProviderError extends VcoError {
    constructor(message, details) {
        super(message, VcoErrorCode.CRYPTO_UNAVAILABLE, details);
        this.name = "CryptoProviderError";
    }
}
/**
 * Thrown when Proof-of-Work validation or generation fails.
 */
export class PoWError extends VcoError {
    constructor(message, details) {
        super(message, VcoErrorCode.INVALID_POW, details);
        this.name = "PoWError";
    }
}
//# sourceMappingURL=errors.js.map