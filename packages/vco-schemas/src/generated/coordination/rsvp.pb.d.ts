import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IRsvp { schema?: string|null; eventCid?: Uint8Array|null; status?: string|null; timestampMs?: number|null; }
  class Rsvp implements IRsvp {
    constructor(p?: IRsvp); schema: string; eventCid: Uint8Array; status: string; timestampMs: number;
    static create(p?: IRsvp): Rsvp;
    static encode(m: IRsvp, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Rsvp;
  }
} }
export const Rsvp: typeof vco.schemas.Rsvp;
