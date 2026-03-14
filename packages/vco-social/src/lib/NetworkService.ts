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
  private static eventUnsub: (() => void) | null = null;

  static startPolling(callback: (stats: NetworkStats) => void, ms: number = 5000) {
    if (this.pollInterval) return;

    const client = NodeClient.getInstance();

    const snapshot = () => ({
      peerId: client.peerId,
      multiaddrs: client.multiaddrs,
      peers: client.peers,
      connections: client.connections,
      isReady: client.isReady
    });

    // Push update immediately whenever the node emits any event
    this.eventUnsub = client.onEvent((event) => {
      const s = snapshot();
      console.log('NetworkService: event push →', event.type, '| isReady:', s.isReady, '| peerId:', s.peerId);
      callback(s);
    });

    const poll = () => {
      client.getStats();
      const s = snapshot();
      console.log('NetworkService: poll snapshot → isReady:', s.isReady, '| peerId:', s.peerId, '| peers:', s.peers.length);
      callback(s);
    };

    poll();
    this.pollInterval = setInterval(poll, ms);
  }

  static stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    if (this.eventUnsub) {
      this.eventUnsub();
      this.eventUnsub = null;
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
