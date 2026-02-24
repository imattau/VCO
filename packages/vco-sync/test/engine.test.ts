import { describe, expect, it } from "vitest";
import {
  RECON_THRESHOLD,
  ReconciliationEngine,
  ReconciliationState,
  type ReconciliationItem,
} from "../src/index.js";

function id(byte: number): Uint8Array {
  return new Uint8Array(32).fill(byte);
}

function item(timestamp: number, value: number): ReconciliationItem {
  return { timestamp, id: id(value) };
}

function hex(value: Uint8Array): string {
  return Buffer.from(value).toString("hex");
}

describe("ReconciliationEngine", () => {
  it("starts in INIT with full hash range and default settings", () => {
    const engine = new ReconciliationEngine();

    expect(engine.snapshot()).toEqual({
      state: ReconciliationState.INIT,
      fullRange: { start: 0x00, end: 0xff },
      reconThreshold: RECON_THRESHOLD,
      frameSizeLimit: 50_000,
    });
  });

  it("enters TERMINATED when roots match", () => {
    const engine = new ReconciliationEngine();
    const root = new Uint8Array([1, 2, 3]);

    engine.begin(root);
    expect(engine.compare(root, root)).toBe(ReconciliationState.TERMINATED);
  });

  it("enters BISECT when roots do not match", () => {
    const engine = new ReconciliationEngine();
    const localRoot = new Uint8Array([1, 2, 3]);
    const remoteRoot = new Uint8Array([1, 2, 4]);

    engine.begin(localRoot);
    expect(engine.compare(localRoot, remoteRoot)).toBe(ReconciliationState.BISECT);
  });

  it("bisects inclusive ranges into contiguous halves", () => {
    const engine = new ReconciliationEngine();
    const [left, right] = engine.bisect({ start: 0x00, end: 0xff });

    expect(left).toEqual({ start: 0x00, end: 0x7f });
    expect(right).toEqual({ start: 0x80, end: 0xff });
  });

  it("reconciles equal sets to TERMINATED", async () => {
    const engine = new ReconciliationEngine();
    const local = [item(1, 0x11), item(2, 0x22), item(3, 0x33)];
    const remote = [item(1, 0x11), item(2, 0x22), item(3, 0x33)];

    const result = await engine.reconcile(local, remote);

    expect(result.state).toBe(ReconciliationState.TERMINATED);
    expect(result.rounds).toBeGreaterThan(0);
    expect(result.need.size).toBe(0);
    expect(result.have.size).toBe(0);
  });

  it("reconciles small diffs to EXCHANGE and returns have/need IDs", async () => {
    const engine = new ReconciliationEngine({ reconThreshold: 16 });
    const localOnly = item(2, 0x44);
    const remoteOnly = item(3, 0x55);
    const local = [item(1, 0x11), localOnly];
    const remote = [item(1, 0x11), remoteOnly];

    const result = await engine.reconcile(local, remote);

    expect(result.state).toBe(ReconciliationState.EXCHANGE);
    expect(result.need).toEqual(new Set([hex(remoteOnly.id)]));
    expect(result.have).toEqual(new Set([hex(localOnly.id)]));
  });

  it("reconciles large diffs to RECURSE", async () => {
    const engine = new ReconciliationEngine({ reconThreshold: 2 });
    const local = Array.from({ length: 6 }, (_, index) => item(index + 1, 0x20 + index));
    const remote = Array.from({ length: 6 }, (_, index) => item(index + 1, 0x70 + index));

    const result = await engine.reconcile(local, remote);

    expect(result.state).toBe(ReconciliationState.RECURSE);
    expect(result.need.size).toBe(6);
    expect(result.have.size).toBe(6);
  });

  it("rejects invalid item IDs before reconciliation", async () => {
    const engine = new ReconciliationEngine();
    const invalid = { timestamp: 1, id: new Uint8Array(31) };

    await expect(async () => {
      await engine.reconcile([invalid], []);
    }).rejects.toThrow(/must be 32 bytes/i);
  });
});
