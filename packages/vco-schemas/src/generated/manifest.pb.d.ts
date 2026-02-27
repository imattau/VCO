import $protobuf from "protobufjs/minimal.js";

export namespace vco {
  namespace schemas {
    interface ISequenceManifest {
      schema?: string | null;
      chunkCids?: Uint8Array[] | null;
      totalSize?: number | null;
      mimeType?: string | null;
      previousManifest?: Uint8Array | null;
    }
    class SequenceManifest implements ISequenceManifest {
      constructor(properties?: ISequenceManifest);
      public schema: string;
      public chunkCids: Uint8Array[];
      public totalSize: number;
      public mimeType: string;
      public previousManifest: Uint8Array;
      public static create(properties?: ISequenceManifest): SequenceManifest;
      public static encode(message: ISequenceManifest, writer?: $protobuf.Writer): $protobuf.Writer;
      public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): SequenceManifest;
      public static verify(message: { [k: string]: unknown }): string | null;
    }
  }
}
export const SequenceManifest: typeof vco.schemas.SequenceManifest;
