import { describe, expect, it } from "vitest";
import { SyncRangeProofProtocol } from "../../vco-sync/src/index.ts";
import {
  DEFAULT_VCO_SYNC_PROTOCOL,
  createVcoLibp2pNode,
  handleSyncSessionChannels,
  openSyncSessionChannel,
  type Libp2pNode,
} from "../src/index.js";

async function safeStop(node: Libp2pNode | undefined): Promise<void> {
  if (!node) {
    return;
  }

  try {
    await node.stop();
  } catch {
    // best-effort cleanup in tests
  }
}

describe("libp2p sync integration", () => {
  it(
    "exchanges sync range proofs across live libp2p QUIC nodes",
    async () => {
      let nodeA: Libp2pNode | undefined;
      let nodeB: Libp2pNode | undefined;

      try {
        nodeA = await createVcoLibp2pNode({
          addresses: { listen: ["/ip4/127.0.0.1/udp/0/quic-v1"] },
          services: {},
        });
        nodeB = await createVcoLibp2pNode({
          addresses: { listen: ["/ip4/127.0.0.1/udp/0/quic-v1"] },
          services: {},
        });

        await Promise.all([nodeA.start(), nodeB.start()]);

        let serverReceived: Uint8Array | undefined;
        const serverDone = new Promise<void>((resolve, reject) => {
          handleSyncSessionChannels(
            nodeB!,
            async (channel) => {
              try {
                const protocol = new SyncRangeProofProtocol(channel);
                const incoming = await protocol.receiveRangeProofs();
                serverReceived = incoming[0]?.merkleRoot;

                await protocol.sendRangeProofs([
                  {
                    range: incoming[0].range,
                    merkleRoot: new Uint8Array([9, 8, 7]),
                  },
                ]);
                await channel.close();
                resolve();
              } catch (error) {
                reject(error);
              }
            },
            { protocol: DEFAULT_VCO_SYNC_PROTOCOL },
          ).catch(reject);
        });

        const connection = await nodeA.dial(nodeB.getMultiaddrs());
        const clientChannel = await openSyncSessionChannel(connection, {
          protocol: DEFAULT_VCO_SYNC_PROTOCOL,
        });
        const clientProtocol = new SyncRangeProofProtocol(clientChannel);

        await clientProtocol.sendRangeProofs([
          {
            range: { start: 0x00, end: 0xff },
            merkleRoot: new Uint8Array([1, 2, 3]),
          },
        ]);
        const response = await clientProtocol.receiveRangeProofs();
        await clientChannel.close();
        await serverDone;

        expect(Array.from(serverReceived ?? new Uint8Array())).toEqual([1, 2, 3]);
        expect(response).toEqual([
          {
            range: { start: 0x00, end: 0xff },
            merkleRoot: new Uint8Array([9, 8, 7]),
          },
        ]);
      } finally {
        await Promise.all([safeStop(nodeA), safeStop(nodeB)]);
      }
    },
    30_000,
  );
});
