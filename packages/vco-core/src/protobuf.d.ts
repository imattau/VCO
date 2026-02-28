import { type PayloadFragment, type PayloadFragmentSet } from "./fragmentation.js";
import type { VcoEnvelope } from "./types.js";
export interface SyncRange {
    startHash: Uint8Array;
    endHash: Uint8Array;
    fingerprint: Uint8Array;
}
export interface SyncMessage {
    ranges: SyncRange[];
}
export declare function encodeEnvelopeProto(envelope: VcoEnvelope): Uint8Array;
export declare function decodeEnvelopeProto(encoded: Uint8Array): VcoEnvelope;
export declare function encodeSyncMessageProto(message: SyncMessage): Uint8Array;
export declare function decodeSyncMessageProto(encoded: Uint8Array): SyncMessage;
export declare function encodePayloadFragmentProto(fragment: PayloadFragment): Uint8Array;
export declare function decodePayloadFragmentProto(encoded: Uint8Array): PayloadFragment;
export declare function encodePayloadFragmentSetProto(fragmentSet: PayloadFragmentSet): Uint8Array;
export declare function decodePayloadFragmentSetProto(encoded: Uint8Array): PayloadFragmentSet;
