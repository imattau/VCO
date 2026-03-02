import { toHex } from "@vco/vco-testing";

const DB_NAME = "vco_social_db";
const DB_VERSION = 1;

export interface StoredEnvelope {
  cid: string;
  channelId: string;
  payload: string; // Base64 or JSON
  timestamp: number;
}

export class VcoStore {
  private db: IDBDatabase | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = request.result;
        // Store for all verifiable objects (envelopes)
        if (!db.objectStoreNames.contains("envelopes")) {
          const store = db.createObjectStore("envelopes", { keyPath: "cid" });
          store.createIndex("by_channel", "channelId", { unique: false });
          store.createIndex("by_timestamp", "timestamp", { unique: false });
        }
        // Store for peer profiles
        if (!db.objectStoreNames.contains("profiles")) {
          db.createObjectStore("profiles", { keyPath: "creatorId" });
        }
        // Store for media blobs
        if (!db.objectStoreNames.contains("blobs")) {
          db.createObjectStore("blobs", { keyPath: "cid" });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Saves an envelope to the local store.
   */
  async putEnvelope(envelope: StoredEnvelope): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("envelopes", "readwrite");
      const store = tx.objectStore("envelopes");
      const request = store.put(envelope);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Retrieves all envelopes for a specific channel, sorted by timestamp.
   */
  async getEnvelopesByChannel(channelId: string): Promise<StoredEnvelope[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("envelopes", "readonly");
      const store = tx.objectStore("envelopes");
      const index = store.index("by_channel");
      const request = index.getAll(IDBKeyRange.only(channelId));

      request.onsuccess = () => {
        const results = request.result as StoredEnvelope[];
        // Sort descending by timestamp
        resolve(results.sort((a, b) => b.timestamp - a.timestamp));
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Saves a peer profile to the store.
   */
  async putProfile(creatorId: string, profileData: any): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("profiles", "readwrite");
      const store = tx.objectStore("profiles");
      const request = store.put({ creatorId, data: profileData, updatedAt: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Retrieves a profile by creator ID.
   */
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

  /**
   * Saves a media blob to the store.
   */
  async putBlob(cid: string | Uint8Array, blob: Blob): Promise<void> {
    const db = await this.getDB();
    const cidHex = typeof cid === 'string' ? cid : toHex(cid);
    
    return new Promise((resolve, reject) => {
      const tx = db.transaction("blobs", "readwrite");
      const store = tx.objectStore("blobs");
      const request = store.put({ cid: cidHex, blob, updatedAt: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Retrieves a media blob by CID.
   */
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

  /**
   * Retrieves all known peer profiles.
   */
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

  /**
   * Wipes all local data (security/reset utility).
   */
  async clearAll(): Promise<void> {
    const db = await this.getDB();
    const stores = ["envelopes", "profiles"];
    const tx = db.transaction(stores, "readwrite");
    stores.forEach(s => tx.objectStore(s).clear());
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
    });
  }
}

export const vcoStore = new VcoStore();
