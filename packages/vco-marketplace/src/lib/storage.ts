// packages/vco-marketplace/src/lib/storage.ts

import { toPlainObject, fromPlainObject } from "@vco/vco-core";

/**
 * Serializes data to a JSON string with support for VCO types.
 */
export function serialize(data: any): string {
  return JSON.stringify(toPlainObject(data));
}

/**
 * Deserializes a JSON string back into objects, restoring VCO types.
 */
export function deserialize<T>(json: string | null): T | null {
  if (!json) return null;
  try {
    return fromPlainObject<T>(JSON.parse(json));
  } catch (err) {
    console.error("Failed to deserialize marketplace data:", err);
    return null;
  }
}
