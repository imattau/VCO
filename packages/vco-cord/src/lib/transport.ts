// packages/vco-cord/src/lib/transport.ts
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

type Listener = (encoded: Uint8Array) => void;

const listeners = new Map<string, Set<Listener>>();
const subscribedChannels = new Set<string>(); // channels already registered with sidecar
let globalListenerInitialised = false;

function base64ToUint8Array(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function ensureGlobalListener(): void {
  if (globalListenerInitialised) return;
  globalListenerInitialised = true;
  void listen<string>("vco://sidecar", (event) => {
    let msg: { type: string; channelId?: string; envelope?: string };
    try {
      msg = JSON.parse(event.payload) as typeof msg;
    } catch {
      return;
    }
    if (msg.type === "envelope" && msg.channelId && msg.envelope) {
      const encoded = base64ToUint8Array(msg.envelope);
      listeners.get(msg.channelId)?.forEach((fn) => fn(encoded));
    }
  });
}

export function subscribe(channelId: string, fn: Listener): () => void {
  ensureGlobalListener();
  if (!listeners.has(channelId)) listeners.set(channelId, new Set());
  listeners.get(channelId)!.add(fn);
  if (!subscribedChannels.has(channelId)) {
    subscribedChannels.add(channelId);
    void invoke("vco_subscribe", { channelId });
  }
  return () => listeners.get(channelId)?.delete(fn);
}

export function publish(channelId: string, encoded: Uint8Array): void {
  const envelope = uint8ArrayToBase64(encoded);
  void invoke("vco_publish", { channelId, envelope });
}
