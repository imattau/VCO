import { randomFillSync } from "node:crypto";
export const DEFAULT_FRAME_SIZE = 1440;
function assertValidPayloadLength(payloadLength, frameSize) {
    if (!Number.isInteger(payloadLength) || payloadLength < 0 || payloadLength > frameSize) {
        throw new Error(`payloadLength must be an integer between 0 and ${frameSize}.`);
    }
}
function assertFrameSize(frameSize) {
    if (!Number.isInteger(frameSize) || frameSize <= 0) {
        throw new Error("frameSize must be a positive integer.");
    }
}
export class CryptoRandomSource {
    fill(target, start) {
        if (!Number.isInteger(start) || start < 0 || start > target.length) {
            throw new Error("Random fill start offset is out of bounds.");
        }
        if (start === target.length) {
            return;
        }
        randomFillSync(target.subarray(start));
    }
}
export class ZeroRandomSource {
    fill(target, start) {
        assertValidPayloadLength(start, target.length);
        target.fill(0, start);
    }
}
export class FixedFramePadder {
    frameSize;
    randomSource;
    constructor(frameSize = DEFAULT_FRAME_SIZE, randomSource = new CryptoRandomSource()) {
        this.frameSize = frameSize;
        this.randomSource = randomSource;
        assertFrameSize(frameSize);
    }
    frame(payload) {
        if (!(payload instanceof Uint8Array)) {
            throw new Error("payload must be a Uint8Array.");
        }
        if (payload.length > this.frameSize) {
            throw new Error(`Payload length ${payload.length} exceeds frame size ${this.frameSize}.`);
        }
        const frame = new Uint8Array(this.frameSize);
        frame.set(payload, 0);
        this.randomSource.fill(frame, payload.length);
        return { frame, payloadLength: payload.length };
    }
    deframe(frame, payloadLength) {
        if (frame.length !== this.frameSize) {
            throw new Error(`Expected frame size ${this.frameSize}, received ${frame.length}.`);
        }
        assertValidPayloadLength(payloadLength, this.frameSize);
        return frame.slice(0, payloadLength);
    }
}
//# sourceMappingURL=frame.js.map