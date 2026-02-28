// packages/vco-simulator/src/lib/vco.ts

import {
  createEnvelope,
  encodeEnvelopeProto,
  decodeEnvelopeProto,
  getPowScore,
  MULTICODEC_PROTOBUF,
  deriveContextId
} from "@vco/vco-core";
import { 
  LISTING_SCHEMA_URI,
  encodeListing,
  decodeListing as decodeListingSchema,
  OFFER_SCHEMA_URI,
  encodeOffer,
  decodeOffer,
  RECEIPT_SCHEMA_URI,
  encodeReceipt,
  decodeReceipt as decodeReceiptSchema,
  FILE_DESCRIPTOR_SCHEMA_URI,
  encodeFileDescriptor,
  SEQUENCE_MANIFEST_SCHEMA_URI,
  encodeSequenceManifest
} from "@vco/vco-schemas";
import {
  createNobleCryptoProvider,
  deriveEd25519Multikey,
  deriveEd25519PublicKey,
} from "@vco/vco-crypto";
import type { Identity } from "../types/index.js";

const crypto = createNobleCryptoProvider();
const RAW_CODEC = 0x55;
const CHUNK_SIZE = 16384; // 16KB chunks

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
const FLAG_ZKP_AUTH = 1 << 4;

export async function buildListing(
  data: { title: string; description: string; priceSats: bigint; mediaCids?: string[]; contextId?: Uint8Array },
  identity: Identity,
): Promise<any> {
  const mediaCidsBytes = (data.mediaCids ?? []).map(cid => hexToUint8Array(cid));
  
  const payload = encodeListing({
    schema: LISTING_SCHEMA_URI,
    title: data.title,
    description: data.description,
    priceSats: data.priceSats,
    mediaCids: mediaCidsBytes,
    expiryMs: BigInt(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    previousCid: new Uint8Array(32),
  });

  const envelope = createEnvelope(
    {
      payload,
      payloadType: MULTICODEC_PROTOBUF,
      creatorId: identity.creatorId,
      privateKey: identity.privateKey,
      powDifficulty: POW_DIFFICULTY,
      contextId: data.contextId,
    },
    crypto,
  );

  return {
    id: uint8ArrayToHex(envelope.headerHash),
    schema: LISTING_SCHEMA_URI,
    title: data.title,
    description: data.description,
    priceSats: data.priceSats,
    mediaCids: mediaCidsBytes,
    expiryMs: BigInt(Date.now() + 30 * 24 * 60 * 60 * 1000),
    previousCid: new Uint8Array(32),
    authorId: uint8ArrayToHex(identity.creatorId),
    authorName: identity.displayName,
    powScore: getPowScore(envelope.headerHash),
    timestamp: Date.now(),
    contextId: data.contextId ? uint8ArrayToHex(data.contextId) : undefined,
  };
}

export async function buildZkpListing(
  data: { title: string; description: string; priceSats: bigint; contextId?: Uint8Array },
): Promise<any> {
  const payload = encodeListing({
    schema: LISTING_SCHEMA_URI,
    title: data.title,
    description: data.description,
    priceSats: data.priceSats,
    mediaCids: [],
    expiryMs: BigInt(Date.now() + 30 * 24 * 60 * 60 * 1000),
    previousCid: new Uint8Array(32),
  });

  // Simulated ZKP generation
  const nullifier = globalThis.crypto.getRandomValues(new Uint8Array(32));
  const proof = globalThis.crypto.getRandomValues(new Uint8Array(128));

  const envelope = createEnvelope(
    {
      payload,
      payloadType: MULTICODEC_PROTOBUF,
      // In ZKP mode, creatorId and privateKey are not used for signing the header
      creatorId: new Uint8Array(32), 
      privateKey: new Uint8Array(32), 
      powDifficulty: POW_DIFFICULTY,
      contextId: data.contextId,
      zkpExtension: {
        circuitId: 1, // "Membership"
        proof,
        proofLength: proof.length,
        publicInputs: new Uint8Array(32),
        inputsLength: 32,
        nullifier,
      }
    },
    crypto,
  );

  // Manually set the ZKP_AUTH flag
  envelope.header.flags |= FLAG_ZKP_AUTH;

  return {
    id: uint8ArrayToHex(envelope.headerHash),
    schema: LISTING_SCHEMA_URI,
    title: data.title,
    description: data.description,
    priceSats: data.priceSats,
    mediaCids: [],
    authorId: "00".repeat(32), // Anonymous
    authorName: "Anonymous Member",
    powScore: getPowScore(envelope.headerHash),
    timestamp: Date.now(),
    isZkp: true,
    nullifier: uint8ArrayToHex(nullifier),
    contextId: data.contextId ? uint8ArrayToHex(data.contextId) : undefined,
  };
}

export function decodeListingEnvelope(
  encoded: Uint8Array,
  knownAuthors: Map<string, string>,
): any {
  const envelope = decodeEnvelopeProto(encoded);
  const authorId = uint8ArrayToHex(envelope.header.creatorId);
  const data = decodeListingSchema(envelope.payload);

  return {
    ...data,
    id: uint8ArrayToHex(envelope.headerHash),
    authorId,
    authorName: knownAuthors.get(authorId) ?? authorId.slice(0, 8) + "…",
    powScore: getPowScore(envelope.headerHash),
    timestamp: Date.now(),
  };
}

export async function buildOffer(
  data: { listingId: string; offerSats: bigint; message: string },
  identity: Identity,
): Promise<Uint8Array> {
  const payload = encodeOffer({
    schema: OFFER_SCHEMA_URI,
    listingCid: hexToUint8Array(data.listingId),
    offerSats: data.offerSats,
    message: data.message,
    timestampMs: BigInt(Date.now()),
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

  return encodeEnvelopeProto(envelope);
}

export function decodeOfferEnvelope(
  encoded: Uint8Array,
  knownAuthors: Map<string, string>,
): any {
  const envelope = decodeEnvelopeProto(encoded);
  const authorId = uint8ArrayToHex(envelope.header.creatorId);
  const data = decodeOffer(envelope.payload);

  return {
    id: uint8ArrayToHex(envelope.headerHash),
    listingId: uint8ArrayToHex(data.listingCid),
    offerSats: data.offerSats,
    message: data.message,
    authorId,
    authorName: knownAuthors.get(authorId) ?? authorId.slice(0, 8) + "…",
    timestamp: Date.now(),
  };
}

export async function buildReceipt(
  data: { listingId: string; offerId: string; txId: string },
  identity: Identity,
): Promise<Uint8Array> {
  const payload = encodeReceipt({
    schema: RECEIPT_SCHEMA_URI,
    listingCid: hexToUint8Array(data.listingId),
    offerCid: hexToUint8Array(data.offerId),
    txId: data.txId,
    timestampMs: BigInt(Date.now()),
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

  return encodeEnvelopeProto(envelope);
}

export function decodeReceiptEnvelope(
  encoded: Uint8Array,
  knownAuthors: Map<string, string>,
): any {
  const envelope = decodeEnvelopeProto(encoded);
  const authorId = uint8ArrayToHex(envelope.header.creatorId);
  const data = decodeReceiptSchema(envelope.payload);

  return {
    id: uint8ArrayToHex(envelope.headerHash),
    listingId: uint8ArrayToHex(data.listingCid),
    offerId: uint8ArrayToHex(data.offerCid),
    txId: data.txId,
    timestampMs: data.timestampMs,
    authorId,
    authorName: knownAuthors.get(authorId) ?? authorId.slice(0, 8) + "…",
    timestamp: Date.now(),
  };
}

/**
 * Splits a file into VCO chunks, creates a manifest and a descriptor.
 * Returns the FileDescriptor CID and the list of all created envelopes (simulated storage).
 */
export async function buildVcoFile(
  file: { name: string; type: string; data: Uint8Array },
  identity: Identity,
): Promise<{ descriptorCid: string; envelopes: Map<string, Uint8Array> }> {
  const envelopes = new Map<string, Uint8Array>();
  const chunkCids: Uint8Array[] = [];

  // 1. Create Chunks
  for (let i = 0; i < file.data.length; i += CHUNK_SIZE) {
    const chunkData = file.data.slice(i, i + CHUNK_SIZE);
    const env = createEnvelope({
      payload: chunkData,
      payloadType: RAW_CODEC,
      creatorId: identity.creatorId,
      privateKey: identity.privateKey,
      powDifficulty: 0,
    }, crypto);
    
    const cid = uint8ArrayToHex(env.headerHash);
    envelopes.set(cid, encodeEnvelopeProto(env));
    chunkCids.push(env.headerHash);
  }

  // 2. Create Manifest
  const manifestPayload = encodeSequenceManifest({
    schema: SEQUENCE_MANIFEST_SCHEMA_URI,
    chunkCids,
    totalSize: BigInt(file.data.length),
    mimeType: file.type,
    previousManifest: new Uint8Array(32),
  });

  const manifestEnv = createEnvelope({
    payload: manifestPayload,
    payloadType: MULTICODEC_PROTOBUF,
    creatorId: identity.creatorId,
    privateKey: identity.privateKey,
    powDifficulty: 0,
  }, crypto);

  const manifestCid = uint8ArrayToHex(manifestEnv.headerHash);
  envelopes.set(manifestCid, encodeEnvelopeProto(manifestEnv));

  // 3. Create Descriptor
  const descriptorPayload = encodeFileDescriptor({
    schema: FILE_DESCRIPTOR_SCHEMA_URI,
    name: file.name,
    mimeType: file.type,
    size: BigInt(file.data.length),
    rootManifestCid: manifestEnv.headerHash,
    previousCid: new Uint8Array(32),
    timestampMs: BigInt(Date.now()),
  });

  const descriptorEnv = createEnvelope({
    payload: descriptorPayload,
    payloadType: MULTICODEC_PROTOBUF,
    creatorId: identity.creatorId,
    privateKey: identity.privateKey,
    powDifficulty: 2,
  }, crypto);

  const descriptorCid = uint8ArrayToHex(descriptorEnv.headerHash);
  envelopes.set(descriptorCid, encodeEnvelopeProto(descriptorEnv));

  return { descriptorCid, envelopes };
}

/**
 * Public utility to derive context ID from a topic string.
 */
export function deriveSimulatorContextId(topic: string): Uint8Array {
  return deriveContextId(topic, crypto.digest.bind(crypto));
}
