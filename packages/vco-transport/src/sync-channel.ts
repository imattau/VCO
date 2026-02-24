import type { Connection, Stream, StreamHandlerOptions } from "@libp2p/interface";
import { Libp2pSessionChannel, type Libp2pSessionChannelOptions } from "./channel.js";
import type { Libp2pNode } from "./libp2p.js";

export const DEFAULT_VCO_SYNC_PROTOCOL = "/vco/sync/3.2.0";

export interface SyncChannelOptions extends Libp2pSessionChannelOptions {
  protocol?: string;
}

export interface SyncChannelHandlerOptions extends SyncChannelOptions {
  streamHandlerOptions?: StreamHandlerOptions;
}

export type SyncChannelHandler = (
  channel: Libp2pSessionChannel,
  connection: Connection,
) => Promise<void> | void;

export async function openSyncSessionChannel(
  connection: Connection,
  options: SyncChannelOptions = {},
): Promise<Libp2pSessionChannel> {
  const protocol = options.protocol ?? DEFAULT_VCO_SYNC_PROTOCOL;
  const stream = await connection.newStream(protocol);
  return new Libp2pSessionChannel(stream as Stream, options);
}

export async function handleSyncSessionChannels(
  node: Libp2pNode,
  handler: SyncChannelHandler,
  options: SyncChannelHandlerOptions = {},
): Promise<void> {
  const protocol = options.protocol ?? DEFAULT_VCO_SYNC_PROTOCOL;

  await node.handle(
    protocol,
    async ({ stream, connection }) => {
      const channel = new Libp2pSessionChannel(stream as Stream, options);
      await handler(channel, connection);
    },
    options.streamHandlerOptions,
  );
}
