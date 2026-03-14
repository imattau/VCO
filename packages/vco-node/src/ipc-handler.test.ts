import { describe, it, expect, vi } from "vitest";
import {
  createIpcState,
  storeEnvelope,
  registerChannelListener,
  replayChannel,
  handleMessage,
  uint8ArrayToBase64,
  base64ToUint8Array,
} from "./ipc-handler.js";

function makeMockNode(overrides: Partial<{
  peerId: string;
  multiaddrs: string[];
  peers: string[];
  connections: Array<{ remotePeer: string; remoteAddr: string }>;
  dialResult: Promise<void>;
}> = {}) {
  return {
    peerId: { toString: () => overrides.peerId ?? "peer-abc" },
    getMultiaddrs: () => (overrides.multiaddrs ?? ["/ip4/127.0.0.1/tcp/1234"]).map(a => ({ toString: () => a })),
    getPeers: () => (overrides.peers ?? []).map(p => ({ toString: () => p })),
    getConnections: () => (overrides.connections ?? []).map(c => ({
      remotePeer: { toString: () => c.remotePeer },
      remoteAddr: { toString: () => c.remoteAddr },
    })),
    dial: vi.fn(() => overrides.dialResult ?? Promise.resolve()),
    stop: vi.fn(() => Promise.resolve()),
    services: {
      dht: {
        findProviders: async function* () { /* no providers by default */ },
      },
    },
  };
}

describe("uint8ArrayToBase64 / base64ToUint8Array", () => {
  it("roundtrips correctly", () => {
    const original = new Uint8Array([1, 2, 3, 255, 0]);
    const b64 = uint8ArrayToBase64(original);
    expect(base64ToUint8Array(b64)).toEqual(original);
  });

  it("produces valid base64 string", () => {
    const b64 = uint8ArrayToBase64(new Uint8Array([72, 101, 108, 108, 111]));
    expect(b64).toBe(Buffer.from("Hello").toString("base64"));
  });
});

describe("storeEnvelope", () => {
  it("stores envelopes per channel", () => {
    const state = createIpcState();
    const env = new Uint8Array([1, 2, 3]);
    storeEnvelope(state, "ch1", env);
    expect(state.channelStore.get("ch1")).toHaveLength(1);
    expect(state.channelStore.get("ch1")![0]).toEqual(env);
  });

  it("appends multiple envelopes in order", () => {
    const state = createIpcState();
    storeEnvelope(state, "ch1", new Uint8Array([1]));
    storeEnvelope(state, "ch1", new Uint8Array([2]));
    expect(state.channelStore.get("ch1")).toHaveLength(2);
  });

  it("isolates envelopes across channels", () => {
    const state = createIpcState();
    storeEnvelope(state, "ch1", new Uint8Array([1]));
    storeEnvelope(state, "ch2", new Uint8Array([2]));
    expect(state.channelStore.get("ch1")).toHaveLength(1);
    expect(state.channelStore.get("ch2")).toHaveLength(1);
  });
});

describe("registerChannelListener", () => {
  it("registers a listener that emits envelope events", () => {
    const state = createIpcState();
    const emitted: unknown[] = [];
    const emit = (obj: Record<string, unknown>) => emitted.push(obj);

    registerChannelListener(state, "ch1", emit);
    const listeners = state.inboundListeners.get("ch1")!;
    listeners[0](new Uint8Array([9, 8]));

    expect(emitted).toHaveLength(1);
    expect((emitted[0] as any).type).toBe("envelope");
    expect((emitted[0] as any).channelId).toBe("ch1");
  });

  it("is idempotent — second registration is a no-op", () => {
    const state = createIpcState();
    const emit = vi.fn();
    registerChannelListener(state, "ch1", emit);
    registerChannelListener(state, "ch1", emit);
    expect(state.inboundListeners.get("ch1")).toHaveLength(1);
  });
});

describe("replayChannel", () => {
  it("emits all stored envelopes on subscribe", () => {
    const state = createIpcState();
    const emit = vi.fn();
    storeEnvelope(state, "ch1", new Uint8Array([1]));
    storeEnvelope(state, "ch1", new Uint8Array([2]));

    replayChannel(state, "ch1", emit);

    expect(emit).toHaveBeenCalledTimes(2);
    expect(emit.mock.calls[0][0].channelId).toBe("ch1");
  });

  it("emits nothing for unknown channel", () => {
    const state = createIpcState();
    const emit = vi.fn();
    replayChannel(state, "no-such-channel", emit);
    expect(emit).not.toHaveBeenCalled();
  });
});

describe("handleMessage — subscribe", () => {
  it("adds channel to subscriptions and replays stored envelopes", async () => {
    const state = createIpcState();
    storeEnvelope(state, "ch1", new Uint8Array([42]));
    const emitted: unknown[] = [];
    const emit = (obj: Record<string, unknown>) => emitted.push(obj);

    await handleMessage(JSON.stringify({ type: "subscribe", channelId: "ch1" }), state, makeMockNode() as any, emit);

    expect(state.subscriptions.has("ch1")).toBe(true);
    expect(emitted.some((e: any) => e.type === "envelope" && e.channelId === "ch1")).toBe(true);
  });
});

describe("handleMessage — unsubscribe", () => {
  it("removes channel from subscriptions", async () => {
    const state = createIpcState();
    state.subscriptions.add("ch1");
    const emit = vi.fn();

    await handleMessage(JSON.stringify({ type: "unsubscribe", channelId: "ch1" }), state, makeMockNode() as any, emit);

    expect(state.subscriptions.has("ch1")).toBe(false);
  });
});

describe("handleMessage — publish", () => {
  it("stores envelope and fires registered listener", async () => {
    const state = createIpcState();
    const fired: Uint8Array[] = [];
    state.inboundListeners.set("ch1", [(enc) => fired.push(enc)]);
    const emit = vi.fn();

    const payload = new Uint8Array([7, 8, 9]);
    const b64 = uint8ArrayToBase64(payload);
    await handleMessage(JSON.stringify({ type: "publish", channelId: "ch1", envelope: b64 }), state, makeMockNode() as any, emit);

    expect(state.channelStore.get("ch1")).toHaveLength(1);
    expect(fired[0]).toEqual(payload);
  });

  it("stores envelope even with no registered listener", async () => {
    const state = createIpcState();
    const emit = vi.fn();
    const b64 = uint8ArrayToBase64(new Uint8Array([1]));
    await handleMessage(JSON.stringify({ type: "publish", channelId: "ch-new", envelope: b64 }), state, makeMockNode() as any, emit);
    expect(state.channelStore.get("ch-new")).toHaveLength(1);
  });
});

describe("handleMessage — get_stats", () => {
  it("emits stats with peerId, multiaddrs, peers, connections", async () => {
    const emitted: unknown[] = [];
    const emit = (obj: Record<string, unknown>) => emitted.push(obj);
    const node = makeMockNode({
      peerId: "test-peer",
      multiaddrs: ["/ip4/1.2.3.4/tcp/9000"],
      peers: ["peer-1"],
      connections: [{ remotePeer: "peer-1", remoteAddr: "/ip4/1.2.3.4/tcp/9000" }],
    });

    await handleMessage(JSON.stringify({ type: "get_stats" }), createIpcState(), node as any, emit);

    const stats = emitted[0] as any;
    expect(stats.type).toBe("stats");
    expect(stats.peerId).toBe("test-peer");
    expect(stats.multiaddrs).toContain("/ip4/1.2.3.4/tcp/9000");
    expect(stats.peers).toContain("peer-1");
    expect(stats.connections[0].remotePeer).toBe("peer-1");
  });
});

describe("handleMessage — resolve", () => {
  it("subscribes to vco://objects/<cid> channel and emits resolving event", async () => {
    const state = createIpcState();
    const emitted: unknown[] = [];
    const emit = (obj: Record<string, unknown>) => emitted.push(obj);
    const cid = "deadbeef";

    await handleMessage(JSON.stringify({ type: "resolve", cid }), state, makeMockNode() as any, emit);

    expect(state.subscriptions.has(`vco://objects/${cid}`)).toBe(true);
    const resolving = emitted.find((e: any) => e.type === "resolving") as any;
    expect(resolving).toBeDefined();
    expect(resolving.cid).toBe(cid);
    expect(resolving.channelId).toBe(`vco://objects/${cid}`);
  });
});

describe("handleMessage — invalid JSON", () => {
  it("emits error for malformed input", async () => {
    const emitted: unknown[] = [];
    const emit = (obj: Record<string, unknown>) => emitted.push(obj);

    await handleMessage("not valid json {{{", createIpcState(), makeMockNode() as any, emit);

    expect((emitted[0] as any).type).toBe("error");
    expect((emitted[0] as any).message).toContain("invalid JSON");
  });
});
