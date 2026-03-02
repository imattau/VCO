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

  static getSeedPosts(): { creatorId: string, post: PostData }[] {
    return [
      {
        creatorId: "charlie-id-hex",
        post: {
          schema: POST_V3_SCHEMA_URI,
          content: "Hello #VCO! This is a decentralized post synced via the protocol. Checking out the new media gallery component. #web3 #privacy",
          mediaCids: [], // Real app would have blake3 hashes here
          timestampMs: BigInt(Date.now() - 3600000),
          tags: ["vco", "web3", "privacy"]
        }
      },
      {
        creatorId: "bob-id-hex",
        post: {
          schema: POST_V3_SCHEMA_URI,
          content: "Just implemented E2EE DMs using X25519. Privacy is not a feature, it's a foundation. #cryptography",
          mediaCids: [],
          timestampMs: BigInt(Date.now() - 7200000),
          tags: ["cryptography"]
        }
      }
    ];
  }
}
