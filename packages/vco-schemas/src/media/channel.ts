import { MediaChannel } from "../generated/media/channel.pb.js";

export const MEDIA_CHANNEL_SCHEMA_URI = "vco://schemas/media/channel/v1";

export interface MediaChannelData {
  schema: string;
  name: string;
  author: string;
  bio: string;
  avatarCid: Uint8Array;
  latestItemCid: Uint8Array;
  categories: string[];
  isLive: boolean;
}

export function encodeMediaChannel(data: MediaChannelData): Uint8Array {
  const msg = MediaChannel.create({
    schema: data.schema,
    name: data.name,
    author: data.author,
    bio: data.bio,
    avatarCid: data.avatarCid,
    latestItemCid: data.latestItemCid,
    categories: data.categories,
    isLive: data.isLive
  });
  return MediaChannel.encode(msg).finish();
}

export function decodeMediaChannel(bytes: Uint8Array): MediaChannelData {
  const msg = MediaChannel.decode(bytes);
  return {
    schema: msg.schema,
    name: msg.name,
    author: msg.author,
    bio: msg.bio,
    avatarCid: new Uint8Array(msg.avatarCid),
    latestItemCid: new Uint8Array(msg.latestItemCid),
    categories: msg.categories,
    isLive: !!msg.isLive
  };
}
