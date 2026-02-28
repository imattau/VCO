export enum AssemblyState {
  PENDING = "PENDING",
  PARTIAL = "PARTIAL",
  COMPLETE = "COMPLETE",
  CORRUPTED = "CORRUPTED",
}

export interface AssemblyInput {
  chunkCids: Uint8Array[];
  resolvedChunks: Map<string, Uint8Array>;
  corruptedCids: Set<string>;
}

export function computeAssemblyState(input: AssemblyInput): AssemblyState {
  const { chunkCids, resolvedChunks, corruptedCids } = input;

  if (corruptedCids.size > 0) return AssemblyState.CORRUPTED;
  if (chunkCids.length === 0) return AssemblyState.COMPLETE;

  const resolvedCount = chunkCids.filter((cid) => resolvedChunks.has(cid.toString())).length;

  if (resolvedCount === 0) return AssemblyState.PENDING;
  if (resolvedCount < chunkCids.length) return AssemblyState.PARTIAL;
  return AssemblyState.COMPLETE;
}
