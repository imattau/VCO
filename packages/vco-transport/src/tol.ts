import { DEFAULT_FRAME_SIZE, FixedFramePadder } from "./frame.js";
import { FixedFramePacketizer } from "./packetizer.js";
import type {
  FramePacketizer,
  FramedPacketSet,
  RandomSource,
} from "./types.js";

export interface TransportObfuscationLayerOptions {
  frameSize?: number;
  randomSource?: RandomSource;
  packetizer?: FramePacketizer;
}

export class TransportObfuscationLayer {
  private readonly packetizer: FramePacketizer;

  constructor(options: TransportObfuscationLayerOptions = {}) {
    if (options.packetizer) {
      this.packetizer = options.packetizer;
      return;
    }

    const frameSize = options.frameSize ?? DEFAULT_FRAME_SIZE;
    const padder = new FixedFramePadder(frameSize, options.randomSource);
    this.packetizer = new FixedFramePacketizer(frameSize, padder);
  }

  encapsulatePayload(payload: Uint8Array): FramedPacketSet {
    return this.packetizer.packetize(payload);
  }

  decapsulatePayload(packetSet: FramedPacketSet): Uint8Array {
    return this.packetizer.reassemble(packetSet);
  }
}
