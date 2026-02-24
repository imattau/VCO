import { noise } from "@chainsafe/libp2p-noise";
import { quic } from "@chainsafe/libp2p-quic";
import { yamux } from "@chainsafe/libp2p-yamux";
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

export const VCO_LIBP2P_NOISE_PROFILE: Readonly<NoiseTransportProfile> = Object.freeze({
  protocolName: "Noise_XX_25519_ChaChaPoly_SHA256",
  handshakePattern: "XX",
  dh: "25519",
  cipher: "ChaChaPoly",
  hash: "SHA256",
});

export interface VcoLibp2pOptions
  extends Omit<Libp2pCreateOptions, "connectionEncrypters" | "transports" | "streamMuxers"> {
  connectionEncrypters?: Libp2pCreateOptions["connectionEncrypters"];
  transports?: Libp2pCreateOptions["transports"];
  streamMuxers?: Libp2pCreateOptions["streamMuxers"];
}

export function createNoiseConnectionEncrypters(): Libp2pCreateOptions["connectionEncrypters"] {
  return [noise()];
}

export function createQuicTransports(): Libp2pCreateOptions["transports"] {
  return [quic()];
}

export function createYamuxStreamMuxers(): Libp2pCreateOptions["streamMuxers"] {
  return [yamux()];
}

export function buildVcoLibp2pOptions(
  options: VcoLibp2pOptions,
): Libp2pCreateOptions {
  return {
    ...options,
    connectionEncrypters: options.connectionEncrypters ?? createNoiseConnectionEncrypters(),
    transports: options.transports ?? createQuicTransports(),
    streamMuxers: options.streamMuxers ?? createYamuxStreamMuxers(),
  };
}

export async function createVcoLibp2pNode(
  options: VcoLibp2pOptions,
): Promise<Libp2pNode> {
  return createLibp2p(buildVcoLibp2pOptions(options));
}
