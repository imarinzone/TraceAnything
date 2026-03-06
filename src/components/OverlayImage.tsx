import { motion } from 'motion/react';
import { logger } from '../utils/logger';

interface OverlayImageProps {
  imageSrc: string;
  opacity: number;
  scale: number;
  rotation: number;
  filter: string;
  isLocked: boolean;
}

export function OverlayImage({ 
  imageSrc, 
  opacity, 
  scale, 
  rotation, 
  filter,
  isLocked 
}: OverlayImageProps) {
  if (!imageSrc) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        drag={!isLocked}
        dragMomentum={false}
        onDragStart={() => logger.info('Overlay drag started')}
        onDragEnd={() => logger.info('Overlay drag ended')}
        className={`absolute left-1/2 top-1/2 touch-none ${isLocked ? 'pointer-events-none' : 'pointer-events-auto cursor-move'}`}
        style={{
          opacity,
          scale,
          rotate: rotation,
          x: "-50%", // Center initially
          y: "-50%", // Center initially
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
