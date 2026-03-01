import { code as rawCodec } from "multiformats/codecs/raw";
import { describe, expect, it } from "vitest";
import {
  FLAG_ZKP_AUTH,
  FLAG_OBFUSCATED,
  MULTICODEC_PROTOBUF,
  PROTOCOL_VERSION,
  assertSupportedPayloadType,
  encodeBlake3Multihash,
  encodeEd25519Multikey,
  isKnownPayloadType,
  validateEnvelope,
} from "../src/index.js";

function filled(length: number, value = 1): Uint8Array {
  return new Uint8Array(length).fill(value);
}

function validCreatorId(): Uint8Array {
  return encodeEd25519Multikey(filled(32, 7));
}

function validPayloadHash(): Uint8Array {
  return encodeBlake3Multihash(filled(32, 9));
}

describe("validateEnvelope", () => {
  it("accepts minimally valid envelope shapes", () => {
    expect(() =>
      validateEnvelope({
        headerHash: filled(32),
        header: {
          version: PROTOCOL_VERSION,
          flags: 0,
          payloadType: MULTICODEC_PROTOBUF,
          creatorId: validCreatorId(),
          payloadHash: validPayloadHash(),
          signature: filled(64),
          nonce: 0,
          priorityHint: 0,
        },
        payload: new Uint8Array([1, 2, 3]),
      }),
    ).not.toThrow();
  });

  it("rejects invalid fixed-length header fields", () => {
    expect(() =>
      validateEnvelope({
        headerHash: filled(31),
        header: {
          version: PROTOCOL_VERSION,
          flags: 0,
          payloadType: MULTICODEC_PROTOBUF,
          creatorId: validCreatorId(),
          payloadHash: validPayloadHash(),
          signature: filled(64),
          nonce: 0,
          priorityHint: 0,
        },
        payload: new Uint8Array([1, 2, 3]),
      }),
    ).toThrow(/headerHash/);
  });

  it("accepts supported flag bits", () => {
    expect(() =>
      validateEnvelope({
        headerHash: filled(32),
        header: {
          version: PROTOCOL_VERSION,
          flags: FLAG_OBFUSCATED,
          payloadType: MULTICODEC_PROTOBUF,
          creatorId: validCreatorId(),
          payloadHash: validPayloadHash(),
          signature: filled(64),
          nonce: 0,
          priorityHint: 0,
        },
        payload: new Uint8Array([1, 2, 3]),
      }),
    ).not.toThrow();
  });

  it("accepts valid ZKP-authenticated envelopes", () => {
    expect(() =>
      validateEnvelope({
        headerHash: filled(32),
        header: {
          version: PROTOCOL_VERSION,
          flags: FLAG_ZKP_AUTH,
          nullifier: filled(32),
          payloadType: MULTICODEC_PROTOBUF,
          creatorId: new Uint8Array(),
          payloadHash: validPayloadHash(),
          signature: new Uint8Array(),
          nonce: 0,
          priorityHint: 0,
        },
        payload: new Uint8Array([1, 2, 3]),
        zkpExtension: {
          circuitId: 1,
          proofLength: 3,
          proof: new Uint8Array([1, 2, 3]),
          inputsLength: 2,
          publicInputs: new Uint8Array([4, 5]),
          nullifier: filled(32, 6),
        },
      }),
    ).not.toThrow();
  });

  it("rejects ZKP-authenticated envelopes missing zkpExtension", () => {
    expect(() =>
      validateEnvelope({
        headerHash: filled(32),
        header: {
          version: PROTOCOL_VERSION,
          flags: FLAG_ZKP_AUTH,
          nullifier: filled(32),
          payloadType: MULTICODEC_PROTOBUF,
          creatorId: new Uint8Array(),
          payloadHash: validPayloadHash(),
          signature: new Uint8Array(),
          nonce: 0,
          priorityHint: 0,
        },
        payload: new Uint8Array([1, 2, 3]),
      }),
    ).toThrow(/zkpExtension is required/i);
  });

  it("rejects signature-auth envelopes that include zkpExtension", () => {
    expect(() =>
      validateEnvelope({
        headerHash: filled(32),
        header: {
          version: PROTOCOL_VERSION,
          flags: 0,
          payloadType: MULTICODEC_PROTOBUF,
          creatorId: validCreatorId(),
          payloadHash: validPayloadHash(),
          signature: filled(64),
          nonce: 0,
          priorityHint: 0,
        },
        payload: new Uint8Array([1, 2, 3]),
        zkpExtension: {
          circuitId: 1,
          proofLength: 3,
          proof: new Uint8Array([1, 2, 3]),
          inputsLength: 2,
          publicInputs: new Uint8Array([4, 5]),
          nullifier: filled(32, 6),
        },
      }),
    ).toThrow(/must be omitted unless FLAG_ZKP_AUTH is set/i);
  });

  it("rejects invalid ZKP extension lengths", () => {
    expect(() =>
      validateEnvelope({
        headerHash: filled(32),
        header: {
          version: PROTOCOL_VERSION,
          flags: FLAG_ZKP_AUTH,
          nullifier: filled(32),
          payloadType: MULTICODEC_PROTOBUF,
          creatorId: new Uint8Array(),
          payloadHash: validPayloadHash(),
          signature: new Uint8Array(),
          nonce: 0,
          priorityHint: 0,
        },
        payload: new Uint8Array([1, 2, 3]),
        zkpExtension: {
          circuitId: 1,
          proofLength: 4,
          proof: new Uint8Array([1, 2, 3]),
          inputsLength: 2,
          publicInputs: new Uint8Array([4, 5]),
          nullifier: filled(31, 6),
        },
      }),
    ).toThrow(/proofLength|nullifier/i);
  });

  it("rejects reserved flag bits", () => {
    expect(() =>
      validateEnvelope({
        headerHash: filled(32),
        header: {
          version: PROTOCOL_VERSION,
          flags: 0x04,
          payloadType: MULTICODEC_PROTOBUF,
          creatorId: validCreatorId(),
          payloadHash: validPayloadHash(),
          signature: filled(64),
          nonce: 0,
          priorityHint: 0,
        },
        payload: new Uint8Array([1, 2, 3]),
      }),
    ).toThrow(/reserve bits 2-3/i);
  });

  it("rejects raw creatorId bytes without multikey prefix", () => {
    expect(() =>
      validateEnvelope({
        headerHash: filled(32),
        header: {
          version: PROTOCOL_VERSION,
          flags: 0,
          payloadType: MULTICODEC_PROTOBUF,
          creatorId: filled(32),
          payloadHash: validPayloadHash(),
          signature: filled(64),
          nonce: 0,
          priorityHint: 0,
        },
        payload: new Uint8Array([1, 2, 3]),
      }),
    ).toThrow(/multikey/i);
  });

  it("rejects raw payloadHash bytes without multihash prefix", () => {
    expect(() =>
      validateEnvelope({
        headerHash: filled(32),
        header: {
          version: PROTOCOL_VERSION,
          flags: 0,
          payloadType: MULTICODEC_PROTOBUF,
          creatorId: validCreatorId(),
          payloadHash: filled(32),
          signature: filled(64),
          nonce: 0,
          priorityHint: 0,
        },
        payload: new Uint8Array([1, 2, 3]),
      }),
    ).toThrow(/multihash/i);
  });

  it("accepts a supported multicodec payload type from multiformats", () => {
    expect(() =>
      validateEnvelope({
        headerHash: filled(32),
        header: {
          version: PROTOCOL_VERSION,
          flags: 0,
          payloadType: rawCodec,
          creatorId: validCreatorId(),
          payloadHash: validPayloadHash(),
          signature: filled(64),
          nonce: 0,
          priorityHint: 0,
        },
        payload: new Uint8Array([1, 2, 3]),
      }),
    ).not.toThrow();
  });

  it("accepts known multicodec identifiers even when runtime support is not enabled", () => {
    expect(() =>
      validateEnvelope({
        headerHash: filled(32),
        header: {
          version: PROTOCOL_VERSION,
          flags: 0,
          payloadType: 0x71,
          creatorId: validCreatorId(),
          payloadHash: validPayloadHash(),
          signature: filled(64),
          nonce: 0,
          priorityHint: 0,
        },
        payload: new Uint8Array([1, 2, 3]),
      }),
    ).not.toThrow();
  });

  it("rejects unknown payload multicodec identifiers", () => {
    const unknownCandidate = [0x7fff_ffff, 0x5fff_ffff, 0x4fff_ffff].find(
      (candidate) => !isKnownPayloadType(candidate),
    );

    expect(unknownCandidate).toBeDefined();

    expect(() =>
      validateEnvelope({
        headerHash: filled(32),
        header: {
          version: PROTOCOL_VERSION,
          flags: 0,
          payloadType: unknownCandidate!,
          creatorId: validCreatorId(),
          payloadHash: validPayloadHash(),
          signature: filled(64),
          nonce: 0,
          priorityHint: 0,
        },
        payload: new Uint8Array([1, 2, 3]),
      }),
    ).toThrow(/Unknown payloadType/i);
  });

  it("exposes runtime codec support checks separately", () => {
    expect(() => assertSupportedPayloadType(0x71)).toThrow(/Supported runtime codecs/i);
  });

  it("rejects payload types that are not uint32", () => {
    expect(() =>
      validateEnvelope({
        headerHash: filled(32),
        header: {
          version: PROTOCOL_VERSION,
          flags: 0,
          payloadType: 2 ** 40,
          creatorId: validCreatorId(),
          payloadHash: validPayloadHash(),
          signature: filled(64),
          nonce: 0,
          priorityHint: 0,
        },
        payload: new Uint8Array([1, 2, 3]),
      }),
    ).toThrow(/uint32 multicodec code/i);
  });
});
