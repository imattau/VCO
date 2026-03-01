import { describe, it, expect } from "vitest";
import { 
  encodeMediaManifest, 
  decodeMediaManifest, 
  MEDIA_MANIFEST_SCHEMA_URI,
  encodeMediaChannel,
  decodeMediaChannel,
  MEDIA_CHANNEL_SCHEMA_URI,
  encodeTranscript,
  decodeTranscript,
  TRANSCRIPT_SCHEMA_URI
} from "../index.js";

describe("Media Schemas", () => {
  const mockCid = (seed: string) => new TextEncoder().encode(seed.padEnd(32, '0')).slice(0, 32);

  it("should round-trip MediaManifest (Refactored to contentCid)", () => {
    const data = {
      schema: MEDIA_MANIFEST_SCHEMA_URI,
      title: "VCO Protocol Deep Dive",
      summary: "Exploring the inner workings of VCO v3.2",
      showNotes: `# Show Notes
- Intro
- Chunks
- Outro`,
      contentCid: mockCid("sequence-manifest-cid"),
      thumbnailCid: mockCid("cover"),
      transcriptCid: mockCid("transcript"),
      durationMs: 3600000n,
      publishedAtMs: BigInt(Date.now()),
      previousItemCid: mockCid("prev-ep"),
      contentType: "audio/mpeg"
    };

    const encoded = encodeMediaManifest(data);
    const decoded = decodeMediaManifest(encoded);

    expect(decoded.title).toBe(data.title);
    expect(decoded.contentCid).toEqual(data.contentCid);
    expect(decoded.durationMs).toBe(data.durationMs);
    expect(decoded.previousItemCid).toEqual(data.previousItemCid);
  });

  it("should round-trip MediaChannel", () => {
    const data = {
      schema: MEDIA_CHANNEL_SCHEMA_URI,
      name: "The VCO Podcast",
      author: "did:vco:123",
      bio: "A podcast about verifiable content.",
      avatarCid: mockCid("avatar"),
      latestItemCid: mockCid("latest"),
      categories: ["Technology", "Privacy"],
      isLive: false
    };

    const encoded = encodeMediaChannel(data);
    const decoded = decodeMediaChannel(encoded);

    expect(decoded.name).toBe(data.name);
    expect(decoded.categories).toContain("Privacy");
    expect(decoded.latestItemCid).toEqual(data.latestItemCid);
  });

  it("should round-trip Transcript", () => {
    const data = {
      schema: TRANSCRIPT_SCHEMA_URI,
      mediaManifestCid: mockCid("media"),
      entries: [
        { startMs: 0n, endMs: 1000n, text: "Hello world", speaker: "Host" },
        { startMs: 1000n, endMs: 2000n, text: "Welcome to the show", speaker: "Host" }
      ],
      language: "en"
    };

    const encoded = encodeTranscript(data);
    const decoded = decodeTranscript(encoded);

    expect(decoded.entries).toHaveLength(2);
    expect(decoded.entries[0].text).toBe("Hello world");
    expect(decoded.language).toBe("en");
  });
});
