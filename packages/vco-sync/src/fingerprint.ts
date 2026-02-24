import { sha256 } from "@noble/hashes/sha256";
import { MerkleTree, MerkleTreeOptions, SHA_256 } from "merkle-ts";
import type { HashRange, RangeProof } from "./types.js";

const EMPTY_RANGE_FINGERPRINT = sha256(new Uint8Array());
const HASH_BYTE_LENGTH = 32;
const MIN_HASH_BOUND = 0x00;
const MAX_HASH_BOUND = 0xff;

function assertRange(range: HashRange): void {
  if (!Number.isInteger(range.start) || !Number.isInteger(range.end)) {
    throw new Error("range bounds must be integers.");
  }

  if (range.start < MIN_HASH_BOUND || range.end > MAX_HASH_BOUND) {
    throw new Error("range bounds must be within [0, 255].");
  }

  if (range.start > range.end) {
    throw new Error("range.start must be <= range.end.");
  }
}

function assertHashBytes(hash: Uint8Array, fieldName: string): void {
  if (!(hash instanceof Uint8Array)) {
    throw new Error(`${fieldName} must be a Uint8Array.`);
  }

  if (hash.length !== HASH_BYTE_LENGTH) {
    throw new Error(`${fieldName} must be ${HASH_BYTE_LENGTH} bytes.`);
  }
}

function compareBytes(left: Uint8Array, right: Uint8Array): number {
  const count = Math.min(left.length, right.length);
  for (let index = 0; index < count; index += 1) {
    if (left[index] < right[index]) {
      return -1;
    }
    if (left[index] > right[index]) {
      return 1;
    }
  }

  return left.length - right.length;
}

function inRange(hash: Uint8Array, range: HashRange): boolean {
  const prefix = hash[0];
  return prefix >= range.start && prefix <= range.end;
}

export interface MerkleRangeFingerprintOptions {
  sortLeaves?: boolean;
  doubleHash?: boolean;
}

const DEFAULT_MERKLE_OPTIONS: MerkleRangeFingerprintOptions = {
  sortLeaves: true,
  doubleHash: false,
};

function createMerkleTree(options: MerkleRangeFingerprintOptions): MerkleTree {
  return new MerkleTree(
    MerkleTreeOptions(
      options.doubleHash ?? DEFAULT_MERKLE_OPTIONS.doubleHash,
      SHA_256,
      options.sortLeaves ?? DEFAULT_MERKLE_OPTIONS.sortLeaves,
    ),
  );
}

export async function computeRangeFingerprint(
  range: HashRange,
  hashes: readonly Uint8Array[],
  options: MerkleRangeFingerprintOptions = {},
): Promise<Uint8Array> {
  assertRange(range);

  const filtered = hashes
    .map((hash, index) => {
      assertHashBytes(hash, `hashes[${index}]`);
      return hash;
    })
    .filter((hash) => inRange(hash, range))
    .sort(compareBytes);

  if (filtered.length === 0) {
    return Uint8Array.from(EMPTY_RANGE_FINGERPRINT);
  }

  const tree = createMerkleTree(options);
  const leafBuffers = filtered.map((hash) => Buffer.from(hash));
  await tree.addLeaves(true, ...leafBuffers);
  return Uint8Array.from(Buffer.from(tree.getRootHash(), "hex"));
}

export interface HeaderHashProvider {
  listHeaderHashes(): Promise<readonly Uint8Array[]> | readonly Uint8Array[];
}

export class MerkleRangeProofBuilder {
  constructor(
    private readonly source: HeaderHashProvider,
    private readonly options: MerkleRangeFingerprintOptions = {},
  ) {}

  async build(range: HashRange): Promise<RangeProof> {
    const hashes = await this.source.listHeaderHashes();
    const merkleRoot = await computeRangeFingerprint(range, hashes, this.options);
    return {
      range: { ...range },
      merkleRoot,
    };
  }
}
