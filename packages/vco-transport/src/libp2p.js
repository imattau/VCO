import { noise } from "@chainsafe/libp2p-noise";
import { quic } from "@chainsafe/libp2p-quic";
import { yamux } from "@chainsafe/libp2p-yamux";
import { createLibp2p } from "libp2p";
export const VCO_LIBP2P_NOISE_PROFILE = Object.freeze({
    protocolName: "Noise_XX_25519_ChaChaPoly_SHA256",
    handshakePattern: "XX",
    dh: "25519",
    cipher: "ChaChaPoly",
    hash: "SHA256",
});
export function createNoiseConnectionEncrypters() {
    return [noise()];
}
export function createQuicTransports() {
    return [quic()];
}
export function createYamuxStreamMuxers() {
    return [yamux()];
}
export function buildVcoLibp2pOptions(options) {
    return {
        ...options,
        connectionEncrypters: options.connectionEncrypters ?? createNoiseConnectionEncrypters(),
        transports: options.transports ?? createQuicTransports(),
        streamMuxers: options.streamMuxers ?? createYamuxStreamMuxers(),
    };
}
export async function createVcoLibp2pNode(options) {
    return createLibp2p(buildVcoLibp2pOptions(options));
}
//# sourceMappingURL=libp2p.js.map