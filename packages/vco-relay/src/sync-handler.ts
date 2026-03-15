import type { VCOCore } from "@vco/vco-core";
import { decodeEnvelopeProto, getPowScore } from "@vco/vco-core";
import {
  PowChallengePolicy,
  SyncRangeProofProtocol,
  decodeSyncControlKind,
  type SyncMessageChannel,
} from "@vco/vco-sync";
import type { IRelayStore } from "./store.js";
import type { RelayConfig } from "./config.js";
import { SyncResponder } from "./sync-responder.js";

export interface SyncHandlerOptions {
  store: IRelayStore;
  core: VCOCore;
  config: RelayConfig;
}

/**
 * A channel wrapper that replays one already-received message before
 * delegating all subsequent receives to the inner channel.
 */
class ReplayChannel implements SyncMessageChannel {
  private replayed = false;
  constructor(
    private readonly inner: SyncMessageChannel,
    private readonly firstMessage: Uint8Array,
  ) {}

  async send(payload: Uint8Array): Promise<void> {
    return this.inner.send(payload);
  }

  async receive(): Promise<Uint8Array> {
    if (!this.replayed) {
      this.replayed = true;
      return this.firstMessage;
    }
    return this.inner.receive();
  }
}

export async function handleSyncSession(
  channel: SyncMessageChannel,
  options: SyncHandlerOptions,
): Promise<void> {
  const { store, core, config } = options;

  const inboundPolicy = new PowChallengePolicy();
  const outboundPolicy = new PowChallengePolicy({
    defaultTtlSeconds: config.pow.windowSeconds,
    minDifficultyProvider: () => config.pow.defaultDifficulty,
  });

  const protocol = new SyncRangeProofProtocol(channel, {
    onPowChallenge: (challenge) => inboundPolicy.applyInboundChallenge(challenge),
  });

  // Issue outbound PoW challenge if difficulty > 0
  const outChallenge = outboundPolicy.createOutboundChallenge();
  if (outChallenge) {
    await protocol.sendPowChallenge(outChallenge);
  }

  // ── Phase 1 (pull): peek at first message to detect new-protocol client ──
  let firstEnvelopeBytes: Uint8Array | null = null;

  try {
    const firstBytes = await channel.receive();
    let kind: string;
    try {
      kind = decodeSyncControlKind(firstBytes);
    } catch {
      // Legacy client: first message is a raw envelope, not a SyncControl frame
      firstEnvelopeBytes = firstBytes;
      kind = "raw_envelope";
    }

    if (kind === "range_proofs") {
      // New-protocol client: wrap channel so the first frame is replayed into
      // SyncResponder.protocol.receiveRangeProofs(), then run the responder.
      const replayChannel = new ReplayChannel(channel, firstBytes);
      const responder = new SyncResponder(replayChannel, store);
      await responder.run();
    }
  } catch (err: any) {
    if (
      err?.code === "ERR_STREAM_RESET" ||
      err?.message?.includes("closed") ||
      err?.message?.includes("reset") ||
      err?.message?.includes("aborted") ||
      err?.message?.includes("transport payload")
    ) {
      return; // Session ended before first message — normal
    }
    process.stderr.write(`[vco-relay] sync-handler: phase detection error: ${err}\n`);
    return;
  }

  // ── Phase 2 (push): receive and ingest envelopes from client ──
  const processEnvelope = async (encoded: Uint8Array): Promise<void> => {
    // Ignore zero-length sentinel frames
    if (encoded.length === 0) return;
    try {
      const requiredDifficulty = inboundPolicy.getRequiredDifficulty();
      const envelope = decodeEnvelopeProto(encoded);
      const valid = await core.validateEnvelope(envelope, { powDifficulty: requiredDifficulty });
      if (!valid) return;

      if (!await store.hasEnvelope(envelope.headerHash)) {
        await store.put(envelope);

        // Evict lowest priority/work envelope if store size limit exceeded
        if (config.maxStoreSizeMb > 0) {
          const worstHash = await store.worstEnvelopeHash();
          if (worstHash) {
            const worstEnv = await store.get(worstHash);
            if (worstEnv) {
              const worstPriority = worstEnv.header.priorityHint ?? 1;
              const thisPriority = envelope.header.priorityHint ?? 1;

              if (worstPriority < thisPriority) {
                await store.evict(worstHash);
              } else if (worstPriority === thisPriority) {
                const worstScore = getPowScore(worstHash);
                const thisScore = getPowScore(envelope.headerHash);
                if (worstScore < thisScore) {
                  await store.evict(worstHash);
                }
              }
            }
          }
        }
      }
    } catch (err) {
      process.stderr.write(`[vco-relay] sync-handler: envelope decode/validate/store error: ${err}\n`);
    }
  };

  // If the first message was a legacy raw envelope, process it now
  if (firstEnvelopeBytes) {
    await processEnvelope(firstEnvelopeBytes);
  }

  while (true) {
    let encoded: Uint8Array;
    try {
      encoded = await channel.receive();
    } catch (err: any) {
      // Stream closed cleanly or timed out — normal session end
      if (
        err?.code === "ERR_STREAM_RESET" ||
        err?.message?.includes("closed") ||
        err?.message?.includes("reset") ||
        err?.message?.includes("aborted") ||
        err?.message?.includes("transport payload")
      ) {
        break;
      }
      // Unexpected receive error — log and terminate session
      process.stderr.write(`[vco-relay] sync-handler: unexpected receive error: ${err}\n`);
      break;
    }

    await processEnvelope(encoded);
  }
}
