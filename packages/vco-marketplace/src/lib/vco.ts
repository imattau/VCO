// packages/vco-cord/src/lib/vco.ts

import {
  createEnvelope,
  encodeEnvelopeProto,
  decodeEnvelopeProto,
  getPowScore,
  MULTICODEC_PROTOBUF,
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
  decodeReceipt as decodeReceiptSchema
} from "@vco/vco-schemas";
import {
  createNobleCryptoProvider,
  deriveEd25519Multikey,
  deriveEd25519PublicKey,
} from "@vco/vco-crypto";
import type { Identity } from "../types/index.js";
import type { ListingWithMetadata, OfferWithMetadata, ReceiptWithMetadata } from "../features/listings/MarketplaceContext.js";

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

export async function buildListing(
  data: { title: string; description: string; priceSats: bigint },
  identity: Identity,
): Promise<ListingWithMetadata> {
  const payload = encodeListing({
    schema: LISTING_SCHEMA_URI,
    title: data.title,
    description: data.description,
    priceSats: data.priceSats,
    mediaCids: [],
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
    },
    crypto,
  );

  return {
    id: uint8ArrayToHex(envelope.headerHash),
    schema: LISTING_SCHEMA_URI,
    title: data.title,
    description: data.description,
    priceSats: data.priceSats,
    mediaCids: [],
    expiryMs: BigInt(Date.now() + 30 * 24 * 60 * 60 * 1000),
    previousCid: new Uint8Array(32),
    authorId: uint8ArrayToHex(identity.creatorId),
    authorName: identity.displayName,
    powScore: getPowScore(envelope.headerHash),
    timestamp: Date.now(),
  };
}

export function decodeListingEnvelope(
  encoded: Uint8Array,
  knownAuthors: Map<string, string>,
): ListingWithMetadata {
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
): OfferWithMetadata {
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
): ReceiptWithMetadata {
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
