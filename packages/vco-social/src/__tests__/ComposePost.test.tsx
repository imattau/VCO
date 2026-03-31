// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';

const mockToast = vi.fn();
const mockCreatePost = vi.fn();

vi.mock('../features/SocialContext', () => ({
  useSocial: () => ({
    createPost: mockCreatePost,
    profile: { displayName: 'Test User', avatarCid: null },
  }),
}));

vi.mock('../components/ToastProvider', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('lucide-react', () => ({
  Send: () => null,
  Image: () => null,
  Smile: () => null,
  MapPin: () => null,
  Hash: () => null,
  Loader2: () => null,
  X: () => null,
}));

vi.mock('@/components/Avatar', () => ({
  Avatar: () => null,
}));

import { ComposePost } from '../features/feed/ComposePost';

afterEach(cleanup);

describe('ComposePost — geolocation', () => {
  beforeEach(() => {
    mockToast.mockClear();
    mockCreatePost.mockReset();
  });

  it('shows error toast when geolocation is not supported', () => {
    Object.defineProperty(navigator, 'geolocation', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    render(<ComposePost />);
    fireEvent.click(screen.getByLabelText('Location'));

    expect(mockToast).toHaveBeenCalledWith(
      'Geolocation not supported by your browser',
      'error',
    );
  });

  it('appends coordinates and shows success toast on geolocation success', () => {
    const mockGetCurrentPosition = vi.fn((success: PositionCallback) => {
      success({ coords: { latitude: 51.51, longitude: -0.13 } } as GeolocationPosition);
    });
    Object.defineProperty(navigator, 'geolocation', {
      value: { getCurrentPosition: mockGetCurrentPosition },
      configurable: true,
      writable: true,
    });

    render(<ComposePost />);
    fireEvent.click(screen.getByLabelText('Location'));

    expect(mockToast).toHaveBeenCalledWith('Location coordinates attached', 'success');
    const textarea = screen.getByPlaceholderText("What's happening in the swarm?");
    expect((textarea as HTMLTextAreaElement).value).toContain('51.51');
    expect((textarea as HTMLTextAreaElement).value).toContain('-0.13');
  });

  it('shows error toast when geolocation access is denied', () => {
    const mockGetCurrentPosition = vi.fn(
      (_success: PositionCallback, error: PositionErrorCallback) => {
        error({ code: 1, message: 'User denied geolocation' } as GeolocationPositionError);
      },
    );
    Object.defineProperty(navigator, 'geolocation', {
      value: { getCurrentPosition: mockGetCurrentPosition },
      configurable: true,
      writable: true,
    });

    render(<ComposePost />);
    fireEvent.click(screen.getByLabelText('Location'));

    expect(mockToast).toHaveBeenCalledWith('Failed to access location', 'error');
  });
});
