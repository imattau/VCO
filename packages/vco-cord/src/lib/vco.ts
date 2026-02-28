// packages/vco-cord/src/lib/vco.ts

import {
  createEnvelope,
  encodeEnvelopeProto,
  decodeEnvelopeProto,
  assertEnvelopeIntegrity,
  getPowScore,
  MULTICODEC_PROTOBUF,
} from "@vco/vco-core";
import { encodePost, decodePost, POST_SCHEMA_URI } from "@vco/vco-schemas";
import {
  createNobleCryptoProvider,
  deriveEd25519Multikey,
  deriveEd25519PublicKey,
} from "@vco/vco-crypto";
import type { Identity, VcoMessage } from "../types/index.js";

const crypto = createNobleCryptoProvider();

export function generateIdentity(displayName: string): Identity {
  const privateKey = globalThis.crypto.getRandomValues(new Uint8Array(32));
  const publicKey = deriveEd25519PublicKey(privateKey);
  const creatorId = deriveEd25519Multikey(privateKey);
  return { privateKey, publicKey, creatorId, displayName };
}

export function uint8ArrayToHex(arr: Uint8Array): string {
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const POW_DIFFICULTY = 4;

export async function buildMessage(
  channelId: string,
  content: string,
  identity: Identity,
): Promise<VcoMessage> {
  const payload = encodePost({
    schema: POST_SCHEMA_URI,
    content,
    mediaCids: [],
    timestampMs: BigInt(Date.now()),
    channelId,
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
  try {
    const post = decodePost(envelope.payload);
    content = post.content;
  } catch {
    content = new TextDecoder().decode(envelope.payload);
  }
  return {
    id: uint8ArrayToHex(envelope.headerHash),
    channelId,
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
