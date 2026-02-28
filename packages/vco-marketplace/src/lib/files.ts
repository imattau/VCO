// packages/vco-marketplace/src/lib/files.ts
import { decodeEnvelopeProto } from "@vco/vco-core";
import { decodeFileDescriptor, decodeSequenceManifest } from "@vco/vco-schemas";

/**
 * Reassembles a file from VCO envelopes.
 * @param descriptorCid The CID of the FileDescriptor envelope.
 * @param getEnvelope A function to retrieve an envelope by its CID.
 * @returns A Blob representing the original file.
 */
export async function reassembleVcoFile(
  descriptorCid: string,
  getEnvelope: (cid: string) => Promise<Uint8Array | undefined>
): Promise<Blob> {
  const descriptorBytes = await getEnvelope(descriptorCid);
  if (!descriptorBytes) throw new Error(`FileDescriptor ${descriptorCid} not found.`);

  const descriptorEnv = decodeEnvelopeProto(descriptorBytes);
  const descriptor = decodeFileDescriptor(descriptorEnv.payload);

  const manifestCid = Array.from(descriptor.rootManifestCid)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
    
  const manifestBytes = await getEnvelope(manifestCid);
  if (!manifestBytes) throw new Error(`SequenceManifest ${manifestCid} not found.`);

  const manifestEnv = decodeEnvelopeProto(manifestBytes);
  const manifest = decodeSequenceManifest(manifestEnv.payload);

  const chunks: Uint8Array[] = [];
  for (const chunkHash of manifest.chunkCids) {
    const chunkCid = Array.from(chunkHash)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    
    const chunkBytes = await getEnvelope(chunkCid);
    if (!chunkBytes) throw new Error(`Chunk ${chunkCid} not found.`);
    
    const chunkEnv = decodeEnvelopeProto(chunkBytes);
    chunks.push(chunkEnv.payload);
  }

  return new Blob(chunks as BlobPart[], { type: descriptor.mimeType });
}
