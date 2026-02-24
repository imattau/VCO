import { describe, expect, it } from "vitest";
import { TransportSession, ZeroRandomSource } from "../src/index.js";

describe("TransportSession", () => {
  it("encapsulates and decapsulates while active", () => {
    let nowMs = 0;
    const session = new TransportSession({
      frameSize: 8,
      idleTimeoutSeconds: 5,
      randomSource: new ZeroRandomSource(),
      now: () => nowMs,
    });
    const payload = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    const packetSet = session.encapsulatePayload(payload);
    nowMs = 1_000;
    const recovered = session.decapsulatePayload(packetSet);

    expect(Array.from(recovered)).toEqual(Array.from(payload));
  });

  it("expires after idle timeout", () => {
    let nowMs = 0;
    const session = new TransportSession({
      frameSize: 8,
      idleTimeoutSeconds: 1,
      randomSource: new ZeroRandomSource(),
      now: () => nowMs,
    });

    session.encapsulatePayload(new Uint8Array([1, 2, 3]));
    nowMs = 1_000;

    expect(() => session.encapsulatePayload(new Uint8Array([4]))).toThrow(/expired/i);
  });

  it("touch extends session lifetime", () => {
    let nowMs = 0;
    const session = new TransportSession({
      frameSize: 8,
      idleTimeoutSeconds: 1,
      randomSource: new ZeroRandomSource(),
      now: () => nowMs,
    });

    nowMs = 900;
    session.touch();
    nowMs = 1_500;

    expect(session.isIdle()).toBe(false);
  });
});
