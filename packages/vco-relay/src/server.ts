import { createVcoLibp2pNode, handleSyncSessionChannels } from "@vco/vco-transport";
import type { Libp2pNode } from "@vco/vco-transport";
import { identify } from "@libp2p/identify";
import { kadDHT } from "@libp2p/kad-dht";
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

    // Use persistent store for core (nullifier tracking)
    (this.core as any).nullifierStore = store;

    const node = await createVcoLibp2pNode({
      addresses: { listen: this.config.listenAddrs },
      services: {
        identify: identify(),
        dht: kadDHT({ clientMode: false }),
      },
      connectionManager: { maxConnections: this.config.maxConnections },
    });

    await handleSyncSessionChannels(node, async (channel) => {
      await handleSyncSession(channel, { store: store, core: this.core, config: this.config });
    });

    await node.start();
    this.node = node;

    if (this.config.httpPort) {
      this.httpServer = http.createServer((req, res) => {
        if (req.url === "/health") {
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end("OK");
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
}
