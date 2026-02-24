export interface FramedPayload {
  frame: Uint8Array;
  payloadLength: number;
}

export interface FramedPacket {
  frame: Uint8Array;
  payloadLength: number;
  index: number;
  count: number;
}

export interface FramedPacketSet {
  packets: FramedPacket[];
  totalPayloadLength: number;
}

export interface FramePadder {
  frame(payload: Uint8Array): FramedPayload;
  deframe(frame: Uint8Array, payloadLength: number): Uint8Array;
}

export interface FramePacketizer {
  packetize(payload: Uint8Array): FramedPacketSet;
  reassemble(packetSet: FramedPacketSet): Uint8Array;
}

export interface RandomSource {
  fill(target: Uint8Array, start: number): void;
}
