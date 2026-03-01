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
  /**
   * Checks if a nullifier exists and adds it if missing, atomically.
   * @param nullifierHex The hex-encoded nullifier.
   * @returns True if the nullifier was NOT present and was successfully added; False if it already existed.
   */
  testAndSet(nullifierHex: string): Promise<boolean> | boolean;

  /** Deprecated: use testAndSet for atomic operations. */
  has(nullifierHex: string): Promise<boolean> | boolean;
  /** Deprecated: use testAndSet for atomic operations. */
  add(nullifierHex: string): Promise<void> | void;
}

export class InMemoryNullifierStore implements NullifierStore {
  private readonly seen = new Set<string>();

  testAndSet(nullifierHex: string): boolean {
    if (this.seen.has(nullifierHex)) {
      return false;
    }
    this.seen.add(nullifierHex);
    return true;
  }

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

    if (!envelope.header.nullifier) {
      return false; // Should not happen if validation passed, but for safety
    }

    const nullifierHex = toHex(envelope.header.nullifier);
    
    // ATOMIC TEST AND SET: Prevent race condition between checking and adding nullifier.
    // If the verifier fails later, the nullifier remains recorded (conservative behavior).
    if (!await this.nullifierStore.testAndSet(nullifierHex)) {
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
      // NOTE: We do NOT remove the nullifier if verification fails to prevent 
      // brute-force/fuzzing of ZKP proofs using the same nullifier.
      return false;
    }

    return true;
  }
}
