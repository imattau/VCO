import { Rsvp } from "../generated/coordination/rsvp.pb.js";
export const RSVP_SCHEMA_URI = "vco://schemas/coordination/rsvp/v1";
export interface RsvpData { schema: string; eventCid: Uint8Array; status: "yes" | "no" | "maybe"; timestampMs: bigint; }
export function encodeRsvp(d: RsvpData): Uint8Array {
  return Rsvp.encode(Rsvp.create({ schema: d.schema, eventCid: d.eventCid, status: d.status, timestampMs: Number(d.timestampMs) })).finish();
}
export function decodeRsvp(bytes: Uint8Array): RsvpData {
  const m = Rsvp.decode(bytes);
  return { schema: m.schema, eventCid: new Uint8Array(m.eventCid), status: m.status as "yes" | "no" | "maybe", timestampMs: BigInt(m.timestampMs as number) };
}
