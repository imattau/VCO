import { createVcoLibp2pNode, handleSyncSessionChannels } from "@vco/vco-transport";
import { identify } from "@libp2p/identify";
import { kadDHT } from "@libp2p/kad-dht";
import { decodeEnvelopeProto } from "@vco/vco-core";
import { createInterface } from "node:readline";

// channel subscriptions: channelId → set of listeners (in-process only — one process = one "peer")
const subscriptions = new Set<string>();

// channel → inbound envelope listeners
const inboundListeners = new Map<string, Array<(encoded: Uint8Array) => void>>();

function emit(obj: Record<string, unknown>): void {
  process.stdout.write(JSON.stringify(obj) + "\n");
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

function base64ToUint8Array(b64: string): Uint8Array {
  return Uint8Array.from(Buffer.from(b64, "base64"));
}

function registerChannelListener(channelId: string): void {
  if (!inboundListeners.has(channelId)) inboundListeners.set(channelId, []);
  inboundListeners.get(channelId)!.push((encoded) => {
    emit({ type: "envelope", channelId, envelope: uint8ArrayToBase64(encoded) });
  });
}

async function main() {
  const relayAddr = process.env.VCO_RELAY_ADDR ?? "";

  const node = await createVcoLibp2pNode({
    addresses: { listen: ["/ip4/0.0.0.0/udp/0/quic-v1"] },
    services: {
      identify: identify(),
      dht: kadDHT({ clientMode: true }),
    },
  });

  await node.start();

  emit({
    type: "ready",
    peerId: node.peerId.toString(),
    multiaddrs: node.getMultiaddrs().map((a) => a.toString()),
  });

  // Connect to relay if provided
  if (relayAddr) {
    try {
      const { multiaddr } = await import("@multiformats/multiaddr");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await node.dial(multiaddr(relayAddr) as any);
    } catch (err) {
      emit({ type: "error", message: `Failed to connect to relay: ${String(err)}` });
    }
  }

  // Handle inbound sync sessions from other peers
  await handleSyncSessionChannels(node, async (channel) => {
    try {
      while (true) {
        const encoded = await channel.receive();
        decodeEnvelopeProto(encoded); // validate
        // Broadcast to all subscribed channels
        for (const [channelId, listeners] of inboundListeners) {
          if (subscriptions.has(channelId)) {
            for (const fn of listeners) fn(encoded);
          }
        }
      }
    } catch {
      // session ended
    }
  });

  // Read commands from stdin
  const rl = createInterface({ input: process.stdin });

  rl.on("line", (line) => {
    let msg: Record<string, unknown>;
    try {
      msg = JSON.parse(line) as Record<string, unknown>;
    } catch {
      emit({ type: "error", message: "invalid JSON on stdin" });
      return;
    }

    if (msg.type === "subscribe") {
      const channelId = msg.channelId as string;
      subscriptions.add(channelId);
      // Register listener dynamically when subscription arrives
      registerChannelListener(channelId);
    } else if (msg.type === "unsubscribe") {
      subscriptions.delete(msg.channelId as string);
    } else if (msg.type === "publish") {
      const channelId = msg.channelId as string;
      const encoded = base64ToUint8Array(msg.envelope as string);
      // Echo back to all subscribers on this node (loopback for now)
      // Real delivery to remote peers happens via libp2p sync sessions
      const listeners = inboundListeners.get(channelId);
      if (listeners) {
        for (const fn of listeners) fn(encoded);
      }
    } else if (msg.type === "shutdown") {
      void Promise.resolve(node.stop()).then(() => process.exit(0)).catch(() => process.exit(1));
    }
  });

  process.on("SIGINT", async () => { await node.stop(); process.exit(0); });
  process.on("SIGTERM", async () => { await node.stop(); process.exit(0); });
}

main().catch((err) => {
  process.stderr.write(String(err) + "\n");
  process.exit(1);
});
