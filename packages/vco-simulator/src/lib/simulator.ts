// packages/vco-simulator/src/lib/simulator.ts

export interface NetworkEvent {
  id: string;
  type: "system" | "transport" | "sync" | "object";
  message: string;
  timestamp: number;
  data?: any;
}

export class SimulatedWire {
  private listeners: ((event: NetworkEvent) => void)[] = [];

  public addListener(fn: (event: NetworkEvent) => void) {
    this.listeners.push(fn);
  }

  public emit(type: NetworkEvent["type"], message: string, data?: any, delay = 0) {
    const event: NetworkEvent = {
      id: Math.random().toString(36).slice(2, 9),
      type,
      message,
      timestamp: Date.now(),
      data
    };
    
    if (delay > 0) {
      setTimeout(() => this.listeners.forEach(l => l(event)), delay);
    } else {
      this.listeners.forEach(l => l(event));
    }
  }

  public broadcast(object: any) {
    this.emit("transport", `Relay: Received envelope ${object.id.slice(0, 8)}`, object);
    this.emit("transport", `Relay: Verifying PoW score (${object.powScore})...`, null, 400);
    this.emit("transport", `Relay: Signature valid. Propagating to 5 peers.`, null, 800);
    this.emit("sync", `Peer 0xed...f2: Requested range sync for /social/posts`, null, 1200);
    this.emit("sync", `Peer 0xed...f2: Reconciliation complete. 1 new object received.`, null, 1800);
  }
}

export const globalWire = new SimulatedWire();

export function log(type: NetworkEvent["type"], message: string, data?: any, delay = 0) {
  globalWire.emit(type, message, data, delay);
}
