import fs from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const protoPath = path.join(projectRoot, "proto/vco/v3/vco.proto");
const coreOutJsPath = path.join(projectRoot, "packages/vco-core/src/generated/vco.pb.js");
const coreOutDtsPath = path.join(projectRoot, "packages/vco-core/src/generated/vco.pb.d.ts");
const syncOutJsPath = path.join(projectRoot, "packages/vco-sync/src/generated/vco.pb.js");
const syncOutDtsPath = path.join(projectRoot, "packages/vco-sync/src/generated/vco.pb.d.ts");

await fs.mkdir(path.dirname(coreOutJsPath), { recursive: true });
await fs.mkdir(path.dirname(syncOutJsPath), { recursive: true });

await execFileAsync(
  "npm",
  [
    "exec",
    "--",
    "pbjs",
    "-t",
    "static-module",
    "-w",
    "es6",
    "-o",
    coreOutJsPath,
    protoPath,
  ],
  { cwd: projectRoot },
);

const dts = `import $protobuf from "protobufjs/minimal.js";

export namespace vco {
  namespace v3 {
    interface IEnvelope {
      headerHash?: Uint8Array | null;
      version?: number | null;
      flags?: number | null;
      payloadType?: number | null;
      creatorId?: Uint8Array | null;
      payloadHash?: Uint8Array | null;
      signature?: Uint8Array | null;
      payload?: Uint8Array | null;
      zkpExtension?: IZKPExtension | null;
      nonce?: number | null;
    }

    class Envelope implements IEnvelope {
      constructor(properties?: IEnvelope);
      public headerHash: Uint8Array;
      public version: number;
      public flags: number;
      public payloadType: number;
      public creatorId: Uint8Array;
      public payloadHash: Uint8Array;
      public signature: Uint8Array;
      public payload: Uint8Array;
      public zkpExtension?: ZKPExtension | null;
      public nonce: number;
      public static create(properties?: IEnvelope): Envelope;
      public static encode(message: IEnvelope, writer?: $protobuf.Writer): $protobuf.Writer;
      public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): Envelope;
      public static verify(message: { [k: string]: unknown }): string | null;
    }

    interface IZKPExtension {
      circuitId?: number | null;
      proofLength?: number | null;
      proof?: Uint8Array | null;
      inputsLength?: number | null;
      publicInputs?: Uint8Array | null;
      nullifier?: Uint8Array | null;
    }

    class ZKPExtension implements IZKPExtension {
      constructor(properties?: IZKPExtension);
      public circuitId: number;
      public proofLength: number;
      public proof: Uint8Array;
      public inputsLength: number;
      public publicInputs: Uint8Array;
      public nullifier: Uint8Array;
      public static create(properties?: IZKPExtension): ZKPExtension;
      public static encode(message: IZKPExtension, writer?: $protobuf.Writer): $protobuf.Writer;
      public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): ZKPExtension;
      public static verify(message: { [k: string]: unknown }): string | null;
    }

    interface IPowChallenge {
      minDifficulty?: number | null;
      ttlSeconds?: number | null;
      reason?: string | null;
    }

    class PowChallenge implements IPowChallenge {
      constructor(properties?: IPowChallenge);
      public minDifficulty: number;
      public ttlSeconds: number;
      public reason: string;
      public static create(properties?: IPowChallenge): PowChallenge;
      public static encode(message: IPowChallenge, writer?: $protobuf.Writer): $protobuf.Writer;
      public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): PowChallenge;
      public static verify(message: { [k: string]: unknown }): string | null;
    }

    interface ISyncControl {
      syncMessage?: ISyncMessage | null;
      powChallenge?: IPowChallenge | null;
    }

    class SyncControl implements ISyncControl {
      constructor(properties?: ISyncControl);
      public syncMessage?: ISyncMessage | null;
      public powChallenge?: IPowChallenge | null;
      public static create(properties?: ISyncControl): SyncControl;
      public static encode(message: ISyncControl, writer?: $protobuf.Writer): $protobuf.Writer;
      public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): SyncControl;
      public static verify(message: { [k: string]: unknown }): string | null;
    }

    interface IEnvelopeSigningMaterial {
      version?: number | null;
      flags?: number | null;
      payloadType?: number | null;
      creatorId?: Uint8Array | null;
      payloadHash?: Uint8Array | null;
    }

    class EnvelopeSigningMaterial implements IEnvelopeSigningMaterial {
      constructor(properties?: IEnvelopeSigningMaterial);
      public version: number;
      public flags: number;
      public payloadType: number;
      public creatorId: Uint8Array;
      public payloadHash: Uint8Array;
      public static create(properties?: IEnvelopeSigningMaterial): EnvelopeSigningMaterial;
      public static encode(
        message: IEnvelopeSigningMaterial,
        writer?: $protobuf.Writer,
      ): $protobuf.Writer;
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number,
      ): EnvelopeSigningMaterial;
      public static verify(message: { [k: string]: unknown }): string | null;
    }

    interface IEnvelopeHeaderHashMaterial {
      version?: number | null;
      flags?: number | null;
      payloadType?: number | null;
      creatorId?: Uint8Array | null;
      payloadHash?: Uint8Array | null;
      signature?: Uint8Array | null;
      nonce?: number | null;
    }

    class EnvelopeHeaderHashMaterial implements IEnvelopeHeaderHashMaterial {
      constructor(properties?: IEnvelopeHeaderHashMaterial);
      public version: number;
      public flags: number;
      public payloadType: number;
      public creatorId: Uint8Array;
      public payloadHash: Uint8Array;
      public signature: Uint8Array;
      public nonce: number;
      public static create(properties?: IEnvelopeHeaderHashMaterial): EnvelopeHeaderHashMaterial;
      public static encode(
        message: IEnvelopeHeaderHashMaterial,
        writer?: $protobuf.Writer,
      ): $protobuf.Writer;
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number,
      ): EnvelopeHeaderHashMaterial;
      public static verify(message: { [k: string]: unknown }): string | null;
    }

    interface IPayloadFragment {
      parentHeaderHash?: Uint8Array | null;
      fragmentIndex?: number | null;
      fragmentCount?: number | null;
      totalPayloadSize?: number | null;
      payloadChunk?: Uint8Array | null;
      payloadHash?: Uint8Array | null;
    }

    class PayloadFragment implements IPayloadFragment {
      constructor(properties?: IPayloadFragment);
      public parentHeaderHash: Uint8Array;
      public fragmentIndex: number;
      public fragmentCount: number;
      public totalPayloadSize: number;
      public payloadChunk: Uint8Array;
      public payloadHash: Uint8Array;
      public static create(properties?: IPayloadFragment): PayloadFragment;
      public static encode(message: IPayloadFragment, writer?: $protobuf.Writer): $protobuf.Writer;
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number,
      ): PayloadFragment;
      public static verify(message: { [k: string]: unknown }): string | null;
    }

    interface IPayloadFragmentSet {
      fragments?: IPayloadFragment[] | null;
    }

    class PayloadFragmentSet implements IPayloadFragmentSet {
      constructor(properties?: IPayloadFragmentSet);
      public fragments: IPayloadFragment[];
      public static create(properties?: IPayloadFragmentSet): PayloadFragmentSet;
      public static encode(
        message: IPayloadFragmentSet,
        writer?: $protobuf.Writer,
      ): $protobuf.Writer;
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number,
      ): PayloadFragmentSet;
      public static verify(message: { [k: string]: unknown }): string | null;
    }

    interface ISyncMessage {
      ranges?: SyncMessage.IRange[] | null;
    }

    class SyncMessage implements ISyncMessage {
      constructor(properties?: ISyncMessage);
      public ranges: SyncMessage.IRange[];
      public static create(properties?: ISyncMessage): SyncMessage;
      public static encode(message: ISyncMessage, writer?: $protobuf.Writer): $protobuf.Writer;
      public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): SyncMessage;
      public static verify(message: { [k: string]: unknown }): string | null;
    }

    namespace SyncMessage {
      interface IRange {
        startHash?: Uint8Array | null;
        endHash?: Uint8Array | null;
        fingerprint?: Uint8Array | null;
      }

      class Range implements IRange {
        constructor(properties?: IRange);
        public startHash: Uint8Array;
        public endHash: Uint8Array;
        public fingerprint: Uint8Array;
        public static create(properties?: IRange): Range;
        public static encode(message: IRange, writer?: $protobuf.Writer): $protobuf.Writer;
        public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): Range;
        public static verify(message: { [k: string]: unknown }): string | null;
      }
    }
  }
}
`;

// protobufjs/minimal is CJS. Node.js ESM wraps CJS via `import * as` into a
// namespace where .roots/.Writer etc are under .default, breaking pbjs output.
// Use a default import instead, and fix the missing .js extension.
const jsContent = await fs.readFile(coreOutJsPath, "utf8");
await fs.writeFile(
  coreOutJsPath,
  jsContent.replace(
    'import * as $protobuf from "protobufjs/minimal";',
    'import $protobuf from "protobufjs/minimal.js";',
  ),
  "utf8",
);

await fs.writeFile(coreOutDtsPath, dts, "utf8");
await fs.copyFile(coreOutJsPath, syncOutJsPath);
await fs.copyFile(coreOutDtsPath, syncOutDtsPath);

console.log(`Generated ${path.relative(projectRoot, coreOutJsPath)}`);
console.log(`Generated ${path.relative(projectRoot, coreOutDtsPath)}`);
console.log(`Generated ${path.relative(projectRoot, syncOutJsPath)}`);
console.log(`Generated ${path.relative(projectRoot, syncOutDtsPath)}`);

// ── Application-layer schema protos ──────────────────────────────────────────

const schemasOutDir = path.join(projectRoot, "packages/vco-schemas/src/generated");
await fs.mkdir(schemasOutDir, { recursive: true });

for (const domain of ["social", "marketplace", "files", "coordination"]) {
  await fs.mkdir(path.join(schemasOutDir, domain), { recursive: true });
}

const schemaTargets = [
  {
    protoFile: "proto/vco/schemas/post.proto",
    outBase: "post",
    // Top-level re-export so helpers can `import { Post } from "./generated/post.pb.js"`
    reExport: "export const Post = vco.schemas.Post;",
    dts: `import $protobuf from "protobufjs/minimal.js";

export namespace vco {
  namespace schemas {
    interface IPost {
      schema?: string | null;
      content?: string | null;
      mediaCids?: Uint8Array[] | null;
      timestampMs?: number | null;
      channelId?: string | null;
      tags?: string[] | null;
    }
    class Post implements IPost {
      constructor(properties?: IPost);
      public schema: string;
      public content: string;
      public mediaCids: Uint8Array[];
      public timestampMs: number;
      public channelId: string;
      public tags: string[];
      public static create(properties?: IPost): Post;
      public static encode(message: IPost, writer?: $protobuf.Writer): $protobuf.Writer;
      public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): Post;
      public static verify(message: { [k: string]: unknown }): string | null;
    }
  }
}
export const Post: typeof vco.schemas.Post;
`,
  },
  {
    protoFile: "proto/vco/schemas/profile.proto",
    outBase: "profile",
    reExport: "export const Profile = vco.schemas.Profile;",
    dts: `import $protobuf from "protobufjs/minimal.js";

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
`,
  },
  {
    protoFile: "proto/vco/schemas/manifest.proto",
    outBase: "manifest",
    reExport: "export const SequenceManifest = vco.schemas.SequenceManifest;",
    dts: `import $protobuf from "protobufjs/minimal.js";

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
`,
  },
  // ── Social ────────────────────────────────────────────────────────────────────
  {
    protoFile: "proto/vco/schemas/social/reaction.proto",
    outBase: "social/reaction",
    reExport: "export const Reaction = vco.schemas.Reaction;",
    dts: `import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IReaction { schema?: string|null; targetCid?: Uint8Array|null; emoji?: string|null; timestampMs?: number|null; }
  class Reaction implements IReaction {
    constructor(p?: IReaction); schema: string; targetCid: Uint8Array; emoji: string; timestampMs: number;
    static create(p?: IReaction): Reaction;
    static encode(m: IReaction, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Reaction;
  }
} }
export const Reaction: typeof vco.schemas.Reaction;
`,
  },
  {
    protoFile: "proto/vco/schemas/social/reply.proto",
    outBase: "social/reply",
    reExport: "export const Reply = vco.schemas.Reply;",
    dts: `import $protobuf from "protobufjs/minimal.js";
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
`,
  },
  {
    protoFile: "proto/vco/schemas/social/follow.proto",
    outBase: "social/follow",
    reExport: "export const Follow = vco.schemas.Follow;",
    dts: `import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IFollow { schema?: string|null; subjectKey?: Uint8Array|null; action?: string|null; timestampMs?: number|null; }
  class Follow implements IFollow {
    constructor(p?: IFollow); schema: string; subjectKey: Uint8Array; action: string; timestampMs: number;
    static create(p?: IFollow): Follow;
    static encode(m: IFollow, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Follow;
  }
} }
export const Follow: typeof vco.schemas.Follow;
`,
  },
  {
    protoFile: "proto/vco/schemas/social/tombstone.proto",
    outBase: "social/tombstone",
    reExport: "export const Tombstone = vco.schemas.Tombstone;",
    dts: `import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface ITombstone { schema?: string|null; targetCid?: Uint8Array|null; reason?: string|null; timestampMs?: number|null; }
  class Tombstone implements ITombstone {
    constructor(p?: ITombstone); schema: string; targetCid: Uint8Array; reason: string; timestampMs: number;
    static create(p?: ITombstone): Tombstone;
    static encode(m: ITombstone, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Tombstone;
  }
} }
export const Tombstone: typeof vco.schemas.Tombstone;
`,
  },
  {
    protoFile: "proto/vco/schemas/social/thread.proto",
    outBase: "social/thread",
    reExport: "export const ThreadEntry = vco.schemas.ThreadEntry;\nexport const Thread = vco.schemas.Thread;",
    dts: `import $protobuf from "protobufjs/minimal.js";
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
`,
  },
  // ── Marketplace ───────────────────────────────────────────────────────────────
  {
    protoFile: "proto/vco/schemas/marketplace/listing.proto",
    outBase: "marketplace/listing",
    reExport: "export const Listing = vco.schemas.Listing;",
    dts: `import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IListing { schema?: string|null; title?: string|null; description?: string|null; priceSats?: number|null; mediaCids?: Uint8Array[]|null; expiryMs?: number|null; previousCid?: Uint8Array|null; }
  class Listing implements IListing {
    constructor(p?: IListing); schema: string; title: string; description: string; priceSats: number; mediaCids: Uint8Array[]; expiryMs: number; previousCid: Uint8Array;
    static create(p?: IListing): Listing;
    static encode(m: IListing, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Listing;
  }
} }
export const Listing: typeof vco.schemas.Listing;
`,
  },
  {
    protoFile: "proto/vco/schemas/marketplace/offer.proto",
    outBase: "marketplace/offer",
    reExport: "export const Offer = vco.schemas.Offer;",
    dts: `import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IOffer { schema?: string|null; listingCid?: Uint8Array|null; offerSats?: number|null; message?: string|null; timestampMs?: number|null; }
  class Offer implements IOffer {
    constructor(p?: IOffer); schema: string; listingCid: Uint8Array; offerSats: number; message: string; timestampMs: number;
    static create(p?: IOffer): Offer;
    static encode(m: IOffer, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Offer;
  }
} }
export const Offer: typeof vco.schemas.Offer;
`,
  },
  {
    protoFile: "proto/vco/schemas/marketplace/receipt.proto",
    outBase: "marketplace/receipt",
    reExport: "export const Receipt = vco.schemas.Receipt;",
    dts: `import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IReceipt { schema?: string|null; listingCid?: Uint8Array|null; offerCid?: Uint8Array|null; txId?: string|null; timestampMs?: number|null; }
  class Receipt implements IReceipt {
    constructor(p?: IReceipt); schema: string; listingCid: Uint8Array; offerCid: Uint8Array; txId: string; timestampMs: number;
    static create(p?: IReceipt): Receipt;
    static encode(m: IReceipt, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Receipt;
  }
} }
export const Receipt: typeof vco.schemas.Receipt;
`,
  },
  // ── Files ─────────────────────────────────────────────────────────────────────
  {
    protoFile: "proto/vco/schemas/files/file-descriptor.proto",
    outBase: "files/file-descriptor",
    reExport: "export const FileDescriptor = vco.schemas.FileDescriptor;",
    dts: `import $protobuf from "protobufjs/minimal.js";
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
`,
  },
  {
    protoFile: "proto/vco/schemas/files/directory.proto",
    outBase: "files/directory",
    reExport: "export const DirectoryEntry = vco.schemas.DirectoryEntry;\nexport const Directory = vco.schemas.Directory;",
    dts: `import $protobuf from "protobufjs/minimal.js";
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
`,
  },
  // ── Coordination ──────────────────────────────────────────────────────────────
  {
    protoFile: "proto/vco/schemas/coordination/poll.proto",
    outBase: "coordination/poll",
    reExport: "export const Poll = vco.schemas.Poll;",
    dts: `import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IPoll { schema?: string|null; question?: string|null; options?: string[]|null; closesAtMs?: number|null; timestampMs?: number|null; }
  class Poll implements IPoll {
    constructor(p?: IPoll); schema: string; question: string; options: string[]; closesAtMs: number; timestampMs: number;
    static create(p?: IPoll): Poll;
    static encode(m: IPoll, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Poll;
  }
} }
export const Poll: typeof vco.schemas.Poll;
`,
  },
  {
    protoFile: "proto/vco/schemas/coordination/vote.proto",
    outBase: "coordination/vote",
    reExport: "export const Vote = vco.schemas.Vote;",
    dts: `import $protobuf from "protobufjs/minimal.js";
export namespace vco { namespace schemas {
  interface IVote { schema?: string|null; pollCid?: Uint8Array|null; optionIndex?: number|null; timestampMs?: number|null; }
  class Vote implements IVote {
    constructor(p?: IVote); schema: string; pollCid: Uint8Array; optionIndex: number; timestampMs: number;
    static create(p?: IVote): Vote;
    static encode(m: IVote, w?: $protobuf.Writer): $protobuf.Writer;
    static decode(r: $protobuf.Reader|Uint8Array, l?: number): Vote;
  }
} }
export const Vote: typeof vco.schemas.Vote;
`,
  },
  {
    protoFile: "proto/vco/schemas/coordination/event.proto",
    outBase: "coordination/event",
    reExport: "export const Event = vco.schemas.Event;",
    dts: `import $protobuf from "protobufjs/minimal.js";
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
`,
  },
  {
    protoFile: "proto/vco/schemas/coordination/rsvp.proto",
    outBase: "coordination/rsvp",
    reExport: "export const Rsvp = vco.schemas.Rsvp;",
    dts: `import $protobuf from "protobufjs/minimal.js";
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
`,
  },
  {
    protoFile: "proto/vco/schemas/coordination/announcement.proto",
    outBase: "coordination/announcement",
    reExport: "export const Announcement = vco.schemas.Announcement;",
    dts: `import $protobuf from "protobufjs/minimal.js";
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
`,
  },
];

for (const target of schemaTargets) {
  const jsOut = path.join(schemasOutDir, `${target.outBase}.pb.js`);
  const dtsOut = path.join(schemasOutDir, `${target.outBase}.pb.d.ts`);

  await execFileAsync(
    "npm",
    ["exec", "--", "pbjs", "-t", "static-module", "-w", "es6", "-o", jsOut,
      path.join(projectRoot, target.protoFile)],
    { cwd: projectRoot },
  );

  // Fix CJS/ESM import + add .js extension.
  // Use a unique root name per schema file so each pb.js does NOT clobber
  // the shared $protobuf.roots["default"] namespace used by vco.pb.js.
  let js = await fs.readFile(jsOut, "utf8");
  js = js
    .replace(
      'import * as $protobuf from "protobufjs/minimal";',
      'import $protobuf from "protobufjs/minimal.js";',
    )
    .replace(
      /\$protobuf\.roots\["default"\]/g,
      `$protobuf.roots["vco-schemas-${target.outBase}"]`,
    );
  js += `\n${target.reExport}\n`;
  await fs.writeFile(jsOut, js, "utf8");

  await fs.writeFile(dtsOut, target.dts, "utf8");
  console.log(`Generated ${path.relative(projectRoot, jsOut)}`);
  console.log(`Generated ${path.relative(projectRoot, dtsOut)}`);
}
