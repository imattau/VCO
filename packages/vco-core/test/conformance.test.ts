import {
  createNobleCryptoProvider,
  deriveEd25519Multikey,
} from "../../vco-crypto/src/index.ts";
import { describe, expect, it } from "vitest";
import vectors from "./vectors/envelope.vectors.json";
import {
  assertEnvelopeIntegrity,
  createEnvelope,
  decodeEnvelopeProto,
  encodeEnvelopeProto,
} from "../src/index.js";

interface EnvelopeVector {
  id: string;
  privateKeyHex: string;
  creatorIdHex: string;
  payloadHex: string;
  payloadType: number;
  flags: number;
  version: number;
  nonce?: number;
  payloadHashHex: string;
  signatureHex: string;
  headerHashHex: string;
  encodedEnvelopeHex: string;
}

function fromHex(value: string): Uint8Array {
  return new Uint8Array(Buffer.from(value, "hex"));
}

function toHex(value: Uint8Array): string {
  return Buffer.from(value).toString("hex");
}

describe("envelope conformance vectors", () => {
  const crypto = createNobleCryptoProvider();

  for (const vector of vectors as EnvelopeVector[]) {
    it(`matches vector ${vector.id}`, () => {
      const privateKey = fromHex(vector.privateKeyHex);
      const creatorId = deriveEd25519Multikey(privateKey);

      expect(toHex(creatorId)).toBe(vector.creatorIdHex);

      const envelope = createEnvelope(
        {
          payload: fromHex(vector.payloadHex),
          payloadType: vector.payloadType,
          creatorId,
          privateKey,
          flags: vector.flags,
          version: vector.version,
          nonce: vector.nonce ?? 0,
        },
        crypto,
      );

      expect(toHex(envelope.header.payloadHash)).toBe(vector.payloadHashHex);
      expect(toHex(envelope.header.signature)).toBe(vector.signatureHex);
      expect(toHex(envelope.headerHash)).toBe(vector.headerHashHex);

      const encoded = encodeEnvelopeProto(envelope);
      expect(toHex(encoded)).toBe(vector.encodedEnvelopeHex);

      const decoded = decodeEnvelopeProto(encoded);
      expect(() => assertEnvelopeIntegrity(decoded, crypto)).not.toThrow();
    });
  }

  it("detects tampered encoded payload bytes", () => {
    const vector = (vectors as EnvelopeVector[])[0];
    const tampered = fromHex(vector.encodedEnvelopeHex);

    tampered[tampered.length - 1] ^= 0xff;

    expect(() => {
      const decoded = decodeEnvelopeProto(tampered);
      assertEnvelopeIntegrity(decoded, crypto);
    }).toThrow(/multihash|payload hash mismatch|index out of range/i);
  });
});
