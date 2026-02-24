import { describe, expect, it } from "vitest";
import { DEFAULT_FRAME_SIZE, FixedFramePadder, ZeroRandomSource } from "../src/index.js";

describe("FixedFramePadder", () => {
  it("pads payload to fixed-size frame", () => {
    const padder = new FixedFramePadder(DEFAULT_FRAME_SIZE, new ZeroRandomSource());
    const payload = new Uint8Array([1, 2, 3]);

    const framed = padder.frame(payload);

    expect(framed.frame.length).toBe(DEFAULT_FRAME_SIZE);
    expect(framed.payloadLength).toBe(payload.length);
    expect(Array.from(framed.frame.slice(0, payload.length))).toEqual([1, 2, 3]);
  });

  it("recovers payload with deframe", () => {
    const padder = new FixedFramePadder(DEFAULT_FRAME_SIZE, new ZeroRandomSource());
    const payload = new Uint8Array([7, 8, 9, 10]);

    const framed = padder.frame(payload);
    expect(Array.from(padder.deframe(framed.frame, framed.payloadLength))).toEqual([7, 8, 9, 10]);
  });

  it("rejects invalid payload lengths while deframing", () => {
    const padder = new FixedFramePadder(DEFAULT_FRAME_SIZE, new ZeroRandomSource());
    const framed = padder.frame(new Uint8Array([1, 2]));

    expect(() => padder.deframe(framed.frame, DEFAULT_FRAME_SIZE + 1)).toThrow(/payloadLength/i);
    expect(() => padder.deframe(framed.frame, -1)).toThrow(/payloadLength/i);
  });
});
