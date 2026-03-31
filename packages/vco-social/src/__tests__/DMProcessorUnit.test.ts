// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DMProcessor } from '../lib/DMProcessor';

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

// Stable mock DM data returned by decodeDirectMessage
const mockDmData = {
  schema: 'vco://schemas/social/direct-message/v1',
  recipientCid: new Uint8Array([0xaa, 0xbb]),
  senderCid: new Uint8Array([0xcc, 0xdd]),
  ephemeralPubkey: new Uint8Array(32).fill(1),
  nonce: new Uint8Array(12).fill(2),
  encryptedPayload: new Uint8Array(48).fill(3),
  timestampMs: BigInt(1700000000000),
};

vi.mock('@vco/vco-schemas', () => ({
  decodeDirectMessage: vi.fn(() => ({ ...mockDmData })),
}));

// decodeEnvelopeProto returns a minimal CoreEnvelope whose creatorId is the
// first byte of the input, so callers can control the hex value by controlling
// that byte.
vi.mock('@vco/vco-core', () => ({
  decodeEnvelopeProto: vi.fn((bytes: Uint8Array) => ({
    header: { creatorId: new Uint8Array([bytes[0]]) },
    headerHash: new Uint8Array(32).fill(0xab),
    payload: bytes,
  })),
}));

vi.mock('../lib/E2EEService', () => ({
  E2EEService: {
    decryptMessage: vi.fn(async () => ({
      content: 'Hello, world!',
      mediaCids: [],
    })),
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds a minimal base64-encoded "envelope payload" whose first byte equals
 * `creatorFirstByte`.  The remaining bytes are arbitrary non-zero filler so
 * that the mock decodeEnvelopeProto doesn't receive empty input.
 */
function makePayload(creatorFirstByte = 0x01): string {
  const raw = new Uint8Array(64);
  raw[0] = creatorFirstByte;
  raw.fill(0x55, 1);
  return btoa(String.fromCharCode(...raw));
}

/** Hex string for a single byte, matching what toHex() in encoding.ts produces. */
function byteHex(b: number): string {
  return b.toString(16).padStart(2, '0');
}

/** A valid hex CID string (16 bytes). */
const VALID_CID_HEX = '0102030405060708090a0b0c0d0e0f10';

const PEER_KEY = 'peer-0102030405060708090a0b0c0d0e0f';
const DM_CHANNEL = `vco://channels/dm/${PEER_KEY}`;

// Identity whose creatorIdHex does NOT match any default envelope creator
const foreignIdentity: any = {
  creatorIdHex: byteHex(0xff), // 'ff'
  encryptionPrivateKey: new Uint8Array(32).fill(0x42),
};

// Identity whose creatorIdHex matches first-byte 0x01 (default makePayload)
const ownIdentity: any = {
  creatorIdHex: byteHex(0x01), // '01'
  encryptionPrivateKey: new Uint8Array(32).fill(0x42),
};

// ---------------------------------------------------------------------------
// Imports for spy access
// ---------------------------------------------------------------------------
import { E2EEService } from '../lib/E2EEService';
import * as vcoCore from '@vco/vco-core';
import * as vcoSchemas from '@vco/vco-schemas';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DMProcessor.process()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Restore default happy-path behaviour
    vi.mocked(E2EEService.decryptMessage).mockResolvedValue({
      content: 'Hello, world!',
      mediaCids: [],
    });
    vi.mocked(vcoCore.decodeEnvelopeProto).mockImplementation((bytes: Uint8Array) => ({
      header: { creatorId: new Uint8Array([bytes[0]]) },
      headerHash: new Uint8Array(32).fill(0xab),
      payload: bytes,
    }));
    vi.mocked(vcoSchemas.decodeDirectMessage).mockReturnValue({ ...mockDmData });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // 1. Valid E2EE DM envelope → decoded and returned with correct sender/content
  // -------------------------------------------------------------------------
  describe('valid E2EE DM envelope', () => {
    it('returns the message under the correct peer key', async () => {
      const envelopes = [
        { channelId: DM_CHANNEL, payload: makePayload(0x01), cid: VALID_CID_HEX },
      ];

      const result = await DMProcessor.process(envelopes, foreignIdentity);

      expect(result.has(PEER_KEY)).toBe(true);
      expect(result.get(PEER_KEY)).toHaveLength(1);
    });

    it('populates payload.content from E2EEService.decryptMessage', async () => {
      const envelopes = [
        { channelId: DM_CHANNEL, payload: makePayload(0x01), cid: VALID_CID_HEX },
      ];

      const result = await DMProcessor.process(envelopes, foreignIdentity);
      const msg = result.get(PEER_KEY)![0];

      expect(msg.payload.content).toBe('Hello, world!');
      expect(msg.payload.mediaCids).toEqual([]);
    });

    it('attaches the dmData returned by decodeDirectMessage', async () => {
      const envelopes = [
        { channelId: DM_CHANNEL, payload: makePayload(0x01), cid: VALID_CID_HEX },
      ];

      const result = await DMProcessor.process(envelopes, foreignIdentity);
      const msg = result.get(PEER_KEY)![0];

      expect(msg.data).toEqual(mockDmData);
    });

    it('calls E2EEService.decryptMessage with the correct arguments', async () => {
      const envelopes = [
        { channelId: DM_CHANNEL, payload: makePayload(0x01), cid: VALID_CID_HEX },
      ];

      await DMProcessor.process(envelopes, foreignIdentity);

      expect(E2EEService.decryptMessage).toHaveBeenCalledOnce();
      expect(E2EEService.decryptMessage).toHaveBeenCalledWith(
        foreignIdentity.encryptionPrivateKey,
        mockDmData.ephemeralPubkey,
        mockDmData.nonce,
        mockDmData.encryptedPayload,
      );
    });

    it('marks the message as not own when creatorId does not match identity', async () => {
      // creatorFirstByte 0x01 → hex '01'; foreignIdentity.creatorIdHex = 'ff'
      const envelopes = [
        { channelId: DM_CHANNEL, payload: makePayload(0x01), cid: VALID_CID_HEX },
      ];

      const result = await DMProcessor.process(envelopes, foreignIdentity);
      expect(result.get(PEER_KEY)![0].isOwn).toBe(false);
    });

    it('marks the message as own when creatorId matches identity', async () => {
      // creatorFirstByte 0x01 → hex '01'; ownIdentity.creatorIdHex = '01'
      const envelopes = [
        { channelId: DM_CHANNEL, payload: makePayload(0x01), cid: VALID_CID_HEX },
      ];

      const result = await DMProcessor.process(envelopes, ownIdentity);
      expect(result.get(PEER_KEY)![0].isOwn).toBe(true);
    });

    it('attaches the decoded cid bytes', async () => {
      const envelopes = [
        { channelId: DM_CHANNEL, payload: makePayload(0x01), cid: VALID_CID_HEX },
      ];

      const result = await DMProcessor.process(envelopes, foreignIdentity);
      const msg = result.get(PEER_KEY)![0];

      // fromHex(VALID_CID_HEX) should produce 16 bytes
      expect(msg.cid).toBeInstanceOf(Uint8Array);
      expect(msg.cid).toHaveLength(16);
    });
  });

  // -------------------------------------------------------------------------
  // 2. Decryption failure → fallback content AND console.warn
  // -------------------------------------------------------------------------
  describe('decryption failure', () => {
    it('returns [Encrypted Message] fallback content when decryption throws', async () => {
      vi.mocked(E2EEService.decryptMessage).mockRejectedValue(
        new Error('bad key'),
      );
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const envelopes = [
        { channelId: DM_CHANNEL, payload: makePayload(0x01), cid: VALID_CID_HEX },
      ];

      const result = await DMProcessor.process(envelopes, foreignIdentity);
      const msg = result.get(PEER_KEY)![0];

      expect(msg.payload.content).toBe('[Encrypted Message]');
      expect(msg.payload.mediaCids).toEqual([]);

      warnSpy.mockRestore();
    });

    it('calls console.warn when decryption throws', async () => {
      const decryptError = new Error('bad key');
      vi.mocked(E2EEService.decryptMessage).mockRejectedValue(decryptError);
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const envelopes = [
        { channelId: DM_CHANNEL, payload: makePayload(0x01), cid: VALID_CID_HEX },
      ];

      await DMProcessor.process(envelopes, foreignIdentity);

      expect(warnSpy).toHaveBeenCalledOnce();
      expect(warnSpy.mock.calls[0][0]).toContain('DMProcessor: decryption failed');

      warnSpy.mockRestore();
    });

    it('still emits the message (with fallback) even when decryption fails', async () => {
      vi.mocked(E2EEService.decryptMessage).mockRejectedValue(new Error('bad key'));
      vi.spyOn(console, 'warn').mockImplementation(() => {});

      const envelopes = [
        { channelId: DM_CHANNEL, payload: makePayload(0x01), cid: VALID_CID_HEX },
      ];

      const result = await DMProcessor.process(envelopes, foreignIdentity);

      expect(result.has(PEER_KEY)).toBe(true);
      expect(result.get(PEER_KEY)).toHaveLength(1);
    });
  });

  // -------------------------------------------------------------------------
  // 3. Non-DM channelId → envelope skipped
  // -------------------------------------------------------------------------
  describe('non-DM channelId', () => {
    it('skips envelopes whose channelId does not start with vco://channels/dm/', async () => {
      const envelopes = [
        { channelId: 'vco://channels/global', payload: makePayload(), cid: VALID_CID_HEX },
        { channelId: 'vco://channels/feed', payload: makePayload(), cid: VALID_CID_HEX },
        { channelId: 'vco://channels/dm_FAKE', payload: makePayload(), cid: VALID_CID_HEX },
      ];

      const result = await DMProcessor.process(envelopes, foreignIdentity);

      expect(result.size).toBe(0);
      expect(vcoCore.decodeEnvelopeProto).not.toHaveBeenCalled();
    });

    it('processes only DM envelopes when mixed with non-DM ones', async () => {
      const envelopes = [
        { channelId: 'vco://channels/global', payload: makePayload(), cid: VALID_CID_HEX },
        { channelId: DM_CHANNEL, payload: makePayload(0x01), cid: VALID_CID_HEX },
      ];

      const result = await DMProcessor.process(envelopes, foreignIdentity);

      expect(result.size).toBe(1);
      expect(result.has(PEER_KEY)).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 4. channelId is undefined / null / number → type guard prevents crash
  // -------------------------------------------------------------------------
  describe('channelId type guard (fix #8)', () => {
    it('skips envelopes where channelId is undefined', async () => {
      const envelopes = [
        { channelId: undefined, payload: makePayload(), cid: VALID_CID_HEX },
      ];

      await expect(
        DMProcessor.process(envelopes as any, foreignIdentity),
      ).resolves.toEqual(new Map());
    });

    it('skips envelopes where channelId is null', async () => {
      const envelopes = [
        { channelId: null, payload: makePayload(), cid: VALID_CID_HEX },
      ];

      await expect(
        DMProcessor.process(envelopes as any, foreignIdentity),
      ).resolves.toEqual(new Map());
    });

    it('skips envelopes where channelId is a number', async () => {
      const envelopes = [
        { channelId: 42, payload: makePayload(), cid: VALID_CID_HEX },
      ];

      await expect(
        DMProcessor.process(envelopes as any, foreignIdentity),
      ).resolves.toEqual(new Map());
    });

    it('skips envelopes where channelId is an object', async () => {
      const envelopes = [
        { channelId: { dm: true }, payload: makePayload(), cid: VALID_CID_HEX },
      ];

      await expect(
        DMProcessor.process(envelopes as any, foreignIdentity),
      ).resolves.toEqual(new Map());
    });

    it('skips envelopes where channelId is boolean true', async () => {
      const envelopes = [
        { channelId: true, payload: makePayload(), cid: VALID_CID_HEX },
      ];

      await expect(
        DMProcessor.process(envelopes as any, foreignIdentity),
      ).resolves.toEqual(new Map());
    });

    it('does not throw when the envelopes array contains items with missing channelId', async () => {
      const envelopes = [
        { payload: makePayload(), cid: VALID_CID_HEX }, // channelId absent
      ];

      await expect(
        DMProcessor.process(envelopes as any, foreignIdentity),
      ).resolves.not.toThrow();
    });
  });

  // -------------------------------------------------------------------------
  // 5. Malformed base64 payload → skipped with console.warn
  // -------------------------------------------------------------------------
  describe('malformed base64 payload', () => {
    it('skips the envelope and emits console.warn for invalid base64', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // atob will throw on this input
      const envelopes = [
        { channelId: DM_CHANNEL, payload: '!!!NOT_BASE64!!!', cid: VALID_CID_HEX },
      ];

      const result = await DMProcessor.process(envelopes, foreignIdentity);

      expect(result.size).toBe(0);
      expect(warnSpy).toHaveBeenCalledOnce();
      expect(warnSpy.mock.calls[0][0]).toContain('DMProcessor: failed to decode envelope');

      warnSpy.mockRestore();
    });

    it('continues processing subsequent valid envelopes after a bad base64 entry', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});

      const envelopes = [
        { channelId: DM_CHANNEL, payload: '!!!NOT_BASE64!!!', cid: VALID_CID_HEX },
        { channelId: DM_CHANNEL, payload: makePayload(0x01), cid: VALID_CID_HEX },
      ];

      const result = await DMProcessor.process(envelopes, foreignIdentity);

      expect(result.has(PEER_KEY)).toBe(true);
      expect(result.get(PEER_KEY)).toHaveLength(1);
    });
  });

  // -------------------------------------------------------------------------
  // 6. Invalid protobuf in envelope → skipped with console.warn
  // -------------------------------------------------------------------------
  describe('invalid protobuf in envelope payload', () => {
    it('skips and warns when decodeEnvelopeProto throws', async () => {
      vi.mocked(vcoCore.decodeEnvelopeProto).mockImplementation(() => {
        throw new Error('protobuf decode error');
      });
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const envelopes = [
        { channelId: DM_CHANNEL, payload: makePayload(0x01), cid: VALID_CID_HEX },
      ];

      const result = await DMProcessor.process(envelopes, foreignIdentity);

      expect(result.size).toBe(0);
      expect(warnSpy).toHaveBeenCalledOnce();
      expect(warnSpy.mock.calls[0][0]).toContain('DMProcessor: failed to decode envelope');

      warnSpy.mockRestore();
    });

    it('skips and warns when decodeDirectMessage throws', async () => {
      vi.mocked(vcoSchemas.decodeDirectMessage).mockImplementation(() => {
        throw new Error('bad DM proto');
      });
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const envelopes = [
        { channelId: DM_CHANNEL, payload: makePayload(0x01), cid: VALID_CID_HEX },
      ];

      const result = await DMProcessor.process(envelopes, foreignIdentity);

      expect(result.size).toBe(0);
      expect(warnSpy).toHaveBeenCalledOnce();

      warnSpy.mockRestore();
    });

    it('continues processing valid envelopes after a bad protobuf entry', async () => {
      let callCount = 0;
      vi.mocked(vcoCore.decodeEnvelopeProto).mockImplementation((bytes: Uint8Array) => {
        callCount++;
        if (callCount === 1) throw new Error('protobuf decode error');
        return {
          header: { creatorId: new Uint8Array([bytes[0]]) },
          headerHash: new Uint8Array(32).fill(0xab),
          payload: bytes,
        };
      });
      vi.spyOn(console, 'warn').mockImplementation(() => {});

      const envelopes = [
        { channelId: DM_CHANNEL, payload: makePayload(0x01), cid: VALID_CID_HEX },
        { channelId: DM_CHANNEL, payload: makePayload(0x02), cid: VALID_CID_HEX },
      ];

      const result = await DMProcessor.process(envelopes, foreignIdentity);

      expect(result.has(PEER_KEY)).toBe(true);
      expect(result.get(PEER_KEY)).toHaveLength(1);
    });
  });

  // -------------------------------------------------------------------------
  // 7. Batch with mixed valid/invalid DMs → valid returned, invalid skipped
  // -------------------------------------------------------------------------
  describe('mixed batch processing', () => {
    it('returns only valid messages and skips each invalid one with a warn', async () => {
      let decodeCallCount = 0;
      vi.mocked(vcoCore.decodeEnvelopeProto).mockImplementation((bytes: Uint8Array) => {
        decodeCallCount++;
        // Every other call fails
        if (decodeCallCount % 2 === 0) throw new Error('decode failure');
        return {
          header: { creatorId: new Uint8Array([bytes[0]]) },
          headerHash: new Uint8Array(32).fill(0xab),
          payload: bytes,
        };
      });
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const envelopes = [
        { channelId: DM_CHANNEL, payload: makePayload(0x01), cid: VALID_CID_HEX }, // valid (call 1)
        { channelId: DM_CHANNEL, payload: makePayload(0x02), cid: VALID_CID_HEX }, // invalid (call 2)
        { channelId: DM_CHANNEL, payload: makePayload(0x03), cid: VALID_CID_HEX }, // valid (call 3)
        { channelId: DM_CHANNEL, payload: makePayload(0x04), cid: VALID_CID_HEX }, // invalid (call 4)
      ];

      const result = await DMProcessor.process(envelopes, foreignIdentity);

      expect(result.get(PEER_KEY)).toHaveLength(2);
      expect(warnSpy).toHaveBeenCalledTimes(2);

      warnSpy.mockRestore();
    });

    it('groups messages from the same peer under one key', async () => {
      const envelopes = [
        { channelId: DM_CHANNEL, payload: makePayload(0x01), cid: VALID_CID_HEX },
        { channelId: DM_CHANNEL, payload: makePayload(0x02), cid: VALID_CID_HEX },
        { channelId: DM_CHANNEL, payload: makePayload(0x03), cid: VALID_CID_HEX },
      ];

      const result = await DMProcessor.process(envelopes, foreignIdentity);

      expect(result.size).toBe(1);
      expect(result.get(PEER_KEY)).toHaveLength(3);
    });

    it('creates separate map entries for different peer keys', async () => {
      const peerA = 'aaaaaaaaaaaaaaaa';
      const peerB = 'bbbbbbbbbbbbbbbb';

      const envelopes = [
        {
          channelId: `vco://channels/dm/${peerA}`,
          payload: makePayload(0x01),
          cid: VALID_CID_HEX,
        },
        {
          channelId: `vco://channels/dm/${peerB}`,
          payload: makePayload(0x02),
          cid: VALID_CID_HEX,
        },
      ];

      const result = await DMProcessor.process(envelopes, foreignIdentity);

      expect(result.size).toBe(2);
      expect(result.has(peerA)).toBe(true);
      expect(result.has(peerB)).toBe(true);
    });

    it('handles decryption failure on some messages while others succeed', async () => {
      let decryptCallCount = 0;
      vi.mocked(E2EEService.decryptMessage).mockImplementation(async () => {
        decryptCallCount++;
        if (decryptCallCount % 2 === 0) throw new Error('decrypt fail');
        return { content: 'Good message', mediaCids: [] };
      });
      vi.spyOn(console, 'warn').mockImplementation(() => {});

      const envelopes = [
        { channelId: DM_CHANNEL, payload: makePayload(0x01), cid: VALID_CID_HEX },
        { channelId: DM_CHANNEL, payload: makePayload(0x02), cid: VALID_CID_HEX },
        { channelId: DM_CHANNEL, payload: makePayload(0x03), cid: VALID_CID_HEX },
      ];

      const result = await DMProcessor.process(envelopes, foreignIdentity);
      const msgs = result.get(PEER_KEY)!;

      // All 3 should be present — failures fall back to [Encrypted Message]
      expect(msgs).toHaveLength(3);
      expect(msgs[0].payload.content).toBe('Good message');
      expect(msgs[1].payload.content).toBe('[Encrypted Message]');
      expect(msgs[2].payload.content).toBe('Good message');
    });
  });

  // -------------------------------------------------------------------------
  // 8. Empty batch → empty result, no crash
  // -------------------------------------------------------------------------
  describe('empty batch', () => {
    it('returns an empty Map for an empty envelopes array', async () => {
      const result = await DMProcessor.process([], foreignIdentity);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    it('does not call any decoding functions on an empty batch', async () => {
      await DMProcessor.process([], foreignIdentity);

      expect(vcoCore.decodeEnvelopeProto).not.toHaveBeenCalled();
      expect(vcoSchemas.decodeDirectMessage).not.toHaveBeenCalled();
      expect(E2EEService.decryptMessage).not.toHaveBeenCalled();
    });

    it('does not emit console.warn for an empty batch', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await DMProcessor.process([], foreignIdentity);

      expect(warnSpy).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });
  });
});
