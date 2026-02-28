/** @vitest-environment node */
import { describe, it, expect, vi } from "vitest";
import { buildListing, initializeIdentity } from "../lib/vco.js";
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
});
