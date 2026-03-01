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
  public isObfuscated = false;

  public addListener(fn: (event: NetworkEvent) => void) {
    this.listeners.push(fn);
  }

  public removeListener(fn: (event: NetworkEvent) => void) {
    this.listeners = this.listeners.filter(l => l !== fn);
  }

  public setObfuscation(enabled: boolean) {
    this.isObfuscated = enabled;
    this.emit("system", `TOL Mode ${enabled ? "ENABLED" : "DISABLED"}`);
  }

  public emit(type: NetworkEvent["type"], message: string, data?: any, delay = 0) {
    let finalMessage = message;
    
    // In obfuscated mode, transport/sync events look like generic frames to an observer
    if (this.isObfuscated && (type === "transport" || type === "sync" || type === "object")) {
      finalMessage = `[TOL Frame] Encrypted Payload (Fixed Size: 1024 bytes)`;
    }

    const event: NetworkEvent = {
      id: Math.random().toString(36).slice(2, 9),
      type,
      message: finalMessage,
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
    
    if (object.isZkp) {
      this.emit("transport", "Relay: Received anonymous envelope. Verifying ZKP (Circuit: 0x01)...", null, 400);
      this.emit("transport", `Relay: Nullifier check (Unique: ${object.nullifier.slice(0, 8)}...). ZKP Valid. Admitting object.`, null, 800);
    }

    if (object.contextId) {
      this.emit("transport", `Relay: Routing by Blind Context ID (0x${object.contextId})`, null, 200);
    }
    
    this.emit("transport", `Relay: Verifying PoW score (${object.powScore})...`, null, 400);
    
    if (!object.isZkp) {
      this.emit("transport", `Relay: Signature valid. Propagating to 5 peers.`, null, 800);
    }
    
    this.emit("sync", `Peer 0xed...f2: Requested range sync for /social/posts`, null, 1200);
    this.emit("sync", `Peer 0xed...f2: Reconciliation complete. 1 new object received.`, null, 1800);
  }

  public simulateSpam() {
    this.emit("system", "ATTACK: Attempting to flood relay with 0-PoW envelopes...");
    for (let i = 0; i < 20; i++) {
      const id = Math.random().toString(16).slice(2, 10);
      const msg = this.isObfuscated ? `[TOL Frame] Low-PoW Pattern Detected (Dropped)` : `[SPAM] Dropped low-PoW envelope ${id}`;
      this.emit("transport", msg, null, i * 50);
    }
    this.emit("system", "Relay Health: Stable (PoW filter blocked 20/20 spam attempts)", null, 1100);
  }
}

export const globalWire = new SimulatedWire();

export function log(type: NetworkEvent["type"], message: string, data?: any, delay = 0) {
  globalWire.emit(type, message, data, delay);
}
