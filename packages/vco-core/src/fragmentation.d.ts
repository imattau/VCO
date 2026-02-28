import type { VcoEnvelope } from "./types.js";
export interface PayloadFragment {
    parentHeaderHash: Uint8Array;
    fragmentIndex: number;
    fragmentCount: number;
    totalPayloadSize: number;
    payloadChunk: Uint8Array;
    payloadHash: Uint8Array;
}
export interface PayloadFragmentSet {
    fragments: PayloadFragment[];
}
export interface PayloadFragmentContext {
    parentHeaderHash: Uint8Array;
    payloadHash: Uint8Array;
}
export declare function assertPayloadFragmentIntegrity(fragment: PayloadFragment): void;
export declare function fragmentEnvelopePayload(envelope: VcoEnvelope, maxChunkSize?: number): PayloadFragmentSet;
export declare function fragmentPayload(payload: Uint8Array, context: PayloadFragmentContext, maxChunkSize?: number): PayloadFragmentSet;
export declare function assertPayloadFragmentSetIntegrity(fragmentSet: PayloadFragmentSet): void;
export declare function reassemblePayloadFragments(fragmentSet: PayloadFragmentSet): Uint8Array;
//# sourceMappingURL=fragmentation.d.ts.map