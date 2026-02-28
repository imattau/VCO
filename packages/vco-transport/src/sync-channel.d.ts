import type { Connection, StreamHandlerOptions } from "@libp2p/interface";
import { Libp2pSessionChannel, type Libp2pSessionChannelOptions } from "./channel.js";
import type { Libp2pNode } from "./libp2p.js";
export declare const DEFAULT_VCO_SYNC_PROTOCOL = "/vco/sync/3.2.0";
export interface SyncChannelOptions extends Libp2pSessionChannelOptions {
    protocol?: string;
}
export interface SyncChannelHandlerOptions extends SyncChannelOptions {
    streamHandlerOptions?: StreamHandlerOptions;
}
export type SyncChannelHandler = (channel: Libp2pSessionChannel, connection: Connection) => Promise<void> | void;
export declare function openSyncSessionChannel(connection: Connection, options?: SyncChannelOptions): Promise<Libp2pSessionChannel>;
export declare function handleSyncSessionChannels(node: Libp2pNode, handler: SyncChannelHandler, options?: SyncChannelHandlerOptions): Promise<void>;
//# sourceMappingURL=sync-channel.d.ts.map