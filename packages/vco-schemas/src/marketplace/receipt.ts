import { Receipt } from "../generated/marketplace/receipt.pb.js";
export const RECEIPT_SCHEMA_URI = "vco://schemas/marketplace/receipt/v1";
export interface ReceiptData { schema: string; listingCid: Uint8Array; offerCid: Uint8Array; txId: string; timestampMs: bigint; }
export function encodeReceipt(d: ReceiptData): Uint8Array {
  return Receipt.encode(Receipt.create({ schema: d.schema, listingCid: d.listingCid, offerCid: d.offerCid, txId: d.txId, timestampMs: Number(d.timestampMs) })).finish();
}
export function decodeReceipt(bytes: Uint8Array): ReceiptData {
  const m = Receipt.decode(bytes);
  return { schema: m.schema, listingCid: new Uint8Array(m.listingCid), offerCid: new Uint8Array(m.offerCid), txId: m.txId, timestampMs: BigInt(m.timestampMs as number) };
}
