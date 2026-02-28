import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IOffer { schema?: string|null; listingCid?: Uint8Array|null; offerSats?: number|null; message?: string|null; timestampMs?: number|null; }
  class Offer implements IOffer {
    constructor(p?: IOffer); schema: string; listingCid: Uint8Array; offerSats: number; message: string; timestampMs: number;
    static create(p?: IOffer): Offer;
    static encode(m: IOffer, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Offer;
  }
} }
export const Offer: typeof vco.schemas.Offer;
