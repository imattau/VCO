import {
  handleSyncSessionChannels,
  type Libp2pNode,
  type SyncChannelHandler,
  type SyncChannelHandlerOptions,
} from "@vco/vco-transport";
import { PowChallengePolicy } from "./pow-policy.js";
import { SyncRangeProofProtocol } from "./protocol.js";
import type { PowChallenge } from "./wire.js";

export interface SyncPowBackpressureContext {
  issuedChallenge?: PowChallenge;
  getRequiredPowDifficulty: () => number;
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
        },
      });

      const issuedChallenge = outbound.createOutboundChallenge();
      if (issuedChallenge) {
        await protocol.sendPowChallenge(issuedChallenge);
      }

      await handler(protocol, connection, {
        issuedChallenge,
        getRequiredPowDifficulty: () => inbound.getRequiredDifficulty(),
      });
    },
    channelOptions,
  );
}
