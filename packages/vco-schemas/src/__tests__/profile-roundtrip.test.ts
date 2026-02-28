import { describe, it, expect } from "vitest";
import { encodeProfile, decodeProfile, PROFILE_SCHEMA_URI } from "../profile.js";

describe("Profile encode/decode roundtrip", () => {
  it("roundtrips a full profile", () => {
    const avatarCid = new Uint8Array(34).fill(0x12);
    const prevManifest = new Uint8Array(34).fill(0x34);
    const bytes = encodeProfile({
      schema: PROFILE_SCHEMA_URI,
      displayName: "Alice",
      avatarCid,
      previousManifest: prevManifest,
      bio: "Building on VCO",
    });
    const decoded = decodeProfile(bytes);
    expect(decoded.displayName).toBe("Alice");
    expect(decoded.avatarCid).toEqual(avatarCid);
    expect(decoded.previousManifest).toEqual(prevManifest);
    expect(decoded.bio).toBe("Building on VCO");
  });

  it("roundtrips a minimal profile with no avatar or previous manifest", () => {
    const bytes = encodeProfile({
      schema: PROFILE_SCHEMA_URI,
      displayName: "Bob",
      avatarCid: new Uint8Array(0),
      previousManifest: new Uint8Array(0),
      bio: "",
    });
    const decoded = decodeProfile(bytes);
    expect(decoded.displayName).toBe("Bob");
    expect(decoded.avatarCid.length).toBe(0);
    expect(decoded.previousManifest.length).toBe(0);
  });
});
