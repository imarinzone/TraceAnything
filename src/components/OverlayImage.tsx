import { motion } from 'motion/react';
import { logger } from '../utils/logger';
import { useGesture } from '@use-gesture/react';
import { useRef } from 'react';

interface OverlayImageProps {
  imageSrc: string;
  opacity: number;
  scale: number;
  rotation: number;
  position: { x: number; y: number };
  onTransformChange: (updates: { scale?: number; rotation?: number; position?: { x: number; y: number } }) => void;
  filter: string;
  isLocked: boolean;
}

export function OverlayImage({ 
  imageSrc, 
  opacity, 
  scale, 
  rotation, 
  position,
  onTransformChange,
  filter,
  isLocked 
}: OverlayImageProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGesture(
    {
      onDrag: ({ offset: [x, y] }) => {
        if (isLocked) return;
        onTransformChange({ position: { x, y } });
      },
      onPinch: ({ offset: [s, a] }) => {
        if (isLocked) return;
        onTransformChange({ scale: s, rotation: a });
      },
    },
    {
      target: ref,
      drag: { 
        from: () => [position.x, position.y],
        filterTaps: true,
      },
      pinch: { 
        scaleBounds: { min: 0.1, max: 5 }, 
        rubberband: true, 
        from: () => [scale, rotation] 
      },
    }
  );

  if (!imageSrc) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        ref={ref}
        className={`absolute left-1/2 top-1/2 touch-none ${isLocked ? 'pointer-events-none' : 'pointer-events-auto cursor-move'}`}
        style={{
          opacity,
          scale,
          rotate: rotation,
          x: `calc(-50% + ${position.x}px)`,
          y: `calc(-50% + ${position.y}px)`,
        }}
      >
        <img 
          src={imageSrc} 
          alt="Overlay" 
          className="max-w-[80vw] max-h-[80vh] object-contain select-none pointer-events-none"
          style={{ filter }}
          draggable={false}
        />
      </motion.div>
    </div>
  );
}
