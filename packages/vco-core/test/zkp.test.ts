import { describe, expect, it } from "vitest";
import {
  FLAG_ZKP_AUTH,
  MULTICODEC_PROTOBUF,
  VCOCore,
  createEnvelope,
  encodeEd25519Multikey,
  type EnvelopeCryptoProvider,
  type IZKPVerifier,
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

describe("VCOCore", () => {
  it("accepts a standard signature-authenticated envelope", async () => {
    const crypto = new DeterministicCryptoProvider();
    const privateKey = filled(32, 7);
    const envelope = createEnvelope(
      {
        payload: new Uint8Array([1, 2, 3]),
        payloadType: MULTICODEC_PROTOBUF,
        creatorId: encodeEd25519Multikey(privateKey),
        privateKey,
      },
      crypto,
    );

    const core = new VCOCore(crypto);
    await expect(core.validateEnvelope(envelope)).resolves.toBe(true);
  });

  it("rejects ZKP envelopes when verifier is missing", async () => {
    const crypto = new DeterministicCryptoProvider();
    const envelope = createEnvelope(
      {
        payload: new Uint8Array([1, 2, 3]),
        payloadType: MULTICODEC_PROTOBUF,
        flags: FLAG_ZKP_AUTH,
        nullifier: new Uint8Array(32).fill(1),
        zkpExtension: {
          circuitId: 77,
          proofLength: 3,
          proof: new Uint8Array([1, 2, 3]),
          inputsLength: 2,
          publicInputs: new Uint8Array([4, 5]),
          nullifier: filled(32, 9),
        },
      },
      crypto,
    );

    const core = new VCOCore(crypto);
    await expect(core.validateEnvelope(envelope)).resolves.toBe(false);
  });

  it("accepts valid ZKP envelope once and rejects replay by nullifier", async () => {
    const crypto = new DeterministicCryptoProvider();
    const envelope = createEnvelope(
      {
        payload: new Uint8Array([1, 2, 3]),
        payloadType: MULTICODEC_PROTOBUF,
        flags: FLAG_ZKP_AUTH,
        nullifier: new Uint8Array(32).fill(1),
        zkpExtension: {
          circuitId: 91,
          proofLength: 3,
          proof: new Uint8Array([1, 2, 3]),
          inputsLength: 2,
          publicInputs: new Uint8Array([4, 5]),
          nullifier: filled(32, 4),
        },
      },
      crypto,
    );

    const verifier: IZKPVerifier = {
      circuitId: 91,
      async verify(proof, publicInputs, payloadHash) {
        return proof.length === 3 && publicInputs.length === 2 && payloadHash.length > 0;
      },
    };

    const core = new VCOCore(crypto);
    core.registerVerifier(verifier);

    await expect(core.validateEnvelope(envelope)).resolves.toBe(true);
    await expect(core.validateEnvelope(envelope)).resolves.toBe(false);
  });

  it("rejects invalid proofs from registered verifier", async () => {
    const crypto = new DeterministicCryptoProvider();
    const envelope = createEnvelope(
      {
        payload: new Uint8Array([1, 2, 3]),
        payloadType: MULTICODEC_PROTOBUF,
        flags: FLAG_ZKP_AUTH,
        nullifier: new Uint8Array(32).fill(1),
        zkpExtension: {
          circuitId: 11,
          proofLength: 3,
          proof: new Uint8Array([1, 2, 3]),
          inputsLength: 2,
          publicInputs: new Uint8Array([4, 5]),
          nullifier: filled(32, 1),
        },
      },
      crypto,
    );

    const verifier: IZKPVerifier = {
      circuitId: 11,
      async verify() {
        return false;
      },
    };

    const core = new VCOCore(crypto);
    core.registerVerifier(verifier);

    await expect(core.validateEnvelope(envelope)).resolves.toBe(false);
  });

  it("fails verification if the nullifier is tampered with after creation", async () => {
    const crypto = new DeterministicCryptoProvider();
    const verifier: IZKPVerifier = {
      circuitId: 77,
      async verify() {
        return true;
      },
    };

    const envelope = createEnvelope(
      {
        payload: new Uint8Array([1, 2, 3]),
        payloadType: MULTICODEC_PROTOBUF,
        flags: FLAG_ZKP_AUTH,
        nullifier: new Uint8Array(32).fill(1),
        zkpExtension: {
          circuitId: 77,
          proofLength: 3,
          proof: new Uint8Array([9, 8, 7]),
          inputsLength: 0,
          publicInputs: new Uint8Array(0),
        },
      },
      crypto,
    );

    // Tamper with the nullifier
    if (envelope.header.nullifier) {
      envelope.header.nullifier[0] ^= 0xff;
    }

    const core = new VCOCore(crypto);
    core.registerVerifier(verifier);

    // Should fail because the headerHash (integrity) no longer matches the tampered header
    await expect(core.validateEnvelope(envelope)).resolves.toBe(false);
  });
});
