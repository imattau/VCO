/** @vitest-environment jsdom */
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMessages } from "../useMessages.js";
import * as transport from "../../../lib/transport.js";
import * as vco from "../../../lib/vco.js";

vi.mock("../../../lib/transport.js", () => ({
  subscribe: vi.fn(() => () => {}),
  publish: vi.fn(),
}));

vi.mock("../../../lib/vco.js", () => ({
  buildMessage: vi.fn(),
  decodeMessage: vi.fn(),
  uint8ArrayToHex: vi.fn((arr) => Buffer.from(arr).toString("hex")),
}));

describe("useMessages hook", () => {
  const mockIdentity = {
    privateKey: new Uint8Array(32),
    publicKey: new Uint8Array(32),
    creatorId: new Uint8Array(32),
    displayName: "TestUser",
  };

  it("should start with an empty message list", () => {
    const { result } = renderHook(() => useMessages("general", mockIdentity));
    expect(result.current.messages).toEqual([]);
  });

  it("should optimistically update state after sending a message (Fixed Behavior)", async () => {
    const mockMsg = { id: "msg1", content: "hello", rawEnvelope: new Uint8Array() };
    (vco.buildMessage as any).mockResolvedValue(mockMsg);

    const { result } = renderHook(() => useMessages("general", mockIdentity));

    await act(async () => {
      await result.current.send("hello");
    });

    // Success: The message is published AND added to local state
    expect(transport.publish).toHaveBeenCalled();
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toEqual(mockMsg);
  });
});
