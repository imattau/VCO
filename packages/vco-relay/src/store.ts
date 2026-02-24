import { ClassicLevel } from "classic-level";
import { encodeEnvelopeProto, decodeEnvelopeProto, getPowScore } from "@vco/vco-core";
import type { VcoEnvelope } from "@vco/vco-core";

export interface IRelayStore {
  open(): Promise<void>;
  put(envelope: VcoEnvelope): Promise<void>;
  get(headerHash: Uint8Array): Promise<VcoEnvelope | undefined>;
  has(headerHash: Uint8Array): Promise<boolean>;
  allHeaderHashes(): AsyncIterable<Uint8Array>;
  lowestPowScoreHash(): Promise<Uint8Array | undefined>;
  powScore(headerHash: Uint8Array): Promise<number>;
  evict(headerHash: Uint8Array): Promise<void>;
  close(): Promise<void>;
}

function toHex(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("hex");
}

function fromHex(hex: string): Uint8Array {
  return Uint8Array.from(Buffer.from(hex, "hex"));
}

function powScoreKey(score: number, hashHex: string): string {
  return `idx:${String(score).padStart(3, "0")}:${hashHex}`;
}

export class LevelDBRelayStore implements IRelayStore {
  private db: ClassicLevel<string, Uint8Array>;

  constructor(dataDir: string) {
    this.db = new ClassicLevel(dataDir, { valueEncoding: "buffer" });
  }

  async open(): Promise<void> {
    await this.db.open();
  }

  async put(envelope: VcoEnvelope): Promise<void> {
    const hashHex = toHex(envelope.headerHash);
    const score = getPowScore(envelope.headerHash);
    const encoded = encodeEnvelopeProto(envelope);
    const batch = this.db.batch();
    batch.put(`env:${hashHex}`, encoded);
    batch.put(powScoreKey(score, hashHex), new Uint8Array(0));
    await batch.write();
  }

  async get(headerHash: Uint8Array): Promise<VcoEnvelope | undefined> {
    try {
      const encoded = await this.db.get(`env:${toHex(headerHash)}`);
      const env = decodeEnvelopeProto(Uint8Array.from(encoded));
      return { ...env, payload: new Uint8Array(env.payload) };
    } catch {
      return undefined;
    }
  }

  async has(headerHash: Uint8Array): Promise<boolean> {
    try {
      await this.db.get(`env:${toHex(headerHash)}`);
      return true;
    } catch {
      return false;
    }
  }

  async *allHeaderHashes(): AsyncIterable<Uint8Array> {
    for await (const key of this.db.keys({ gte: "env:", lte: "env:~" })) {
      yield fromHex(key.slice(4));
    }
  }

  async lowestPowScoreHash(): Promise<Uint8Array | undefined> {
    for await (const key of this.db.keys({ gte: "idx:", lte: "idx:~", limit: 1 })) {
      const parts = key.split(":");
      return fromHex(parts[2]);
    }
    return undefined;
  }

  async powScore(headerHash: Uint8Array): Promise<number> {
    return getPowScore(headerHash);
  }

  async evict(headerHash: Uint8Array): Promise<void> {
    const hashHex = toHex(headerHash);
    const score = getPowScore(headerHash);
    const batch = this.db.batch();
    batch.del(`env:${hashHex}`);
    batch.del(powScoreKey(score, hashHex));
    await batch.write();
  }

  async close(): Promise<void> {
    await this.db.close();
  }
}
