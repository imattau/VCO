import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IReceipt { schema?: string|null; listingCid?: Uint8Array|null; offerCid?: Uint8Array|null; txId?: string|null; timestampMs?: number|null; }
  class Receipt implements IReceipt {
    constructor(p?: IReceipt); schema: string; listingCid: Uint8Array; offerCid: Uint8Array; txId: string; timestampMs: number;
    static create(p?: IReceipt): Receipt;
    static encode(m: IReceipt, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Receipt;
  }
} }
export const Receipt: typeof vco.schemas.Receipt;
