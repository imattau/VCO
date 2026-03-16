import { describe, it, expect, beforeEach } from 'vitest';
import { KeyringService } from '../lib/KeyringService';
import { setPlatform } from '../lib/platform';
import { MockPlatform } from './PlatformTestUtils';

describe('KeyringService Unit Tests (Platform Abstracted)', () => {
  let mockPlatform: MockPlatform;

  beforeEach(() => {
    mockPlatform = new MockPlatform();
    setPlatform(mockPlatform);
  });

  it('should generate, store, and unlock an identity', async () => {
    const password = "secure-password-123";
    
    // 1. Generate
    const identity = await KeyringService.generateAndStoreIdentity(password);
    expect(identity.creatorIdHex).toBeDefined();
    expect(identity.signingPrivateKey).toHaveLength(32);
    expect(mockPlatform.getRandomValues).toHaveBeenCalled();

    // 2. Check existence
    const exists = await KeyringService.hasIdentity();
    expect(exists).toBe(true);

    // 3. Unlock with correct password
    const unlocked = await KeyringService.unlockIdentity(password);
    expect(unlocked).not.toBeNull();
    expect(unlocked?.creatorIdHex).toBe(identity.creatorIdHex);
  });

  it('should fail to unlock with wrong password', async () => {
    await KeyringService.generateAndStoreIdentity("correct");
    const result = await KeyringService.unlockIdentity("wrong");
    expect(result).toBeNull();
  });

  it('should correctly rotate identity (generate new keys and delete old)', async () => {
    const id1 = await KeyringService.generateAndStoreIdentity("pass1");
    const did1 = id1.creatorIdHex;

    const id2 = await KeyringService.rotateIdentity("pass2");
    const did2 = id2.creatorIdHex;

    expect(did2).not.toBe(did1);
    expect(await KeyringService.unlockIdentity("pass1")).toBeNull();
    expect((await KeyringService.unlockIdentity("pass2"))?.creatorIdHex).toBe(did2);
  });

  it('should support Export and Import of encrypted identity packages', async () => {
    const password = "migration-pass";
    
    // 1. Create identity on "Device A"
    const originalId = await KeyringService.generateAndStoreIdentity(password);
    const exportedPackage = await KeyringService.exportEncryptedPackage();
    
    expect(exportedPackage).not.toBeNull();
    expect(typeof exportedPackage).toBe('string');

    // 2. Simulate "Device B" (Clear mock storage)
    mockPlatform.storage = {};
    expect(await KeyringService.hasIdentity()).toBe(false);

    // 3. Import onto "Device B"
    await KeyringService.importEncryptedPackage(exportedPackage!);
    expect(await KeyringService.hasIdentity()).toBe(true);

    // 4. Unlock on "Device B"
    const importedId = await KeyringService.unlockIdentity(password);
    expect(importedId).not.toBeNull();
    expect(importedId?.creatorIdHex).toBe(originalId.creatorIdHex);
    expect(importedId?.signingPrivateKey).toEqual(originalId.signingPrivateKey);
  });
});
