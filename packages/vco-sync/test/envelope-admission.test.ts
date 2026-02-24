import { describe, expect, it } from "vitest";
import {
  MULTICODEC_PROTOBUF,
  VCOCore,
  createEnvelope,
  encodeEd25519Multikey,
  encodeEnvelopeProto,
  type EnvelopeCryptoProvider,
} from "@vco/vco-core";
import { PowChallengePolicy } from "../src/index.js";
import { admitInboundEnvelope } from "../src/envelope-admission.js";

class TestCryptoProvider implements EnvelopeCryptoProvider {
  digest(payload: Uint8Array): Uint8Array {
    const out = new Uint8Array(32);
    let acc = 0;
    for (const byte of payload) {
      acc = (acc + byte) & 0xff;
      acc ^= byte;
    }
    for (let index = 0; index < out.length; index += 1) {
      out[index] = (acc + index) & 0xff;
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
    return signature.length === expected.length && signature.every((value, index) => value === expected[index]);
  }
}

function createSignedEnvelope(privateKey: Uint8Array, powDifficulty = 0): Uint8Array {
  const creatorId = encodeEd25519Multikey(privateKey);
  const envelope = createEnvelope(
    {
      payload: new Uint8Array([1, 2, 3]),
      payloadType: MULTICODEC_PROTOBUF,
      creatorId,
      privateKey,
      powDifficulty,
    },
    new TestCryptoProvider(),
  );

  return encodeEnvelopeProto(envelope);
}

describe("envelope admission", () => {
  it("accepts envelopes when policy difficulty is met", async () => {
    const core = new VCOCore(new TestCryptoProvider());
    const envelopeBytes = createSignedEnvelope(new Uint8Array(32).fill(4), 5);
    const policy = new PowChallengePolicy();
    policy.applyInboundChallenge({ minDifficulty: 5, ttlSeconds: 60, reason: "test" });

    await expect(admitInboundEnvelope(envelopeBytes, core, { powPolicy: policy })).resolves.toBeDefined();
  });

  it("rejects envelopes that do not meet required difficulty", async () => {
    const core = new VCOCore(new TestCryptoProvider());
    const envelopeBytes = createSignedEnvelope(new Uint8Array(32).fill(7), 0);
    const policy = new PowChallengePolicy();
    policy.applyInboundChallenge({ minDifficulty: 5, ttlSeconds: 60, reason: "test" });

    await expect(admitInboundEnvelope(envelopeBytes, core, { powPolicy: policy })).rejects.toThrow(
      /required PoW difficulty/,
    );
  });

  it("uses explicit requiredDifficulty overrides", async () => {
    const core = new VCOCore(new TestCryptoProvider());
    const envelopeBytes = createSignedEnvelope(new Uint8Array(32).fill(9), 0);

    await expect(admitInboundEnvelope(envelopeBytes, core, { requiredDifficulty: 2 })).rejects.toThrow(
      /required PoW difficulty/,
    );
  });
});
