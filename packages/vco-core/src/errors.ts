/**
 * Standard error codes for the Verifiable Content Object protocol.
 * Used for programmatic handling of specific failure modes across the ecosystem.
 */
export enum VcoErrorCode {
  GENERIC_ERROR = "VCO_GENERIC_ERROR",
  INVALID_ENVELOPE = "VCO_INVALID_ENVELOPE",
  CRYPTO_UNAVAILABLE = "VCO_CRYPTO_UNAVAILABLE",
  INVALID_MULTIFORMAT = "VCO_INVALID_MULTIFORMAT",
  INVALID_POW = "VCO_INVALID_POW",
  INVALID_PAYLOAD = "VCO_INVALID_PAYLOAD",
  TRANSPORT_ERROR = "VCO_TRANSPORT_ERROR",
  SYNC_ERROR = "VCO_SYNC_ERROR",
}

/**
 * Base error class for all VCO protocol-related failures.
 * Provides structured error codes and optional metadata for diagnostic purposes.
 */
export class VcoError extends Error {
  /** The standard error code for programmatic handling. */
  public readonly code: VcoErrorCode;
  /** Optional structured metadata describing the error context. */
  public readonly details?: Record<string, unknown>;
  /** Explicitly override the name property. */
  public name: string;

  constructor(message: string, code: VcoErrorCode = VcoErrorCode.GENERIC_ERROR, details?: Record<string, unknown>) {
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
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, VcoErrorCode.INVALID_ENVELOPE, details);
    this.name = "EnvelopeValidationError";
  }
}

/**
 * Thrown when a multihash or multicodec multiformat value is invalid or unsupported.
 */
export class MultiformatError extends VcoError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, VcoErrorCode.INVALID_MULTIFORMAT, details);
    this.name = "MultiformatError";
  }
}

/**
 * Thrown when a required cryptographic operation fails or a provider is missing.
 */
export class CryptoProviderError extends VcoError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, VcoErrorCode.CRYPTO_UNAVAILABLE, details);
    this.name = "CryptoProviderError";
  }
}

/**
 * Thrown when Proof-of-Work validation or generation fails.
 */
export class PoWError extends VcoError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, VcoErrorCode.INVALID_POW, details);
    this.name = "PoWError";
  }
}
