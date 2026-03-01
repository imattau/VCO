import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { RelayServer } from "../src/server.js";
import { loadConfig } from "../src/config.js";
import { createVcoLibp2pNode } from "@vco/vco-transport";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { Libp2pNode } from "@vco/vco-transport";

let tmpDir: string;
let server: RelayServer;
const MAX_CONNECTIONS = 100;

beforeEach(async () => {
  tmpDir = mkdtempSync(join(tmpdir(), "vco-relay-stress-"));
  const config = loadConfig({
    configPath: undefined,
    env: {
      VCO_DATA_DIR: tmpDir,
      VCO_LISTEN_ADDRS: "/ip4/127.0.0.1/udp/0/quic-v1",
      VCO_MAX_CONNECTIONS: MAX_CONNECTIONS.toString(),
      VCO_HTTP_PORT: "0",
    },
  });
  server = new RelayServer(config);
  await server.start();
}, 20000);

afterEach(async () => {
  await server.stop();
  rmSync(tmpDir, { recursive: true });
}, 20000);

describe("RelayServer Concurrent Stress Test", () => {
  it("handles high volume of concurrent connections", async () => {
    const NUM_CLIENTS = 100; 
    const clients: Libp2pNode[] = [];
    const relayAddr = server.multiaddrs[0];

    console.log(`Starting stress test: Connecting ${NUM_CLIENTS} clients to ${relayAddr}`);

    try {
      // Create and start client nodes in parallel
      const startTasks = Array.from({ length: NUM_CLIENTS }).map(async (_, i) => {
        const node = await createVcoLibp2pNode({
          addresses: {
            listen: ["/ip4/127.0.0.1/udp/0/quic-v1"],
          },
        });
        await node.start();
        return node;
      });

      const startedNodes = await Promise.all(startTasks);
      clients.push(...startedNodes);

      console.log(`All ${NUM_CLIENTS} clients started. Initiating connections...`);

      // Attempt to dial the relay from all clients concurrently
      const connectTasks = startedNodes.map(async (node, i) => {
        try {
          await node.dial(relayAddr);
          return { index: i, success: true };
        } catch (err) {
          console.error(`Client ${i} failed to connect:`, err);
          return { index: i, success: false, error: err };
        }
      });

      const results = await Promise.all(connectTasks);
      const successful = results.filter((r) => r.success).length;

      console.log(`Stress test complete: ${successful}/${NUM_CLIENTS} successful connections.`);

      // Give libp2p a moment to update internal state
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verify relay internal state
      const relayConnections = (server as any).node.getConnections().length;
      console.log(`Relay internal connection count: ${relayConnections}`);

      expect(successful).toBe(NUM_CLIENTS);
      expect(relayConnections).toBeGreaterThanOrEqual(NUM_CLIENTS - 5); // Allow small margin for transient drops
    } finally {
      // Cleanup all client nodes
      console.log("Cleaning up clients...");
      await Promise.all(clients.map((c) => c.stop()));
    }
  }, 120000); // 120s timeout for 100 clients

  it("finds the upper limit of concurrent connections", async () => {
    // Re-configure server with a very high limit to see where it actually breaks
    await server.stop();
    const config = loadConfig({
      configPath: undefined,
      env: {
        VCO_DATA_DIR: tmpDir,
        VCO_LISTEN_ADDRS: "/ip4/127.0.0.1/udp/0/quic-v1",
        VCO_MAX_CONNECTIONS: "2000", // High limit
        VCO_HTTP_PORT: "0",
      },
    });
    server = new RelayServer(config);
    await server.start();

    const relayAddr = server.multiaddrs[0];
    const allClients: Libp2pNode[] = [];
    const BATCH_SIZE = 100;
    const MAX_TOTAL = 1000; // Increase target to find real limits
    let totalConnected = 0;

    console.log(`Starting upper-limit search. Max target: ${MAX_TOTAL}, Batch size: ${BATCH_SIZE}`);

    try {
      for (let i = 0; i < MAX_TOTAL / BATCH_SIZE; i++) {
        console.log(`--- Batch ${i + 1} (${totalConnected + 1} to ${totalConnected + BATCH_SIZE}) ---`);
        
        const batchNodes = await Promise.all(
          Array.from({ length: BATCH_SIZE }).map(async () => {
            const node = await createVcoLibp2pNode({
              addresses: { listen: ["/ip4/127.0.0.1/udp/0/quic-v1"] },
            });
            await node.start();
            return node;
          })
        );
        allClients.push(...batchNodes);

        const connections = await Promise.all(
          batchNodes.map(async (node) => {
            try {
              await node.dial(relayAddr);
              return true;
            } catch (e) {
              return false;
            }
          })
        );

        const batchSuccess = connections.filter(Boolean).length;
        totalConnected += batchSuccess;

        console.log(`Batch ${i + 1} successful: ${batchSuccess}/${BATCH_SIZE}. Total: ${totalConnected}`);

        if (batchSuccess < BATCH_SIZE) {
          console.warn(`Significant failures detected in batch ${i + 1}. Stopping limit search.`);
          break;
        }

        // Small cooldown between batches
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      console.log(`Upper limit search finished. Highest stable connection count: ${totalConnected}`);
      
      // Verify relay state
      const finalCount = (server as any).node.getConnections().length;
      console.log(`Relay final internal connection count: ${finalCount}`);
      
      expect(totalConnected).toBeGreaterThanOrEqual(100); // Should at least reach previous stress test level
    } finally {
      console.log(`Cleaning up ${allClients.length} clients...`);
      // Shutdown in chunks to avoid overwhelming the event loop during cleanup
      for (let i = 0; i < allClients.length; i += 100) {
        const chunk = allClients.slice(i, i + 100);
        await Promise.all(chunk.map(c => c.stop()));
      }
    }

    // Post-stress responsiveness check
    const healthUrl = `http://127.0.0.1:${(server as any).httpServer.address().port}/health`;
    const response = await fetch(healthUrl);
    expect(response.ok).toBe(true);
    expect(await response.text()).toBe("OK");
    console.log("Relay remains responsive after stress test.");
  }, 300000); // 5 minute timeout for the limit search
});
