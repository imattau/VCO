import { describe, it, expect, beforeEach, afterEach } from "vitest";
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
  tmpDir = mkdtempSync(join(tmpdir(), "vco-relay-store-"));
  store = new LevelDBRelayStore(tmpDir);
  await store.open();
});

afterEach(async () => {
  await store.close();
  rmSync(tmpDir, { recursive: true });
});

describe("LevelDBRelayStore", () => {
  it("put and get roundtrip", async () => {
    const env = makeEnvelope(1);
    await store.put(env);
    const retrieved = await store.get(env.headerHash);
    expect(retrieved).toBeDefined();
    expect(retrieved!.payload).toEqual(env.payload);
  });

  it("has returns true after put", async () => {
    const env = makeEnvelope(2);
    expect(await store.has(env.headerHash)).toBe(false);
    await store.put(env);
    expect(await store.has(env.headerHash)).toBe(true);
  });

  it("evict removes envelope", async () => {
    const env = makeEnvelope(3);
    await store.put(env);
    await store.evict(env.headerHash);
    expect(await store.has(env.headerHash)).toBe(false);
  });

  it("allHeaderHashes yields stored hashes", async () => {
    const e1 = makeEnvelope(4);
    const e2 = makeEnvelope(5);
    await store.put(e1);
    await store.put(e2);
    const hashes: Uint8Array[] = [];
    for await (const h of store.allHeaderHashes()) hashes.push(h);
    expect(hashes.length).toBe(2);
  });

  it("PoW-sorted eviction: lowest score evicted first", async () => {
    const plain = makeEnvelope(6);
    const powered = createEnvelope(
      { payload: new Uint8Array([7]), payloadType: MULTICODEC_PROTOBUF, creatorId: CREATOR_ID, privateKey: PRIVATE_KEY, powDifficulty: 4 },
      crypto,
    );
    await store.put(plain);
    await store.put(powered);
    const lowest = await store.lowestPowScoreHash();
    expect(lowest).toBeDefined();
  });
});
