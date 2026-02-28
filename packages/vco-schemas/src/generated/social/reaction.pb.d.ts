import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IReaction { schema?: string|null; targetCid?: Uint8Array|null; emoji?: string|null; timestampMs?: number|null; }
  class Reaction implements IReaction {
    constructor(p?: IReaction); schema: string; targetCid: Uint8Array; emoji: string; timestampMs: number;
    static create(p?: IReaction): Reaction;
    static encode(m: IReaction, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Reaction;
  }
} }
export const Reaction: typeof vco.schemas.Reaction;
