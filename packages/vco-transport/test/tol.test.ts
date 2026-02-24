import { describe, expect, it } from "vitest";
import {
  FixedFramePacketizer,
  TransportObfuscationLayer,
  ZeroRandomSource,
} from "../src/index.js";

describe("TransportObfuscationLayer", () => {
  it("encapsulates and decapsulates payloads via default packetizer", () => {
    const tol = new TransportObfuscationLayer({ frameSize: 8, randomSource: new ZeroRandomSource() });
    const payload = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    const framed = tol.encapsulatePayload(payload);
    const recovered = tol.decapsulatePayload(framed);

    expect(Array.from(recovered)).toEqual(Array.from(payload));
  });

  it("uses a provided packetizer instance when supplied", () => {
    const packetizer = new FixedFramePacketizer(8);
    const tol = new TransportObfuscationLayer({ packetizer });
    const payload = new Uint8Array([5, 4, 3]);

    const framed = tol.encapsulatePayload(payload);
    expect(framed.packets).toHaveLength(1);
    expect(Array.from(tol.decapsulatePayload(framed))).toEqual([5, 4, 3]);
  });
});
