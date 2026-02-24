import { describe, expect, it } from "vitest";
import {
  FixedFramePacketizer,
  FixedFramePadder,
  ZeroRandomSource,
} from "../src/index.js";

describe("FixedFramePacketizer", () => {
  it("packetizes and reassembles multi-frame payloads", () => {
    const frameSize = 8;
    const padder = new FixedFramePadder(frameSize, new ZeroRandomSource());
    const packetizer = new FixedFramePacketizer(frameSize, padder);
    const payload = new Uint8Array(19).map((_, index) => index + 1);

    const packetSet = packetizer.packetize(payload);

    expect(packetSet.packets).toHaveLength(3);
    expect(packetSet.packets.map((packet) => packet.index)).toEqual([0, 1, 2]);
    expect(packetSet.totalPayloadLength).toBe(payload.length);

    const reassembled = packetizer.reassemble(packetSet);
    expect(Array.from(reassembled)).toEqual(Array.from(payload));
  });

  it("supports empty payloads as a single padded packet", () => {
    const frameSize = 8;
    const padder = new FixedFramePadder(frameSize, new ZeroRandomSource());
    const packetizer = new FixedFramePacketizer(frameSize, padder);

    const packetSet = packetizer.packetize(new Uint8Array());
    expect(packetSet.packets).toHaveLength(1);
    expect(packetSet.packets[0].payloadLength).toBe(0);
    expect(packetizer.reassemble(packetSet).length).toBe(0);
  });

  it("rejects duplicate packet indices", () => {
    const frameSize = 8;
    const padder = new FixedFramePadder(frameSize, new ZeroRandomSource());
    const packetizer = new FixedFramePacketizer(frameSize, padder);
    const payload = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const packetSet = packetizer.packetize(payload);

    packetSet.packets[1].index = 0;
    expect(() => packetizer.reassemble(packetSet)).toThrow(/duplicate packet index/i);
  });

  it("rejects missing packet indices", () => {
    const frameSize = 8;
    const padder = new FixedFramePadder(frameSize, new ZeroRandomSource());
    const packetizer = new FixedFramePacketizer(frameSize, padder);
    const payload = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const packetSet = packetizer.packetize(payload);

    packetSet.packets = packetSet.packets.filter((packet) => packet.index !== 1);
    expect(() => packetizer.reassemble(packetSet)).toThrow(/missing packet index/i);
  });
});
