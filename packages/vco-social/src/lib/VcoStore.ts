import { toHex } from "./encoding";
import type { VcoEnvelope } from "@vco/vco-core";
import { getPlatform } from "./platform";

const DB_NAME_BASE = "vco_social_db";
const DB_VERSION = 4;

export interface StoredEnvelope {
  cid: string;
  channelId: string;
  payload: string; // Base64
  timestamp: number;
  syncStatus?: 'pending' | 'synced';
  headerHash?: string; // hex-encoded
}

export class VcoStore {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;
  private profile: string | null = null;

  /**
   * Internal helper to get the active storage profile.
   */
  private async getStorageProfile(): Promise<string> {
    if (this.profile && this.profile !== "default") return this.profile;
    
    this.profile = await getPlatform().getVcoProfile();
    return this.profile;
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = (async () => {
      const profile = await this.getStorageProfile();
      const dbName = `${DB_NAME_BASE}_${profile}`;
      
      console.log(`VcoStore: Opening database [${dbName}] (v${DB_VERSION})`);

      return new Promise<IDBDatabase>((resolve, reject) => {
        const request = getPlatform().getIndexedDB().open(dbName, DB_VERSION);

        request.onupgradeneeded = (event: any) => {
          const db = request.result;
          const oldVersion = event.oldVersion;
          console.log(`VcoStore: Upgrading [${dbName}] from v${oldVersion} to v${DB_VERSION}`);

          if (oldVersion < 1) {
            const envelopeStore = db.createObjectStore("envelopes", { keyPath: "cid" });
            envelopeStore.createIndex("by_channel", "channelId", { unique: false });
            envelopeStore.createIndex("by_timestamp", "timestamp", { unique: false });

            db.createObjectStore("profiles", { keyPath: "creatorId" });
            db.createObjectStore("blobs", { keyPath: "cid" });
            db.createObjectStore("notifications", { keyPath: "cid" });
          }

          if (oldVersion < 2) {
            const tx = request.transaction;
            if (tx) {
              const envelopeStore = tx.objectStore("envelopes");
              if (!envelopeStore.indexNames.contains("by_sync")) {
                envelopeStore.createIndex("by_sync", "syncStatus", { unique: false });
              }
            }
          }

          if (oldVersion < 3) {
            const tx = request.transaction;
            if (tx) {
              const blobStore = tx.objectStore("blobs");
              if (!blobStore.indexNames.contains("by_updated")) {
                blobStore.createIndex("by_updated", "updatedAt", { unique: false });
              }
            }
          }

          if (oldVersion < 4) {
            const tx = request.transaction;
            if (tx) {
              const envelopeStore = tx.objectStore("envelopes");
              if (!envelopeStore.indexNames.contains("by_header_hash")) {
                envelopeStore.createIndex("by_header_hash", "headerHash", { unique: false });
              }
            }
          }
        };

        request.onsuccess = () => {
          this.db = request.result;
          console.log(`VcoStore: Database [${dbName}] ready.`);
          resolve(this.db);
        };

        request.onerror = () => {
          console.error(`VcoStore: Failed to open database [${dbName}]`, request.error);
          this.dbPromise = null;
          reject(request.error);
        };
      });
    })();

    return this.dbPromise;
  }

  async putEnvelope(envelope: StoredEnvelope): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("envelopes", "readwrite");
      const store = tx.objectStore("envelopes");
      const request = store.put(envelope);

      tx.oncomplete = () => resolve();
      tx.onerror = () => {
        console.error("VcoStore: putEnvelope transaction failed", tx.error);
        reject(tx.error);
      };
      tx.onabort = () => reject(new Error('Transaction aborted'));
    });
  }

  async getEnvelopesPaged(limit: number, beforeTimestamp?: number): Promise<StoredEnvelope[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("envelopes", "readonly");
      const store = tx.objectStore("envelopes");
      const index = store.index("by_timestamp");

      const results: StoredEnvelope[] = [];
      const range = beforeTimestamp ? IDBKeyRange.upperBound(beforeTimestamp, true) : null;
      const request = index.openCursor(range, "prev");

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor && results.length < limit) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
      tx.onabort = () => reject(new Error('Transaction aborted'));
    });
  }

  async getAllEnvelopes(): Promise<StoredEnvelope[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("envelopes", "readonly");
      const store = tx.objectStore("envelopes");
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
      tx.onabort = () => reject(new Error('Transaction aborted'));
    });
  }

  async putProfile(creatorId: string, data: any): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("profiles", "readwrite");
      const store = tx.objectStore("profiles");
      const request = store.put({ creatorId, data });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(new Error('Transaction aborted'));
    });
  }

  async getProfile(creatorId: string): Promise<any | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("profiles", "readonly");
      const store = tx.objectStore("profiles");
      const request = store.get(creatorId);
      request.onsuccess = () => resolve(request.result?.data || null);
      request.onerror = () => reject(request.error);
      tx.onabort = () => reject(new Error('Transaction aborted'));
    });
  }

  async putBlob(cid: string | Uint8Array, blob: Blob): Promise<void> {
    const db = await this.getDB();
    const cidHex = typeof cid === 'string' ? cid : toHex(cid);

    const writeBlob = (): Promise<void> =>
      new Promise((resolve, reject) => {
        const tx = db.transaction("blobs", "readwrite");
        const store = tx.objectStore("blobs");
        store.put({ cid: cidHex, blob, updatedAt: Date.now() });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(new Error('Transaction aborted'));
      });

    try {
      await writeBlob();
    } catch (err: any) {
      if (err && (err.name === 'QuotaExceededError' || err instanceof DOMException && err.code === 22)) {
        console.warn("VcoStore: QuotaExceededError on blob write — evicting old blobs and retrying");
        await this.evictOldBlobs(200);
        try {
          await writeBlob();
        } catch (retryErr: any) {
          throw new Error(`VcoStore: blob write failed after eviction — storage quota exceeded: ${retryErr?.message ?? retryErr}`);
        }
      } else {
        throw err;
      }
    }
  }

  async getBlob(cid: string | Uint8Array): Promise<Blob | null> {
    const db = await this.getDB();
    const cidHex = typeof cid === 'string' ? cid : toHex(cid);

    return new Promise((resolve, reject) => {
      const tx = db.transaction("blobs", "readonly");
      const store = tx.objectStore("blobs");
      const request = store.get(cidHex);
      request.onsuccess = () => resolve(request.result?.blob || null);
      request.onerror = () => reject(request.error);
      tx.onabort = () => reject(new Error('Transaction aborted'));
    });
  }

  async getBlobCount(): Promise<number> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("blobs", "readonly");
      const store = tx.objectStore("blobs");
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      tx.onabort = () => reject(new Error('Transaction aborted'));
    });
  }

  async evictOldBlobs(maxCount: number = 200): Promise<void> {
    const db = await this.getDB();
    const count = await this.getBlobCount();
    if (count <= maxCount) return;

    return new Promise((resolve, reject) => {
      const tx = db.transaction("blobs", "readwrite");
      const store = tx.objectStore("blobs");
      const index = store.index("by_updated");
      const request = index.openCursor(null, "next");
      
      let deleted = 0;
      const toDelete = count - maxCount;

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor && deleted < toDelete) {
          cursor.delete();
          deleted++;
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
      tx.onabort = () => reject(new Error('Transaction aborted'));
    });
  }

  async getAllProfiles(): Promise<{ creatorId: string, data: any }[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("profiles", "readonly");
      const store = tx.objectStore("profiles");
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
      tx.onabort = () => reject(new Error('Transaction aborted'));
    });
  }

  async putNotification(notification: any): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("notifications", "readwrite");
      const store = tx.objectStore("notifications");
      const request = store.put(notification);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(new Error('Transaction aborted'));
    });
  }

  async getAllNotifications(): Promise<any[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("notifications", "readonly");
      const store = tx.objectStore("notifications");
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
      tx.onabort = () => reject(new Error('Transaction aborted'));
    });
  }

  async deleteNotificationByTarget(targetCid: Uint8Array): Promise<void> {
    const db = await this.getDB();
    const targetHex = toHex(targetCid);
    return new Promise((resolve, reject) => {
      const tx = db.transaction("notifications", "readwrite");
      const store = tx.objectStore("notifications");
      const request = store.openCursor();
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          if (toHex(cursor.value.targetCid) === targetHex) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
      tx.onabort = () => reject(new Error('Transaction aborted'));
    });
  }

  async clearAll(): Promise<void> {
    const db = await this.getDB();
    const stores = ["envelopes", "profiles", "blobs", "notifications"];
    const tx = db.transaction(stores, "readwrite");
    stores.forEach(s => tx.objectStore(s).clear());
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
    });
  }

  /**
   * Point-lookup by headerHash (CID hex string).
   * Used to resolve cross-batch reposts where the original post was stored
   * in a prior sync session and is not present in the current in-memory batch.
   */
  async getEnvelopeByCid(cidHex: string): Promise<StoredEnvelope | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("envelopes", "readonly");
      const store = tx.objectStore("envelopes");
      const index = store.index("by_header_hash");
      const request = index.get(cidHex);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Returns the headerHash bytes for all stored envelopes.
   * Used by the delta-sync bisect loop to compute range fingerprints.
   */
  async getAllHeaderHashes(): Promise<Uint8Array[]> {
    const envelopes = await this.getAllEnvelopes();
    const result: Uint8Array[] = [];
    for (const env of envelopes) {
      if (env.headerHash) {
        // Guard against malformed stored data: must be a non-empty even-length hex string.
        try {
          if (typeof env.headerHash !== 'string' || env.headerHash.length === 0 || env.headerHash.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(env.headerHash)) {
            console.warn("VcoStore: skipping invalid headerHash value", env.headerHash);
            continue;
          }
          const bytes = new Uint8Array(env.headerHash.length / 2);
          for (let i = 0; i < bytes.length; i++) {
            bytes[i] = parseInt(env.headerHash.slice(i * 2, i * 2 + 2), 16);
          }
          result.push(bytes);
        } catch (e) {
          console.warn("VcoStore: failed to decode headerHash, skipping entry", env.headerHash, e);
        }
      }
    }
    return result;
  }

  /**
   * Single write path for all envelope storage.
   * Builds a StoredEnvelope from a decoded VcoEnvelope and stores it.
   */
  async storeEnvelope(env: VcoEnvelope, syncStatus: 'pending' | 'synced', explicitChannelId?: string): Promise<void> {
    const { encodeEnvelopeProto } = await import('@vco/vco-core');
    const encoded = encodeEnvelopeProto(env);
    // base64 encode without TextDecoder to avoid 0x00 truncation
    const bytes = encoded;
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const payload = btoa(binary);
    // channelId: use explicit if provided, else contextId (hex), else creatorId hex
    const channelId = explicitChannelId || (env.header.contextId && env.header.contextId.length > 0
      ? toHex(env.header.contextId)
      : toHex(env.header.creatorId));
    const stored: StoredEnvelope = {
      cid: toHex(env.headerHash),
      channelId,
      payload,
      timestamp: Date.now(),
      syncStatus,
      headerHash: toHex(env.headerHash),
    };
    await this.putEnvelope(stored);
  }
}

export const vcoStore = new VcoStore();
