import {
  decodeEnvelopeProto,
  EnvelopeValidationError,
  VCOCore,
  type VcoEnvelope,
} from "@vco/vco-core";
import { PowChallengePolicy } from "./pow-policy.js";

export interface EnvelopeAdmissionOptions {
  powPolicy?: PowChallengePolicy;
  requiredDifficulty?: number;
}

function resolveRequiredDifficulty(options: EnvelopeAdmissionOptions): number {
  if (typeof options.requiredDifficulty === "number") {
    if (options.requiredDifficulty < 0) {
      throw new EnvelopeValidationError("requiredDifficulty must be non-negative.");
    }
    return options.requiredDifficulty;
  }

  return options.powPolicy?.getRequiredDifficulty() ?? 0;
}

export async function admitInboundEnvelope(
  encoded: Uint8Array,
  core: VCOCore,
  options: EnvelopeAdmissionOptions = {},
): Promise<VcoEnvelope> {
  const requiredDifficulty = resolveRequiredDifficulty(options);
  const envelope = decodeEnvelopeProto(encoded);

  const success = await core.validateEnvelope(envelope, { powDifficulty: requiredDifficulty });
  if (!success) {
    const reason = requiredDifficulty > 0
      ? `Envelope lacks required PoW difficulty ${requiredDifficulty}.`
      : "Envelope failed validation.";
    throw new EnvelopeValidationError(reason);
  }

  return envelope;
}
