// packages/vco-cord/src/lib/vco.ts

import {
  createEnvelope,
  encodeEnvelopeProto,
  decodeEnvelopeProto,
  assertEnvelopeIntegrity,
  getPowScore,
  MULTICODEC_PROTOBUF,
} from "@vco/vco-core";
import { encodePost, decodePost, POST_V3_SCHEMA_URI, extractHashtags } from "@vco/vco-schemas";
import {
  createNobleCryptoProvider,
  deriveEd25519Multikey,
  deriveEd25519PublicKey,
} from "@vco/vco-crypto";
import type { Identity, VcoMessage } from "../types/index.js";

const crypto = createNobleCryptoProvider();

export function initializeIdentity(displayName: string, privateKey?: Uint8Array): Identity {
  const priv = privateKey ?? globalThis.crypto.getRandomValues(new Uint8Array(32));
  const publicKey = deriveEd25519PublicKey(priv);
  const creatorId = deriveEd25519Multikey(priv);
  return { privateKey: priv, publicKey, creatorId, displayName };
}

export function uint8ArrayToHex(arr: Uint8Array): string {
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function hexToUint8Array(hex: string): Uint8Array {
  const pairs = hex.match(/[\da-f]{2}/gi) ?? [];
  return new Uint8Array(pairs.map((p) => parseInt(p, 16)));
}

const POW_DIFFICULTY = 4;

export async function buildMessage(
  channelId: string,
  content: string,
  identity: Identity,
): Promise<VcoMessage> {
  const tags = extractHashtags(content);
  const payload = encodePost({
    schema: POST_V3_SCHEMA_URI,
    content,
    mediaCids: [],
    timestampMs: BigInt(Date.now()),
    channelId, // encodePost will move this to a 'c:' tag for v3
    tags,
  });
  const envelope = createEnvelope(
    {
      payload,
      payloadType: MULTICODEC_PROTOBUF,
      creatorId: identity.creatorId,
      privateKey: identity.privateKey,
      powDifficulty: POW_DIFFICULTY,
    },
    crypto,
  );
  const rawEnvelope = encodeEnvelopeProto(envelope);
  const powScore = getPowScore(envelope.headerHash);
  return {
    id: uint8ArrayToHex(envelope.headerHash),
    channelId,
    authorId: uint8ArrayToHex(identity.creatorId),
    authorName: identity.displayName,
    content,
    timestamp: Date.now(),
    powScore,
    flags: envelope.header.flags,
    rawEnvelope,
    verified: true,
    tampered: false,
  };
}

export function decodeMessage(
  channelId: string,
  encoded: Uint8Array,
  knownAuthors: Map<string, string>,
): VcoMessage {
  const envelope = decodeEnvelopeProto(encoded);
  let verified = false;
  let tampered = false;
  try {
    assertEnvelopeIntegrity(envelope, crypto);
    verified = true;
  } catch {
    tampered = true;
  }
  const authorId = uint8ArrayToHex(envelope.header.creatorId);
  let content: string;
  let msgChannelId = channelId;
  try {
    const post = decodePost(envelope.payload);
    content = post.content;
    if (post.channelId) {
      msgChannelId = post.channelId;
    }
  } catch {
    content = new TextDecoder().decode(envelope.payload);
  }
  return {
    id: uint8ArrayToHex(envelope.headerHash),
    channelId: msgChannelId,
    authorId,
    authorName: knownAuthors.get(authorId) ?? authorId.slice(0, 8) + "…",
    content,
    timestamp: Date.now(),
    powScore: getPowScore(envelope.headerHash),
    flags: envelope.header.flags,
    rawEnvelope: encoded,
    verified,
    tampered,
  };
}
