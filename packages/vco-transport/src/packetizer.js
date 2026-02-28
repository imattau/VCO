import { DEFAULT_FRAME_SIZE, FixedFramePadder } from "./frame.js";
function assertPositiveInteger(value, fieldName) {
    if (!Number.isInteger(value) || value <= 0) {
        throw new Error(`${fieldName} must be a positive integer.`);
    }
}
function assertPacketShape(packet, frameSize) {
    if (packet.frame.length !== frameSize) {
        throw new Error(`packet.frame must be exactly ${frameSize} bytes.`);
    }
    if (!Number.isInteger(packet.payloadLength) || packet.payloadLength < 0 || packet.payloadLength > frameSize) {
        throw new Error(`packet.payloadLength must be between 0 and ${frameSize}.`);
    }
    if (!Number.isInteger(packet.index) || packet.index < 0) {
        throw new Error("packet.index must be a non-negative integer.");
    }
    assertPositiveInteger(packet.count, "packet.count");
}
function concatChunks(chunks) {
    const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
        out.set(chunk, offset);
        offset += chunk.length;
    }
    return out;
}
export class FixedFramePacketizer {
    frameSize;
    padder;
    constructor(frameSize = DEFAULT_FRAME_SIZE, padder) {
        this.frameSize = frameSize;
        assertPositiveInteger(frameSize, "frameSize");
        this.padder = padder ?? new FixedFramePadder(frameSize);
    }
    packetize(payload) {
        if (!(payload instanceof Uint8Array)) {
            throw new Error("payload must be a Uint8Array.");
        }
        const count = Math.max(1, Math.ceil(payload.length / this.frameSize));
        const packets = [];
        for (let index = 0; index < count; index += 1) {
            const start = index * this.frameSize;
            const end = Math.min(start + this.frameSize, payload.length);
            const chunk = payload.slice(start, end);
            const framed = this.padder.frame(chunk);
            packets.push({
                frame: framed.frame,
                payloadLength: framed.payloadLength,
                index,
                count,
            });
        }
        return {
            packets,
            totalPayloadLength: payload.length,
        };
    }
    reassemble(packetSet) {
        if (packetSet.packets.length === 0) {
            throw new Error("packetSet must include at least one packet.");
        }
        if (!Number.isInteger(packetSet.totalPayloadLength) || packetSet.totalPayloadLength < 0) {
            throw new Error("totalPayloadLength must be a non-negative integer.");
        }
        const sorted = [...packetSet.packets].sort((left, right) => left.index - right.index);
        const expectedCount = sorted[0].count;
        const seen = new Set();
        const chunks = [];
        let total = 0;
        for (const packet of sorted) {
            assertPacketShape(packet, this.frameSize);
            if (packet.count !== expectedCount) {
                throw new Error("packet.count mismatch across packet set.");
            }
            if (packet.index >= packet.count) {
                throw new Error("packet.index must be lower than packet.count.");
            }
            if (seen.has(packet.index)) {
                throw new Error("duplicate packet index detected.");
            }
            seen.add(packet.index);
            const chunk = this.padder.deframe(packet.frame, packet.payloadLength);
            chunks.push(chunk);
            total += chunk.length;
        }
        if (seen.size !== expectedCount) {
            throw new Error("missing packet index in packet set.");
        }
        for (let index = 0; index < expectedCount; index += 1) {
            if (!seen.has(index)) {
                throw new Error(`missing packet index ${index}.`);
            }
        }
        if (total !== packetSet.totalPayloadLength) {
            throw new Error(`Packet payload total ${total} does not match totalPayloadLength ${packetSet.totalPayloadLength}.`);
        }
        return concatChunks(chunks);
    }
}
//# sourceMappingURL=packetizer.js.map