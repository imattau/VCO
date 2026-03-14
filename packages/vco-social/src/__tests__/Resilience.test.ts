import { describe, it, expect } from 'vitest';
import { PoWService } from '../lib/PoWService';

describe('Resilience & PoW Unit Tests', () => {
  
  describe('PoW Difficulty Calculation', () => {
    it('should scale difficulty with payload size', () => {
      const diffSmall = PoWService.calculateTargetDifficulty(1024, 1.0);
      const diffLarge = PoWService.calculateTargetDifficulty(1024 * 1024, 1.0); // 1MB
      
      expect(diffLarge).toBeGreaterThan(diffSmall);
    });

    it('should scale difficulty with network load', () => {
      const diffNormal = PoWService.calculateTargetDifficulty(1024, 1.0);
      const diffHeavy = PoWService.calculateTargetDifficulty(1024, 2.5);
      
      expect(diffHeavy).toBe(Math.floor(diffNormal * 2.5));
    });
  });

  describe('PoW Verification', () => {
    it('should pass if hash has enough leading zero bits', () => {
      // 16 bits = 2 bytes of zeros
      const hash = new Uint8Array(32);
      hash[0] = 0;
      hash[1] = 0;
      hash[2] = 0xFF;

      expect(PoWService.verify(hash, 16)).toBe(true);
      expect(PoWService.verify(hash, 17)).toBe(false);
    });

    it('should correctly verify partial byte difficulty', () => {
      // 12 bits = 1 full zero byte, and 4 bits of next byte zero
      const hash = new Uint8Array(32);
      hash[0] = 0;
      hash[1] = 0x0F; // 0000 1111 -> first 4 bits are zero

      expect(PoWService.verify(hash, 12)).toBe(true);
      expect(PoWService.verify(hash, 13)).toBe(false);
    });

    it('should always pass difficulty 0', () => {
      const hash = new Uint8Array(32);
      hash.fill(0xFF);
      expect(PoWService.verify(hash, 0)).toBe(true);
    });
  });

});
