import { blake3 } from "@vco/vco-crypto";
import { toHex } from "@vco/vco-testing";
import { vcoStore } from "./VcoStore";
import { 
  SEQUENCE_MANIFEST_SCHEMA_URI, 
  encodeSequenceManifest,
  SequenceManifestData
} from "@vco/vco-schemas";

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

export class MediaService {
  /**
   * Processes a file: hashes it, persists it, and returns the CID.
   * If large, fragments into a SequenceManifest.
   */
  static async processAndStore(file: File): Promise<Uint8Array> {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    if (bytes.length <= CHUNK_SIZE) {
      // Small file: single blob
      const cid = blake3(bytes);
      await vcoStore.putBlob(toHex(cid), file);
      return cid;
    }

    // Large file: fragmentation
    const chunkCids: Uint8Array[] = [];
    for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
      const chunk = bytes.slice(i, i + CHUNK_SIZE);
      const chunkCid = blake3(chunk);
      const chunkBlob = new Blob([chunk], { type: "application/octet-stream" });
      await vcoStore.putBlob(toHex(chunkCid), chunkBlob);
      chunkCids.push(chunkCid);
    }

    // Create SequenceManifest
    const manifestData: SequenceManifestData = {
      schema: SEQUENCE_MANIFEST_SCHEMA_URI,
      chunkCids,
      totalSize: BigInt(bytes.length),
      mimeType: file.type,
      previousManifest: new Uint8Array(0)
    };

    const encodedManifest = encodeSequenceManifest(manifestData);
    const manifestCid = blake3(encodedManifest);
    
    // Store the manifest itself as a blob so it can be retrieved by CID
    const manifestBlob = new Blob([encodedManifest], { type: "application/x-protobuf" });
    await vcoStore.putBlob(toHex(manifestCid), manifestBlob);

    return manifestCid;
  }

  /**
   * Resolves a CID to a playable/viewable URL.
   * Handles both single blobs and SequenceManifests.
   */
  static async resolveToUrl(cid: Uint8Array): Promise<string | null> {
    const hex = toHex(cid);
    const blob = await vcoStore.getBlob(hex);
    if (!blob) return null;

    // Check if it's a manifest (application/x-protobuf)
    if (blob.type === "application/x-protobuf") {
      try {
        const buffer = await blob.arrayBuffer();
        const { decodeSequenceManifest } = await import("@vco/vco-schemas");
        const manifest = decodeSequenceManifest(new Uint8Array(buffer));
        
        // Reconstruct the blob from chunks
        const chunks: Blob[] = [];
        for (const chunkCid of manifest.chunkCids) {
          const chunkBlob = await vcoStore.getBlob(toHex(chunkCid));
          if (chunkBlob) chunks.push(chunkBlob);
        }
        
        if (chunks.length === manifest.chunkCids.length) {
          return URL.createObjectURL(new Blob(chunks, { type: manifest.mimeType }));
        }
      } catch (e) {
        console.error("Failed to decode sequence manifest during resolution", e);
      }
    }

    return URL.createObjectURL(blob);
  }
}
