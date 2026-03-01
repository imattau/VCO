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

/**
 * Generates TypeScript definitions from a generated JavaScript protobuf file.
 */
async function generateDts(jsPath, dtsPath, reExports = []) {
  // Use pbts to generate the .d.ts from the .js
  await execFileAsync(
    "npm",
    ["exec", "--", "pbts", "-o", dtsPath, jsPath],
    { cwd: projectRoot }
  );

  let dts = await fs.readFile(dtsPath, "utf8");

  // Fix protobufjs imports for ESM compatibility
  dts = dts.replace(
    'import * as $protobuf from "protobufjs";',
    'import $protobuf from "protobufjs/minimal.js";'
  );

  // Remove Long import if not used (protobufjs adds it by default)
  dts = dts.replace('import Long = require("long");\n', "");

  // Append re-exports if provided
  if (reExports.length > 0) {
    dts += "\n" + reExports.join("\n") + "\n";
  }

  await fs.writeFile(dtsPath, dts, "utf8");
}

await fs.mkdir(path.dirname(coreOutJsPath), { recursive: true });
await fs.mkdir(path.dirname(syncOutJsPath), { recursive: true });

// ── Core Protocol Proto ──────────────────────────────────────────────────────

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

// Fix CJS/ESM import + add .js extension in the JS file
const jsContent = await fs.readFile(coreOutJsPath, "utf8");
await fs.writeFile(
  coreOutJsPath,
  jsContent.replace(
    'import * as $protobuf from "protobufjs/minimal";',
    'import $protobuf from "protobufjs/minimal.js";',
  ),
  "utf8",
);

await generateDts(coreOutJsPath, coreOutDtsPath);

// Sync package uses the same proto
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
    reExports: ["export const Post: typeof vco.schemas.Post;"],
  },
  {
    protoFile: "proto/vco/schemas/profile.proto",
    outBase: "profile",
    reExports: ["export const Profile: typeof vco.schemas.Profile;"],
  },
  {
    protoFile: "proto/vco/schemas/manifest.proto",
    outBase: "manifest",
    reExports: ["export const SequenceManifest: typeof vco.schemas.SequenceManifest;"],
  },
  {
    protoFile: "proto/vco/schemas/social/reaction.proto",
    outBase: "social/reaction",
    reExports: ["export const Reaction: typeof vco.schemas.Reaction;"],
  },
  {
    protoFile: "proto/vco/schemas/social/reply.proto",
    outBase: "social/reply",
    reExports: ["export const Reply: typeof vco.schemas.Reply;"],
  },
  {
    protoFile: "proto/vco/schemas/social/follow.proto",
    outBase: "social/follow",
    reExports: ["export const Follow: typeof vco.schemas.Follow;"],
  },
  {
    protoFile: "proto/vco/schemas/social/tombstone.proto",
    outBase: "social/tombstone",
    reExports: ["export const Tombstone: typeof vco.schemas.Tombstone;"],
  },
  {
    protoFile: "proto/vco/schemas/social/thread.proto",
    outBase: "social/thread",
    reExports: [
      "export const ThreadEntry: typeof vco.schemas.ThreadEntry;",
      "export const Thread: typeof vco.schemas.Thread;"
    ],
  },
  {
    protoFile: "proto/vco/schemas/marketplace/listing.proto",
    outBase: "marketplace/listing",
    reExports: ["export const Listing: typeof vco.schemas.Listing;"],
  },
  {
    protoFile: "proto/vco/schemas/marketplace/offer.proto",
    outBase: "marketplace/offer",
    reExports: ["export const Offer: typeof vco.schemas.Offer;"],
  },
  {
    protoFile: "proto/vco/schemas/marketplace/receipt.proto",
    outBase: "marketplace/receipt",
    reExports: ["export const Receipt: typeof vco.schemas.Receipt;"],
  },
  {
    protoFile: "proto/vco/schemas/files/file-descriptor.proto",
    outBase: "files/file-descriptor",
    reExports: ["export const FileDescriptor: typeof vco.schemas.FileDescriptor;"],
  },
  {
    protoFile: "proto/vco/schemas/files/directory.proto",
    outBase: "files/directory",
    reExports: [
      "export const DirectoryEntry: typeof vco.schemas.DirectoryEntry;",
      "export const Directory: typeof vco.schemas.Directory;"
    ],
  },
  {
    protoFile: "proto/vco/schemas/coordination/poll.proto",
    outBase: "coordination/poll",
    reExports: ["export const Poll: typeof vco.schemas.Poll;"],
  },
  {
    protoFile: "proto/vco/schemas/coordination/vote.proto",
    outBase: "coordination/vote",
    reExports: ["export const Vote: typeof vco.schemas.Vote;"],
  },
  {
    protoFile: "proto/vco/schemas/coordination/event.proto",
    outBase: "coordination/event",
    reExports: ["export const Event: typeof vco.schemas.Event;"],
  },
  {
    protoFile: "proto/vco/schemas/coordination/rsvp.proto",
    outBase: "coordination/rsvp",
    reExports: ["export const Rsvp: typeof vco.schemas.Rsvp;"],
  },
  {
    protoFile: "proto/vco/schemas/coordination/announcement.proto",
    outBase: "coordination/announcement",
    reExports: ["export const Announcement: typeof vco.schemas.Announcement;"],
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
  
  // Also fix the JS re-export (pbjs output doesn't include it by default)
  const reExportLines = target.reExports.map(line => {
    // Convert "export const Post: typeof vco.schemas.Post;" -> "export const Post = vco.schemas.Post;"
    return line.replace(": typeof ", " = ").replace(";", "");
  });
  js += `\n${reExportLines.join(";\n")};\n`;
  
  await fs.writeFile(jsOut, js, "utf8");

  await generateDts(jsOut, dtsOut, target.reExports);
  
  console.log(`Generated ${path.relative(projectRoot, jsOut)}`);
  console.log(`Generated ${path.relative(projectRoot, dtsOut)}`);
}
