import { describe, expect, it } from "vitest";
import {
  FLAG_POW_ACTIVE,
  MULTICODEC_PROTOBUF,
  VCOCore,
  countLeadingZeroBits,
  createEnvelope,
  encodeEd25519Multikey,
  getPowScore,
  solvePoWNonce,
  type EnvelopeCryptoProvider,
  verifyPoW,
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

class PowFriendlyCryptoProvider implements EnvelopeCryptoProvider {
  digest(payload: Uint8Array): Uint8Array {
    const out = new Uint8Array(32);
    const last = payload[payload.length - 1] ?? 0;
    out[0] = last;
    out[1] = (255 - last) & 0xff;
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

describe("PoW utilities", () => {
  it("counts leading zero bits", () => {
    expect(countLeadingZeroBits(new Uint8Array([0x00, 0x00, 0x10]))).toBe(19);
  });

  it("verifies PoW thresholds against header hash", () => {
    const hash = new Uint8Array([0x00, 0x00, 0x0f]);
    expect(verifyPoW(hash, 20)).toBe(true);
    expect(verifyPoW(hash, 21)).toBe(false);
    expect(getPowScore(hash)).toBe(20);
  });

  it("solves nonce search for small difficulty", () => {
    const solution = solvePoWNonce({
      difficulty: 8,
      hashForNonce: (nonce) => {
        const hash = new Uint8Array(32);
        hash[0] = nonce % 256 === 0 ? 0 : 0xff;
        return hash;
      },
    });

    expect(solution.nonce).toBe(0);
    expect(verifyPoW(solution.headerHash, 8)).toBe(true);
  });
});

describe("PoW integration", () => {
  it("creates PoW-active envelope when powDifficulty is requested", () => {
    const crypto = new PowFriendlyCryptoProvider();
    const privateKey = filled(32, 3);
    const creatorId = encodeEd25519Multikey(privateKey);

    const envelope = createEnvelope(
      {
        payload: new Uint8Array([7, 8, 9]),
        payloadType: MULTICODEC_PROTOBUF,
        creatorId,
        privateKey,
        powDifficulty: 4,
      },
      crypto,
    );

    expect((envelope.header.flags & FLAG_POW_ACTIVE) !== 0).toBe(true);
    expect(verifyPoW(envelope.headerHash, 4)).toBe(true);
  });

  it("enforces minimum PoW difficulty in VCOCore validation", async () => {
    const crypto = new PowFriendlyCryptoProvider();
    const privateKey = filled(32, 5);
    const creatorId = encodeEd25519Multikey(privateKey);
    const envelope = createEnvelope(
      {
        payload: new Uint8Array([1, 2, 3]),
        payloadType: MULTICODEC_PROTOBUF,
        creatorId,
        privateKey,
        powDifficulty: 3,
      },
      crypto,
    );

    const core = new VCOCore(crypto, { minPowDifficulty: 3 });
    await expect(core.validateEnvelope(envelope)).resolves.toBe(true);
    await expect(core.validateEnvelope(envelope, { powDifficulty: 12 })).resolves.toBe(false);
  });
});
