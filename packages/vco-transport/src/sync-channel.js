import { Libp2pSessionChannel } from "./channel.js";
export const DEFAULT_VCO_SYNC_PROTOCOL = "/vco/sync/3.2.0";
export async function openSyncSessionChannel(connection, options = {}) {
    const protocol = options.protocol ?? DEFAULT_VCO_SYNC_PROTOCOL;
    const stream = await connection.newStream(protocol);
    return new Libp2pSessionChannel(stream, options);
}
export async function handleSyncSessionChannels(node, handler, options = {}) {
    const protocol = options.protocol ?? DEFAULT_VCO_SYNC_PROTOCOL;
    await node.handle(protocol, async ({ stream, connection }) => {
        const channel = new Libp2pSessionChannel(stream, options);
        await handler(channel, connection);
    }, options.streamHandlerOptions);
}
//# sourceMappingURL=sync-channel.js.map