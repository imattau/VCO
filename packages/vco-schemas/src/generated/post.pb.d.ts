import $protobuf from "protobufjs/minimal.js";

export namespace vco {
  namespace schemas {
    interface IPost {
      schema?: string | null;
      content?: string | null;
      mediaCids?: Uint8Array[] | null;
      timestampMs?: number | null;
      channelId?: string | null;
    }
    class Post implements IPost {
      constructor(properties?: IPost);
      public schema: string;
      public content: string;
      public mediaCids: Uint8Array[];
      public timestampMs: number;
      public channelId: string;
      public static create(properties?: IPost): Post;
      public static encode(message: IPost, writer?: $protobuf.Writer): $protobuf.Writer;
      public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): Post;
      public static verify(message: { [k: string]: unknown }): string | null;
    }
  }
}
export const Post: typeof vco.schemas.Post;
