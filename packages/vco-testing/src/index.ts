/**
 * Common Mock CID generator for testing and simulation.
 * Generates a 32-byte Uint8Array seeded by the input string.
 */
export const mockCid = (seed: string): Uint8Array => {
  const bytes = new Uint8Array(32);
  const seedBytes = new TextEncoder().encode(seed);
  bytes.set(seedBytes.slice(0, 32));
  return bytes;
};

/**
 * Converts a Uint8Array to a hex string.
 */
export const toHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Base class for a simulated network store.
 */
export class MockNetworkStore<T = Uint8Array> {
  protected store = new Map<string, T>();

  set(cid: Uint8Array, data: T): void {
    this.store.set(toHex(cid), data);
  }

  get(cid: Uint8Array): T | null {
    return this.store.get(toHex(cid)) || null;
  }

  has(cid: Uint8Array): boolean {
    return this.store.has(toHex(cid));
  }

  clear(): void {
    this.store.clear();
  }
}
