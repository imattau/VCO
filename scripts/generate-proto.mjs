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
