import { describe, it, expect } from "vitest";
import { createRelayAdmission } from "../src/admission.js";
import {
  VCOCore, FLAG_ZKP_AUTH, createEnvelope, encodeEnvelopeProto,
  MULTICODEC_PROTOBUF,
} from "../../vco-core/src/index.js";
import { NobleCryptoProvider, deriveEd25519Multikey } from "../../vco-crypto/src/index.js";
import { PowChallengePolicy } from "../../vco-sync/src/index.js";

const crypto = new NobleCryptoProvider();
const PRIVATE_KEY = new Uint8Array(32).fill(1);
const CREATOR_ID = deriveEd25519Multikey(PRIVATE_KEY);

function makeEncoded(opts: { powDifficulty?: number } = {}): Uint8Array {
  const env = createEnvelope(
    { payload: new Uint8Array([1]), payloadType: MULTICODEC_PROTOBUF, creatorId: CREATOR_ID, privateKey: PRIVATE_KEY, ...opts },
    crypto,
  );
  return encodeEnvelopeProto(env);
}

describe("createRelayAdmission", () => {
  it("admits valid signed envelope", async () => {
    const core = new VCOCore(crypto);
    const policy = new PowChallengePolicy();
    const admit = createRelayAdmission({ core, powPolicy: policy });
    const encoded = makeEncoded();
    await expect(admit(encoded)).resolves.toBeDefined();
  });

  it("rejects envelope below required PoW", async () => {
    const core = new VCOCore(crypto);
    // Use requiredDifficulty directly since powPolicy.getRequiredDifficulty() only
    // returns non-zero after applyInboundChallenge is called
    const admit = createRelayAdmission({ core, requiredDifficulty: 8 });
    const encoded = makeEncoded({ powDifficulty: 0 });
    await expect(admit(encoded)).rejects.toThrow();
  });

  it("rejects ZKP_AUTH envelope with no registered verifier", async () => {
    const core = new VCOCore(crypto);
    const policy = new PowChallengePolicy();
    const admit = createRelayAdmission({ core, powPolicy: policy });
    const zkpEnv = createEnvelope(
      {
        payload: new Uint8Array([1]),
        payloadType: MULTICODEC_PROTOBUF,
        flags: FLAG_ZKP_AUTH,
        nullifier: new Uint8Array(32).fill(0xef),
        zkpExtension: {
          circuitId: 1,
          proof: new Uint8Array(32).fill(0xab),
          proofLength: 32,
          publicInputs: new Uint8Array(16).fill(0xcd),
          inputsLength: 16,
        },
      },
      crypto,
    );
    const encoded = encodeEnvelopeProto(zkpEnv);
    await expect(admit(encoded)).rejects.toThrow();
  });
});
