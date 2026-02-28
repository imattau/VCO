import { type TransportObfuscationLayerOptions } from "./tol.js";
import type { FramedPacketSet } from "./types.js";
export declare const DEFAULT_IDLE_TIMEOUT_SECONDS = 300;
export interface TransportSessionOptions extends TransportObfuscationLayerOptions {
    idleTimeoutSeconds?: number;
    now?: () => number;
}
export interface TransportSessionSnapshot {
    idleTimeoutSeconds: number;
    lastActivityAtMs: number;
}
export declare class TransportSession {
    private readonly tol;
    private readonly idleTimeoutMs;
    private readonly now;
    private lastActivityAtMs;
    constructor(options?: TransportSessionOptions);
    touch(): void;
    isIdle(): boolean;
    encapsulatePayload(payload: Uint8Array): FramedPacketSet;
    decapsulatePayload(packetSet: FramedPacketSet): Uint8Array;
    snapshot(): TransportSessionSnapshot;
    private assertActive;
}
//# sourceMappingURL=session.d.ts.map