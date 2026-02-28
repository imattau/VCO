/** @vitest-environment node */
import { describe, it, expect } from "vitest";
import { buildListing, buildReceipt, initializeIdentity, buildVcoFile } from "../lib/vco.js";
import { LISTING_SCHEMA_URI } from "@vco/vco-schemas";

describe("Marketplace App Logic", () => {
  it("buildListing creates a valid verifiable listing object", async () => {
    const identity = initializeIdentity("Seller");
    const data = {
      title: "VCO Laptop",
      description: "Fast and verifiable",
      priceSats: 50000n
    };

    const listing = await buildListing(data, identity);
    
    expect(listing.schema).toBe(LISTING_SCHEMA_URI);
    expect(listing.title).toBe(data.title);
    expect(listing.priceSats).toBe(data.priceSats);
    expect(listing.authorName).toBe("Seller");
    expect(listing.id).toBeDefined();
  });

  it("buildReceipt creates a valid verifiable receipt object", async () => {
    const identity = initializeIdentity("Seller");
    const data = {
      listingId: "00".repeat(32),
      offerId: "11".repeat(32),
      txId: "tx123"
    };

    const encoded = await buildReceipt(data, identity);
    expect(encoded).toBeInstanceOf(Uint8Array);
    expect(encoded.length).toBeGreaterThan(0);
  });

  it("buildVcoFile chunks data and creates manifest/descriptor", async () => {
    const identity = initializeIdentity("Uploader");
    const file = {
      name: "test.png",
      type: "image/png",
      data: new Uint8Array(20000) // Slightly more than one 16KB chunk
    };

    const { descriptorCid, envelopes } = await buildVcoFile(file, identity);
    
    expect(descriptorCid).toBeDefined();
    expect(envelopes.size).toBe(4); // 2 chunks + 1 manifest + 1 descriptor
    expect(envelopes.has(descriptorCid)).toBe(true);
  });
});
