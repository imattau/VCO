import type { FramePadder, FramePacketizer, FramedPacketSet } from "./types.js";
export declare class FixedFramePacketizer implements FramePacketizer {
    private readonly frameSize;
    private readonly padder;
    constructor(frameSize?: number, padder?: FramePadder);
    packetize(payload: Uint8Array): FramedPacketSet;
    reassemble(packetSet: FramedPacketSet): Uint8Array;
}
//# sourceMappingURL=packetizer.d.ts.map