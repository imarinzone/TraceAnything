import { render, fireEvent } from '@testing-library/react';
import { DrawingCanvas } from '../DrawingCanvas';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('DrawingCanvas', () => {
  const mockProps = {
    width: 500,
    height: 500,
    color: '#ef4444',
    brushSize: 4,
    isEnabled: true,
    clearTrigger: 0,
  };

  let mockContext: any;

  beforeEach(() => {
    mockContext = {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      clearRect: vi.fn(),
      drawImage: vi.fn(),
    };

    // @ts-ignore
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => mockContext);
    
    // Mock getBoundingClientRect
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 500,
      height: 500,
      bottom: 500,
      right: 500,
      x: 0,
      y: 0,
      toJSON: () => {}
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders canvas element', () => {
    const { container } = render(<DrawingCanvas {...mockProps} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('draws on mouse move when enabled', () => {
    const { container } = render(<DrawingCanvas {...mockProps} />);
    const canvas = container.querySelector('canvas');
    
    if (canvas) {
      fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 });
      fireEvent.mouseMove(canvas, { clientX: 20, clientY: 20 });
      fireEvent.mouseUp(canvas);
    }

    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.moveTo).toHaveBeenCalled();
    expect(mockContext.lineTo).toHaveBeenCalled();
    expect(mockContext.stroke).toHaveBeenCalled();
  });

  it('does not draw when disabled', () => {
    const { container } = render(<DrawingCanvas {...mockProps} isEnabled={false} />);
    const canvas = container.querySelector('canvas');
    
    if (canvas) {
      fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 });
      fireEvent.mouseMove(canvas, { clientX: 20, clientY: 20 });
    }

    expect(mockContext.beginPath).not.toHaveBeenCalled();
  });

  it('clears canvas when clearTrigger changes', () => {
    const { rerender } = render(<DrawingCanvas {...mockProps} />);
    
    // Clear previous calls from initial render
    mockContext.clearRect.mockClear();

    rerender(<DrawingCanvas {...mockProps} clearTrigger={1} />);

    expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 500, 500);
  });
});
