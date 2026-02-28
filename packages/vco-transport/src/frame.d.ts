import type { FramePadder, FramedPayload, RandomSource } from "./types.js";
export declare const DEFAULT_FRAME_SIZE = 1440;
export declare class CryptoRandomSource implements RandomSource {
    fill(target: Uint8Array, start: number): void;
}
export declare class ZeroRandomSource implements RandomSource {
    fill(target: Uint8Array, start: number): void;
}
export declare class FixedFramePadder implements FramePadder {
    private readonly frameSize;
    private readonly randomSource;
    constructor(frameSize?: number, randomSource?: RandomSource);
    frame(payload: Uint8Array): FramedPayload;
    deframe(frame: Uint8Array, payloadLength: number): Uint8Array;
}
//# sourceMappingURL=frame.d.ts.map