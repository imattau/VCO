// packages/vco-schemas/src/__tests__/generated-files-exist.test.ts
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

const gen = resolve(import.meta.dirname, "../generated/");

describe("generated protobuf stubs", () => {
  for (const name of ["post", "profile", "manifest"]) {
    it(`${name}.pb.js exists`, () => {
      expect(existsSync(resolve(gen, `${name}.pb.js`))).toBe(true);
    });
    it(`${name}.pb.d.ts exists`, () => {
      expect(existsSync(resolve(gen, `${name}.pb.d.ts`))).toBe(true);
    });
  }
});
