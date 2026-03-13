import { Command, Child } from '@tauri-apps/plugin-shell';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

export type NodeEvent = 
  | { type: 'ready', peerId: string, multiaddrs: string[] }
  | { type: 'envelope', channelId: string, envelope: string }
  | { type: 'stats', peerId: string, multiaddrs: string[], peers: string[], connections: { remotePeer: string, remoteAddr: string, tags: string[] }[] }
  | { type: 'resolving', cid: string, channelId: string }
  | { type: 'dial_success', addr: string }
  | { type: 'error', message: string };

type EventListener = (event: NodeEvent) => void;

export class NodeClient {
  private static instance: NodeClient;
  private listeners: Set<EventListener> = new Set();
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
   */
  public async connect(): Promise<void> {
    try {
      // Listen for events from the native Rust node
      await listen<NodeEvent>('vco-node-event', (event) => {
        this.handleEvent(event.payload);
      });

      console.log('NodeClient: Connected to native Rust node.');
      
      // Initial stats request
      this.getStats();
    } catch (error) {
      console.error('NodeClient: Failed to connect to native node.', error);
    }
  }

  public subscribe(channelId: string) {
    invoke('subscribe', { channelId }).catch(console.error);
  }

  public unsubscribe(channelId: string) {
    invoke('unsubscribe', { channelId }).catch(console.error);
  }

  public publish(channelId: string, envelopeBase64: string) {
    invoke('publish', { channelId, envelopeBase64 }).catch(console.error);
  }

  public resolve(cidHex: string) {
    invoke('resolve', { cid: cidHex }).catch(console.error);
  }

  public putRecord(cidHex: string, payloadBase64: string) {
    invoke('put_record', { cid: cidHex, payloadBase64 }).catch(console.error);
  }

  public dial(addr: string) {
    invoke('dial', { addr }).catch(console.error);
  }

  public getStats() {
    invoke('get_stats').catch(console.error);
  }

  public async shutdown() {
    this.isReady = false;
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
    } else if (event.type === 'stats') {
      this.peerId = event.peerId;
      this.multiaddrs = event.multiaddrs;
      this.peers = event.peers;
      this.connections = event.connections;
    }
    this.listeners.forEach(l => l(event));
  }
}
