import { encodeEnvelopeProto } from "@vco/vco-core";
import {
  SyncRangeProofProtocol,
  computeRangeFingerprint,
  type SyncMessageChannel,
} from "@vco/vco-sync";
import type { RangeProof } from "@vco/vco-sync";
import type { IRelayStore } from "./store.js";

function arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function toHex(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("hex");
}

export class SyncResponder {
  private readonly protocol: SyncRangeProofProtocol;

  constructor(
    private readonly channel: SyncMessageChannel,
    private readonly store: IRelayStore,
  ) {
    this.protocol = new SyncRangeProofProtocol(channel);
  }

  async run(): Promise<void> {
    // 1. Hydrate local set from store
    const relayHashes: Uint8Array[] = [];
    for await (const hash of this.store.allHeaderHashes()) {
      relayHashes.push(hash);
    }

    const missingHexes = new Set<string>();

    // 2. Range-proof exchange loop (server role)
    while (true) {
      // Receive client's range proofs
      const clientProofs: RangeProof[] = await this.protocol.receiveRangeProofs();

      // Build relay's range proofs for the same ranges
      const relayProofs: RangeProof[] = await Promise.all(
        clientProofs.map(async (cp) => {
          const merkleRoot = await computeRangeFingerprint(cp.range, relayHashes);
          return { range: cp.range, merkleRoot };
        }),
      );

      // Send relay's proofs back
      await this.protocol.sendRangeProofs(relayProofs);

      // Compare roots to detect which ranges differ
      let allMatch = true;
      for (let i = 0; i < clientProofs.length; i++) {
        const clientRoot = clientProofs[i].merkleRoot;
        const relayRoot = relayProofs[i].merkleRoot;
        if (!arraysEqual(clientRoot, relayRoot)) {
          allMatch = false;
          const range = clientProofs[i].range;
          // Unit range (start === end) identifies a specific hash bucket
          if (range.start === range.end) {
            // Collect all relay hashes in this unit range that the client doesn't have
            for (const hash of relayHashes) {
              if (hash[0] === range.start) {
                missingHexes.add(toHex(hash));
              }
            }
          }
          // Non-unit range: client will bisect and send sub-ranges next round
        }
      }

      if (allMatch) {
        // Both sets are identical — no missing envelopes
        break;
      }

      // If all differing ranges were unit ranges, we've collected all missing hashes
      const allDiffAreUnit = clientProofs.every(
        (cp, i) =>
          arraysEqual(cp.merkleRoot, relayProofs[i].merkleRoot) ||
          cp.range.start === cp.range.end,
      );
      if (allDiffAreUnit) {
        break;
      }
      // Otherwise continue loop: client will send bisected sub-ranges
    }

    // 3. Stream missing envelopes to client
    for (const hex of missingHexes) {
      const hashBytes = Uint8Array.from(Buffer.from(hex, "hex"));
      const envelope = await this.store.get(hashBytes);
      if (envelope) {
        const encoded = encodeEnvelopeProto(envelope);
        await this.channel.send(encoded);
      }
    }

    // 4. Signal pull phase complete with a zero-length sentinel frame.
    // Libp2pSessionChannel has no half-close; the client reads until it
    // catches an error or receives a zero-length frame that it treats as EOF.
    await this.channel.send(new Uint8Array(0));
  }
}
