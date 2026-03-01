import type { VCOCore } from "@vco/vco-core";
import { decodeEnvelopeProto, getPowScore } from "@vco/vco-core";
import {
  PowChallengePolicy,
  SyncRangeProofProtocol,
  type SyncMessageChannel,
} from "@vco/vco-sync";
import type { IRelayStore } from "./store.js";
import type { RelayConfig } from "./config.js";

export interface SyncHandlerOptions {
  store: IRelayStore;
  core: VCOCore;
  config: RelayConfig;
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

  // Exchange phase: receive envelopes from client
  while (true) {
    let encoded: Uint8Array;
    try {
      encoded = await channel.receive();
    } catch {
      break;
    }

    try {
      const requiredDifficulty = inboundPolicy.getRequiredDifficulty();
      const envelope = decodeEnvelopeProto(encoded);
      const valid = await core.validateEnvelope(envelope, { powDifficulty: requiredDifficulty });
      if (!valid) continue;

      if (!await store.hasEnvelope(envelope.headerHash)) {
        await store.put(envelope);

        // Evict lowest priority/work envelope if store size limit exceeded
        // Optimization: In a real relay, we'd track bytes. Here we trigger QoS-aware eviction
        // to maintain a high-quality cache if a limit is set.
        if (config.maxStoreSizeMb > 0) {
          const worstHash = await store.worstEnvelopeHash();
          if (worstHash) {
            const worstEnv = await store.get(worstHash);
            if (worstEnv) {
              const worstPriority = worstEnv.header.priorityHint ?? 1;
              const thisPriority = envelope.header.priorityHint ?? 1;

              // Compare priority first, then PoW score
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
    } catch {
      continue;
    }
  }
}
