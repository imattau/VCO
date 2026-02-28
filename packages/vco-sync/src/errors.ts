import { VcoError, VcoErrorCode } from "@vco/vco-core";

/**
 * Base error class for sync and reconciliation failures.
 */
export class SyncError extends VcoError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, VcoErrorCode.SYNC_ERROR, details);
    this.name = "SyncError";
  }
}

/**
 * Thrown when the sync protocol logic is violated or a reconciliation loop fails.
 */
export class SyncProtocolError extends SyncError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
    this.name = "SyncProtocolError";
  }
}
