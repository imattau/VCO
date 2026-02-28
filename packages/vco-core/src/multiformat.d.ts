export interface VarintDecoded {
    value: number;
    bytesRead: number;
}
export interface DecodedMultikey {
    codec: number;
    keyBytes: Uint8Array;
}
export interface DecodedMultihash {
    code: number;
    digestSize: number;
    digestBytes: Uint8Array;
}
export declare function encodeVarint(value: number): Uint8Array;
export declare function decodeVarint(bytes: Uint8Array, offset?: number): VarintDecoded;
export declare function encodeEd25519Multikey(publicKey: Uint8Array): Uint8Array;
export declare function decodeMultikey(multikey: Uint8Array): DecodedMultikey;
export declare function assertValidCreatorMultikey(multikey: Uint8Array): void;
export declare function encodeBlake3Multihash(digestBytes: Uint8Array): Uint8Array;
export declare function decodeMultihash(multihash: Uint8Array): DecodedMultihash;
export declare function assertValidPayloadMultihash(multihash: Uint8Array): void;
//# sourceMappingURL=multiformat.d.ts.map