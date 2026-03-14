import { invoke } from "@tauri-apps/api/core";
import { toHex } from "@vco/vco-testing";

const DB_NAME_BASE = "vco_social_db";
const DB_VERSION = 3; 

export interface StoredEnvelope {
  cid: string;
  channelId: string;
  payload: string; // Base64
  timestamp: number;
  syncStatus?: 'pending' | 'synced';
}

export class VcoStore {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;
  private profile: string | null = null;

  /**
   * Internal helper to get the active storage profile.
   * Retries if Tauri isn't ready yet.
   */
  private async getStorageProfile(): Promise<string> {
    if (this.profile && this.profile !== "default") return this.profile;
    
    // If not in Tauri, return default immediately
    if (typeof window === 'undefined' || !(window as any).__TAURI_INTERNALS__) {
      this.profile = "default";
      return "default";
    }

    // Attempt to get profile with retries
    for (let i = 0; i < 5; i++) {
      try {
        const p = await invoke<string>("get_vco_profile");
        if (p) {
          console.log(`VcoStore: Resolved profile [${p}] on attempt ${i+1}`);
          this.profile = p;
          return p;
        }
      } catch (e) {
        console.warn(`VcoStore: Profile resolution attempt ${i+1} failed`, e);
        await new Promise(r => setTimeout(r, 100 * (i + 1)));
      }
    }

    console.error("VcoStore: Failed to resolve profile after retries, falling back to default");
    this.profile = "default";
    return "default";
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = (async () => {
      const profile = await this.getStorageProfile();
      const dbName = `${DB_NAME_BASE}_${profile}`;
      
      console.log(`VcoStore: Opening database [${dbName}] (v${DB_VERSION})`);

      return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(dbName, DB_VERSION);

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
    });
  }

  async putBlob(cid: string | Uint8Array, blob: Blob): Promise<void> {
    const db = await this.getDB();
    const cidHex = typeof cid === 'string' ? cid : toHex(cid);
    
    this.evictOldBlobs(200).catch(console.warn);

    return new Promise((resolve, reject) => {
      const tx = db.transaction("blobs", "readwrite");
      const store = tx.objectStore("blobs");
      const request = store.put({ cid: cidHex, blob, updatedAt: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
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
}

export const vcoStore = new VcoStore();
