import { SubscriptionManifest } from "../generated/marketplace/subscription.pb.js";

export const SUBSCRIPTION_MANIFEST_SCHEMA_URI = "vco://schemas/marketplace/subscription/v1";

export interface SubscriptionRequirement {
  type: number;
  contractRef?: Uint8Array;
  zkpCircuitId?: number;
}

export interface SubscriptionManifestData {
  schema: string;
  contentCid: Uint8Array;
  tierName: string;
  requirements: SubscriptionRequirement[];
}

export function encodeSubscriptionManifest(data: SubscriptionManifestData): Uint8Array {
  const msg = SubscriptionManifest.create({
    schema: data.schema,
    contentCid: data.contentCid,
    tierName: data.tierName,
    requirements: data.requirements.map(r => ({
      type: r.type,
      contractRef: r.contractRef,
      zkpCircuitId: r.zkpCircuitId ?? 0
    }))
  });
  return SubscriptionManifest.encode(msg).finish();
}

export function decodeSubscriptionManifest(bytes: Uint8Array): SubscriptionManifestData {
  const msg = SubscriptionManifest.decode(bytes);
  return {
    schema: msg.schema,
    contentCid: new Uint8Array(msg.contentCid),
    tierName: msg.tierName,
    requirements: msg.requirements.map(r => ({
      type: r.type,
      contractRef: (r.contractRef && r.contractRef.length > 0) ? new Uint8Array(r.contractRef) : undefined,
      zkpCircuitId: r.zkpCircuitId || undefined
    }))
  };
}
