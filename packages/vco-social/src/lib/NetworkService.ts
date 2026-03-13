import { NodeClient } from './NodeClient';

export interface NetworkStats {
  peerId: string | null;
  multiaddrs: string[];
  peers: string[];
  connections: { remotePeer: string, remoteAddr: string, tags: string[] }[];
  isReady: boolean;
}

export class NetworkService {
  private static pollInterval: NodeJS.Timeout | null = null;

  /**
   * Starts periodic polling of node statistics.
   */
  static startPolling(callback: (stats: NetworkStats) => void, ms: number = 5000) {
    if (this.pollInterval) return;

    const client = NodeClient.getInstance();
    
    const poll = () => {
      client.getStats();
      callback({
        peerId: client.peerId,
        multiaddrs: client.multiaddrs,
        peers: client.peers,
        connections: client.connections,
        isReady: client.isReady
      });
    };

    poll();
    this.pollInterval = setInterval(poll, ms);
  }

  static stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  /**
   * Resolves a peer profile from the DHT.
   * Event will be emitted back to NodeClient and handled by SocialContext.
   */
  static async resolvePeer(creatorId: string): Promise<void> {
    console.log(`Resolving peer ${creatorId} from swarm DHT...`);
    NodeClient.getInstance().resolve(creatorId);
  }
}
