import { describe, expect, it } from "vitest";
import {
  VCO_LIBP2P_NOISE_PROFILE,
  buildVcoLibp2pOptions,
  createNoiseConnectionEncrypters,
  createQuicTransports,
  createYamuxStreamMuxers,
  type Libp2pCreateOptions,
} from "../src/index.js";

function stubLibp2pOptions(): Omit<
  Libp2pCreateOptions,
  "connectionEncrypters" | "transports" | "streamMuxers"
> {
  return {
    services: {},
  } as Omit<Libp2pCreateOptions, "connectionEncrypters" | "transports" | "streamMuxers">;
}

describe("libp2p adapter", () => {
  it("declares the active library-backed Noise profile explicitly", () => {
    expect(VCO_LIBP2P_NOISE_PROFILE).toEqual({
      protocolName: "Noise_XX_25519_ChaChaPoly_SHA256",
      handshakePattern: "XX",
      dh: "25519",
      cipher: "ChaChaPoly",
      hash: "SHA256",
    });
  });

  it("provides Noise connection encrypter from established library", () => {
    const encrypters = createNoiseConnectionEncrypters();
    expect(encrypters).toHaveLength(1);
  });

  it("provides QUIC transport and Yamux stream muxer from established libraries", () => {
    expect(createQuicTransports()).toHaveLength(1);
    expect(createYamuxStreamMuxers()).toHaveLength(1);
  });

  it("builds options with VCO transport defaults injected", () => {
    const options = buildVcoLibp2pOptions(stubLibp2pOptions());
    expect(options.connectionEncrypters).toHaveLength(1);
    expect(options.transports).toHaveLength(1);
    expect(options.streamMuxers).toHaveLength(1);
  });
});
