import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { vcoStore } from './VcoStore';

export type NodeEvent =
  | { type: 'ready', peerId: string, multiaddrs: string[] }
  | { type: 'envelope', channelId: string, envelope: string }
  | { type: 'stats', peerId: string, multiaddrs: string[], peers: string[], connections: { remotePeer: string, remoteAddr: string, tags: string[] }[], networkLoad: number }
  | { type: 'resolving', cid: string, channelId: string }
  | { type: 'dialing', peerId?: string }
  | { type: 'dial_success', addr: string }
  | { type: 'error', message: string }
  | { type: 'sync_session_ready', sessionId: string }
  | { type: 'sync_frame', sessionId: string, frameB64: string }
  | { type: 'sync_complete', sessionId: string, receivedCount: number }
  | { type: 'sync_error', sessionId: string, message: string };

type EventListener = (event: NodeEvent) => void;

/**
 * Small async queue to bridge event-driven IPC frames into a sequential
 * async iteration pattern for the bisect loop.
 */
class AsyncQueue<T> {
  private queue: T[] = [];
  private pending: ((value: T) => void) | null = null;

  enqueue(item: T): void {
    if (this.pending) {
      const resolve = this.pending;
      this.pending = null;
      resolve(item);
    } else {
      this.queue.push(item);
    }
  }

  dequeue(): Promise<T> {
    if (this.queue.length > 0) {
      return Promise.resolve(this.queue.shift()!);
    }
    return new Promise<T>((resolve) => {
      this.pending = resolve;
    });
  }
}

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

  // Delta-sync public state
  public syncInProgress: boolean = false;
  public lastSyncAt: Date | null = null;
  public relayAddr: string | null = localStorage.getItem('vco.relay_addr');

  // Per-session frame queues keyed by sessionId
  private sessionQueues: Map<string, AsyncQueue<Uint8Array>> = new Map();

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
    if (isTauri()) {
      invoke('dial', { addr }).catch(console.error);
    } else {
      // Mock dial simulation
      this.handleEvent({ type: 'dialing', peerId: addr.split('/').pop() });
      setTimeout(() => {
        this.peers = [addr];
        this.connections = [{ remotePeer: addr.split('/').pop() || 'mock-peer', remoteAddr: addr, tags: ['connected'] }];
        this.handleEvent({ type: 'dial_success', addr });
        this.handleEvent({
          type: 'stats',
          peerId: this.peerId!,
          multiaddrs: this.multiaddrs,
          peers: this.peers,
          connections: this.connections,
          networkLoad: 1.0
        });
      }, 1000);
    }
  }

  public bootstrap(addrs: string[]) {
    if (isTauri()) {
      invoke('bootstrap', { addrs }).catch(console.error);
    } else {
      this.handleEvent({ type: 'dialing' });
      setTimeout(() => {
        this.handleEvent({ type: 'stats', peerId: this.peerId!, multiaddrs: this.multiaddrs, peers: addrs, connections: [], networkLoad: 1.0 });
      }, 500);
    }
  }

  public getStats() {
    if (isTauri()) {
      invoke('get_stats').catch(console.error);
    } else {
      this.handleEvent({
        type: 'stats',
        peerId: this.peerId!,
        multiaddrs: this.multiaddrs,
        peers: this.peers,
        connections: this.connections,
        networkLoad: 1.0
      });
    }
  }

  public async shutdown() {
    this.isReady = false;
    if (isTauri()) await invoke('shutdown').catch(console.error);
  }

  public onEvent(listener: EventListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Initiate a delta-sync session with the given relay address.
   * Returns immediately if a sync is already in progress.
   */
  public async syncWithRelay(relayAddr: string): Promise<void> {
    if (this.syncInProgress) return;
    this.syncInProgress = true;

    const sessionId = crypto.randomUUID();

    try {
      await invoke('sync_with_relay', { relayAddr, sessionId });
    } catch (e) {
      console.error('VCO NodeClient: sync_with_relay invoke failed', e);
      this.syncInProgress = false;
      this.handleEvent({ type: 'sync_error', sessionId, message: String(e) });
      return;
    }

    // Wait for sync_session_ready with 10s timeout
    const sessionReady = await new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => {
        cleanup();
        resolve(false);
      }, 10_000);

      const cleanup = this.onEvent((event) => {
        if (event.type === 'sync_session_ready' && event.sessionId === sessionId) {
          clearTimeout(timeout);
          cleanup();
          resolve(true);
        } else if (event.type === 'sync_error' && event.sessionId === sessionId) {
          clearTimeout(timeout);
          cleanup();
          resolve(false);
        }
      });
    });

    if (!sessionReady) {
      console.error('VCO NodeClient: Sync session timed out or errored', sessionId);
      this.syncInProgress = false;
      return;
    }

    try {
      await this._runBisectLoop(sessionId);
      this.lastSyncAt = new Date();
    } catch (e) {
      console.error('VCO NodeClient: Bisect loop error', e);
    } finally {
      this.syncInProgress = false;
      this.listeners.forEach(l => l({ type: 'stats', peerId: this.peerId!, multiaddrs: this.multiaddrs, peers: this.peers, connections: this.connections, networkLoad: 1.0 }));
    }
  }

  /**
   * Run the Negentropy bisect loop over the open sync session.
   * Direct port of runClientDeltaSync from the delta-sync test.
   */
  private async _runBisectLoop(sessionId: string): Promise<void> {
    // Dynamic imports: @vco/vco-sync uses Node.js APIs (Buffer, libp2p) that are
    // unavailable in Android WebView. Deferring to runtime avoids a bundle-time crash.
    const { SyncRangeProofProtocol, computeRangeFingerprint } = await import('@vco/vco-sync');
    const { decodeEnvelopeProto } = await import('@vco/vco-core');
    type RangeProof = import('@vco/vco-sync').RangeProof;

    // Create per-session queue and register it
    const queue = new AsyncQueue<Uint8Array>();
    this.sessionQueues.set(sessionId, queue);

    // Build the channel adapter for SyncRangeProofProtocol
    const channel = {
      send: async (payload: Uint8Array): Promise<void> => {
        let binary = '';
        for (let i = 0; i < payload.byteLength; i++) {
          binary += String.fromCharCode(payload[i]);
        }
        const frameB64 = btoa(binary);
        await invoke('sync_respond', { sessionId, frameB64 }).catch((e) => {
          console.warn('VCO NodeClient: sync_respond error (session may be closing)', e);
        });
      },
      receive: async (): Promise<Uint8Array> => {
        return queue.dequeue();
      },
    };

    const protocol = new SyncRangeProofProtocol(channel);

    // Get local header hashes once before the first sendRangeProofs
    const localHashes = await vcoStore.getAllHeaderHashes();
    const fullRange = { start: 0x00, end: 0xff };
    const initialRoot = await computeRangeFingerprint(fullRange, localHashes);
    const initialProofs: RangeProof[] = [{ range: fullRange, merkleRoot: initialRoot }];

    // Send initial range proofs
    await protocol.sendRangeProofs(initialProofs);

    // Bisect loop until convergence
    let relayProofs = await protocol.receiveRangeProofs();
    while (true) {
      const nextRound: RangeProof[] = [];
      let anyDiff = false;

      for (const rp of relayProofs) {
        const clientRoot = await computeRangeFingerprint(rp.range, localHashes);
        const match = clientRoot.length === rp.merkleRoot.length &&
          clientRoot.every((b, i) => b === rp.merkleRoot[i]);
        if (!match) {
          anyDiff = true;
          if (rp.range.start === rp.range.end) {
            // Unit range — relay will send the envelope; stop bisecting this branch
          } else {
            const mid = Math.floor((rp.range.start + rp.range.end) / 2);
            const leftRoot = await computeRangeFingerprint(
              { start: rp.range.start, end: mid },
              localHashes,
            );
            const rightRoot = await computeRangeFingerprint(
              { start: mid + 1, end: rp.range.end },
              localHashes,
            );
            nextRound.push(
              { range: { start: rp.range.start, end: mid }, merkleRoot: leftRoot },
              { range: { start: mid + 1, end: rp.range.end }, merkleRoot: rightRoot },
            );
          }
        }
      }

      if (!anyDiff || nextRound.length === 0) break;

      await protocol.sendRangeProofs(nextRound);
      relayProofs = await protocol.receiveRangeProofs();
    }

    // Read missing envelopes until zero-length sentinel (empty frameB64)
    // The sync_complete event signals the end; we drain the queue until we see
    // either a zero-length frame or the queue resolves with an empty payload.
    const completionPromise = new Promise<void>((resolve) => {
      const cleanup = this.onEvent((event) => {
        if (event.type === 'sync_complete' && event.sessionId === sessionId) {
          cleanup();
          resolve();
        } else if (event.type === 'sync_error' && event.sessionId === sessionId) {
          cleanup();
          resolve();
        }
      });
    });

    // Drain envelope frames until zero-length sentinel or sync_complete
    const drainLoop = async () => {
      while (true) {
        const bytes = await queue.dequeue();
        if (bytes.length === 0) break; // zero-length sentinel = pull phase complete
        try {
          const env = decodeEnvelopeProto(bytes);
          vcoStore.storeEnvelope(env, 'synced').catch(console.error);
          // Emit synthetic envelope event so UI updates (same path as gossipsub)
          const channelIdHex = env.header.contextId
            ? Array.from(env.header.contextId).map(b => b.toString(16).padStart(2, '0')).join('')
            : Array.from(env.header.creatorId).map(b => b.toString(16).padStart(2, '0')).join('');
          // Build base64 payload for the event (re-encode the raw bytes we already have)
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
          this.handleEvent({
            type: 'envelope',
            channelId: channelIdHex,
            envelope: btoa(binary),
          });
        } catch {
          // Not an envelope — ignore
        }
      }
    };

    try {
      await Promise.race([drainLoop(), completionPromise]);
    } finally {
      this.sessionQueues.delete(sessionId);
    }
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
    } else if (event.type === 'envelope') {
      // Write gossipsub envelope to store (fire-and-forget)
      // Dynamic import: @vco/vco-core may transitively pull in Node.js deps via
      // @vco/vco-sync when bundled together; keep it lazy to be safe.
      import('@vco/vco-core').then(({ decodeEnvelopeProto }) => {
        try {
          const binaryStr = atob(event.envelope);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          const decoded = decodeEnvelopeProto(bytes);
          vcoStore.storeEnvelope(decoded, 'pending').catch(console.error);
        } catch (e) {
          console.warn('VCO NodeClient: Failed to decode/store gossipsub envelope', e);
          this.handleEvent({ type: 'error', message: `Failed to decode gossipsub envelope: ${e}` });
        }
      }).catch((e) => {
        console.warn('VCO NodeClient: Failed to load @vco/vco-core for envelope decode', e);
        this.handleEvent({ type: 'error', message: `Failed to decode gossipsub envelope: ${e}` });
      });
    } else if (event.type === 'dial_success') {
      // Auto-trigger sync if this is the configured relay
      if (this.relayAddr && event.addr.startsWith(this.relayAddr)) {
        this.syncWithRelay(this.relayAddr).catch(console.error);
      }
    } else if (event.type === 'sync_frame') {
      // Deliver frame to the per-session queue
      const queue = this.sessionQueues.get(event.sessionId);
      if (queue) {
        if (event.frameB64 === '') {
          // zero-length sentinel
          queue.enqueue(new Uint8Array(0));
        } else {
          try {
            const binaryStr = atob(event.frameB64);
            const bytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) {
              bytes[i] = binaryStr.charCodeAt(i);
            }
            queue.enqueue(bytes);
          } catch (e) {
            console.warn('VCO NodeClient: Failed to decode sync_frame', e);
            // Enqueue a zero-length sentinel so the bisect loop unblocks,
            // then emit sync_error so the caller knows the session is broken.
            queue.enqueue(new Uint8Array(0));
            this.handleEvent({ type: 'sync_error', sessionId: event.sessionId, message: `Bad sync_frame: ${e}` });
          }
        }
      }
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
