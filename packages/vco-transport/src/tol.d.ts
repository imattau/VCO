import type { FramePacketizer, FramedPacketSet, RandomSource } from "./types.js";
export interface TransportObfuscationLayerOptions {
    frameSize?: number;
    randomSource?: RandomSource;
    packetizer?: FramePacketizer;
}
export declare class TransportObfuscationLayer {
    private readonly packetizer;
    constructor(options?: TransportObfuscationLayerOptions);
    encapsulatePayload(payload: Uint8Array): FramedPacketSet;
    decapsulatePayload(packetSet: FramedPacketSet): Uint8Array;
}
//# sourceMappingURL=tol.d.ts.map