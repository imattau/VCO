import { describe, it, expect } from "vitest";
import { encodeListing, decodeListing, LISTING_SCHEMA_URI } from "../marketplace/listing.js";
import { encodeOffer, decodeOffer, OFFER_SCHEMA_URI } from "../marketplace/offer.js";
import { encodeReceipt, decodeReceipt, RECEIPT_SCHEMA_URI } from "../marketplace/receipt.js";

const cid = () => new Uint8Array(34).fill(0xcd);

describe("Listing roundtrip", () => {
  it("roundtrips all fields", () => {
    const bytes = encodeListing({ schema: LISTING_SCHEMA_URI, title: "Widget", description: "A widget", priceSats: 1000n, mediaCids: [cid()], expiryMs: 0n, previousCid: new Uint8Array(0) });
    const d = decodeListing(bytes);
    expect(d.title).toBe("Widget");
    expect(d.priceSats).toBe(1000n);
    expect(d.mediaCids).toHaveLength(1);
    expect(d.mediaCids[0]).toEqual(cid());
  });
});

describe("Offer roundtrip", () => {
  it("roundtrips all fields", () => {
    const bytes = encodeOffer({ schema: OFFER_SCHEMA_URI, listingCid: cid(), offerSats: 900n, message: "Deal?", timestampMs: 0n });
    const d = decodeOffer(bytes);
    expect(d.offerSats).toBe(900n);
    expect(d.listingCid).toEqual(cid());
    expect(d.message).toBe("Deal?");
  });
});

describe("Receipt roundtrip", () => {
  it("roundtrips all fields", () => {
    const bytes = encodeReceipt({ schema: RECEIPT_SCHEMA_URI, listingCid: cid(), offerCid: cid(), txId: "abc123", timestampMs: 0n });
    const d = decodeReceipt(bytes);
    expect(d.txId).toBe("abc123");
    expect(d.listingCid).toEqual(cid());
  });
});
