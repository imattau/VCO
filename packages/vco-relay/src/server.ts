import { createVcoLibp2pNode, handleSyncSessionChannels } from "@vco/vco-transport";
import type { Libp2pNode } from "@vco/vco-transport";
import { identify } from "@libp2p/identify";
import { kadDHT } from "@libp2p/kad-dht";
import { mdns } from "@libp2p/mdns";
import { tcp } from "@libp2p/tcp";
import { quic } from "@chainsafe/libp2p-quic";
import { webSockets } from "@libp2p/websockets";
import { generateKeyPair, privateKeyToProtobuf, privateKeyFromProtobuf } from "@libp2p/crypto/keys";
import { NobleCryptoProvider } from "@vco/vco-crypto";
import { VCOCore, type IZKPVerifier } from "@vco/vco-core";
import type { RelayConfig } from "./config.js";
import { LevelDBRelayStore, type IRelayStore } from "./store.js";
import { handleSyncSession } from "./sync-handler.js";
import http from "node:http";

export class RelayServer {
  private readonly config: RelayConfig;
  private node?: Libp2pNode;
  private store?: IRelayStore;
  private readonly core: VCOCore;
  private httpServer?: http.Server;

  constructor(config: RelayConfig) {
    this.config = config;
    this.core = new VCOCore(new NobleCryptoProvider());
  }

  registerZkpVerifier(verifier: IZKPVerifier): void {
    this.core.registerVerifier(verifier);
  }

  async start(): Promise<void> {
    const store = new LevelDBRelayStore(this.config.dataDir);
    await store.open();
    this.store = store;

    // Persistent identity
    let privateKey;
    const keyBytes = await store.getPrivateKey();
    if (keyBytes) {
      privateKey = await privateKeyFromProtobuf(keyBytes);
    } else {
      privateKey = await generateKeyPair("Ed25519");
      await store.setPrivateKey(privateKeyToProtobuf(privateKey));
    }

    // Use persistent store for core (nullifier tracking)
    (this.core as any).nullifierStore = store;

    const node = await createVcoLibp2pNode({
      privateKey,
      addresses: { listen: this.config.listenAddrs },
      transports: [tcp(), quic(), webSockets()],
      services: {
        identify: identify({
          agentVersion: "/vco/1.0.0",
        }),
        dht: kadDHT({
          protocol: "/vco/kad/1.0.0",
          clientMode: false,
        }),
        mdns: mdns(),
      },
      connectionManager: {
        maxConnections: this.config.maxConnections,
        maxParallelDials: 100,
        maxIncomingPendingConnections: 1000,
        // Relay servers must accept many connections from the same IP (e.g.
        // clients behind NAT, or test suites on loopback).  The libp2p
        // default of 5 per host would reject concurrent stress-test clients.
        inboundConnectionThreshold: this.config.maxConnections,
      },
    });

    await handleSyncSessionChannels(node, async (channel) => {
      await handleSyncSession(channel, { store: store, core: this.core, config: this.config });
    });

    await node.start();
    this.node = node;

    if (this.config.httpPort !== undefined) {
      this.httpServer = http.createServer((req, res) => {
        if (req.url === "/health") {
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end("OK");
        } else if (req.url === "/address") {
          const addrs = this.multiaddrs.map(a => a.toString());
          res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
          res.end(JSON.stringify({
            peerId: this.peerId?.toString(),
            multiaddrs: addrs,
            // Prefer LAN TCP first (universally connectable), then any non-loopback TCP
            recommended: (() => {
              const isLan = (a: string) => /\/ip4\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(a);
              const isTcp = (a: string) => a.includes('/tcp/') && !a.includes('/ws');
              return addrs.find(a => isLan(a) && isTcp(a))
                ?? addrs.find(a => !a.includes('127.0.0.1') && isTcp(a));
            })()
          }));
        } else {
          res.writeHead(404);
          res.end();
        }
      });
      this.httpServer.listen(this.config.httpPort, this.config.httpHost);
      console.log(`HTTP Health Check started on ${this.config.httpHost}:${this.config.httpPort}`);
    }
  }

  async stop(): Promise<void> {
    await this.node?.stop();
    await this.store?.close();
    await new Promise<void>((resolve) => {
      if (this.httpServer) {
        this.httpServer.close(() => resolve());
      } else {
        resolve();
      }
    });
  }

  get peerId() { return this.node?.peerId; }
  get multiaddrs() { return this.node?.getMultiaddrs() ?? []; }
  /** Exposed for integration tests only — do not use in production code. */
  get storeForTest(): IRelayStore | undefined { return this.store; }
}
