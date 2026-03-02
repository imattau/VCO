import { 
  encodeProfile, 
  PROFILE_SCHEMA_URI,
  ProfileData
} from '@vco/vco-schemas';
import { 
  generateX25519KeyPair, 
  ByteArray
} from '@vco/vco-crypto';

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
    
    // In a real app, publish encoded Profile to network
    console.log("Profile created & encoded:", encoded.length, "bytes");
    
    return {
      profile,
      encryptionPrivateKey: encryption.privateKey
    };
  }
}
