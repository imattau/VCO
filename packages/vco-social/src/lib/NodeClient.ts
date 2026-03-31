import { invoke } from '@tauri-apps/api/core';
import type { Libp2pNode } from '@vco/vco-transport';
import { vcoStore } from './VcoStore';
import { getPlatform } from './platform';

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
  public relayAddr: string | null = getPlatform().getLocalStorage().getItem('vco.relay_addr');

  // Per-session frame queues keyed by sessionId
  private sessionQueues: Map<string, AsyncQueue<Uint8Array>> = new Map();

  // Browser-mode libp2p node (null in Tauri mode)
  private libp2pNode: Libp2pNode | null = null;

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

    if (!getPlatform().isTauri()) {
      // Prefer build-time env var, fall back to user's saved relay address
      const relayWsAddr = getPlatform().getEnvVar('VITE_RELAY_WS_ADDR') ?? this.relayAddr ?? null;
      const mockNetworkEnabled = getPlatform().getEnvVar('VITE_MOCK_NETWORK') === 'true';
      if (relayWsAddr) {
        await this.startBrowserNode(relayWsAddr);
      } else if (mockNetworkEnabled) {
        console.warn('VCO NodeClient: VITE_MOCK_NETWORK=true — using mock networking (dev only).');
        this.startMockNode();
      } else {
        console.error('VCO NodeClient: Not running in Tauri. Set VITE_RELAY_WS_ADDR or configure a relay address in Settings.');
        this.handleEvent({ type: 'error', message: 'Configure a relay address in Settings to connect to the VCO network.' });
      }
      return;
    }

    try {
      // Listen for events from the native Rust node
      console.log('VCO NodeClient: Registering vco-node-event listener...');
      await getPlatform().listen<NodeEvent>('vco-node-event', (event) => {
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
    // Browser mode: envelopes arrive via sync session, no pubsub
    if (!this.libp2pNode && getPlatform().isTauri()) {
      invoke('subscribe', { channelId }).catch(console.error);
    }
  }

  public unsubscribe(channelId: string) {
    if (!this.libp2pNode && getPlatform().isTauri()) {
      invoke('unsubscribe', { channelId }).catch(console.error);
    }
  }

  public publish(channelId: string, envelopeBase64: string) {
    if (!this.libp2pNode && getPlatform().isTauri()) {
      invoke('publish', { channelId, envelopeBase64 }).catch(console.error);
    }
  }

  public resolve(cidHex: string) {
    if (getPlatform().isTauri()) invoke('resolve', { cid: cidHex }).catch(console.error);
  }

  public putRecord(cidHex: string, payloadBase64: string) {
    if (getPlatform().isTauri()) invoke('put_record', { cid: cidHex, payloadBase64 }).catch(console.error);
  }

  public dial(addr: string) {
    if (this.libp2pNode) {
      this.handleEvent({ type: 'dialing', peerId: addr.split('/').pop() });
      this.libp2pNode.dial(addr as any).then((conn) => {
        this.handleEvent({ type: 'dial_success', addr });
        this._emitBrowserStats();
      }).catch((e) => {
        this.handleEvent({ type: 'error', message: `Dial failed: ${e}` });
      });
    } else if (getPlatform().isTauri()) {
      invoke('dial', { addr }).catch(console.error);
    } else {
      // Mock dial simulation
      this.handleEvent({ type: 'dialing', peerId: addr.split('/').pop() });
      setTimeout(() => {
        // Basic multiaddr validation for the mock
        if (!addr.startsWith('/') || addr.split('/').length < 3) {
          this.handleEvent({ 
            type: 'error', 
            message: `Invalid multiaddress format: "${addr}". Addresses must start with /ip4, /dns, etc.` 
          });
          return;
        }

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
    if (getPlatform().isTauri()) {
      invoke('bootstrap', { addrs }).catch(console.error);
    } else {
      this.handleEvent({ type: 'dialing' });
      setTimeout(() => {
        this.handleEvent({ type: 'stats', peerId: this.peerId!, multiaddrs: this.multiaddrs, peers: addrs, connections: [], networkLoad: 1.0 });
      }, 500);
    }
  }

  public getStats() {
    if (this.libp2pNode) {
      this._emitBrowserStats();
    } else if (getPlatform().isTauri()) {
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

  private _emitBrowserStats() {
    if (!this.libp2pNode) return;
    const peers = this.libp2pNode.getPeers().map(p => p.toString());
    const connections = this.libp2pNode.getConnections().map(c => ({
      remotePeer: c.remotePeer.toString(),
      remoteAddr: c.remoteAddr.toString(),
      tags: ['connected'],
    }));
    this.handleEvent({
      type: 'stats',
      peerId: this.libp2pNode.peerId.toString(),
      multiaddrs: this.libp2pNode.getMultiaddrs().map(a => a.toString()),
      peers,
      connections,
      networkLoad: 1.0,
    });
  }

  public async shutdown() {
    this.isReady = false;
    if (getPlatform().isTauri()) await invoke('shutdown').catch(console.error);
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

    const sessionId = getPlatform().randomUUID();

    if (this.libp2pNode) {
      try {
        await this._runBrowserSync(sessionId, relayAddr);
        this.lastSyncAt = new Date();
      } catch (e) {
        console.error('VCO NodeClient: Browser sync error', e);
      } finally {
        this.syncInProgress = false;
        this._emitBrowserStats();
      }
      return;
    }

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
      // Request authoritative stats from Rust rather than emitting a synthetic
      // event built from potentially-stale instance fields.
      this.getStats();
    }
  }

  /**
   * Run the Negentropy bisect loop over the open sync session.
   * Direct port of runClientDeltaSync from the delta-sync test.
   */
  private async _runBrowserSync(sessionId: string, relayAddr: string): Promise<void> {
    const { openSyncSessionChannel } = await import('@vco/vco-transport');

    // Dial if not already connected
    const node = this.libp2pNode!;
    const peerId = relayAddr.split('/p2p/')[1];
    const alreadyConnected = peerId && node.getPeers().some(p => p.toString() === peerId);
    const conn = alreadyConnected
      ? node.getConnections().find(c => c.remotePeer.toString() === peerId)!
      : await node.dial(relayAddr as any);

    const channel = await openSyncSessionChannel(conn as any);

    // Pump incoming frames into the session queue
    const queue = new AsyncQueue<Uint8Array>();
    this.sessionQueues.set(sessionId, queue);
    (async () => {
      while (true) {
        try {
          const frame = await channel.receive();
          queue.enqueue(frame);
        } catch {
          queue.enqueue(new Uint8Array(0));
          break;
        }
      }
    })();

    this.handleEvent({ type: 'sync_session_ready', sessionId });

    await this._runBisectLoop(sessionId, (payload) => channel.send(payload));
    this.sessionQueues.delete(sessionId);
  }

  private async _runBisectLoop(sessionId: string, sendFn?: (payload: Uint8Array) => Promise<void>): Promise<void> {
    // Dynamic imports: @vco/vco-sync uses Node.js APIs (Buffer, libp2p) that are
    // unavailable in Android WebView. Deferring to runtime avoids a bundle-time crash.
    const { SyncRangeProofProtocol, computeRangeFingerprint } = await import('@vco/vco-sync');
    const { decodeEnvelopeProto } = await import('@vco/vco-core');
    type RangeProof = import('@vco/vco-sync').RangeProof;

    // Create per-session queue and register it
    const queue = new AsyncQueue<Uint8Array>();
    this.sessionQueues.set(sessionId, queue);

    // Build the channel adapter for SyncRangeProofProtocol
    const defaultSendFn = async (payload: Uint8Array): Promise<void> => {
      let binary = '';
      for (let i = 0; i < payload.byteLength; i++) {
        binary += String.fromCharCode(payload[i]);
      }
      const frameB64 = getPlatform().btoa(binary);
      await invoke('sync_respond', { sessionId, frameB64 }).catch((e) => {
        console.warn('VCO NodeClient: sync_respond error (session may be closing)', e);
      });
    };
    const channel = {
      send: sendFn ?? defaultSendFn,
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
            envelope: getPlatform().btoa(binary),
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
          const binaryStr = getPlatform().atob(event.envelope);
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
            const binaryStr = getPlatform().atob(event.frameB64);
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

  private async startBrowserNode(relayWsAddr: string): Promise<void> {
    const { createVcoLibp2pNode } = await import('@vco/vco-transport');
    const { webSockets } = await import('@libp2p/websockets');
    const { generateKeyPair, privateKeyFromProtobuf, privateKeyToProtobuf } = await import('@libp2p/crypto/keys');

    // Persist the libp2p private key so the PeerId is stable across restarts
    const LIBP2P_KEY_STORAGE = 'vco.libp2p_private_key';
    const storage = getPlatform().getLocalStorage();
    let privateKey;
    const stored = storage.getItem(LIBP2P_KEY_STORAGE);
    if (stored) {
      try {
        const bytes = Uint8Array.from(atob(stored), c => c.charCodeAt(0));
        privateKey = await privateKeyFromProtobuf(bytes);
      } catch {
        storage.removeItem(LIBP2P_KEY_STORAGE);
      }
    }
    if (!privateKey) {
      privateKey = await generateKeyPair('Ed25519');
      const bytes = privateKeyToProtobuf(privateKey);
      storage.setItem(LIBP2P_KEY_STORAGE, btoa(String.fromCharCode(...bytes)));
    }

    const node = await createVcoLibp2pNode({
      privateKey,
      transports: [webSockets()],
    });

    this.libp2pNode = node;
    await node.start();

    this.peerId = node.peerId.toString();
    this.multiaddrs = node.getMultiaddrs().map(a => a.toString());

    // Emit stats when peer connects or disconnects
    node.addEventListener('peer:connect', () => this._emitBrowserStats());
    node.addEventListener('peer:disconnect', () => this._emitBrowserStats());

    this.handleEvent({ type: 'ready', peerId: this.peerId, multiaddrs: this.multiaddrs });

    // Connect to relay
    try {
      this.handleEvent({ type: 'dialing' });
      await node.dial(relayWsAddr as any);
      this.handleEvent({ type: 'dial_success', addr: relayWsAddr });
      this._emitBrowserStats();
    } catch (e) {
      this.handleEvent({ type: 'error', message: `Failed to connect to relay: ${e}` });
    }

    // Periodic stats
    setInterval(() => this._emitBrowserStats(), 5000);
  }

  private startMockNode() {
    this.isReady = true;
    this.peerId = `browser-mock-${Math.floor(Math.random() * 1000)}`;
    this.multiaddrs = ["/ip4/127.0.0.1/tcp/0/ws"];

    // Create a broadcast channel for cross-tab mock networking
    const channel = getPlatform().createBroadcastChannel('vco-mock-mesh');

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
      if (!getPlatform().isTauri()) {
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
