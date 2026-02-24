import type { Libp2pSessionChannel } from "@vco/vco-transport";
import { VCOCore, type VcoEnvelope } from "@vco/vco-core";
import { admitInboundEnvelope, type EnvelopeAdmissionOptions } from "./envelope-admission.js";

export interface EnvelopeReceiverOptions extends EnvelopeAdmissionOptions {
  onEnvelope: (envelope: VcoEnvelope) => Promise<void> | void;
}

const STREAM_CLOSED_MESSAGE = "Stream ended before receiving a transport payload.";

export async function handleEnvelopeStream(
  channel: Libp2pSessionChannel,
  core: VCOCore,
  options: EnvelopeReceiverOptions,
): Promise<void> {
  if (typeof options.onEnvelope !== "function") {
    throw new Error("onEnvelope callback is required.");
  }

  const { onEnvelope, ...admission } = options;

  while (true) {
    let encoded: Uint8Array;
    try {
      encoded = await channel.receive();
    } catch (error) {
      if (error instanceof Error && error.message === STREAM_CLOSED_MESSAGE) {
        return;
      }
      throw error;
    }

    const envelope = await admitInboundEnvelope(encoded, core, admission);
    await onEnvelope(envelope);
  }
}
