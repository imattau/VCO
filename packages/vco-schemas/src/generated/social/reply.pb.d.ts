import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IReply { schema?: string|null; parentCid?: Uint8Array|null; content?: string|null; mediaCids?: Uint8Array[]|null; timestampMs?: number|null; channelId?: string|null; tags?: string[]|null; }
  class Reply implements IReply {
    constructor(p?: IReply); schema: string; parentCid: Uint8Array; content: string; mediaCids: Uint8Array[]; timestampMs: number; channelId: string; tags: string[];
    static create(p?: IReply): Reply;
    static encode(m: IReply, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Reply;
  }
} }
export const Reply: typeof vco.schemas.Reply;
