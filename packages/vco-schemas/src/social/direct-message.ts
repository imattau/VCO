import { DirectMessage, DirectMessagePayload } from "../generated/social/direct_message.pb.js";

export const DIRECT_MESSAGE_SCHEMA_URI = "vco://schemas/social/direct-message/v1";

export interface DirectMessageData {
  schema: string;
  recipientCid: Uint8Array;
  senderCid: Uint8Array;
  ephemeralPubkey: Uint8Array;
  nonce: Uint8Array;
  encryptedPayload: Uint8Array;
  timestampMs: bigint;
}

export interface DirectMessagePayloadData {
  content: string;
  mediaCids: Uint8Array[];
}

export function encodeDirectMessage(data: DirectMessageData): Uint8Array {
  const msg = DirectMessage.create({
    schema: data.schema,
    recipientCid: data.recipientCid,
    senderCid: data.senderCid,
    ephemeralPubkey: data.ephemeralPubkey,
    nonce: data.nonce,
    encryptedPayload: data.encryptedPayload,
    timestampMs: Number(data.timestampMs),
  });
  return DirectMessage.encode(msg).finish();
}

export function decodeDirectMessage(bytes: Uint8Array): DirectMessageData {
  const msg = DirectMessage.decode(bytes);
  return {
    schema: msg.schema,
    recipientCid: new Uint8Array(msg.recipientCid),
    senderCid: new Uint8Array(msg.senderCid),
    ephemeralPubkey: new Uint8Array(msg.ephemeralPubkey),
    nonce: new Uint8Array(msg.nonce),
    encryptedPayload: new Uint8Array(msg.encryptedPayload),
    timestampMs: BigInt(msg.timestampMs?.toString() ?? "0"),
  };
}

export function encodeDirectMessagePayload(data: DirectMessagePayloadData): Uint8Array {
  const msg = DirectMessagePayload.create({
    content: data.content,
    mediaCids: data.mediaCids,
  });
  return DirectMessagePayload.encode(msg).finish();
}

export function decodeDirectMessagePayload(bytes: Uint8Array): DirectMessagePayloadData {
  const msg = DirectMessagePayload.decode(bytes);
  return {
    content: msg.content,
    mediaCids: msg.mediaCids.map((c) => new Uint8Array(c)),
  };
}
