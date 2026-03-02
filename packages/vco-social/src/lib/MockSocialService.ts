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

  static getMockFeed(): { cid: Uint8Array, data: PostData, authorProfile: ProfileData }[] {
    const charlie: ProfileData = {
      schema: PROFILE_SCHEMA_URI,
      displayName: "Crypto Charlie",
      bio: "Decentralized consensus researcher.",
      avatarCid: mockCid("charlie-avatar"),
      previousManifest: new Uint8Array(0),
    };

    const bob: ProfileData = {
      schema: PROFILE_SCHEMA_URI,
      displayName: "Verifiable Bob",
      bio: "Core contributor. Swarm enthusiast.",
      avatarCid: mockCid("bob-avatar"),
      previousManifest: new Uint8Array(0),
    };

    return [
      {
        cid: mockCid("post-1"),
        data: {
          schema: POST_V3_SCHEMA_URI,
          content: "Hello #VCO! This is a decentralized post synced via the protocol. Checking out the new media gallery component. #web3 #privacy",
          mediaCids: [mockCid("media-1"), mockCid("media-2"), mockCid("media-3")],
          timestampMs: BigInt(Date.now() - 3600000),
          tags: ["vco", "web3", "privacy"]
        },
        authorProfile: charlie
      },
      {
        cid: mockCid("post-2"),
        data: {
          schema: POST_V3_SCHEMA_URI,
          content: "Just implemented E2EE DMs using X25519. Privacy is not a feature, it's a foundation. #cryptography",
          mediaCids: [],
          timestampMs: BigInt(Date.now() - 7200000),
          tags: ["cryptography"]
        },
        authorProfile: bob
      }
    ];
  }
}
