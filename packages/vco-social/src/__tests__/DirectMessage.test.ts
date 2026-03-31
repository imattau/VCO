import { describe, it, expect, vi } from 'vitest';
import { DMProcessor } from '../lib/DMProcessor';
import { E2EEService } from '../lib/E2EEService';
import { toHex } from '@vco/vco-testing';

// Mock schema & core
vi.mock('@vco/vco-schemas', () => ({
  decodeDirectMessage: vi.fn(() => ({
    ephemeralPubkey: new Uint8Array([1]),
    nonce: new Uint8Array([2]),
    encryptedPayload: new Uint8Array([3])
  }))
}));

vi.mock('@vco/vco-core', () => ({
  decodeEnvelopeProto: vi.fn((bytes) => ({
    header: { creatorId: new Uint8Array([bytes[0]]) },
    headerHash: new Uint8Array([1,1,1]),
    payload: bytes
  })),
}));

vi.mock('../lib/E2EEService', () => ({
  E2EEService: {
    decryptMessage: vi.fn(async () => ({ content: "Decrypted Content", mediaCids: [] }))
  }
}));

describe('DMProcessor Unit Tests', () => {
  const myIdentity: any = {
    creatorIdHex: "ff",
    encryptionPrivateKey: new Uint8Array(32)
  };

  it('should extract and decrypt direct messages from envelopes', async () => {
    const peerKey = "peer-abc";
    const envelopes = [
      {
        channelId: `vco://channels/dm/${peerKey}`,
        payload: btoa(String.fromCharCode(0xAA) + "MOCK_DM_PAYLOAD"),
        cid: btoa("cid-1")
      }
    ];

    const dmMap = await DMProcessor.process(envelopes, myIdentity);

    expect(dmMap.has(peerKey)).toBe(true);
    const msgs = dmMap.get(peerKey)!;
    expect(msgs).toHaveLength(1);
    expect(msgs[0].payload.content).toBe("Decrypted Content");
    expect(msgs[0].isOwn).toBe(false);
  });

  it('should correctly identify own sent messages', async () => {
    const peerKey = "peer-abc";
    const envelopes = [
      {
        channelId: `vco://channels/dm/${peerKey}`,
        payload: btoa(String.fromCharCode(0xFF) + "MOCK_OWN_DM"),
        cid: btoa("cid-2")
      }
    ];

    const dmMap = await DMProcessor.process(envelopes, myIdentity);
    const msgs = dmMap.get(peerKey)!;
    expect(msgs[0].isOwn).toBe(true);
  });

  it('should ignore non-DM channels', async () => {
    const envelopes = [
      {
        channelId: "vco://channels/global",
        payload: btoa("something"),
        cid: btoa("cid-3")
      }
    ];

    const dmMap = await DMProcessor.process(envelopes, myIdentity);
    expect(dmMap.size).toBe(0);
  });
});
