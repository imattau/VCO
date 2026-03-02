import { NodeClient } from './NodeClient';

export interface NetworkStats {
  peerId: string | null;
  multiaddrs: string[];
  peers: string[];
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
   * Resolves a peer profile from the DHT (Simulation).
   * In a real app, this would use a 'find_peer' IPC command.
   */
  static async resolvePeer(creatorId: string): Promise<any | null> {
    console.log(`Resolving peer ${creatorId} from swarm...`);
    // Real implementation would wait for a 'peer_resolved' event from sidecar
    return null;
  }
}
