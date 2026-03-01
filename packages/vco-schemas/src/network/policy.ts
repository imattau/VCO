import { RelayAdmissionPolicy } from "../generated/network/policy.pb.js";

export const RELAY_ADMISSION_POLICY_SCHEMA_URI = "vco://schemas/network/policy/v1";

export interface RelayAdmissionPolicyData {
  schema: string;
  minPowDifficulty: number;
  acceptedPayloadTypes: number[];
  maxEnvelopeSize: number;
  storageTtlSeconds: number;
  requiresZkpAuth: boolean;
  supportsBlindRouting: boolean;
}

export function encodeRelayAdmissionPolicy(data: RelayAdmissionPolicyData): Uint8Array {
  const msg = RelayAdmissionPolicy.create({
    schema: data.schema,
    minPowDifficulty: data.minPowDifficulty,
    acceptedPayloadTypes: data.acceptedPayloadTypes,
    maxEnvelopeSize: data.maxEnvelopeSize,
    storageTtlSeconds: data.storageTtlSeconds,
    requiresZkpAuth: data.requiresZkpAuth,
    supportsBlindRouting: data.supportsBlindRouting
  });
  return RelayAdmissionPolicy.encode(msg).finish();
}

export function decodeRelayAdmissionPolicy(bytes: Uint8Array): RelayAdmissionPolicyData {
  const msg = RelayAdmissionPolicy.decode(bytes);
  return {
    schema: msg.schema,
    minPowDifficulty: msg.minPowDifficulty,
    acceptedPayloadTypes: msg.acceptedPayloadTypes ?? [],
    maxEnvelopeSize: msg.maxEnvelopeSize,
    storageTtlSeconds: msg.storageTtlSeconds,
    requiresZkpAuth: !!msg.requiresZkpAuth,
    supportsBlindRouting: !!msg.supportsBlindRouting
  };
}
