import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IFollow { schema?: string|null; subjectKey?: Uint8Array|null; action?: string|null; timestampMs?: number|null; }
  class Follow implements IFollow {
    constructor(p?: IFollow); schema: string; subjectKey: Uint8Array; action: string; timestampMs: number;
    static create(p?: IFollow): Follow;
    static encode(m: IFollow, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Follow;
  }
} }
export const Follow: typeof vco.schemas.Follow;
