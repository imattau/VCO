import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IListing { schema?: string|null; title?: string|null; description?: string|null; priceSats?: number|null; mediaCids?: Uint8Array[]|null; expiryMs?: number|null; previousCid?: Uint8Array|null; }
  class Listing implements IListing {
    constructor(p?: IListing); schema: string; title: string; description: string; priceSats: number; mediaCids: Uint8Array[]; expiryMs: number; previousCid: Uint8Array;
    static create(p?: IListing): Listing;
    static encode(m: IListing, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Listing;
  }
} }
export const Listing: typeof vco.schemas.Listing;
