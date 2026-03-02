import { Command, Child } from '@tauri-apps/plugin-shell';

type NodeEvent = 
  | { type: 'ready', peerId: string, multiaddrs: string[] }
  | { type: 'envelope', channelId: string, envelope: string }
  | { type: 'stats', peerId: string, multiaddrs: string[], peers: string[] }
  | { type: 'resolving', cid: string, channelId: string }
  | { type: 'error', message: string };

type EventListener = (event: NodeEvent) => void;

export class NodeClient {
  private static instance: NodeClient;
  private process: Child | null = null;
  private listeners: Set<EventListener> = new Set();
  public isReady: boolean = false;
  public peerId: string | null = null;
  public multiaddrs: string[] = [];
  public peers: string[] = [];

  private constructor() {}

  public static getInstance(): NodeClient {
    if (!NodeClient.instance) {
      NodeClient.instance = new NodeClient();
    }
    return NodeClient.instance;
  }

  /**
   * Starts the vco-node sidecar process via Tauri shell.
   */
  public async connect(): Promise<void> {
    if (this.process) return;

    try {
      // Assuming 'vco-node' is bundled as a sidecar via Tauri config
      const command = Command.sidecar('binaries/vco-node');
      
      command.stdout.on('data', (line) => {
        try {
          const event = JSON.parse(line) as NodeEvent;
          this.handleEvent(event);
        } catch (e) {
          console.warn('NodeClient: Received non-JSON stdout:', line);
        }
      });

      command.stderr.on('data', (line) => {
        console.error('NodeClient STDERR:', line);
      });

      this.process = await command.spawn();
      console.log('NodeClient: Sidecar process spawned with PID:', this.process.pid);
    } catch (error) {
      console.error('NodeClient: Failed to spawn sidecar, falling back to mock mode.', error);
      // In a pure web environment, we won't have the sidecar.
    }
  }

  public subscribe(channelId: string) {
    this.send({ type: 'subscribe', channelId });
  }

  public unsubscribe(channelId: string) {
    this.send({ type: 'unsubscribe', channelId });
  }

  public publish(channelId: string, envelopeBase64: string) {
    this.send({ type: 'publish', channelId, envelope: envelopeBase64 });
  }

  public resolve(cidHex: string) {
    this.send({ type: 'resolve', cid: cidHex });
  }

  public getStats() {
    this.send({ type: 'get_stats' });
  }

  public async shutdown() {
    this.send({ type: 'shutdown' });
    this.process = null;
    this.isReady = false;
  }

  public onEvent(listener: EventListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private send(command: any) {
    if (this.process) {
      this.process.write(JSON.stringify(command) + "\n");
    } else {
      console.log('NodeClient (Mock) Command:', command);
    }
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
    }
    this.listeners.forEach(l => l(event));
  }
}
