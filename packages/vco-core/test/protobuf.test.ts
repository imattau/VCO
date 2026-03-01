import { describe, expect, it } from "vitest";
import {
  FLAG_ZKP_AUTH,
  MULTICODEC_PROTOBUF,
  PROTOCOL_VERSION,
  decodeEnvelopeProto,
  decodePayloadFragmentSetProto,
  decodeSyncMessageProto,
  encodeBlake3Multihash,
  encodeEd25519Multikey,
  encodeEnvelopeProto,
  encodePayloadFragmentProto,
  encodePayloadFragmentSetProto,
  encodeSyncMessageProto,
} from "../src/index.js";
import { vco } from "../src/generated/vco.pb.js";

function filled(length: number, value: number): Uint8Array {
  return new Uint8Array(length).fill(value);
}

describe("protobuf envelope codec", () => {
  it("round-trips a valid envelope", () => {
    const envelope = {
      headerHash: filled(32, 1),
      header: {
        version: PROTOCOL_VERSION,
        flags: 0,
        payloadType: MULTICODEC_PROTOBUF,
        creatorId: encodeEd25519Multikey(filled(32, 2)),
        payloadHash: encodeBlake3Multihash(filled(32, 3)),
        signature: filled(64, 4),
        nonce: 0,
        priorityHint: 0,
      },
      payload: new Uint8Array([9, 8, 7]),
    };

    const encoded = encodeEnvelopeProto(envelope);
    const decoded = decodeEnvelopeProto(encoded);

    expect(decoded.header.version).toBe(PROTOCOL_VERSION);
    expect(Array.from(decoded.headerHash)).toEqual(Array.from(envelope.headerHash));
    expect(Array.from(decoded.header.creatorId)).toEqual(Array.from(envelope.header.creatorId));
    expect(Array.from(decoded.payload)).toEqual([9, 8, 7]);
  });

  it("rejects invalid envelope constraints before encoding", () => {
    expect(() =>
      encodeEnvelopeProto({
        headerHash: filled(32, 1),
        header: {
          version: 2,
          flags: 0,
          payloadType: MULTICODEC_PROTOBUF,
          creatorId: encodeEd25519Multikey(filled(32, 2)),
          payloadHash: encodeBlake3Multihash(filled(32, 3)),
          signature: filled(64, 4),
          nonce: 0,
        priorityHint: 0,
        },
        payload: new Uint8Array([1]),
      }),
    ).toThrow(/Unsupported version/);
  });

  it("round-trips a valid ZKP-auth envelope", () => {
    const envelope = {
      headerHash: filled(32, 1),
      header: {
        version: PROTOCOL_VERSION,
        flags: FLAG_ZKP_AUTH,
        nullifier: filled(32, 0),
        payloadType: MULTICODEC_PROTOBUF,
        creatorId: new Uint8Array(),
        payloadHash: encodeBlake3Multihash(filled(32, 3)),
        signature: new Uint8Array(),
        nonce: 0,
        priorityHint: 0,
      },
      payload: new Uint8Array([9, 8, 7]),
      zkpExtension: {
        circuitId: 5,
        proofLength: 4,
        proof: new Uint8Array([1, 2, 3, 4]),
        inputsLength: 3,
        publicInputs: new Uint8Array([5, 6, 7]),
        nullifier: filled(32, 8),
      },
    };

    const encoded = encodeEnvelopeProto(envelope);
    const decoded = decodeEnvelopeProto(encoded);

    expect(decoded.header.flags).toBe(FLAG_ZKP_AUTH);
    expect(decoded.zkpExtension?.circuitId).toBe(5);
    expect(Array.from(decoded.zkpExtension?.proof ?? [])).toEqual([1, 2, 3, 4]);
    expect(Array.from(decoded.zkpExtension?.publicInputs ?? [])).toEqual([5, 6, 7]);
  });
});

describe("protobuf sync codec", () => {
  it("round-trips sync ranges", () => {
    const message = {
      ranges: [
        {
          startHash: new Uint8Array([0x00, 0x01]),
          endHash: new Uint8Array([0x7f, 0xff]),
          fingerprint: new Uint8Array([0xaa, 0xbb, 0xcc]),
        },
      ],
    };

    const encoded = encodeSyncMessageProto(message);
    const decoded = decodeSyncMessageProto(encoded);

    expect(decoded.ranges).toHaveLength(1);
    expect(Array.from(decoded.ranges[0].startHash)).toEqual([0x00, 0x01]);
    expect(Array.from(decoded.ranges[0].endHash)).toEqual([0x7f, 0xff]);
    expect(Array.from(decoded.ranges[0].fingerprint)).toEqual([0xaa, 0xbb, 0xcc]);
  });
});

describe("protobuf payload fragment codec", () => {
  it("round-trips a valid PayloadFragmentSet", () => {
    const payloadHash = encodeBlake3Multihash(filled(32, 9));
    const fragmentSet = {
      fragments: [
        {
          parentHeaderHash: filled(32, 1),
          fragmentIndex: 0,
          fragmentCount: 2,
          totalPayloadSize: 4,
          payloadChunk: new Uint8Array([1, 2]),
          payloadHash,
        },
        {
          parentHeaderHash: filled(32, 1),
          fragmentIndex: 1,
          fragmentCount: 2,
          totalPayloadSize: 4,
          payloadChunk: new Uint8Array([3, 4]),
          payloadHash,
        },
      ],
    };

    const encoded = encodePayloadFragmentSetProto(fragmentSet);
    const decoded = decodePayloadFragmentSetProto(encoded);

    expect(decoded.fragments).toHaveLength(2);
    expect(decoded.fragments[0].fragmentIndex).toBe(0);
    expect(decoded.fragments[1].fragmentIndex).toBe(1);
  });

  it("rejects invalid fragment constraints before encoding", () => {
    const payloadHash = encodeBlake3Multihash(filled(32, 4));

    expect(() =>
      encodePayloadFragmentProto({
        parentHeaderHash: filled(32, 2),
        fragmentIndex: 1,
        fragmentCount: 1,
        totalPayloadSize: 2,
        payloadChunk: new Uint8Array([1, 2]),
        payloadHash,
      }),
    ).toThrow(/fragmentIndex must be lower than fragmentCount/i);
  });

  it("rejects semantically invalid fragment sets during decode", () => {
    const payloadHash = encodeBlake3Multihash(filled(32, 5));
    const invalidEncoded = vco.v3.PayloadFragmentSet.encode(
      vco.v3.PayloadFragmentSet.create({
        fragments: [
          {
            parentHeaderHash: filled(32, 3),
            fragmentIndex: 0,
            fragmentCount: 2,
            totalPayloadSize: 2,
            payloadChunk: new Uint8Array([1]),
            payloadHash,
          },
          {
            parentHeaderHash: filled(32, 3),
            fragmentIndex: 0,
            fragmentCount: 2,
            totalPayloadSize: 2,
            payloadChunk: new Uint8Array([2]),
            payloadHash,
          },
        ],
      }),
    ).finish();

    expect(() => decodePayloadFragmentSetProto(invalidEncoded)).toThrow(
      /duplicate fragmentIndex|missing fragment index/i,
    );
  });
});
