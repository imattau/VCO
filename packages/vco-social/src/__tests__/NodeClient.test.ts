// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@tauri-apps/plugin-shell', () => ({ Command: {}, Child: {} }));
vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn() }));
vi.mock('@tauri-apps/api/event', () => ({ listen: vi.fn() }));

// BroadcastChannel stub (not in jsdom)
(globalThis as any).BroadcastChannel = class {
  onmessage: ((e: any) => void) | null = null;
  postMessage() {}
  close() {}
};

import { NodeClient } from '../lib/NodeClient';

function resetSingleton() {
  (NodeClient as any).instance = undefined;
}

describe('NodeClient — connect() branching', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetSingleton();
    delete (window as any).__TAURI_INTERNALS__;
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('emits error event when not in Tauri and VITE_MOCK_NETWORK is unset', async () => {
    const client = NodeClient.getInstance();
    const events: any[] = [];
    client.onEvent(e => events.push(e));

    await client.connect();

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('error');
    expect(events[0].message).toContain('Tauri');
  });

  it('startMockNode sets isReady and multiaddrs synchronously', () => {
    const client = NodeClient.getInstance();

    (client as any).startMockNode();

    expect(client.isReady).toBe(true);
    expect(client.peerId).toMatch(/^browser-mock-/);
    expect(client.multiaddrs).toContain('/ip4/127.0.0.1/tcp/0/ws');
  });

  it('startMockNode emits ready event after 100ms', () => {
    const client = NodeClient.getInstance();
    const events: any[] = [];
    client.onEvent(e => events.push(e));

    (client as any).startMockNode();
    vi.advanceTimersByTime(150);

    const readyEvent = events.find((e: any) => e.type === 'ready');
    expect(readyEvent).toBeDefined();
    expect(readyEvent.peerId).toMatch(/^browser-mock-/);
  });

  it('handleEvent ready sets isReady, peerId, and multiaddrs', () => {
    const client = NodeClient.getInstance();

    (client as any).handleEvent({
      type: 'ready',
      peerId: 'test-peer-123',
      multiaddrs: ['/ip4/1.2.3.4/tcp/9000'],
    });

    expect(client.isReady).toBe(true);
    expect(client.peerId).toBe('test-peer-123');
    expect(client.multiaddrs).toContain('/ip4/1.2.3.4/tcp/9000');
  });

  it('handleEvent stats updates peers and connections', () => {
    const client = NodeClient.getInstance();

    (client as any).handleEvent({
      type: 'stats',
      peerId: 'peer-xyz',
      multiaddrs: [],
      peers: ['peer-a', 'peer-b'],
      connections: [{ remotePeer: 'peer-a', remoteAddr: '/ip4/0.0.0.0/tcp/0', tags: [] }],
      networkLoad: 0.5,
    });

    expect(client.peers).toEqual(['peer-a', 'peer-b']);
    expect(client.connections).toHaveLength(1);
  });

  it('onEvent listener can be removed', () => {
    const client = NodeClient.getInstance();
    const received: any[] = [];
    const remove = client.onEvent(e => received.push(e));

    (client as any).handleEvent({ type: 'ready', peerId: 'p1', multiaddrs: [] });
    expect(received).toHaveLength(1);

    remove();
    (client as any).handleEvent({ type: 'ready', peerId: 'p2', multiaddrs: [] });
    expect(received).toHaveLength(1); // no new events after removal
  });
});
