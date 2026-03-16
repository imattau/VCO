import { describe, expect, it } from "vitest";
import {
  FLAG_ZKP_AUTH,
  MULTICODEC_PROTOBUF,
  PROTOCOL_VERSION,
  type EnvelopeCryptoProvider,
  assertEnvelopeIntegrity,
  createEnvelope,
  encodeEd25519Multikey,
  verifyEnvelope,
} from "../src/index.js";

class DeterministicCryptoProvider implements EnvelopeCryptoProvider {
  digest(payload: Uint8Array): Uint8Array {
    const out = new Uint8Array(32);
    for (let index = 0; index < payload.length; index += 1) {
      out[index % 32] = (out[index % 32] + payload[index] + index) & 0xff;
    }
    return out;
  }

  sign(message: Uint8Array, privateKey: Uint8Array): Uint8Array {
    const digest = this.digest(message);
    const signature = new Uint8Array(64);

    for (let index = 0; index < signature.length; index += 1) {
      signature[index] = digest[index % digest.length] ^ privateKey[index % privateKey.length];
    }

    return signature;
  }

  verify(message: Uint8Array, signature: Uint8Array, publicKey: Uint8Array): boolean {
    const expected = this.sign(message, publicKey);
    return (
      signature.length === expected.length &&
      signature.every((value, index) => value === expected[index])
    );
  }
}

function filled(length: number, value: number): Uint8Array {
  return new Uint8Array(length).fill(value);
}

describe("createEnvelope", () => {
  it("creates a valid envelope and computes hashes/signature", () => {
    const crypto = new DeterministicCryptoProvider();
    const privateKey = filled(32, 7);
    const creatorId = encodeEd25519Multikey(privateKey);

    const envelope = createEnvelope(
      {
        payload: new Uint8Array([10, 20, 30]),
        payloadType: MULTICODEC_PROTOBUF,
        creatorId,
        privateKey,
      },
      crypto,
    );

    expect(envelope.header.version).toBe(PROTOCOL_VERSION);
    expect(envelope.header.payloadType).toBe(MULTICODEC_PROTOBUF);
    expect(envelope.header.payloadHash.length).toBe(34);
    expect(envelope.header.signature.length).toBe(64);
    expect(envelope.headerHash.length).toBe(32);
    expect(verifyEnvelope(envelope, crypto)).toBe(true);
  });

  it("rejects reserved flag bits at creation time", () => {
    const crypto = new DeterministicCryptoProvider();
    const privateKey = filled(32, 7);
    const creatorId = encodeEd25519Multikey(privateKey);

    expect(() =>
      createEnvelope(
        {
          payload: new Uint8Array([10, 20, 30]),
          payloadType: MULTICODEC_PROTOBUF,
          creatorId,
          privateKey,
          flags: 0x04,
        },
        crypto,
      ),
    ).toThrow(/reserve bits 2-3/i);
  });

  it("creates a valid ZKP-auth envelope with empty creator/signature", () => {
    const crypto = new DeterministicCryptoProvider();

    const envelope = createEnvelope(
      {
        payload: new Uint8Array([10, 20, 30]),
        payloadType: MULTICODEC_PROTOBUF,
        flags: FLAG_ZKP_AUTH,
        nullifier: new Uint8Array(32).fill(1),
        zkpExtension: {
          circuitId: 7,
          proofLength: 3,
          proof: new Uint8Array([9, 8, 7]),
          inputsLength: 2,
          publicInputs: new Uint8Array([1, 2]),
        },
      },
      crypto,
    );

    expect(envelope.header.version).toBe(PROTOCOL_VERSION);
    expect(envelope.header.flags).toBe(FLAG_ZKP_AUTH);
    expect(envelope.header.creatorId.length).toBe(0);
    expect(envelope.header.signature.length).toBe(0);
    expect(envelope.zkpExtension?.circuitId).toBe(7);
    expect(verifyEnvelope(envelope, crypto)).toBe(true);
  });
});

describe("createEnvelope edge cases", () => {
  it("creates a valid envelope with an empty payload", () => {
    const crypto = new DeterministicCryptoProvider();
    const privateKey = filled(32, 9);
    const creatorId = encodeEd25519Multikey(privateKey);

    const envelope = createEnvelope(
      {
        payload: new Uint8Array(0),
        payloadType: MULTICODEC_PROTOBUF,
        creatorId,
        privateKey,
      },
      crypto,
    );

    expect(envelope.payload.length).toBe(0);
    expect(verifyEnvelope(envelope, crypto)).toBe(true);
  });

  it("throws when creatorId and privateKey are missing for signature auth", () => {
    const crypto = new DeterministicCryptoProvider();
    expect(() =>
      createEnvelope(
        {
          payload: new Uint8Array([1]),
          payloadType: MULTICODEC_PROTOBUF,
        },
        crypto,
      ),
    ).toThrow(/creatorId and privateKey are required/i);
  });

  it("throws when zkpExtension is missing for ZKP auth", () => {
    const crypto = new DeterministicCryptoProvider();
    expect(() =>
      createEnvelope(
        {
          payload: new Uint8Array([1]),
          payloadType: MULTICODEC_PROTOBUF,
          flags: FLAG_ZKP_AUTH,
        },
        crypto,
      ),
    ).toThrow(/zkpExtension is required/i);
  });

  it("clones input arrays to prevent external mutation after creation", () => {
    const crypto = new DeterministicCryptoProvider();
    const privateKey = filled(32, 11);
    const creatorId = encodeEd25519Multikey(privateKey);
    const payload = new Uint8Array([1, 2, 3]);

    const envelope = createEnvelope(
      {
        payload,
        payloadType: MULTICODEC_PROTOBUF,
        creatorId,
        privateKey,
      },
      crypto,
    );

    payload[0] = 99;
    expect(envelope.payload[0]).toBe(1);
  });
});

describe("assertEnvelopeIntegrity edge cases", () => {
  it("rejects tampered header flags (non-reserved bit)", () => {
    const crypto = new DeterministicCryptoProvider();
    const privateKey = filled(32, 13);
    const creatorId = encodeEd25519Multikey(privateKey);
    const envelope = createEnvelope(
      {
        payload: new Uint8Array([7, 8, 9]),
        payloadType: MULTICODEC_PROTOBUF,
        creatorId,
        privateKey,
      },
      crypto,
    );

    envelope.header.flags ^= 0x80; // Tamper with bit 7 (unreserved)

    // Should fail signature check because flags are part of the signing material
    expect(() => assertEnvelopeIntegrity(envelope, crypto)).toThrow(/signature verification failed/i);
  });

  it("fails early on unsupported version during integrity check", () => {
    const crypto = new DeterministicCryptoProvider();
    const privateKey = filled(32, 15);
    const creatorId = encodeEd25519Multikey(privateKey);
    const envelope = createEnvelope(
      {
        payload: new Uint8Array([1, 1, 1]),
        payloadType: MULTICODEC_PROTOBUF,
        creatorId,
        privateKey,
      },
      crypto,
    );

    envelope.header.version = 99;

    // validation happens before hash check
    expect(() => assertEnvelopeIntegrity(envelope, crypto)).toThrow(/Unsupported version 99/i);
  });

  it("rejects tampered nonce", () => {
    const crypto = new DeterministicCryptoProvider();
    const privateKey = filled(32, 17);
    const creatorId = encodeEd25519Multikey(privateKey);
    const envelope = createEnvelope(
      {
        payload: new Uint8Array([2, 2, 2]),
        payloadType: MULTICODEC_PROTOBUF,
        creatorId,
        privateKey,
      },
      crypto,
    );

    envelope.header.nonce += 1;

    expect(() => assertEnvelopeIntegrity(envelope, crypto)).toThrow(/header hash mismatch/i);
  });
});
