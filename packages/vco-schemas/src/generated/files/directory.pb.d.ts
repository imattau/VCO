import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IDirectoryEntry { cid?: Uint8Array|null; schemaUri?: string|null; name?: string|null; }
  class DirectoryEntry implements IDirectoryEntry {
    constructor(p?: IDirectoryEntry); cid: Uint8Array; schemaUri: string; name: string;
    static create(p?: IDirectoryEntry): DirectoryEntry;
    static encode(m: IDirectoryEntry, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): DirectoryEntry;
  }
  interface IDirectory { schema?: string|null; name?: string|null; entries?: IDirectoryEntry[]|null; previousCid?: Uint8Array|null; timestampMs?: number|null; }
  class Directory implements IDirectory {
    constructor(p?: IDirectory); schema: string; name: string; entries: DirectoryEntry[]; previousCid: Uint8Array; timestampMs: number;
    static create(p?: IDirectory): Directory;
    static encode(m: IDirectory, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Directory;
  }
} }
export const DirectoryEntry: typeof vco.schemas.DirectoryEntry;
export const Directory: typeof vco.schemas.Directory;
