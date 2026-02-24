import { FLAG_POW_ACTIVE, FLAG_ZKP_AUTH } from "./constants.js";
import { assertEnvelopeIntegrity, type EnvelopeCryptoProvider } from "./envelope.js";
import { verifyPoW } from "./pow.js";
import type { VcoEnvelope } from "./types.js";

export interface IZKPVerifier {
  circuitId: number;
  verify(
    proof: Uint8Array,
    publicInputs: Uint8Array,
    payloadHash: Uint8Array,
  ): Promise<boolean>;
}

export interface NullifierStore {
  has(nullifierHex: string): Promise<boolean> | boolean;
  add(nullifierHex: string): Promise<void> | void;
}

export class InMemoryNullifierStore implements NullifierStore {
  private readonly seen = new Set<string>();

  has(nullifierHex: string): boolean {
    return this.seen.has(nullifierHex);
  }

  add(nullifierHex: string): void {
    this.seen.add(nullifierHex);
  }
}

export interface VCOCoreOptions {
  nullifierStore?: NullifierStore;
  minPowDifficulty?: number;
}

export interface EnvelopeValidationOptions {
  powDifficulty?: number;
}

export function isZkpAuthEnvelope(envelope: VcoEnvelope): boolean {
  return (envelope.header.flags & FLAG_ZKP_AUTH) !== 0;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

export class VCOCore {
  private readonly verifiers = new Map<number, IZKPVerifier>();

  private readonly nullifierStore: NullifierStore;

  private readonly minPowDifficulty: number;

  public constructor(
    private readonly crypto: EnvelopeCryptoProvider,
    options: VCOCoreOptions = {},
  ) {
    this.nullifierStore = options.nullifierStore ?? new InMemoryNullifierStore();
    this.minPowDifficulty = options.minPowDifficulty ?? 0;
  }

  public registerVerifier(verifier: IZKPVerifier): void {
    this.verifiers.set(verifier.circuitId, verifier);
  }

  public unregisterVerifier(circuitId: number): void {
    this.verifiers.delete(circuitId);
  }

  public async validateEnvelope(
    envelope: VcoEnvelope,
    options: EnvelopeValidationOptions = {},
  ): Promise<boolean> {
    try {
      assertEnvelopeIntegrity(envelope, this.crypto);
    } catch {
      return false;
    }

    const requiredPowDifficulty = options.powDifficulty ?? this.minPowDifficulty;
    if (requiredPowDifficulty > 0) {
      const powActive = (envelope.header.flags & FLAG_POW_ACTIVE) !== 0;
      if (!powActive) {
        return false;
      }

      let validPow = false;
      try {
        validPow = verifyPoW(envelope.headerHash, requiredPowDifficulty);
      } catch {
        return false;
      }

      if (!validPow) {
        return false;
      }
    }

    if (!isZkpAuthEnvelope(envelope)) {
      return true;
    }

    if (!envelope.zkpExtension) {
      return false;
    }

    const verifier = this.verifiers.get(envelope.zkpExtension.circuitId);
    if (!verifier) {
      return false;
    }

    const nullifierHex = toHex(envelope.zkpExtension.nullifier);
    if (await this.nullifierStore.has(nullifierHex)) {
      return false;
    }

    let isProofValid = false;
    try {
      isProofValid = await verifier.verify(
        envelope.zkpExtension.proof,
        envelope.zkpExtension.publicInputs,
        envelope.header.payloadHash,
      );
    } catch {
      return false;
    }

    if (!isProofValid) {
      return false;
    }

    await this.nullifierStore.add(nullifierHex);
    return true;
  }
}
