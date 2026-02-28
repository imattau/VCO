/**
 * Represesnts a single framed payload with its actual length.
 */
export interface FramedPayload {
    /** The full frame bytes (padded/encrypted). */
    frame: Uint8Array;
    /** The actual length of the payload within the frame. */
    payloadLength: number;
}
/**
 * A single packet within a packet set for large payload transport.
 */
export interface FramedPacket {
    /** The full frame bytes of this packet. */
    frame: Uint8Array;
    /** The length of the payload piece in this packet. */
    payloadLength: number;
    /** The 0-based index of this packet in the set. */
    index: number;
    /** The total number of packets in the set. */
    count: number;
}
/**
 * A collection of framed packets forming a complete payload.
 */
export interface FramedPacketSet {
    /** The individual packets. */
    packets: FramedPacket[];
    /** The total length of the reassembled payload. */
    totalPayloadLength: number;
}
/**
 * Interface for framing and deframing payloads (e.g. for Noise padding).
 */
export interface FramePadder {
    /** Frames a payload into a larger, fixed-size or padded frame. */
    frame(payload: Uint8Array): FramedPayload;
    /** Extracts the payload from a frame. */
    deframe(frame: Uint8Array, payloadLength: number): Uint8Array;
}
/**
 * Interface for breaking large payloads into smaller framed packets.
 */
export interface FramePacketizer {
    /** Splits a payload into a set of packets. */
    packetize(payload: Uint8Array): FramedPacketSet;
    /** Reassembles a set of packets back into the original payload. */
    reassemble(packetSet: FramedPacketSet): Uint8Array;
}
/**
 * Interface for filling buffers with random data.
 */
export interface RandomSource {
    /** Fills the target buffer starting at the given offset with random bytes. */
    fill(target: Uint8Array, start: number): void;
}
//# sourceMappingURL=types.d.ts.map