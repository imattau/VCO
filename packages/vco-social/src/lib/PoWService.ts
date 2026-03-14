import { blake3 } from '@vco/vco-crypto';
import * as Constants from './constants';

export class PoWService {
  /**
   * Pure calculation of PoW difficulty based on payload size and network load.
   */
  static calculateTargetDifficulty(payloadLength: number, networkLoad: number): number {
    const sizeScaling = Math.floor(Math.log2(payloadLength / 1024 + 1));
    return Math.floor((Constants.DEFAULT_POW_DIFFICULTY + sizeScaling) * networkLoad);
  }

  /**
   * Verifies if an envelope meets the required PoW difficulty.
   * This logic should match the one in SocialContext and eventually the Rust core.
   */
  static verify(headerHash: Uint8Array, difficulty: number): boolean {
    if (difficulty <= 0) return true;
    
    // In our protocol, difficulty X means the first X bits of the hash must be zero
    // For simplicity in JS, we'll check leading zero bytes first, then bits
    const leadingZeros = Math.floor(difficulty / 8);
    const remainingBits = difficulty % 8;

    for (let i = 0; i < leadingZeros; i++) {
      if (headerHash[i] !== 0) return false;
    }

    if (remainingBits > 0) {
      const mask = 0xFF << (8 - remainingBits);
      if ((headerHash[leadingZeros] & mask) !== 0) return false;
    }

    return true;
  }
}
