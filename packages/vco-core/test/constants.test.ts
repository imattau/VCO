import { describe, expect, it } from "vitest";
import { MAX_VCO_SIZE, PROTOCOL_VERSION, RECON_THRESHOLD } from "../src/index.js";

describe("core constants", () => {
  it("matches spec values", () => {
    expect(PROTOCOL_VERSION).toBe(0x03);
    expect(MAX_VCO_SIZE).toBe(4_194_304);
    expect(RECON_THRESHOLD).toBe(16);
  });
});
