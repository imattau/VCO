import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { LevelDBRelayStore } from "../src/store.js";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createEnvelope, type VcoEnvelope, MULTICODEC_PROTOBUF } from "@vco/vco-core";
import { NobleCryptoProvider, deriveEd25519Multikey } from "@vco/vco-crypto";

const crypto = new NobleCryptoProvider();
const PRIVATE_KEY = new Uint8Array(32).fill(1);
const CREATOR_ID = deriveEd25519Multikey(PRIVATE_KEY);

function makeEnvelope(payloadByte: number): VcoEnvelope {
  return createEnvelope(
    { payload: new Uint8Array([payloadByte]), payloadType: MULTICODEC_PROTOBUF, creatorId: CREATOR_ID, privateKey: PRIVATE_KEY },
    crypto,
  );
}

let tmpDir: string;
let store: LevelDBRelayStore;

beforeEach(async () => {
  tmpDir = mkdtempSync(join(tmpdir(), "vco-relay-store-failures-"));
  store = new LevelDBRelayStore(tmpDir);
  await store.open();
});

afterEach(async () => {
  await store.close();
  rmSync(tmpDir, { recursive: true });
});

describe("LevelDBRelayStore failure handling", () => {
  it("rejects when underlying put fails", async () => {
    const env = makeEnvelope(1);
    // Monkey-patch the internal db to simulate a write failure
    const db = (store as any).db;
    const origPut = db.put.bind(db);
    vi.spyOn(db, "put").mockRejectedValueOnce(new Error("Simulated write failure"));

    await expect(store.put(env)).rejects.toThrow("Simulated write failure");

    // Restore and verify the store still works
    vi.restoreAllMocks();
    await expect(store.put(env)).resolves.not.toThrow();
  });

  it("rejects when underlying get fails", async () => {
    const env = makeEnvelope(2);
    await store.put(env);

    const db = (store as any).db;
    vi.spyOn(db, "get").mockRejectedValueOnce(new Error("Simulated read failure"));

    await expect(store.get(env.headerHash)).rejects.toThrow("Simulated read failure");

    vi.restoreAllMocks();
    const retrieved = await store.get(env.headerHash);
    expect(retrieved).toBeDefined();
  });

  it("concurrent writes do not corrupt data", async () => {
    const envelopes = Array.from({ length: 20 }, (_, i) => makeEnvelope(i + 10));

    // Fire all puts simultaneously
    await Promise.all(envelopes.map((env) => store.put(env)));

    // Verify all envelopes are present
    for (const env of envelopes) {
      const retrieved = await store.get(env.headerHash);
      expect(retrieved).toBeDefined();
      expect(retrieved!.payload).toEqual(env.payload);
    }
  });

  it("get returns undefined for unknown hash (not a rejection)", async () => {
    const unknownHash = new Uint8Array(32).fill(0xff);
    const result = await store.get(unknownHash);
    expect(result).toBeUndefined();
  });
});
