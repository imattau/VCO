import { Profile } from "./generated/profile.pb.js";

export const PROFILE_SCHEMA_URI = "vco://schemas/identity/profile/v1";

export interface ProfileData {
  schema: string;
  displayName: string;
  avatarCid: Uint8Array;
  previousManifest: Uint8Array;
  bio: string;
}

export function encodeProfile(data: ProfileData): Uint8Array {
  const msg = Profile.create({
    schema: data.schema,
    displayName: data.displayName,
    avatarCid: data.avatarCid,
    previousManifest: data.previousManifest,
    bio: data.bio,
  });
  return Profile.encode(msg).finish();
}

export function decodeProfile(bytes: Uint8Array): ProfileData {
  const msg = Profile.decode(bytes);
  return {
    schema: msg.schema,
    displayName: msg.displayName,
    avatarCid: new Uint8Array(msg.avatarCid),
    previousManifest: new Uint8Array(msg.previousManifest),
    bio: msg.bio,
  };
}
