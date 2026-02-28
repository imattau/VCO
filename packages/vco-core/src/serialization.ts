const BIGINT_PREFIX = "n:";
const BYTES_PREFIX = "h:";

/**
 * Converts a Uint8Array to a hex-encoded string.
 */
function uint8ArrayToHex(arr: Uint8Array): string {
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Converts a hex-encoded string to a Uint8Array.
 */
function hexToUint8Array(hex: string): Uint8Array {
  const pairs = hex.match(/[\da-f]{2}/gi) ?? [];
  return new Uint8Array(pairs.map((p) => parseInt(p, 16)));
}

/**
 * Recursively converts a VCO object (containing BigInt and Uint8Array) 
 * into a JSON-safe "Plain Object" using canonical string prefixes.
 */
export function toPlainObject(data: unknown): any {
  if (data === null || data === undefined) return data;

  if (typeof data === "bigint") {
    return `${BIGINT_PREFIX}${data.toString()}`;
  }

  if (data instanceof Uint8Array) {
    return `${BYTES_PREFIX}${uint8ArrayToHex(data)}`;
  }

  if (Array.isArray(data)) {
    return data.map(toPlainObject);
  }

  if (typeof data === "object") {
    const plain: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      plain[key] = toPlainObject(value);
    }
    return plain;
  }

  return data;
}

/**
 * Recursively restores a "Plain Object" back into a VCO object, 
 * reviving BigInt and Uint8Array values from their canonical prefixes.
 */
export function fromPlainObject<T = any>(data: any): T {
  if (data === null || data === undefined) return data;

  if (typeof data === "string") {
    if (data.startsWith(BIGINT_PREFIX)) {
      return BigInt(data.slice(2)) as any;
    }
    if (data.startsWith(BYTES_PREFIX)) {
      return hexToUint8Array(data.slice(2)) as any;
    }
    return data as any;
  }

  if (Array.isArray(data)) {
    return data.map(fromPlainObject) as any;
  }

  if (typeof data === "object") {
    const revived: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      revived[key] = fromPlainObject(value);
    }
    return revived as any;
  }

  return data;
}
