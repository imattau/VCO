// packages/vco-cord/src/lib/transport.ts
// Simulates a libp2p pub/sub channel with an in-process EventEmitter.
// Subscribers receive the same Uint8Array that was published —
// identical to what real VCO sync would send over the wire.

type Listener = (encoded: Uint8Array) => void;

const listeners = new Map<string, Set<Listener>>();

export function subscribe(channelId: string, fn: Listener): () => void {
  if (!listeners.has(channelId)) listeners.set(channelId, new Set());
  listeners.get(channelId)!.add(fn);
  return () => listeners.get(channelId)?.delete(fn);
}

export function publish(channelId: string, encoded: Uint8Array): void {
  listeners.get(channelId)?.forEach((fn) => fn(encoded));
}
