import {
  handleSyncSessionChannels,
  type Libp2pNode,
  type SyncChannelHandler,
  type SyncChannelHandlerOptions,
} from "@vco/vco-transport";
import { PowChallengePolicy } from "./pow-policy.js";
import { SyncRangeProofProtocol } from "./protocol.js";
import { handleEnvelopeStream, type EnvelopeReceiverOptions } from "./envelope-receiver.js";
import { type VCOCore } from "@vco/vco-core";
import type { PowChallenge } from "./wire.js";

export interface SyncPowBackpressureContext {
  issuedChallenge?: PowChallenge;
  getRequiredPowDifficulty: () => number;
  getActivePowChallenge: () => PowChallenge | undefined;
}

type TransportConnection = Parameters<SyncChannelHandler>[1];

export type SyncPowBackpressureHandler = (
  protocol: SyncRangeProofProtocol,
  connection: TransportConnection,
  context: SyncPowBackpressureContext,
) => Promise<void> | void;

export interface SyncPowBackpressureOptions extends SyncChannelHandlerOptions {
  inboundPolicy?: PowChallengePolicy;
  outboundMinDifficultyProvider?: () => number;
  outboundChallengeTtlSeconds?: number;
  outboundReasonProvider?: () => string | undefined;
  onPowChallengeUpdate?: (challenge?: PowChallenge) => void;
  envelopeReceiverOptions?: SyncEnvelopeReceiverOptions;
}

export interface SyncEnvelopeReceiverOptions
  extends Omit<EnvelopeReceiverOptions, "powPolicy"> {
  core: VCOCore;
  powPolicy?: PowChallengePolicy;
}

export async function handleSyncSessionChannelsWithPowBackpressure(
  node: Libp2pNode,
  handler: SyncPowBackpressureHandler,
  options: SyncPowBackpressureOptions = {},
): Promise<void> {
  const {
    inboundPolicy,
    outboundMinDifficultyProvider,
    outboundChallengeTtlSeconds,
    outboundReasonProvider,
    onPowChallengeUpdate,
    envelopeReceiverOptions,
    ...channelOptions
  } = options;

  const inbound = inboundPolicy ?? new PowChallengePolicy();
  const outbound = new PowChallengePolicy({
    minDifficultyProvider: outboundMinDifficultyProvider,
    defaultTtlSeconds: outboundChallengeTtlSeconds,
    reasonProvider: outboundReasonProvider,
  });

  await handleSyncSessionChannels(
    node,
    async (channel, connection) => {
      const protocol = new SyncRangeProofProtocol(channel, {
        onPowChallenge: (challenge) => {
          inbound.applyInboundChallenge(challenge);
          if (onPowChallengeUpdate) {
            onPowChallengeUpdate(inbound.getActiveChallenge());
          }
        },
      });

      const issuedChallenge = outbound.createOutboundChallenge();
      if (issuedChallenge) {
        await protocol.sendPowChallenge(issuedChallenge);
      }

      await handler(protocol, connection, {
        issuedChallenge,
        getRequiredPowDifficulty: () => inbound.getRequiredDifficulty(),
        getActivePowChallenge: () => inbound.getActiveChallenge(),
      });

      if (envelopeReceiverOptions) {
        const receiverOpts = envelopeReceiverOptions;
        const { core: receiverCore, powPolicy: receiverPowPolicy, ...receiverConfig } = receiverOpts;
        await handleEnvelopeStream(channel, receiverCore, {
          ...receiverConfig,
          powPolicy: receiverPowPolicy ?? inbound,
        });
      }
    },
    channelOptions,
  );
}
