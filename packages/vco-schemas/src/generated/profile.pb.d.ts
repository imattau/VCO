import $protobuf from "protobufjs/minimal.js";

export namespace vco {
  namespace schemas {
    interface IProfile {
      schema?: string | null;
      displayName?: string | null;
      avatarCid?: Uint8Array | null;
      previousManifest?: Uint8Array | null;
      bio?: string | null;
    }
    class Profile implements IProfile {
      constructor(properties?: IProfile);
      public schema: string;
      public displayName: string;
      public avatarCid: Uint8Array;
      public previousManifest: Uint8Array;
      public bio: string;
      public static create(properties?: IProfile): Profile;
      public static encode(message: IProfile, writer?: $protobuf.Writer): $protobuf.Writer;
      public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): Profile;
      public static verify(message: { [k: string]: unknown }): string | null;
    }
  }
}
export const Profile: typeof vco.schemas.Profile;
