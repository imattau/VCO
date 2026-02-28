import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface ITombstone { schema?: string|null; targetCid?: Uint8Array|null; reason?: string|null; timestampMs?: number|null; }
  class Tombstone implements ITombstone {
    constructor(p?: ITombstone); schema: string; targetCid: Uint8Array; reason: string; timestampMs: number;
    static create(p?: ITombstone): Tombstone;
    static encode(m: ITombstone, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Tombstone;
  }
} }
export const Tombstone: typeof vco.schemas.Tombstone;
