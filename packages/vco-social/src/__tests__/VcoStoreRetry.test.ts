// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn() }));

import { invoke } from '@tauri-apps/api/core';

const mockInvoke = invoke as ReturnType<typeof vi.fn>;

// Simulate Tauri being present so getStorageProfile enters the retry loop
function setTauriPresent() {
  (window as any).__TAURI_INTERNALS__ = {};
}

function clearTauri() {
  delete (window as any).__TAURI_INTERNALS__;
}

// Fresh VcoStore instance for each test (avoid shared singleton state)
async function makeStore() {
  // Dynamic import so each call gets a fresh module evaluation via vi.resetModules()
  const { VcoStore } = await import('../lib/VcoStore');
  return new VcoStore();
}

describe('VcoStore — getStorageProfile retry backoff', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setTauriPresent();
    vi.resetModules();
    mockInvoke.mockReset();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
    clearTauri();
  });

  it('returns correct profile path when invoke succeeds on first try', async () => {
    mockInvoke.mockResolvedValueOnce('alice');

    const store = await makeStore();
    // Access the private method via cast
    const profilePromise = (store as any).getStorageProfile() as Promise<string>;

    // Advance timers to let microtasks flush; no delay needed on first-try success
    await vi.runAllTimersAsync();
    const profile = await profilePromise;

    expect(profile).toBe('alice');
    expect(mockInvoke).toHaveBeenCalledTimes(1);
    expect(mockInvoke).toHaveBeenCalledWith('get_vco_profile');
  });

  it('returns correct profile when invoke fails twice then succeeds on third attempt', async () => {
    mockInvoke
      .mockRejectedValueOnce(new Error('not ready'))
      .mockRejectedValueOnce(new Error('not ready'))
      .mockResolvedValueOnce('bob');

    const store = await makeStore();
    const profilePromise = (store as any).getStorageProfile() as Promise<string>;

    // Drive all retry delays (100ms * 1, 100ms * 2) and microtasks
    await vi.runAllTimersAsync();
    const profile = await profilePromise;

    expect(profile).toBe('bob');
    expect(mockInvoke).toHaveBeenCalledTimes(3);
  });

  it('falls back to "default" profile when all 5 retries fail', async () => {
    mockInvoke.mockRejectedValue(new Error('tauri unavailable'));

    const store = await makeStore();
    const profilePromise = (store as any).getStorageProfile() as Promise<string>;

    await vi.runAllTimersAsync();
    const profile = await profilePromise;

    expect(profile).toBe('default');
    // 5 attempts total (indices 0–4)
    expect(mockInvoke).toHaveBeenCalledTimes(5);
  });

  it('retry delays are bounded — total delay for 5 failures is at most 1500ms', async () => {
    // Delays per retry: 100*1 + 100*2 + 100*3 + 100*4 + 100*5 = 1500ms maximum.
    // We verify the promise resolves within that window when using fake timers.
    mockInvoke.mockRejectedValue(new Error('always fails'));

    const store = await makeStore();
    const profilePromise = (store as any).getStorageProfile() as Promise<string>;

    // Advance exactly 1500ms — should be sufficient for all retries to complete
    await vi.advanceTimersByTimeAsync(1500);
    const profile = await profilePromise;

    expect(profile).toBe('default');
    // Confirms it resolved without needing more than 1500ms of fake time
  });
});
