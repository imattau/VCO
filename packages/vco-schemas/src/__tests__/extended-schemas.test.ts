import { describe, it, expect } from "vitest";
import {
  encodeKeywordIndex,
  decodeKeywordIndex,
  KEYWORD_INDEX_SCHEMA_URI,
  encodeReport,
  decodeReport,
  REPORT_SCHEMA_URI,
  ReportReason,
  encodeSubscriptionManifest,
  decodeSubscriptionManifest,
  SUBSCRIPTION_MANIFEST_SCHEMA_URI,
  encodeRelayAdmissionPolicy,
  decodeRelayAdmissionPolicy,
  RELAY_ADMISSION_POLICY_SCHEMA_URI
} from "../index.js";

describe("Extended Schemas Roundtrip", () => {
  it("should roundtrip KeywordIndex", () => {
    const data = {
      schema: KEYWORD_INDEX_SCHEMA_URI,
      keyword: "vco-protocol",
      entries: [
        { cid: new Uint8Array([1, 2, 3]), weight: 100, indexedAtMs: 1625097600000n },
        { cid: new Uint8Array([4, 5, 6]) }
      ],
      nextPageCid: new Uint8Array([7, 8, 9])
    };
    const encoded = encodeKeywordIndex(data);
    const decoded = decodeKeywordIndex(encoded);
    expect(decoded).toEqual(data);
  });

  it("should roundtrip Report", () => {
    const data = {
      schema: REPORT_SCHEMA_URI,
      targetCid: new Uint8Array([10, 11, 12]),
      reason: ReportReason.SPAM,
      detail: "This is a spam post",
      proofOfHarmCid: new Uint8Array([13, 14, 15]),
      timestampMs: BigInt(Date.now())
    };
    const encoded = encodeReport(data);
    const decoded = decodeReport(encoded);
    expect(decoded).toEqual(data);
  });

  it("should roundtrip SubscriptionManifest", () => {
    const data = {
      schema: SUBSCRIPTION_MANIFEST_SCHEMA_URI,
      contentCid: new Uint8Array([20, 21, 22]),
      tierName: "Premium",
      requirements: [
        { type: 1, zkpCircuitId: 42 },
        { type: 2, contractRef: new Uint8Array([23, 24, 25]) }
      ]
    };
    const encoded = encodeSubscriptionManifest(data);
    const decoded = decodeSubscriptionManifest(encoded);
    expect(decoded).toEqual(data);
  });

  it("should roundtrip RelayAdmissionPolicy", () => {
    const data = {
      schema: RELAY_ADMISSION_POLICY_SCHEMA_URI,
      minPowDifficulty: 24,
      acceptedPayloadTypes: [0x50, 0x04],
      maxEnvelopeSize: 1024 * 1024,
      storageTtlSeconds: 86400,
      requiresZkpAuth: true,
      supportsBlindRouting: true
    };
    const encoded = encodeRelayAdmissionPolicy(data);
    const decoded = decodeRelayAdmissionPolicy(encoded);
    expect(decoded).toEqual(data);
  });
});
