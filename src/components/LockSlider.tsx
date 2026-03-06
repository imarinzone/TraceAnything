import { useState, useEffect } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';

interface LockSliderProps {
  onUnlock: () => void;
}

export function LockSlider({ onUnlock }: LockSliderProps) {
  const x = useMotionValue(0);
  const maxDrag = 200; // Width of the slider track
  const backgroundOpacity = useTransform(x, [0, maxDrag], [0.5, 0]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = () => {
    if (x.get() > maxDrag * 0.8) {
      onUnlock();
    } else {
      animate(x, 0, { type: "spring", stiffness: 400, damping: 40 });
    }
    setIsDragging(false);
  };

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-64 h-14 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center px-1 overflow-hidden">
      <motion.div 
        className="absolute inset-0 flex items-center justify-center text-white/50 text-sm font-medium uppercase tracking-widest pointer-events-none"
        style={{ opacity: backgroundOpacity }}
      >
        Slide to Unlock
      </motion.div>
      
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: maxDrag }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="relative w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing z-10"
      >
        {isDragging ? <Unlock size={20} className="text-black" /> : <Lock size={20} className="text-black" />}
      </motion.div>
    </div>
  );
}
