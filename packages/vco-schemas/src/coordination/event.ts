import { Event } from "../generated/coordination/event.pb.js";
export const EVENT_SCHEMA_URI = "vco://schemas/coordination/event/v1";
export interface EventData { schema: string; title: string; description: string; startMs: bigint; endMs: bigint; location: string; previousCid: Uint8Array; }
export function encodeEvent(d: EventData): Uint8Array {
  return Event.encode(Event.create({ schema: d.schema, title: d.title, description: d.description, startMs: Number(d.startMs), endMs: Number(d.endMs), location: d.location, previousCid: d.previousCid })).finish();
}
export function decodeEvent(bytes: Uint8Array): EventData {
  const m = Event.decode(bytes);
  return { schema: m.schema, title: m.title, description: m.description, startMs: BigInt(m.startMs as number), endMs: BigInt(m.endMs as number), location: m.location, previousCid: new Uint8Array(m.previousCid) };
}
