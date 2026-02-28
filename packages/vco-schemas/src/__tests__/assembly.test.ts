import { describe, it, expect } from "vitest";
import { AssemblyState, computeAssemblyState, type AssemblyInput } from "../assembly.js";

describe("computeAssemblyState", () => {
  const mockCid = (fill: number) => new Uint8Array(34).fill(fill);

  it("returns PENDING when manifest received but no chunks resolved", () => {
    const input: AssemblyInput = {
      chunkCids: [mockCid(1), mockCid(2)],
      resolvedChunks: new Map(),
      corruptedCids: new Set(),
    };
    expect(computeAssemblyState(input)).toBe(AssemblyState.PENDING);
  });

  it("returns PARTIAL when some but not all chunks are resolved", () => {
    const cid0 = mockCid(1);
    const cid1 = mockCid(2);
    const input: AssemblyInput = {
      chunkCids: [cid0, cid1],
      resolvedChunks: new Map([[cid0.toString(), new Uint8Array(16)]]),
      corruptedCids: new Set(),
    };
    expect(computeAssemblyState(input)).toBe(AssemblyState.PARTIAL);
  });

  it("returns COMPLETE when all chunks are resolved and none corrupted", () => {
    const cid0 = mockCid(1);
    const cid1 = mockCid(2);
    const chunks = new Map([
      [cid0.toString(), new Uint8Array(16).fill(0xaa)],
      [cid1.toString(), new Uint8Array(16).fill(0xbb)],
    ]);
    const input: AssemblyInput = {
      chunkCids: [cid0, cid1],
      resolvedChunks: chunks,
      corruptedCids: new Set(),
    };
    expect(computeAssemblyState(input)).toBe(AssemblyState.COMPLETE);
  });

  it("returns CORRUPTED when any chunk fails verification", () => {
    const cid0 = mockCid(1);
    const cid1 = mockCid(2);
    const chunks = new Map([
      [cid0.toString(), new Uint8Array(16).fill(0xaa)],
      [cid1.toString(), new Uint8Array(16).fill(0xbb)],
    ]);
    const input: AssemblyInput = {
      chunkCids: [cid0, cid1],
      resolvedChunks: chunks,
      corruptedCids: new Set([cid1.toString()]),
    };
    expect(computeAssemblyState(input)).toBe(AssemblyState.CORRUPTED);
  });

  it("returns CORRUPTED even if only some chunks resolved and one is corrupted", () => {
    const cid0 = mockCid(1);
    const cid1 = mockCid(2);
    const input: AssemblyInput = {
      chunkCids: [cid0, cid1],
      resolvedChunks: new Map([[cid0.toString(), new Uint8Array(8)]]),
      corruptedCids: new Set([cid0.toString()]),
    };
    expect(computeAssemblyState(input)).toBe(AssemblyState.CORRUPTED);
  });

  it("returns COMPLETE for a zero-chunk manifest (empty sequence)", () => {
    const input: AssemblyInput = {
      chunkCids: [],
      resolvedChunks: new Map(),
      corruptedCids: new Set(),
    };
    expect(computeAssemblyState(input)).toBe(AssemblyState.COMPLETE);
  });
});
