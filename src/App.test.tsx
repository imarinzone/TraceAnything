import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock CameraView to avoid getUserMedia issues
vi.mock('./components/CameraView', () => ({
  CameraView: () => <div data-testid="camera-view">Camera View</div>,
}));

describe('App', () => {
  beforeEach(() => {
    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:test');
    global.URL.revokeObjectURL = vi.fn();
    
    // Mock ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial state correctly', () => {
    render(<App />);
    expect(screen.getByTestId('camera-view')).toBeInTheDocument();
    expect(screen.getByText(/Upload Reference Image/i)).toBeInTheDocument();
    expect(screen.getByText(/Select an image to start/i)).toBeInTheDocument();
  });

  it('handles image upload', async () => {
    render(<App />);
    const fileInput = screen.getByLabelText(/upload/i, { selector: 'input[type="file"]' });
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.queryByText(/Upload Reference Image/i)).not.toBeInTheDocument();
      expect(screen.getByAltText('Overlay')).toBeInTheDocument();
    });
  });

  it('shows controls when image is uploaded', async () => {
    render(<App />);
    const fileInput = screen.getByLabelText(/upload/i, { selector: 'input[type="file"]' });
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('Adjust')).toBeInTheDocument();
      expect(screen.getByText('Filter')).toBeInTheDocument();
      expect(screen.getByText('Draw')).toBeInTheDocument();
    });
  });
});
