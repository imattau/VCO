import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IVote { schema?: string|null; pollCid?: Uint8Array|null; optionIndex?: number|null; timestampMs?: number|null; }
  class Vote implements IVote {
    constructor(p?: IVote); schema: string; pollCid: Uint8Array; optionIndex: number; timestampMs: number;
    static create(p?: IVote): Vote;
    static encode(m: IVote, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Vote;
  }
} }
export const Vote: typeof vco.schemas.Vote;
