import { TransportObfuscationLayer, type TransportObfuscationLayerOptions } from "./tol.js";
import type { FramedPacketSet } from "./types.js";

export const DEFAULT_IDLE_TIMEOUT_SECONDS = 300;

function assertIdleTimeoutSeconds(idleTimeoutSeconds: number): void {
  if (!Number.isInteger(idleTimeoutSeconds) || idleTimeoutSeconds <= 0) {
    throw new Error("idleTimeoutSeconds must be a positive integer.");
  }
}

export interface TransportSessionOptions extends TransportObfuscationLayerOptions {
  idleTimeoutSeconds?: number;
  now?: () => number;
}

export interface TransportSessionSnapshot {
  idleTimeoutSeconds: number;
  lastActivityAtMs: number;
}

export class TransportSession {
  private readonly tol: TransportObfuscationLayer;
  private readonly idleTimeoutMs: number;
  private readonly now: () => number;
  private lastActivityAtMs: number;

  constructor(options: TransportSessionOptions = {}) {
    const idleTimeoutSeconds = options.idleTimeoutSeconds ?? DEFAULT_IDLE_TIMEOUT_SECONDS;
    assertIdleTimeoutSeconds(idleTimeoutSeconds);

    this.now = options.now ?? (() => Date.now());
    this.tol = new TransportObfuscationLayer(options);
    this.idleTimeoutMs = idleTimeoutSeconds * 1_000;
    this.lastActivityAtMs = this.now();
  }

  touch(): void {
    this.lastActivityAtMs = this.now();
  }

  isIdle(): boolean {
    return this.now() - this.lastActivityAtMs >= this.idleTimeoutMs;
  }

  encapsulatePayload(payload: Uint8Array): FramedPacketSet {
    this.assertActive();
    const packetSet = this.tol.encapsulatePayload(payload);
    this.touch();
    return packetSet;
  }

  decapsulatePayload(packetSet: FramedPacketSet): Uint8Array {
    this.assertActive();
    const payload = this.tol.decapsulatePayload(packetSet);
    this.touch();
    return payload;
  }

  snapshot(): TransportSessionSnapshot {
    return {
      idleTimeoutSeconds: this.idleTimeoutMs / 1_000,
      lastActivityAtMs: this.lastActivityAtMs,
    };
  }

  private assertActive(): void {
    if (this.isIdle()) {
      throw new Error("Transport session expired due to idle timeout.");
    }
  }
}
