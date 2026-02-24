import {
  createNobleCryptoProvider,
  deriveEd25519Multikey,
} from "../../vco-crypto/src/index.ts";
import { describe, expect, it } from "vitest";
import {
  assertEnvelopeIntegrity,
  createEnvelope,
  decodeEnvelopeProto,
  encodeEnvelopeProto,
  verifyEnvelope,
} from "../src/index.js";

function privateKeyFromSeed(seed: number): Uint8Array {
  const key = new Uint8Array(32);
  key.fill(seed);
  return key;
}

describe("envelope + noble integration", () => {
  it("creates, protobuf-roundtrips, and verifies an envelope", () => {
    const crypto = createNobleCryptoProvider();
    const privateKey = privateKeyFromSeed(23);
    const creatorId = deriveEd25519Multikey(privateKey);

    const envelope = createEnvelope(
      {
        payload: new Uint8Array([4, 8, 15, 16, 23, 42]),
        payloadType: 0x50,
        creatorId,
        privateKey,
      },
      crypto,
    );

    const encoded = encodeEnvelopeProto(envelope);
    const decoded = decodeEnvelopeProto(encoded);

    expect(() => assertEnvelopeIntegrity(decoded, crypto)).not.toThrow();
    expect(verifyEnvelope(decoded, crypto)).toBe(true);
  });
});
