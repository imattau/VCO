import { describe, it, expect } from "vitest";
import { toPlainObject, fromPlainObject } from "../src/serialization.js";

describe("Canonical Plain Object Serialization (ADR 0003)", () => {
  it("should roundtrip BigInt values", () => {
    const original = { amount: 1000n, timestamp: 1700000000000n };
    const plain = toPlainObject(original);
    
    expect(plain.amount).toBe("n:1000");
    expect(plain.timestamp).toBe("n:1700000000000");
    
    const revived = fromPlainObject(plain);
    expect(revived).toEqual(original);
    expect(typeof revived.amount).toBe("bigint");
  });

  it("should roundtrip Uint8Array values", () => {
    const bytes = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
    const original = { id: bytes };
    const plain = toPlainObject(original);
    
    expect(plain.id).toBe("h:deadbeef");
    
    const revived = fromPlainObject(plain);
    expect(revived.id).toBeInstanceOf(Uint8Array);
    expect(Array.from(revived.id)).toEqual([0xde, 0xad, 0xbe, 0xef]);
  });

  it("should handle nested structures and arrays", () => {
    const original = {
      items: [
        { id: new Uint8Array([1]), value: 10n },
        { id: new Uint8Array([2]), value: 20n }
      ],
      meta: {
        active: true,
        count: 2
      }
    };

    const plain = toPlainObject(original);
    expect(plain.items[0].id).toBe("h:01");
    expect(plain.items[1].value).toBe("n:20");

    const revived = fromPlainObject(plain);
    expect(revived).toEqual(original);
  });

  it("should be idempotent for JSON-native types", () => {
    const original = { name: "test", count: 123, flags: [true, false] };
    const plain = toPlainObject(original);
    expect(plain).toEqual(original);
    
    const revived = fromPlainObject(plain);
    expect(revived).toEqual(original);
  });

  it("should handle null and undefined", () => {
    expect(toPlainObject(null)).toBe(null);
    expect(toPlainObject(undefined)).toBe(undefined);
    expect(fromPlainObject(null)).toBe(null);
    expect(fromPlainObject(undefined)).toBe(undefined);
  });
});
