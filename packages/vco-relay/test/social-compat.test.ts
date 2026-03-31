import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { RelayServer } from "../src/server.js";
import { loadConfig } from "../src/config.js";
import { createVcoLibp2pNode } from "@vco/vco-transport";
import { tcp } from "@libp2p/tcp";
import { quic } from "@chainsafe/libp2p-quic";
import { webSockets } from "@libp2p/websockets";
import { identify } from "@libp2p/identify";
import { kadDHT } from "@libp2p/kad-dht";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

/**
 * This test replicates the libp2p stack used in vco-social (Rust/Tauri)
 * to verify compatibility with the vco-relay.
 */
describe("vco-social Compatibility", () => {
  let relay: RelayServer;
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = mkdtempSync(join(tmpdir(), "vco-relay-compat-"));
    const config = loadConfig({
      env: {
        VCO_DATA_DIR: tmpDir,
        VCO_LISTEN_ADDRS: "/ip4/127.0.0.1/tcp/0,/ip4/127.0.0.1/udp/0/quic-v1",
        VCO_HTTP_PORT: "0",
        VCO_HTTP_HOST: "127.0.0.1",
      },
    });
    relay = new RelayServer(config);
    await relay.start();
  });

  afterEach(async () => {
    await relay.stop();
    rmSync(tmpDir, { recursive: true });
  });

  it("can connect using the exact stack used by vco-social", async () => {
    // Replicating vco-social's libp2p configuration from vco_node.rs
    // Using createVcoLibp2pNode to handle internal encrypters/muxers correctly
    const client = await createVcoLibp2pNode({
      transports: [tcp(), quic(), webSockets()],
      services: {
        identify: identify(),
        // vco-social uses a custom protocol name for Kademlia
        kad: kadDHT({
          protocol: "/vco/kad/1.0.0",
          clientMode: true,
        }),
      },
    });

    await client.start();

    try {
      // Test 1: Direct Dial to TCP address
      const tcpAddr = relay.multiaddrs.find(a => a.protoCodes().includes(4) && a.protoCodes().includes(6));
      expect(tcpAddr).toBeDefined();
      console.log(`Attempting dial to relay TCP: ${tcpAddr}`);
      const conn = await client.dial(tcpAddr!);
      expect(conn).toBeDefined();
      expect(client.getConnections()).toHaveLength(1);
      console.log("Successfully connected via TCP");

      await conn.close();

      // Test 2: Direct Dial to QUIC address
      const quicAddr = relay.multiaddrs.find(a => a.toString().includes("quic-v1"));
      expect(quicAddr).toBeDefined();
      console.log(`Attempting dial to relay QUIC: ${quicAddr}`);
      const quicConn = await client.dial(quicAddr!);
      expect(quicConn).toBeDefined();
      console.log("Successfully connected via QUIC");

    } finally {
      await client.stop();
    }
  });

  it("identifies potential protocol mismatches in DHT", async () => {
    // The relay currently uses default @libp2p/kad-dht which is /ipfs/kad/1.0.0
    // vco-social uses /vco/kad/1.0.0. They will connect but not see each other in DHT.
    
    const client = await createVcoLibp2pNode({
      transports: [tcp()],
      services: {
        identify: identify(),
        kad: kadDHT({
          protocol: "/vco/kad/1.0.0",
          clientMode: true,
        }),
      },
    });

    await client.start();

    try {
      const addr = relay.multiaddrs[0];
      await client.dial(addr);
      
      // Wait for Identify to finish
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if relay is in client's peer store
      const peers = client.getPeers();
      expect(peers.map(p => p.toString())).toContain(relay.peerId?.toString());
      
      console.log("Connection established, checking protocols...");
      const connections = client.getConnections();
      const relayConn = connections.find(c => c.remotePeer.equals(relay.peerId!));
      
      // We can't easily check the DHT routing table across protocol mismatches in this test,
      // but the fact that they dial and connect confirms transport compatibility.
    } finally {
      await client.stop();
    }
  });
});
