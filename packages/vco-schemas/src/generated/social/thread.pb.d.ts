import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IThreadEntry { cid?: Uint8Array|null; schemaUri?: string|null; }
  class ThreadEntry implements IThreadEntry {
    constructor(p?: IThreadEntry); cid: Uint8Array; schemaUri: string;
    static create(p?: IThreadEntry): ThreadEntry;
    static encode(m: IThreadEntry, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): ThreadEntry;
  }
  interface IThread { schema?: string|null; title?: string|null; entries?: IThreadEntry[]|null; timestampMs?: number|null; }
  class Thread implements IThread {
    constructor(p?: IThread); schema: string; title: string; entries: ThreadEntry[]; timestampMs: number;
    static create(p?: IThread): Thread;
    static encode(m: IThread, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Thread;
  }
} }
export const ThreadEntry: typeof vco.schemas.ThreadEntry;
export const Thread: typeof vco.schemas.Thread;
