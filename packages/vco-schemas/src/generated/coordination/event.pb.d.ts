import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IEvent { schema?: string|null; title?: string|null; description?: string|null; startMs?: number|null; endMs?: number|null; location?: string|null; previousCid?: Uint8Array|null; }
  class Event implements IEvent {
    constructor(p?: IEvent); schema: string; title: string; description: string; startMs: number; endMs: number; location: string; previousCid: Uint8Array;
    static create(p?: IEvent): Event;
    static encode(m: IEvent, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Event;
  }
} }
export const Event: typeof vco.schemas.Event;
