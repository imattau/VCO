export declare function countLeadingZeroBits(bytes: Uint8Array): number;
export declare function verifyPoW(headerHash: Uint8Array, difficulty: number): boolean;
export interface SolvePoWInput {
    initialNonce?: number;
    difficulty: number;
    hashForNonce: (nonce: number) => Uint8Array;
}
export interface SolvePoWResult {
    nonce: number;
    headerHash: Uint8Array;
    attempts: number;
}
export declare function solvePoWNonce(input: SolvePoWInput): SolvePoWResult;
export declare function getPowScore(headerHash: Uint8Array): number;
