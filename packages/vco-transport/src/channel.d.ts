import type { Stream } from "@libp2p/interface";
import { TransportSession, type TransportSessionOptions } from "./session.js";
export interface BinaryMessageChannel {
    send(payload: Uint8Array): Promise<void>;
    receive(): Promise<Uint8Array>;
    close(): Promise<void>;
}
export interface Libp2pSessionChannelOptions extends TransportSessionOptions {
    session?: TransportSession;
}
export declare class Libp2pSessionChannel implements BinaryMessageChannel {
    private readonly stream;
    private readonly streamIterator;
    private readonly outbound;
    private readonly sinkPromise;
    private sinkError?;
    private readonly session;
    constructor(stream: Stream, options?: Libp2pSessionChannelOptions);
    send(payload: Uint8Array): Promise<void>;
    receive(): Promise<Uint8Array>;
    close(): Promise<void>;
}
//# sourceMappingURL=channel.d.ts.map