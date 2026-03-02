import { ProfileData, PostData, POST_V3_SCHEMA_URI, PROFILE_SCHEMA_URI } from '@vco/vco-schemas';
import { mockCid } from '@vco/vco-testing';

export class MockSocialService {
  static getMockProfile(): ProfileData {
    return {
      schema: PROFILE_SCHEMA_URI,
      displayName: "Verifiable Alice",
      bio: "Cryptography enthusiast. Building the swarm.",
      avatarCid: mockCid("alice-avatar"),
      previousManifest: new Uint8Array(0),
      encryptionPubkey: mockCid("alice-encryption-key")
    };
  }

  static getMockFeed(): { cid: Uint8Array, data: PostData }[] {
    return [
      {
        cid: mockCid("post-1"),
        data: {
          schema: POST_V3_SCHEMA_URI,
          content: "Hello #VCO! This is a decentralized post synced via the protocol. #web3 #privacy",
          mediaCids: [],
          timestampMs: BigInt(Date.now() - 3600000),
          tags: ["vco", "web3", "privacy"]
        }
      },
      {
        cid: mockCid("post-2"),
        data: {
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
