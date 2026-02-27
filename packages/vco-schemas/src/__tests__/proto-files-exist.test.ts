// packages/vco-schemas/src/__tests__/proto-files-exist.test.ts
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

const root = resolve(import.meta.dirname, "../../../../");

describe("proto schema files", () => {
  it("post.proto exists", () => {
    expect(existsSync(resolve(root, "proto/vco/schemas/post.proto"))).toBe(true);
  });
  it("profile.proto exists", () => {
    expect(existsSync(resolve(root, "proto/vco/schemas/profile.proto"))).toBe(true);
  });
  it("manifest.proto exists", () => {
    expect(existsSync(resolve(root, "proto/vco/schemas/manifest.proto"))).toBe(true);
  });
});
