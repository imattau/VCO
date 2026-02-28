import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IPoll { schema?: string|null; question?: string|null; options?: string[]|null; closesAtMs?: number|null; timestampMs?: number|null; }
  class Poll implements IPoll {
    constructor(p?: IPoll); schema: string; question: string; options: string[]; closesAtMs: number; timestampMs: number;
    static create(p?: IPoll): Poll;
    static encode(m: IPoll, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Poll;
  }
} }
export const Poll: typeof vco.schemas.Poll;
