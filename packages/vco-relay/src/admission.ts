import { admitInboundEnvelope, type EnvelopeAdmissionOptions } from "@vco/vco-sync";
import type { VCOCore, VcoEnvelope } from "@vco/vco-core";

export interface RelayAdmissionOptions extends EnvelopeAdmissionOptions {
  core: VCOCore;
}

export type RelayAdmitFn = (encoded: Uint8Array) => Promise<VcoEnvelope>;

export function createRelayAdmission(options: RelayAdmissionOptions): RelayAdmitFn {
  return (encoded) => admitInboundEnvelope(encoded, options.core, options);
}
