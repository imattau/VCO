// packages/vco-marketplace/src/lib/storage.ts

/**
 * Custom JSON replacer to handle BigInt and Uint8Array.
 */
export function replacer(_key: string, value: any) {
  if (typeof value === "bigint") {
    return { __type: "BigInt", value: value.toString() };
  }
  if (value instanceof Uint8Array) {
    return { __type: "Uint8Array", value: Array.from(value) };
  }
  return value;
}

/**
 * Custom JSON reviver to restore BigInt and Uint8Array.
 */
export function reviver(_key: string, value: any) {
  if (value && typeof value === "object" && value.__type === "BigInt") {
    return BigInt(value.value);
  }
  if (value && typeof value === "object" && value.__type === "Uint8Array") {
    return new Uint8Array(value.value);
  }
  return value;
}

/**
 * Serializes data to a JSON string with support for VCO types.
 */
export function serialize(data: any): string {
  return JSON.stringify(data, replacer);
}

/**
 * Deserializes a JSON string back into objects, restoring VCO types.
 */
export function deserialize<T>(json: string | null): T | null {
  if (!json) return null;
  try {
    return JSON.parse(json, reviver) as T;
  } catch (err) {
    console.error("Failed to deserialize marketplace data:", err);
    return null;
  }
}
