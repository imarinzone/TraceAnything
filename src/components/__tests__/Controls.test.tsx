import { render, screen, fireEvent } from '@testing-library/react';
import { Controls } from '../Controls';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('Controls', () => {
  const mockProps = {
    opacity: 0.5,
    setOpacity: vi.fn(),
    scale: 1,
    setScale: vi.fn(),
    rotation: 0,
    setRotation: vi.fn(),
    facingMode: 'user' as 'user' | 'environment',
    toggleCamera: vi.fn(),
    onImageUpload: vi.fn(),
    hasImage: true,
    clearImage: vi.fn(),
    filter: 'none',
    setFilter: vi.fn(),
    isLocked: false,
    setIsLocked: vi.fn(),
    isDrawingMode: false,
    setIsDrawingMode: vi.fn(),
    drawingColor: '#ef4444',
    setDrawingColor: vi.fn(),
    brushSize: 4,
    setBrushSize: vi.fn(),
    clearDrawing: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<Controls {...mockProps} />);
    expect(screen.getByText('Adjust')).toBeInTheDocument();
    expect(screen.getByText('Filter')).toBeInTheDocument();
    expect(screen.getByText('Draw')).toBeInTheDocument();
  });

  it('calls setOpacity when opacity slider changes', () => {
    render(<Controls {...mockProps} />);
    const opacityInput = screen.getByLabelText('Opacity', { selector: 'input' });
    fireEvent.change(opacityInput, { target: { value: '0.8' } });
    expect(mockProps.setOpacity).toHaveBeenCalledWith(0.8);
  });

  it('calls setScale when scale slider changes', () => {
    render(<Controls {...mockProps} />);
    const scaleInput = screen.getByLabelText('Scale', { selector: 'input' });
    fireEvent.change(scaleInput, { target: { value: '1.5' } });
    expect(mockProps.setScale).toHaveBeenCalledWith(1.5);
  });

  it('calls setRotation when rotation slider changes', () => {
    render(<Controls {...mockProps} />);
    const rotationInput = screen.getByLabelText('Rotation', { selector: 'input' });
    fireEvent.change(rotationInput, { target: { value: '90' } });
    expect(mockProps.setRotation).toHaveBeenCalledWith(90);
  });

  it('calls toggleCamera when camera button is clicked', () => {
    render(<Controls {...mockProps} />);
    const cameraButton = screen.getByLabelText('Toggle Camera');
    fireEvent.click(cameraButton);
    expect(mockProps.toggleCamera).toHaveBeenCalled();
  });

  it('calls onImageUpload when file input changes', () => {
    render(<Controls {...mockProps} />);
    const fileInput = screen.getByLabelText('Upload Image');
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(mockProps.onImageUpload).toHaveBeenCalled();
  });

  it('calls setIsLocked when lock button is clicked', () => {
    render(<Controls {...mockProps} />);
    const lockButton = screen.getByLabelText('Lock Controls');
    fireEvent.click(lockButton);
    expect(mockProps.setIsLocked).toHaveBeenCalledWith(true);
  });

  it('switches tabs correctly', () => {
    render(<Controls {...mockProps} />);
    const filterTab = screen.getByText('Filter');
    fireEvent.click(filterTab);
    expect(screen.getByText('Grayscale')).toBeInTheDocument();

    const drawTab = screen.getByText('Draw');
    fireEvent.click(drawTab);
    expect(screen.getByText('Brush Size')).toBeInTheDocument();
  });
});
