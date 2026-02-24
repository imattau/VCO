import {
  createNobleCryptoProvider,
  deriveEd25519Multikey,
} from "../../vco-crypto/src/index.ts";
import { describe, expect, it } from "vitest";
import {
  MAX_VCO_SIZE,
  MULTICODEC_PROTOBUF,
  assertPayloadFragmentSetIntegrity,
  createEnvelope,
  decodePayloadFragmentSetProto,
  encodeBlake3Multihash,
  encodePayloadFragmentSetProto,
  fragmentEnvelopePayload,
  fragmentPayload,
  reassemblePayloadFragments,
} from "../src/index.js";

function keyFromSeed(seed: number): Uint8Array {
  const key = new Uint8Array(32);
  key.fill(seed);
  return key;
}

describe("fragmentEnvelopePayload", () => {
  it("splits and reassembles payload chunks", () => {
    const crypto = createNobleCryptoProvider();
    const privateKey = keyFromSeed(41);
    const creatorId = deriveEd25519Multikey(privateKey);

    const envelope = createEnvelope(
      {
        payload: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]),
        payloadType: MULTICODEC_PROTOBUF,
        creatorId,
        privateKey,
      },
      crypto,
    );

    const fragmentSet = fragmentEnvelopePayload(envelope, 4);

    expect(fragmentSet.fragments).toHaveLength(3);
    expect(fragmentSet.fragments.map((fragment) => fragment.fragmentIndex)).toEqual([0, 1, 2]);

    const reassembled = reassemblePayloadFragments(fragmentSet);
    expect(Array.from(reassembled)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("rejects missing fragment indexes", () => {
    const crypto = createNobleCryptoProvider();
    const privateKey = keyFromSeed(43);
    const creatorId = deriveEd25519Multikey(privateKey);

    const envelope = createEnvelope(
      {
        payload: new Uint8Array([10, 11, 12, 13, 14]),
        payloadType: MULTICODEC_PROTOBUF,
        creatorId,
        privateKey,
      },
      crypto,
    );

    const fragmentSet = fragmentEnvelopePayload(envelope, 2);
    fragmentSet.fragments = fragmentSet.fragments.filter((fragment) => fragment.fragmentIndex !== 1);

    expect(() => assertPayloadFragmentSetIntegrity(fragmentSet)).toThrow(/missing fragment index/i);
  });

  it("protobuf round-trips PayloadFragmentSet", () => {
    const crypto = createNobleCryptoProvider();
    const privateKey = keyFromSeed(47);
    const creatorId = deriveEd25519Multikey(privateKey);

    const envelope = createEnvelope(
      {
        payload: new Uint8Array([21, 22, 23, 24, 25, 26]),
        payloadType: MULTICODEC_PROTOBUF,
        creatorId,
        privateKey,
      },
      crypto,
    );

    const fragmentSet = fragmentEnvelopePayload(envelope, 3);
    const encoded = encodePayloadFragmentSetProto(fragmentSet);
    const decoded = decodePayloadFragmentSetProto(encoded);

    expect(() => assertPayloadFragmentSetIntegrity(decoded)).not.toThrow();
    expect(Array.from(reassemblePayloadFragments(decoded))).toEqual([21, 22, 23, 24, 25, 26]);
  });

  it("fragments payloads larger than MAX_VCO_SIZE with default chunk size", () => {
    const payload = new Uint8Array(MAX_VCO_SIZE + 2);
    payload.fill(1);

    const fragmentSet = fragmentPayload(payload, {
      parentHeaderHash: new Uint8Array(32).fill(9),
      payloadHash: encodeBlake3Multihash(new Uint8Array(32).fill(8)),
    });

    expect(fragmentSet.fragments).toHaveLength(2);
    expect(fragmentSet.fragments[0].payloadChunk.length).toBe(MAX_VCO_SIZE);
    expect(fragmentSet.fragments[1].payloadChunk.length).toBe(2);
    expect(reassemblePayloadFragments(fragmentSet).length).toBe(MAX_VCO_SIZE + 2);
  });
});
