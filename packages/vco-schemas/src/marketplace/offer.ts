import { Offer } from "../generated/marketplace/offer.pb.js";
export const OFFER_SCHEMA_URI = "vco://schemas/marketplace/offer/v1";
export interface OfferData { schema: string; listingCid: Uint8Array; offerSats: bigint; message: string; timestampMs: bigint; }
export function encodeOffer(d: OfferData): Uint8Array {
  return Offer.encode(Offer.create({ schema: d.schema, listingCid: d.listingCid, offerSats: Number(d.offerSats), message: d.message, timestampMs: Number(d.timestampMs) })).finish();
}
export function decodeOffer(bytes: Uint8Array): OfferData {
  const m = Offer.decode(bytes);
  return { schema: m.schema, listingCid: new Uint8Array(m.listingCid), offerSats: BigInt(m.offerSats as number), message: m.message, timestampMs: BigInt(m.timestampMs as number) };
}
