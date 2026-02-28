import { createLibp2p } from "libp2p";
export type Libp2pCreateOptions = NonNullable<Parameters<typeof createLibp2p>[0]>;
export type Libp2pNode = Awaited<ReturnType<typeof createLibp2p>>;
export interface NoiseTransportProfile {
    protocolName: string;
    handshakePattern: "XX";
    dh: "25519";
    cipher: "ChaChaPoly";
    hash: "SHA256";
}
export declare const VCO_LIBP2P_NOISE_PROFILE: Readonly<NoiseTransportProfile>;
export interface VcoLibp2pOptions extends Omit<Libp2pCreateOptions, "connectionEncrypters" | "transports" | "streamMuxers"> {
    connectionEncrypters?: Libp2pCreateOptions["connectionEncrypters"];
    transports?: Libp2pCreateOptions["transports"];
    streamMuxers?: Libp2pCreateOptions["streamMuxers"];
}
export declare function createNoiseConnectionEncrypters(): Libp2pCreateOptions["connectionEncrypters"];
export declare function createQuicTransports(): Libp2pCreateOptions["transports"];
export declare function createYamuxStreamMuxers(): Libp2pCreateOptions["streamMuxers"];
export declare function buildVcoLibp2pOptions(options: VcoLibp2pOptions): Libp2pCreateOptions;
export declare function createVcoLibp2pNode(options: VcoLibp2pOptions): Promise<Libp2pNode>;
//# sourceMappingURL=libp2p.d.ts.map