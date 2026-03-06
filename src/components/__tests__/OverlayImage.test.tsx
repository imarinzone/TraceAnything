import { render, screen } from '@testing-library/react';
import { OverlayImage } from '../OverlayImage';
import { describe, it, expect } from 'vitest';

describe('OverlayImage', () => {
  const mockProps = {
    imageSrc: 'test.jpg',
    opacity: 0.5,
    scale: 1.2,
    rotation: 45,
    filter: 'none',
    isLocked: false,
  };

  it('renders image with correct src', () => {
    render(<OverlayImage {...mockProps} />);
    const image = screen.getByAltText('Overlay');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'test.jpg');
  });

  it('applies correct styles', () => {
    const { container } = render(<OverlayImage {...mockProps} />);
    const wrapper = container.firstChild?.firstChild; // motion.div
    
    // Check if style attribute contains the values we expect
    expect(wrapper).toHaveAttribute('style', expect.stringContaining('opacity: 0.5'));
    expect(wrapper).toHaveAttribute('style', expect.stringContaining('scale(1.2)'));
    expect(wrapper).toHaveAttribute('style', expect.stringContaining('rotate(45deg)'));
  });

  it('does not render when imageSrc is null', () => {
    const { container } = render(<OverlayImage {...mockProps} imageSrc="" />);
    expect(container.firstChild).toBeNull();
  });
});
