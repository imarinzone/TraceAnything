import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CameraView } from '../CameraView';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('CameraView', () => {
  const mockGetUserMedia = vi.fn();

  beforeEach(() => {
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: mockGetUserMedia,
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders video element when camera access is granted', async () => {
    const mockStream = {
      getTracks: () => [{ stop: vi.fn() }],
    };
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { container } = render(<CameraView facingMode="user" />);

    await waitFor(() => {
      const videoElement = container.querySelector('video');
      expect(videoElement).toBeInTheDocument();
    });
    
    expect(screen.queryByText(/Please give camera access/i)).not.toBeInTheDocument();
  });

  it('shows error message when camera access is denied', async () => {
    const error = new Error('Permission denied');
    error.name = 'NotAllowedError';
    mockGetUserMedia.mockRejectedValue(error);

    render(<CameraView facingMode="user" />);

    await waitFor(() => {
      expect(screen.getByText(/Please give camera access/i)).toBeInTheDocument();
    });
  });

  it('shows retry button when error occurs', async () => {
    const error = new Error('Permission denied');
    error.name = 'NotAllowedError';
    mockGetUserMedia.mockRejectedValue(error);

    render(<CameraView facingMode="user" />);

    await waitFor(() => {
      expect(screen.getByText(/Enable Camera/i)).toBeInTheDocument();
    });

    const retryButton = screen.getByText(/Enable Camera/i);
    fireEvent.click(retryButton);

    // Should try to call getUserMedia again
    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalledTimes(2);
    });
  });
});
