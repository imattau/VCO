import { Command, Child } from '@tauri-apps/plugin-shell';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

export type NodeEvent = 
  | { type: 'ready', peerId: string, multiaddrs: string[] }
  | { type: 'envelope', channelId: string, envelope: string }
  | { type: 'stats', peerId: string, multiaddrs: string[], peers: string[], connections: { remotePeer: string, remoteAddr: string, tags: string[] }[], networkLoad: number }
  | { type: 'resolving', cid: string, channelId: string }
  | { type: 'dial_success', addr: string }
  | { type: 'error', message: string };

type EventListener = (event: NodeEvent) => void;

/**
 * Checks if the application is running inside Tauri.
 */
const isTauri = () => !!(window as any).__TAURI_INTERNALS__;

export class NodeClient {
  private static instance: NodeClient;
  private listeners: Set<EventListener> = new Set();
  private connected: boolean = false;
  public isReady: boolean = false;
  public peerId: string | null = null;
  public multiaddrs: string[] = [];
  public peers: string[] = [];
  public connections: { remotePeer: string, remoteAddr: string, tags: string[] }[] = [];

  private constructor() {}

  public static getInstance(): NodeClient {
    if (!NodeClient.instance) {
      NodeClient.instance = new NodeClient();
    }
    return NodeClient.instance;
  }

  /**
   * Connects to the native Rust libp2p node via Tauri IPC.
   * Fallback to a mock node if running in a standard browser.
   */
  public async connect(): Promise<void> {
    if (this.connected) return;
    this.connected = true;

    if (!isTauri()) {
      const mockNetworkEnabled = typeof import.meta !== 'undefined' && typeof (import.meta as any).env !== 'undefined' && (import.meta as any).env.VITE_MOCK_NETWORK === 'true';
      if (mockNetworkEnabled) {
        console.warn('VCO NodeClient: VITE_MOCK_NETWORK=true — using mock networking (dev only).');
        this.startMockNode();
      } else {
        console.error('VCO NodeClient: Not running in Tauri and VITE_MOCK_NETWORK is not set. Node unavailable.');
        this.handleEvent({ type: 'error', message: 'Node requires Tauri runtime. Set VITE_MOCK_NETWORK=true for browser development.' });
      }
      return;
    }

    try {
      // Listen for events from the native Rust node
      console.log('VCO NodeClient: Registering vco-node-event listener...');
      await listen<NodeEvent>('vco-node-event', (event) => {
        console.log('VCO NodeClient: Raw event received:', JSON.stringify(event.payload));
        this.handleEvent(event.payload);
      });

      console.log('VCO NodeClient: Listener registered. Requesting initial stats...');

      // Initial stats request
      this.getStats();
    } catch (error) {
      console.error('VCO NodeClient: Failed to connect to native node.', error);
      this.handleEvent({ type: 'error', message: `Failed to connect to native node: ${error}` });
    }
  }

  public subscribe(channelId: string) {
    if (isTauri()) invoke('subscribe', { channelId }).catch(console.error);
  }

  public unsubscribe(channelId: string) {
    if (isTauri()) invoke('unsubscribe', { channelId }).catch(console.error);
  }

  public publish(channelId: string, envelopeBase64: string) {
    if (isTauri()) invoke('publish', { channelId, envelopeBase64 }).catch(console.error);
  }

  public resolve(cidHex: string) {
    if (isTauri()) invoke('resolve', { cid: cidHex }).catch(console.error);
  }

  public putRecord(cidHex: string, payloadBase64: string) {
    if (isTauri()) invoke('put_record', { cid: cidHex, payloadBase64 }).catch(console.error);
  }

  public dial(addr: string) {
    if (isTauri()) invoke('dial', { addr }).catch(console.error);
  }

  public bootstrap(addrs: string[]) {
    if (isTauri()) invoke('bootstrap', { addrs }).catch(console.error);
  }

  public getStats() {
    if (isTauri()) invoke('get_stats').catch(console.error);
  }

  public async shutdown() {
    this.isReady = false;
    if (isTauri()) await invoke('shutdown').catch(console.error);
  }

  public onEvent(listener: EventListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private handleEvent(event: NodeEvent) {
    if (event.type === 'ready') {
      this.isReady = true;
      this.peerId = event.peerId;
      this.multiaddrs = event.multiaddrs;
      console.log('VCO NodeClient: Node ready. peerId:', event.peerId, 'multiaddrs:', event.multiaddrs);
    } else if (event.type === 'stats') {
      this.isReady = true;
      this.peerId = event.peerId;
      this.multiaddrs = event.multiaddrs;
      this.peers = event.peers;
      this.connections = event.connections;
      console.log('VCO NodeClient: Stats updated. peerId:', event.peerId, 'peers:', event.peers.length, 'isReady:', this.isReady);
    } else if (event.type === 'error') {
      console.error('VCO NodeClient: Error event:', event.message);
    }
    console.log('VCO NodeClient: Notifying', this.listeners.size, 'listeners');
    this.listeners.forEach(l => l(event));
  }

  private startMockNode() {
    this.isReady = true;
    this.peerId = `browser-mock-${Math.floor(Math.random() * 1000)}`;
    this.multiaddrs = ["/ip4/127.0.0.1/tcp/0/ws"];
    
    // Create a broadcast channel for cross-tab mock networking
    const channel = new BroadcastChannel('vco-mock-mesh');
    
    channel.onmessage = (event) => {
      if (event.data.sender !== this.peerId) {
        this.handleEvent({
          type: 'envelope',
          channelId: event.data.channelId,
          envelope: event.data.envelope
        });
      }
    };

    // Override publish for mock mode
    const originalPublish = this.publish.bind(this);
    this.publish = (channelId: string, envelopeBase64: string) => {
      if (!isTauri()) {
        channel.postMessage({
          sender: this.peerId,
          channelId,
          envelope: envelopeBase64
        });
      } else {
        originalPublish(channelId, envelopeBase64);
      }
    };

    // Emit ready event
    setTimeout(() => {
      this.handleEvent({
        type: 'ready',
        peerId: this.peerId!,
        multiaddrs: this.multiaddrs
      });
    }, 100);

    // Periodically emit mock stats
    setInterval(() => {
      this.handleEvent({
        type: 'stats',
        peerId: this.peerId!,
        multiaddrs: this.multiaddrs,
        peers: [],
        connections: [],
        networkLoad: 1.0
      });
    }, 5000);
  }
}
