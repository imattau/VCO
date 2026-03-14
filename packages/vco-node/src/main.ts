import { createVcoLibp2pNode, handleSyncSessionChannels } from "@vco/vco-transport";
import { identify } from "@libp2p/identify";
import { kadDHT } from "@libp2p/kad-dht";
import { decodeEnvelopeProto } from "@vco/vco-core";
import { createInterface } from "node:readline";
import {
  createIpcState,
  storeEnvelope,
  registerChannelListener,
  handleMessage,
} from "./ipc-handler.js";

function emit(obj: Record<string, unknown>): void {
  process.stdout.write(JSON.stringify(obj) + "\n");
}

async function main() {
  const relayAddr = process.env.VCO_RELAY_ADDR ?? "";
  if (!relayAddr) {
    process.stderr.write("[vco-node] VCO_RELAY_ADDR not set — running without relay connection\n");
  }

  const node = await createVcoLibp2pNode({
    addresses: { listen: ["/ip4/0.0.0.0/udp/0/quic-v1"] },
    services: {
      identify: identify(),
      dht: kadDHT({ clientMode: true }),
    },
  });

  await node.start();

  const state = createIpcState();

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
        // Broadcast to all subscribed channels and persist for replay
        for (const [channelId, listeners] of state.inboundListeners) {
          if (state.subscriptions.has(channelId)) {
            storeEnvelope(state, channelId, encoded);
            for (const fn of listeners) fn(encoded);
          }
        }
      }
    } catch (err: any) {
      const isCleanClose = err?.code === 'ERR_STREAM_RESET' || err?.message?.includes('closed') || err?.message?.includes('reset') || err?.message?.includes('aborted');
      if (!isCleanClose) {
        process.stderr.write(`[vco-node] sync session error: ${err}\n`);
      }
    }
  });

  // Read commands from stdin
  const rl = createInterface({ input: process.stdin });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rl.on("line", (line) => { void handleMessage(line, state, node as any, emit); });

  process.on("SIGINT", async () => { await node.stop(); process.exit(0); });
  process.on("SIGTERM", async () => { await node.stop(); process.exit(0); });
}

main().catch((err) => {
  process.stderr.write(String(err) + "\n");
  process.exit(1);
});
