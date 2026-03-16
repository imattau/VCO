import { describe, expect, it } from "vitest";
import { reconcileWithNegentropy } from "../src/negentropy-adapter.js";
import type { ReconciliationItem } from "../src/types.js";

function mockId(byte: number): Uint8Array {
  const id = new Uint8Array(32);
  id.fill(byte);
  return id;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

describe("negentropy-adapter", () => {
  it("reconciles identical sets with zero needs/haves", async () => {
    const items: ReconciliationItem[] = [
      { timestamp: 1000, id: mockId(1) },
      { timestamp: 2000, id: mockId(2) },
    ];

    const result = await reconcileWithNegentropy(items, items, 4096);

    expect(result.need.size).toBe(0);
    expect(result.have.size).toBe(0);
    expect(result.rounds).toBeGreaterThan(0);
  });

  it("identifies missing items on local side (need)", async () => {
    const item1 = { timestamp: 1000, id: mockId(1) };
    const item2 = { timestamp: 2000, id: mockId(2) };

    const localItems = [item1];
    const remoteItems = [item1, item2];

    const result = await reconcileWithNegentropy(localItems, remoteItems, 4096);

    expect(result.need.size).toBe(1);
    expect(result.need.has(toHex(item2.id))).toBe(true);
    expect(result.have.size).toBe(0);
  });

  it("identifies extra items on local side (have)", async () => {
    const item1 = { timestamp: 1000, id: mockId(1) };
    const item2 = { timestamp: 2000, id: mockId(2) };

    const localItems = [item1, item2];
    const remoteItems = [item1];

    const result = await reconcileWithNegentropy(localItems, remoteItems, 4096);

    expect(result.need.size).toBe(0);
    expect(result.have.size).toBe(1);
    expect(result.have.has(toHex(item2.id))).toBe(true);
  });

  it("handles complex diffs", async () => {
    const common = { timestamp: 100, id: mockId(10) };
    const localOnly = { timestamp: 200, id: mockId(20) };
    const remoteOnly = { timestamp: 300, id: mockId(30) };

    const localItems = [common, localOnly];
    const remoteItems = [common, remoteOnly];

    const result = await reconcileWithNegentropy(localItems, remoteItems, 4096);

    expect(result.need.size).toBe(1);
    expect(result.need.has(toHex(remoteOnly.id))).toBe(true);
    expect(result.have.size).toBe(1);
    expect(result.have.has(toHex(localOnly.id))).toBe(true);
  });

  it("throws on invalid item timestamp", async () => {
    const items = [{ timestamp: -1, id: mockId(1) }];
    await expect(reconcileWithNegentropy(items, [], 4096)).rejects.toThrow(/timestamp must be a non-negative integer/);
  });

  it("throws on invalid item id size", async () => {
    const items = [{ timestamp: 1000, id: new Uint8Array(16) }];
    await expect(reconcileWithNegentropy(items, [], 4096)).rejects.toThrow(/id must be 32 bytes/);
  });
});
