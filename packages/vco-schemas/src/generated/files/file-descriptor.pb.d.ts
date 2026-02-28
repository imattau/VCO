import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IFileDescriptor { schema?: string|null; name?: string|null; mimeType?: string|null; size?: number|null; rootManifestCid?: Uint8Array|null; previousCid?: Uint8Array|null; timestampMs?: number|null; }
  class FileDescriptor implements IFileDescriptor {
    constructor(p?: IFileDescriptor); schema: string; name: string; mimeType: string; size: number; rootManifestCid: Uint8Array; previousCid: Uint8Array; timestampMs: number;
    static create(p?: IFileDescriptor): FileDescriptor;
    static encode(m: IFileDescriptor, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): FileDescriptor;
  }
} }
export const FileDescriptor: typeof vco.schemas.FileDescriptor;
