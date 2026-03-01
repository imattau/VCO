import { Transcript } from "../generated/media/transcript.pb.js";

export const TRANSCRIPT_SCHEMA_URI = "vco://schemas/media/transcript/v1";

export interface TranscriptEntry {
  startMs: bigint;
  endMs: bigint;
  text: string;
  speaker: string;
}

export interface TranscriptData {
  schema: string;
  mediaManifestCid: Uint8Array;
  entries: TranscriptEntry[];
  language: string;
}

export function encodeTranscript(data: TranscriptData): Uint8Array {
  const msg = Transcript.create({
    schema: data.schema,
    mediaManifestCid: data.mediaManifestCid,
    entries: data.entries.map(e => ({
      startMs: Number(e.startMs),
      endMs: Number(e.endMs),
      text: e.text,
      speaker: e.speaker
    })),
    language: data.language
  });
  return Transcript.encode(msg).finish();
}

export function decodeTranscript(bytes: Uint8Array): TranscriptData {
  const msg = Transcript.decode(bytes);
  return {
    schema: msg.schema,
    mediaManifestCid: new Uint8Array(msg.mediaManifestCid),
    entries: msg.entries.map(e => ({
      startMs: BigInt(e.startMs?.toString() ?? "0"),
      endMs: BigInt(e.endMs?.toString() ?? "0"),
      text: e.text || "",
      speaker: e.speaker || ""
    })),
    language: msg.language || ""
  };
}
