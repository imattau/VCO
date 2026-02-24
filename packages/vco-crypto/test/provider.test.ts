import { describe, expect, it } from "vitest";
import { createCryptoProvider } from "../src/index.js";

describe("createCryptoProvider", () => {
  it("throws until a concrete adapter is configured", () => {
    const provider = createCryptoProvider();
    expect(() => provider.digest(new Uint8Array([1]))).toThrow(/No crypto provider configured/);
  });
});
