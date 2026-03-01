import { 
  encodeMediaChannel, 
  decodeMediaChannel, 
  MEDIA_CHANNEL_SCHEMA_URI,
  MediaChannelData,
  encodeMediaManifest,
  decodeMediaManifest,
  MEDIA_MANIFEST_SCHEMA_URI,
  MediaManifestData
} from "@vco/vco-schemas";

// Helper to simulate a 32-byte CID (multihash part)
const mockCid = (seed: string) => {
  const bytes = new Uint8Array(32);
  const seedBytes = new TextEncoder().encode(seed);
  bytes.set(seedBytes.slice(0, 32));
  return bytes;
};

// Mock Data
const MOCK_CHANNEL_CID = mockCid("vco-daily-channel");
const MOCK_EP1_CID = mockCid("vco-daily-ep1");
const MOCK_EP2_CID = mockCid("vco-daily-ep2");

const mockChannel: MediaChannelData = {
  schema: MEDIA_CHANNEL_SCHEMA_URI,
  name: "VCO Daily",
  author: "did:vco:alex_dev",
  bio: "Daily updates on the Verifiable Content Object protocol, decentralization, and cryptography.",
  avatarCid: mockCid("vco-daily-avatar"),
  latestItemCid: MOCK_EP2_CID,
  categories: ["Technology", "Cryptography", "Decentralization"],
  isLive: false
};

const mockEpisode1: MediaManifestData = {
  schema: MEDIA_MANIFEST_SCHEMA_URI,
  title: "Episode 1: The Envelope Explained",
  summary: "A deep dive into the structure of a VCO envelope and why it matters.",
  showNotes: "# Episode 1: The Envelope Explained\n\nIn this episode, we break down the core component of the VCO protocol: the **Envelope**.\n\n## Key Topics\n* The structure of a `vco://` URI\n* Why we use Protocol Buffers\n* The difference between `payload_hash` and `header_hash`\n\n### Links\n* [VCO Specification](https://example.com/vco-spec)",
  contentCid: mockCid("ep1-audio-sequence"),
  thumbnailCid: mockCid("vco-daily-avatar"),
  durationMs: 1200000n, // 20 mins
  publishedAtMs: BigInt(Date.now() - 86400000 * 2), // 2 days ago
  contentType: "audio/mpeg"
};

const mockEpisode2: MediaManifestData = {
  schema: MEDIA_MANIFEST_SCHEMA_URI,
  title: "Episode 2: Parallel Fetching & Swarms",
  summary: "How VCO achieves unblockable streaming through sequence manifests.",
  showNotes: "# Episode 2: Parallel Fetching & Swarms\n\nToday we discuss how large media files are distributed across the relay network.\n\n## Key Topics\n* Chunking and Sequence Manifests\n* Deduplication across the swarm\n* Verifying chunks on the fly\n\n> \"A healthy swarm is one that can serve content faster than a centralized CDN.\"",
  contentCid: mockCid("ep2-audio-sequence"),
  thumbnailCid: mockCid("vco-daily-avatar"),
  durationMs: 1500000n, // 25 mins
  publishedAtMs: BigInt(Date.now() - 86400000), // 1 day ago
  previousItemCid: MOCK_EP1_CID, // Sequential linking
  contentType: "audio/mpeg"
};

// Helper to convert Uint8Array to hex string for the map key
const toHex = (bytes: Uint8Array) => 
  Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');

// Simulated Network Store for Schemas
const networkStore = new Map<string, Uint8Array>();
// Simulated Blob Store for Real Media
const blobStore = new Map<string, Blob>();

networkStore.set(toHex(MOCK_CHANNEL_CID), encodeMediaChannel(mockChannel));
networkStore.set(toHex(MOCK_EP1_CID), encodeMediaManifest(mockEpisode1));
networkStore.set(toHex(MOCK_EP2_CID), encodeMediaManifest(mockEpisode2));

export const MockMediaService = {
  /**
   * Fetch and decode a MediaChannel by its CID
   */
  async getChannel(cidBytes: Uint8Array): Promise<MediaChannelData | null> {
    const hex = toHex(cidBytes);
    const encoded = networkStore.get(hex);
    if (!encoded) return null;
    return decodeMediaChannel(encoded);
  },

  /**
   * Update a MediaChannel profile
   */
  async updateChannel(cidBytes: Uint8Array, data: MediaChannelData): Promise<void> {
    const encoded = encodeMediaChannel(data);
    networkStore.set(toHex(cidBytes), encoded);
  },

  /**
   * Fetch and decode a MediaManifest (Episode) by its CID
   */
  async getManifest(cidBytes: Uint8Array): Promise<MediaManifestData | null> {
    const hex = toHex(cidBytes);
    const encoded = networkStore.get(hex);
    if (!encoded) return null;
    return decodeMediaManifest(encoded);
  },

  /**
   * Store a real media blob and return a mock CID
   */
  async storeMedia(blob: Blob): Promise<Uint8Array> {
    const mockId = `blob-${Math.random().toString(36).slice(2, 11)}`;
    const cid = mockCid(mockId);
    blobStore.set(toHex(cid), blob);
    return cid;
  },

  /**
   * Retrieve a playable URL for a CID
   */
  async getMediaUrl(cidBytes: Uint8Array): Promise<string | null> {
    const hex = toHex(cidBytes);
    const blob = blobStore.get(hex);
    if (blob) {
      return URL.createObjectURL(blob);
    }
    // Fallback for mocked episodes (just a placeholder beep)
    return 'https://www.soundjay.com/buttons/beep-01a.mp3';
  },

  /**
   * Publish a new episode manifest
   */
  async publishManifest(data: MediaManifestData): Promise<Uint8Array> {
    const mockId = `manifest-${Math.random().toString(36).slice(2, 11)}`;
    const cid = mockCid(mockId);
    networkStore.set(toHex(cid), encodeMediaManifest(data));
    return cid;
  },

  /**
   * Helper to fetch a channel's history by walking the previousItemCid chain
   */
  async getChannelHistory(latestCidBytes: Uint8Array): Promise<{ cid: Uint8Array, manifest: MediaManifestData }[]> {
    const history: { cid: Uint8Array, manifest: MediaManifestData }[] = [];
    let currentCid: Uint8Array | undefined = latestCidBytes;

    // Limit to 10 for simulation safety
    let depth = 0;
    while (currentCid && depth < 10) {
      const manifest = await this.getManifest(currentCid);
      if (manifest) {
        history.push({ cid: currentCid, manifest });
        currentCid = manifest.previousItemCid;
      } else {
        break;
      }
      depth++;
    }

    return history;
  },

  // Expose the mock channel CID for the app to bootstrap
  getDefaultChannelCid() {
    return MOCK_CHANNEL_CID;
  }
};
