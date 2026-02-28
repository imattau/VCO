import { DEFAULT_FRAME_SIZE, FixedFramePadder } from "./frame.js";
import { FixedFramePacketizer } from "./packetizer.js";
export class TransportObfuscationLayer {
    packetizer;
    constructor(options = {}) {
        if (options.packetizer) {
            this.packetizer = options.packetizer;
            return;
        }
        const frameSize = options.frameSize ?? DEFAULT_FRAME_SIZE;
        const padder = new FixedFramePadder(frameSize, options.randomSource);
        this.packetizer = new FixedFramePacketizer(frameSize, padder);
    }
    encapsulatePayload(payload) {
        return this.packetizer.packetize(payload);
    }
    decapsulatePayload(packetSet) {
        return this.packetizer.reassemble(packetSet);
    }
}
//# sourceMappingURL=tol.js.map