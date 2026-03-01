import { Report, ReportReason } from "../generated/social/report.pb.js";

export const REPORT_SCHEMA_URI = "vco://schemas/social/report/v1";

export { ReportReason };

export interface ReportData {
  schema: string;
  targetCid: Uint8Array;
  reason: ReportReason;
  detail?: string;
  proofOfHarmCid?: Uint8Array;
  timestampMs: bigint;
}

export function encodeReport(data: ReportData): Uint8Array {
  const msg = Report.create({
    schema: data.schema,
    targetCid: data.targetCid,
    reason: data.reason,
    detail: data.detail ?? "",
    proofOfHarmCid: data.proofOfHarmCid,
    timestampMs: Number(data.timestampMs)
  });
  return Report.encode(msg).finish();
}

export function decodeReport(bytes: Uint8Array): ReportData {
  const msg = Report.decode(bytes);
  return {
    schema: msg.schema,
    targetCid: new Uint8Array(msg.targetCid),
    reason: msg.reason,
    detail: msg.detail || undefined,
    proofOfHarmCid: (msg.proofOfHarmCid && msg.proofOfHarmCid.length > 0) ? new Uint8Array(msg.proofOfHarmCid) : undefined,
    timestampMs: BigInt(msg.timestampMs?.toString() ?? "0")
  };
}
