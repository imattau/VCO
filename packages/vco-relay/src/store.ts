import { ClassicLevel } from "classic-level";
import { encodeEnvelopeProto, decodeEnvelopeProto, getPowScore, type NullifierStore } from "@vco/vco-core";
import type { VcoEnvelope } from "@vco/vco-core";
import { LRUCache } from "lru-cache";

export interface IRelayStore extends NullifierStore {
  /** Opens the underlying database. */
  open(): Promise<void>;
  /** Stores an envelope in the relay's persistent storage and update priority/context indexes. */
  put(envelope: VcoEnvelope): Promise<void>;
  /** Retrieves an envelope by its 32-byte header hash. */
  get(headerHash: Uint8Array): Promise<VcoEnvelope | undefined>;
  /** Checks if an envelope with the given header hash exists. */
  hasEnvelope(headerHash: Uint8Array): Promise<boolean>;
  /** Iterates over all stored envelope header hashes. */
  allHeaderHashes(): AsyncIterable<Uint8Array>;
  /** Iterates over header hashes matching the specified blind context ID. */
  getByContext(contextId: Uint8Array): AsyncIterable<Uint8Array>;
  /** Returns the header hash of the envelope with the lowest priority and work score. */
  worstEnvelopeHash(): Promise<Uint8Array | undefined>;
  /** Returns the PoW score of a given envelope hash. */
  powScore(headerHash: Uint8Array): Promise<number>;
  /** Deletes an envelope and its associated index entries. */
  evict(headerHash: Uint8Array): Promise<void>;
  /** Closes the underlying database. */
  close(): Promise<void>;
}

function toHex(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("hex");
}

function fromHex(hex: string): Uint8Array {
  return Uint8Array.from(Buffer.from(hex, "hex"));
}

function priorityScoreKey(priority: number, score: number, hashHex: string): string {
  return `idx:${priority}:${String(score).padStart(3, "0")}:${hashHex}`;
}

export class LevelDBRelayStore implements IRelayStore {
  private db: ClassicLevel<string, Uint8Array>;
  private readonly existenceCache: LRUCache<string, boolean>;
  private readonly envelopeCache: LRUCache<string, VcoEnvelope>;
  private readonly pendingNullifiers = new Set<string>();

  constructor(dataDir: string) {
    this.db = new ClassicLevel(dataDir, { valueEncoding: "buffer" });
    this.existenceCache = new LRUCache({ max: 10000 }); // Cache 10k existence checks
    this.envelopeCache = new LRUCache({ max: 1000 });   // Cache 1k full envelopes
  }

  async open(): Promise<void> {
    await this.db.open();
  }

  async testAndSet(nullifierHex: string): Promise<boolean> {
    if (this.pendingNullifiers.has(nullifierHex)) {
      return false;
    }

    // Synchronously reserve the nullifier to prevent concurrent async yields from entering.
    this.pendingNullifiers.add(nullifierHex);

    try {
      if (await this.has(nullifierHex)) {
        return false;
      }

      await this.add(nullifierHex);
      return true;
    } finally {
      this.pendingNullifiers.delete(nullifierHex);
    }
  }

  async has(nullifierHex: string): Promise<boolean> {
    try {
      await this.db.get(`nul:${nullifierHex}`);
      return true;
    } catch {
      return false;
    }
  }

  async add(nullifierHex: string): Promise<void> {
    await this.db.put(`nul:${nullifierHex}`, new Uint8Array(0));
  }

  async put(envelope: VcoEnvelope): Promise<void> {
    const hashHex = toHex(envelope.headerHash);
    const score = getPowScore(envelope.headerHash);
    const priority = envelope.header.priorityHint ?? 1;
    const encoded = encodeEnvelopeProto(envelope);
    const batch = this.db.batch();
    batch.put(`env:${hashHex}`, encoded);
    batch.put(priorityScoreKey(priority, score, hashHex), new Uint8Array(0));
    
    if (envelope.header.contextId) {
      batch.put(`ctx:${toHex(envelope.header.contextId)}:${hashHex}`, new Uint8Array(0));
    }
    
    await batch.write();
    
    this.existenceCache.set(hashHex, true);
    this.envelopeCache.set(hashHex, envelope);
  }

  async get(headerHash: Uint8Array): Promise<VcoEnvelope | undefined> {
    const hashHex = toHex(headerHash);
    const cached = this.envelopeCache.get(hashHex);
    if (cached) return cached;

    try {
      const encoded = await this.db.get(`env:${hashHex}`);
      const env = decodeEnvelopeProto(Uint8Array.from(encoded));
      const envelope = { ...env, payload: new Uint8Array(env.payload) };
      this.envelopeCache.set(hashHex, envelope);
      this.existenceCache.set(hashHex, true);
      return envelope;
    } catch {
      return undefined;
    }
  }

  async hasEnvelope(headerHash: Uint8Array): Promise<boolean> {
    const hashHex = toHex(headerHash);
    if (this.existenceCache.has(hashHex)) return true;

    try {
      await this.db.get(`env:${hashHex}`);
      this.existenceCache.set(hashHex, true);
      return true;
    } catch {
      return false;
    }
  }

  async *allHeaderHashes(): AsyncIterable<Uint8Array> {
    for await (const key of this.db.keys({ gte: "env:", lte: "env:~" })) {
      const hashHex = key.slice(4);
      this.existenceCache.set(hashHex, true);
      yield fromHex(hashHex);
    }
  }

  async *getByContext(contextId: Uint8Array): AsyncIterable<Uint8Array> {
    const ctxHex = toHex(contextId);
    for await (const key of this.db.keys({ gte: `ctx:${ctxHex}:`, lte: `ctx:${ctxHex}:~` })) {
      const parts = key.split(":");
      const hashHex = parts[2];
      this.existenceCache.set(hashHex, true);
      yield fromHex(hashHex);
    }
  }

  async worstEnvelopeHash(): Promise<Uint8Array | undefined> {
    for await (const key of this.db.keys({ gte: "idx:", lte: "idx:~", limit: 1 })) {
      const parts = key.split(":");
      return fromHex(parts[3]);
    }
    return undefined;
  }

  async powScore(headerHash: Uint8Array): Promise<number> {
    return getPowScore(headerHash);
  }

  async evict(headerHash: Uint8Array): Promise<void> {
    const hashHex = toHex(headerHash);
    const env = await this.get(headerHash);
    if (!env) return;

    const score = getPowScore(headerHash);
    const priority = env.header.priorityHint ?? 1;
    const batch = this.db.batch();
    batch.del(`env:${hashHex}`);
    batch.del(priorityScoreKey(priority, score, hashHex));
    
    if (env.header.contextId) {
      batch.del(`ctx:${toHex(env.header.contextId)}:${hashHex}`);
    }
    
    await batch.write();
    this.existenceCache.delete(hashHex);
    this.envelopeCache.delete(hashHex);
  }

  async close(): Promise<void> {
    await this.db.close();
  }
}
