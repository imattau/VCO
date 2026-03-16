import { describe, expect, it } from "vitest";
import { encodeFramedPacketSet, decodeFramedPacketSet } from "../src/packetset-wire.js";
import type { FramedPacketSet } from "../src/types.js";

describe("packetset-wire", () => {
  it("encodes and decodes a packet set correctly", () => {
    const packetSet: FramedPacketSet = {
      totalPayloadLength: 10,
      packets: [
        {
          index: 0,
          count: 2,
          payloadLength: 5,
          frame: new Uint8Array([1, 2, 3, 4, 5]),
        },
        {
          index: 1,
          count: 2,
          payloadLength: 5,
          frame: new Uint8Array([6, 7, 8, 9, 10]),
        },
      ],
    };

    const encoded = encodeFramedPacketSet(packetSet);
    const decoded = decodeFramedPacketSet(encoded);

    expect(decoded.totalPayloadLength).toBe(packetSet.totalPayloadLength);
    expect(decoded.packets).toHaveLength(packetSet.packets.length);
    expect(decoded.packets[0].index).toBe(0);
    expect(decoded.packets[0].count).toBe(2);
    expect(decoded.packets[0].payloadLength).toBe(5);
    expect(Array.from(decoded.packets[0].frame)).toEqual([1, 2, 3, 4, 5]);
    expect(Array.from(decoded.packets[1].frame)).toEqual([6, 7, 8, 9, 10]);
  });

  it("handles empty packet sets", () => {
    const packetSet: FramedPacketSet = {
      totalPayloadLength: 0,
      packets: [],
    };

    const encoded = encodeFramedPacketSet(packetSet);
    const decoded = decodeFramedPacketSet(encoded);

    expect(decoded.totalPayloadLength).toBe(0);
    expect(decoded.packets).toHaveLength(0);
  });

  it("throws on invalid JSON", () => {
    const invalid = new TextEncoder().encode("{ invalid json }");
    expect(() => decodeFramedPacketSet(invalid)).toThrow(/failed to decode/i);
  });

  it("throws when totalPayloadLength is missing or negative", () => {
    const invalid = new TextEncoder().encode(JSON.stringify({ packets: [] }));
    expect(() => decodeFramedPacketSet(invalid)).toThrow(/totalPayloadLength/i);

    const negative = new TextEncoder().encode(JSON.stringify({ totalPayloadLength: -1, packets: [] }));
    expect(() => decodeFramedPacketSet(negative)).toThrow(/totalPayloadLength/i);
  });

  it("throws when packets is not an array", () => {
    const invalid = new TextEncoder().encode(JSON.stringify({ totalPayloadLength: 0, packets: "not an array" }));
    expect(() => decodeFramedPacketSet(invalid)).toThrow(/packets must be an array/i);
  });
});
