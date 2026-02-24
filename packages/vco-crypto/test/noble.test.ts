import { describe, expect, it } from "vitest";
import { varint } from "multiformats";
import {
  createNobleCryptoProvider,
  deriveEd25519Multikey,
  deriveEd25519PublicKey,
} from "../src/index.js";

function privateKeyFromSeed(seed: number): Uint8Array {
  const key = new Uint8Array(32);
  key.fill(seed);
  return key;
}

describe("NobleCryptoProvider", () => {
  it("hashes payloads to 32-byte digests", () => {
    const provider = createNobleCryptoProvider();
    const digest = provider.digest(new Uint8Array([1, 2, 3, 4]));

    expect(digest.length).toBe(32);
  });

  it("signs and verifies with ed25519 keypairs", () => {
    const provider = createNobleCryptoProvider();
    const privateKey = privateKeyFromSeed(11);
    const publicKey = deriveEd25519PublicKey(privateKey);
    const message = new Uint8Array([9, 8, 7, 6]);

    const signature = provider.sign(message, privateKey);

    expect(signature.length).toBe(64);
    expect(provider.verify(message, signature, publicKey)).toBe(true);
  });

  it("fails verification for modified signatures", () => {
    const provider = createNobleCryptoProvider();
    const privateKey = privateKeyFromSeed(19);
    const publicKey = deriveEd25519PublicKey(privateKey);
    const message = new Uint8Array([1, 1, 2, 3]);
    const signature = provider.sign(message, privateKey);

    signature[0] ^= 0xff;

    expect(provider.verify(message, signature, publicKey)).toBe(false);
  });

  it("derives an Ed25519 multikey with multicodec varint prefix", () => {
    const privateKey = privateKeyFromSeed(7);
    const multikey = deriveEd25519Multikey(privateKey);
    const [codec, prefixLength] = varint.decode(multikey);

    expect(codec).toBe(0xed);
    expect(prefixLength).toBe(2);
    expect(multikey.length).toBe(prefixLength + 32);
    expect(multikey.slice(prefixLength)).toEqual(deriveEd25519PublicKey(privateKey));
  });
});
