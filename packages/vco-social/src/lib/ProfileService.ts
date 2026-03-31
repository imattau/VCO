import {
  encodeProfile,
  PROFILE_SCHEMA_URI,
  ProfileData
} from '@vco/vco-schemas';
import {
  generateX25519KeyPair,
  ByteArray
} from '@vco/vco-crypto';
import { invoke } from '@tauri-apps/api/core';

export class ProfileService {
  /**
   * Initializes a new social profile with a dedicated encryption keypair.
   */
  static async createProfile(
    displayName: string, 
    bio: string, 
    avatarCid: Uint8Array = new Uint8Array(32)
  ): Promise<{ profile: ProfileData, encryptionPrivateKey: ByteArray }> {
    // 1. Generate long-term encryption keypair for DMs
    const encryption = generateX25519KeyPair();
    
    // 2. Build profile data
    const profile: ProfileData = {
      schema: PROFILE_SCHEMA_URI,
      displayName,
      bio,
      avatarCid,
      previousManifest: new Uint8Array(0),
      encryptionPubkey: encryption.publicKey
    };
    
    const encoded = encodeProfile(profile);

    // Publish profile envelope to the network via Tauri IPC
    try {
      const envelopeBase64 = btoa(String.fromCharCode(...encoded));
      await invoke('publish', { channelId: 'vco://channels/profiles/v1', envelopeBase64 });
    } catch (err) {
      console.error("Failed to publish profile to network:", err);
      // Profile is still created locally even if publish fails
    }

    return {
      profile,
      encryptionPrivateKey: encryption.privateKey
    };
  }
}
