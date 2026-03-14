/**
 * Converts a Uint8Array to a lowercase hex string.
 * Production replacement for toHex from @vco/vco-testing.
 */
export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Converts a hex string to a Uint8Array.
 */
export function fromHex(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) return new Uint8Array(0);
  const matches = hex.match(/[0-9a-fA-F]{2}/g);
  if (!matches || matches.length !== hex.length / 2) return new Uint8Array(0);
  return new Uint8Array(matches.map(b => parseInt(b, 16)));
}
