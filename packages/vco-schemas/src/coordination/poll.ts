import { Poll } from "../generated/coordination/poll.pb.js";
export const POLL_SCHEMA_URI = "vco://schemas/coordination/poll/v1";
export interface PollData { schema: string; question: string; options: string[]; closesAtMs: bigint; timestampMs: bigint; }
export function encodePoll(d: PollData): Uint8Array {
  return Poll.encode(Poll.create({ schema: d.schema, question: d.question, options: d.options, closesAtMs: Number(d.closesAtMs), timestampMs: Number(d.timestampMs) })).finish();
}
export function decodePoll(bytes: Uint8Array): PollData {
  const m = Poll.decode(bytes);
  return { schema: m.schema, question: m.question, options: m.options, closesAtMs: BigInt(m.closesAtMs as number), timestampMs: BigInt(m.timestampMs as number) };
}
