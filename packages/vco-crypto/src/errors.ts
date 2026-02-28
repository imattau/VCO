/**
 * Base error class for cryptographic failures in the vco-crypto package.
 * Note: This class does not extend VcoError from vco-core to avoid circular dependencies.
 */
export class CryptoError extends Error {
  constructor(message: string, public readonly details?: Record<string, unknown>) {
    super(message);
    this.name = "CryptoError";

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
