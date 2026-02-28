import { describe, it, expect } from "vitest";
import { 
  createEnvelope, 
  assertEnvelopeIntegrity,
} from "../src/envelope.js";
import { compareEnvelopesByPoW } from "../src/pow.js";
import { deriveContextId, encodeEd25519Multikey } from "../src/multiformat.js";
import { createNobleCryptoProvider } from "../../vco-crypto/src/index.js";
import { MULTICODEC_PROTOBUF } from "../src/constants.js";
import { ed25519 } from "@noble/curves/ed25519";

describe("ADR 0004: Blind Context Routing and PoW Prioritization", () => {
  const crypto = createNobleCryptoProvider();
  
  // Generate real Ed25519 keypair
  const priv = new Uint8Array(32).fill(0xaa);
  const pub = ed25519.getPublicKey(priv);
  const creatorId = encodeEd25519Multikey(pub);

  const identity = {
    creatorId,
    privateKey: priv
  };

  it("should include contextId in the signed material", async () => {
    const payload = new Uint8Array([1, 2, 3]);
    const contextId = new Uint8Array([8, 7, 6, 5, 4, 3, 2, 1]);
    
    const envelope = createEnvelope({
      payload,
      payloadType: MULTICODEC_PROTOBUF,
      creatorId: identity.creatorId,
      privateKey: identity.privateKey,
      contextId
    }, crypto);

    expect(envelope.header.contextId).toEqual(contextId);
    
    // Integrity check should pass
    assertEnvelopeIntegrity(envelope, crypto);

    // Tampering with contextId should fail signature
    const tampered = { ...envelope, header: { ...envelope.header, contextId: new Uint8Array(8).fill(0) } };
    expect(() => assertEnvelopeIntegrity(tampered, crypto)).toThrow();
  });

  it("should derive an 8-byte context ID from a topic string", () => {
    const topic = "vco-dev";
    const cid = deriveContextId(topic, (d) => crypto.digest(d));
    expect(cid.length).toBe(8);
    
    const cid2 = deriveContextId(topic, (d) => crypto.digest(d));
    expect(cid).toEqual(cid2);
  });

  it("should prioritize envelopes by PoW score", () => {
    // Score 0
    const envLow = { headerHash: new Uint8Array([0xff, 0xff]), header: {} } as any; 
    // Score 12 (8 from first byte, 4 from second 0x0f)
    const envHigh = { headerHash: new Uint8Array([0x00, 0x0f]), header: {} } as any; 
    
    const items = [envLow, envHigh];
    items.sort(compareEnvelopesByPoW);
    
    expect(items[0].headerHash).toEqual(envHigh.headerHash);
    expect(items[1].headerHash).toEqual(envLow.headerHash);
  });
});
