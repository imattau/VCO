import { type KadDHT } from "@libp2p/kad-dht";
import { CID } from "multiformats/cid";
import * as raw from "multiformats/codecs/raw";
import { identity } from "multiformats/hashes/identity";

export interface IpcState {
  subscriptions: Set<string>;
  inboundListeners: Map<string, Array<(encoded: Uint8Array) => void>>;
  channelStore: Map<string, Uint8Array[]>;
}

export type EmitFn = (obj: Record<string, unknown>) => void;

export interface NodeLike {
  peerId: { toString(): string };
  getMultiaddrs(): Array<{ toString(): string }>;
  getPeers(): Array<{ toString(): string; includes?: never }>;
  getConnections(): Array<{
    remotePeer: { toString(): string };
    remoteAddr: { toString(): string };
  }>;
  dial(addr: any): Promise<void>;
  stop(): Promise<void>;
  services: Record<string, unknown>;
}

export function createIpcState(): IpcState {
  return {
    subscriptions: new Set(),
    inboundListeners: new Map(),
    channelStore: new Map(),
  };
}

export function uint8ArrayToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

export function base64ToUint8Array(b64: string): Uint8Array {
  return Uint8Array.from(Buffer.from(b64, "base64"));
}

export function storeEnvelope(state: IpcState, channelId: string, encoded: Uint8Array): void {
  if (!state.channelStore.has(channelId)) state.channelStore.set(channelId, []);
  state.channelStore.get(channelId)!.push(encoded);
}

export function registerChannelListener(state: IpcState, channelId: string, emit: EmitFn): void {
  if (state.inboundListeners.has(channelId)) return;
  state.inboundListeners.set(channelId, [(encoded) => {
    emit({ type: "envelope", channelId, envelope: uint8ArrayToBase64(encoded) });
  }]);
}

export function replayChannel(state: IpcState, channelId: string, emit: EmitFn): void {
  const stored = state.channelStore.get(channelId);
  if (!stored) return;
  for (const encoded of stored) {
    emit({ type: "envelope", channelId, envelope: uint8ArrayToBase64(encoded) });
  }
}

export async function handleMessage(
  line: string,
  state: IpcState,
  node: NodeLike,
  emit: EmitFn,
): Promise<void> {
  let msg: Record<string, unknown>;
  try {
    msg = JSON.parse(line) as Record<string, unknown>;
  } catch {
    emit({ type: "error", message: "invalid JSON on stdin" });
    return;
  }

  if (msg.type === "subscribe") {
    const channelId = msg.channelId as string;
    state.subscriptions.add(channelId);
    registerChannelListener(state, channelId, emit);
    replayChannel(state, channelId, emit);
  } else if (msg.type === "unsubscribe") {
    state.subscriptions.delete(msg.channelId as string);
  } else if (msg.type === "publish") {
    const channelId = msg.channelId as string;
    const encoded = base64ToUint8Array(msg.envelope as string);
    storeEnvelope(state, channelId, encoded);
    const listeners = state.inboundListeners.get(channelId);
    if (listeners) {
      for (const fn of listeners) fn(encoded);
    }
  } else if (msg.type === "get_stats") {
    emit({
      type: "stats",
      peerId: node.peerId.toString(),
      multiaddrs: node.getMultiaddrs().map((a) => a.toString()),
      peers: node.getPeers().map((p) => p.toString()),
      connections: node.getConnections().map((c) => ({
        remotePeer: c.remotePeer.toString(),
        remoteAddr: c.remoteAddr.toString(),
      })),
    });
  } else if (msg.type === "dial") {
    const addr = msg.addr as string;
    const { multiaddr } = await import("@multiformats/multiaddr");
    node.dial(multiaddr(addr))
      .then(() => emit({ type: "dial_success", addr }))
      .catch((err) => emit({ type: "error", message: `Dial failed: ${String(err)}` }));
  } else if (msg.type === "resolve") {
    const cid = msg.cid as string;
    const channelId = `vco://objects/${cid}`;
    state.subscriptions.add(channelId);
    registerChannelListener(state, channelId, emit);
    replayChannel(state, channelId, emit);
    emit({ type: "resolving", cid, channelId });
    void (async () => {
      try {
        const dht = (node.services as any).dht as KadDHT;
        const cidBytes = Buffer.from(cid, "hex");
        const mh = identity.digest(cidBytes);
        const key = CID.createV1(raw.code, mh);
        for await (const event of dht.findProviders(key)) {
          if (event.name === "PROVIDER") {
            for (const provider of (event as any).providers) {
              if (provider.multiaddrs.length > 0) {
                try { await node.dial(provider.id); } catch { /* peer unreachable */ }
              }
            }
          }
        }
      } catch (err) {
        process.stderr.write(`[vco-node] DHT findProviders failed for ${cid}: ${err}\n`);
      }
    })();
  } else if (msg.type === "shutdown") {
    void node.stop().then(() => process.exit(0)).catch(() => process.exit(1));
  }
}
