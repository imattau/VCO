import { Listing } from "../generated/marketplace/listing.pb.js";
export const LISTING_SCHEMA_URI = "vco://schemas/marketplace/listing/v1";
export interface ListingData { schema: string; title: string; description: string; priceSats: bigint; mediaCids: Uint8Array[]; expiryMs: bigint; previousCid: Uint8Array; }
export function encodeListing(d: ListingData): Uint8Array {
  return Listing.encode(Listing.create({ schema: d.schema, title: d.title, description: d.description, priceSats: Number(d.priceSats), mediaCids: d.mediaCids, expiryMs: Number(d.expiryMs), previousCid: d.previousCid })).finish();
}
export function decodeListing(bytes: Uint8Array): ListingData {
  const m = Listing.decode(bytes);
  return { schema: m.schema, title: m.title, description: m.description, priceSats: BigInt(m.priceSats as number), mediaCids: m.mediaCids.map(c => new Uint8Array(c)), expiryMs: BigInt(m.expiryMs as number), previousCid: new Uint8Array(m.previousCid) };
}
