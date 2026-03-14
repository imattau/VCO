import { describe, it, expect, vi } from 'vitest';
import { toHex, fromHex } from '../lib/encoding';
import { NotificationService } from '../lib/NotificationService';
import { ProfileService } from '../lib/ProfileService';
import { NOTIFICATION_SCHEMA_URI, PROFILE_SCHEMA_URI } from '@vco/vco-schemas';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(async () => {}),
}));

describe('Core Utilities Unit Tests', () => {
  
  describe('Hex Encoding', () => {
    it('should correctly convert Uint8Array to hex string', () => {
      const bytes = new Uint8Array([0, 1, 15, 16, 255]);
      expect(toHex(bytes)).toBe('00010f10ff');
    });

    it('should correctly convert hex string to Uint8Array', () => {
      const hex = '00010f10ff';
      const expected = new Uint8Array([0, 1, 15, 16, 255]);
      expect(fromHex(hex)).toEqual(expected);
    });

    it('should handle empty buffers', () => {
      expect(toHex(new Uint8Array(0))).toBe('');
      expect(fromHex('')).toEqual(new Uint8Array(0));
    });

    it('should handle invalid hex strings gracefully', () => {
      expect(fromHex('not-hex')).toEqual(new Uint8Array(0));
      expect(fromHex('123')).toEqual(new Uint8Array(0)); // Odd length
    });
  });

  describe('NotificationService', () => {
    it('should generate a valid notification object', () => {
      const actorCid = new Uint8Array([1]);
      const targetCid = new Uint8Array([2]);
      const summary = "Test notification";
      
      const notif = NotificationService.generateNotification(
        1, // Reply
        actorCid,
        targetCid,
        summary
      );

      expect(notif.schema).toBe(NOTIFICATION_SCHEMA_URI);
      expect(notif.type).toBe(1);
      expect(notif.actorCid).toBe(actorCid);
      expect(notif.targetCid).toBe(targetCid);
      expect(notif.summary).toBe(summary);
      expect(notif.timestampMs).toBeDefined();
    });
  });

  describe('ProfileService', () => {
    it('should correctly create a social profile with encryption keys', async () => {
      const displayName = "Alice";
      const bio = "VCO enthusiast";
      
      const result = await ProfileService.createProfile(displayName, bio);
      
      expect(result.profile.schema).toBe(PROFILE_SCHEMA_URI);
      expect(result.profile.displayName).toBe(displayName);
      expect(result.profile.bio).toBe(bio);
      expect(result.profile.encryptionPubkey).toBeDefined();
      expect(result.encryptionPrivateKey).toBeDefined();
      
      const { invoke } = await import('@tauri-apps/api/core');
      expect(invoke).toHaveBeenCalledWith('publish', expect.objectContaining({
        channelId: 'vco://channels/profiles/v1'
      }));
    });
  });

});
