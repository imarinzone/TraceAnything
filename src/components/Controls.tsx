import { Camera, Image as ImageIcon, Lock, Palette, Eraser, X, Check, SlidersHorizontal, Wand2 } from 'lucide-react';
import { ChangeEvent, useState } from 'react';
import { logger } from '../utils/logger';
import { motion, AnimatePresence } from 'motion/react';

interface ControlsProps {
  opacity: number;
  setOpacity: (val: number) => void;
  facingMode: 'user' | 'environment';
  toggleCamera: () => void;
  onImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  hasImage: boolean;
  clearImage: () => void;
  
  filter: string;
  setFilter: (val: string) => void;
  isLocked: boolean;
  setIsLocked: (val: boolean) => void;
  
  isDrawingMode: boolean;
  setIsDrawingMode: (val: boolean) => void;
  drawingColor: string;
  setDrawingColor: (val: string) => void;
  brushSize: number;
  setBrushSize: (val: number) => void;
  clearDrawing: () => void;
}

type Tab = 'adjust' | 'filter' | 'draw';

export function Controls({
  opacity,
  setOpacity,
  facingMode,
  toggleCamera,
  onImageUpload,
  hasImage,
  clearImage,
  filter,
  setFilter,
  isLocked,
  setIsLocked,
  isDrawingMode,
  setIsDrawingMode,
  drawingColor,
  setDrawingColor,
  brushSize,
  setBrushSize,
  clearDrawing
}: ControlsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('adjust');
  const [isExpanded, setIsExpanded] = useState(true);

  if (isLocked) return null;

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    logger.info('Tab changed', { tab });
    if (tab === 'draw') {
      setIsDrawingMode(true);
    } else {
      setIsDrawingMode(false);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 flex flex-col justify-end pointer-events-none">
      {/* Floating Action Buttons Container */}
      <div className="flex justify-between items-end px-6 pb-4 pointer-events-auto">
        {/* Left: Upload / Clear */}
        <div className="flex flex-col gap-3">
           {hasImage && (
            <button
              onClick={clearImage}
              className="w-12 h-12 rounded-full bg-zinc-800 text-red-400 flex items-center justify-center shadow-lg border border-white/5 active:scale-95 transition-transform"
              aria-label="Clear Image"
            >
              <X size={20} />
            </button>
          )}
          <label className="w-14 h-14 rounded-2xl bg-zinc-800 text-white flex items-center justify-center shadow-lg border border-white/5 cursor-pointer active:scale-95 transition-transform">
            <ImageIcon size={24} />
            <input 
              type="file" 
              accept="image/*" 
              onChange={onImageUpload} 
              className="hidden" 
            />
          </label>
        </div>

        {/* Center: Camera Toggle (Large FAB) */}
        <button 
          onClick={toggleCamera}
          className="w-16 h-16 rounded-2xl bg-white text-black flex items-center justify-center shadow-xl active:scale-95 transition-transform mb-2"
          aria-label="Toggle Camera"
        >
          <Camera size={28} strokeWidth={2.5} />
        </button>

        {/* Right: Lock */}
        <div className="flex flex-col gap-3">
          {hasImage ? (
            <button 
              onClick={() => setIsLocked(true)}
              className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              aria-label="Lock Controls"
            >
              <Lock size={24} />
            </button>
          ) : (
            <div className="w-14 h-14" />
          )}
        </div>
      </div>

      {/* Bottom Sheet for Adjustments */}
      {hasImage && (
        <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          className="bg-zinc-900 rounded-t-3xl shadow-2xl border-t border-white/5 pointer-events-auto overflow-hidden"
        >
          {/* Handle */}
          <div className="w-full flex justify-center pt-3 pb-1" onClick={() => setIsExpanded(!isExpanded)}>
            <div className="w-12 h-1.5 bg-zinc-700 rounded-full" />
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-6 pb-8 pt-2"
              >
                {/* Tabs */}
                <div className="flex p-1 bg-zinc-800/50 rounded-xl mb-6">
                  {[
                    { id: 'adjust', icon: SlidersHorizontal, label: 'Adjust' },
                    { id: 'filter', icon: Wand2, label: 'Filter' },
                    { id: 'draw', icon: Palette, label: 'Draw' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id as Tab)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === tab.id 
                          ? 'bg-zinc-700 text-white shadow-sm' 
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <tab.icon size={16} />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Content */}
                <div className="min-h-[120px]">
                  {activeTab === 'adjust' && (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm font-medium text-zinc-300">
                          <span>Opacity</span>
                          <span>{Math.round(opacity * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.05"
                          value={opacity}
                          onChange={(e) => setOpacity(parseFloat(e.target.value))}
                          className="w-full h-12 bg-transparent cursor-pointer accent-white touch-none"
                        />
                      </div>
                      <p className="text-xs text-zinc-500 text-center">
                        Pinch to zoom • Two fingers to rotate • Drag to move
                      </p>
                    </div>
                  )}

                  {activeTab === 'filter' && (
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { name: 'None', value: 'none' },
                        { name: 'B&W', value: 'grayscale(100%)' },
                        { name: 'Sepia', value: 'sepia(100%)' },
                        { name: 'Invert', value: 'invert(100%)' },
                      ].map((f) => (
                        <button
                          key={f.name}
                          onClick={() => setFilter(f.value)}
                          className={`aspect-square rounded-2xl text-xs font-medium border-2 transition-all flex items-center justify-center ${
                            filter === f.value 
                              ? 'border-white bg-zinc-800 text-white' 
                              : 'border-transparent bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800'
                          }`}
                        >
                          {f.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {activeTab === 'draw' && (
                    <div className="space-y-5">
                      <div className="flex justify-between items-center bg-zinc-800/50 p-2 rounded-2xl">
                        <div className="flex gap-2 overflow-x-auto p-1">
                          {['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#ffffff'].map((c) => (
                            <button
                              key={c}
                              onClick={() => setDrawingColor(c)}
                              className={`w-10 h-10 rounded-full border-2 transition-transform ${
                                drawingColor === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                              }`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                        <div className="w-px h-8 bg-zinc-700 mx-2" />
                        <button 
                          onClick={clearDrawing}
                          className="p-3 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-white transition-colors"
                        >
                          <Eraser size={20} />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-zinc-400">
                          <span>Brush Size</span>
                          <span>{brushSize}px</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          step="1"
                          value={brushSize}
                          onChange={(e) => setBrushSize(parseFloat(e.target.value))}
                          className="w-full h-8 bg-transparent cursor-pointer accent-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
