import { type EnvelopeCryptoProvider } from "./envelope.js";
import type { VcoEnvelope } from "./types.js";
export interface IZKPVerifier {
    circuitId: number;
    verify(proof: Uint8Array, publicInputs: Uint8Array, payloadHash: Uint8Array): Promise<boolean>;
}
export interface NullifierStore {
    has(nullifierHex: string): Promise<boolean> | boolean;
    add(nullifierHex: string): Promise<void> | void;
}
export declare class InMemoryNullifierStore implements NullifierStore {
    private readonly seen;
    has(nullifierHex: string): boolean;
    add(nullifierHex: string): void;
}
export interface VCOCoreOptions {
    nullifierStore?: NullifierStore;
    minPowDifficulty?: number;
}
export interface EnvelopeValidationOptions {
    powDifficulty?: number;
}
export declare function isZkpAuthEnvelope(envelope: VcoEnvelope): boolean;
export declare class VCOCore {
    private readonly crypto;
    private readonly verifiers;
    private readonly nullifierStore;
    private readonly minPowDifficulty;
    constructor(crypto: EnvelopeCryptoProvider, options?: VCOCoreOptions);
    registerVerifier(verifier: IZKPVerifier): void;
    unregisterVerifier(circuitId: number): void;
    validateEnvelope(envelope: VcoEnvelope, options?: EnvelopeValidationOptions): Promise<boolean>;
}
