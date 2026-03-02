import { ProfileData, PostData, POST_V3_SCHEMA_URI, PROFILE_SCHEMA_URI } from '@vco/vco-schemas';
import { mockCid } from '@vco/vco-testing';

export class MockSocialService {
  static getSeedPeers(): { creatorId: string, profile: ProfileData }[] {
    return [
      {
        creatorId: "bob-id-hex",
        profile: {
          schema: PROFILE_SCHEMA_URI,
          displayName: "Verifiable Bob",
          bio: "Core contributor. Swarm enthusiast.",
          avatarCid: mockCid("bob-avatar"),
          previousManifest: new Uint8Array(0),
          encryptionPubkey: mockCid("bob-enc-key")
        }
      },
      {
        creatorId: "charlie-id-hex",
        profile: {
          schema: PROFILE_SCHEMA_URI,
          displayName: "Crypto Charlie",
          bio: "Decentralized consensus researcher.",
          avatarCid: mockCid("charlie-avatar"),
          previousManifest: new Uint8Array(0),
          encryptionPubkey: mockCid("charlie-enc-key")
        }
      }
    ];
  }
}
