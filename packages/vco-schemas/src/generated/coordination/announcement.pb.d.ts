import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IAnnouncement { schema?: string|null; content?: string|null; priority?: string|null; mediaCids?: Uint8Array[]|null; timestampMs?: number|null; }
  class Announcement implements IAnnouncement {
    constructor(p?: IAnnouncement); schema: string; content: string; priority: string; mediaCids: Uint8Array[]; timestampMs: number;
    static create(p?: IAnnouncement): Announcement;
    static encode(m: IAnnouncement, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Announcement;
  }
} }
export const Announcement: typeof vco.schemas.Announcement;
