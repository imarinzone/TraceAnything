import { Camera, Image as ImageIcon, Minus, Plus, RotateCcw, Trash2, Lock, Palette, Sliders, Eraser } from 'lucide-react';
import { ChangeEvent, useState } from 'react';
import { logger } from '../utils/logger';

interface ControlsProps {
  opacity: number;
  setOpacity: (val: number) => void;
  scale: number;
  setScale: (val: number) => void;
  rotation: number;
  setRotation: (val: number) => void;
  facingMode: 'user' | 'environment';
  toggleCamera: () => void;
  onImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  hasImage: boolean;
  clearImage: () => void;
  
  // New props
  filter: string;
  setFilter: (val: string) => void;
  isLocked: boolean;
  setIsLocked: (val: boolean) => void;
  
  // Drawing props
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
  scale,
  setScale,
  rotation,
  setRotation,
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
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent text-white pb-8 safe-area-bottom">
      
      <div className="flex flex-col gap-4 max-w-md mx-auto">
        
        {/* Tab Navigation */}
        {hasImage && (
          <div className="flex justify-center gap-2 mb-2">
            <button 
              onClick={() => handleTabChange('adjust')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${activeTab === 'adjust' ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              Adjust
            </button>
            <button 
              onClick={() => handleTabChange('filter')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${activeTab === 'filter' ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              Filter
            </button>
            <button 
              onClick={() => handleTabChange('draw')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${activeTab === 'draw' ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              Draw
            </button>
          </div>
        )}

        {/* Tab Content */}
        {hasImage && (
          <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 min-h-[160px] flex flex-col justify-center">
            
            {/* ADJUST TAB */}
            {activeTab === 'adjust' && (
              <div className="space-y-4">
                {/* Opacity */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-400 font-mono uppercase tracking-wider">
                    <span>Opacity</span>
                    <span>{Math.round(opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={opacity}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setOpacity(val);
                      logger.info('Opacity changed', { value: val });
                    }}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                    aria-label="Opacity"
                  />
                </div>

                {/* Scale */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-400 font-mono uppercase tracking-wider">
                    <span>Scale</span>
                    <span>{scale.toFixed(1)}x</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setScale(Math.max(0.1, scale - 0.1))} className="p-1 hover:bg-white/10 rounded"><Minus size={14} /></button>
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={scale}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setScale(val);
                        logger.info('Scale changed', { value: val });
                      }}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                      aria-label="Scale"
                    />
                    <button onClick={() => setScale(Math.min(3, scale + 0.1))} className="p-1 hover:bg-white/10 rounded"><Plus size={14} /></button>
                  </div>
                </div>

                {/* Rotation */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-400 font-mono uppercase tracking-wider">
                    <span>Rotation</span>
                    <span>{Math.round(rotation)}°</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setRotation(rotation - 90)} className="p-1 hover:bg-white/10 rounded"><RotateCcw size={14} /></button>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="1"
                      value={rotation}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setRotation(val);
                        logger.info('Rotation changed', { value: val });
                      }}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                      aria-label="Rotation"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* FILTER TAB */}
            {activeTab === 'filter' && (
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Normal', value: 'none' },
                  { name: 'Grayscale', value: 'grayscale(100%)' },
                  { name: 'Sepia', value: 'sepia(100%)' },
                  { name: 'Invert', value: 'invert(100%)' },
                ].map((f) => (
                  <button
                    key={f.name}
                    onClick={() => {
                      setFilter(f.value);
                      logger.info('Filter changed', { filter: f.value });
                    }}
                    className={`p-3 rounded-xl text-sm font-medium border transition-all ${
                      filter === f.value 
                        ? 'bg-white text-black border-white' 
                        : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            )}

            {/* DRAW TAB */}
            {activeTab === 'draw' && (
              <div className="space-y-4">
                {/* Colors */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    {['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#ffffff'].map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setDrawingColor(c);
                          logger.info('Drawing color changed', { color: c });
                        }}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${
                          drawingColor === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <button 
                    onClick={() => {
                      clearDrawing();
                      logger.info('Drawing cleared');
                    }}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 transition-colors"
                    title="Clear Drawing"
                  >
                    <Eraser size={20} />
                  </button>
                </div>

                {/* Brush Size */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-400 font-mono uppercase tracking-wider">
                    <span>Brush Size</span>
                    <span>{brushSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={brushSize}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setBrushSize(val);
                      logger.info('Brush size changed', { size: val });
                    }}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 p-2 rounded-lg">
                  <Palette size={14} />
                  <span>Drawing is active on screen</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Action Bar */}
        <div className="flex items-center justify-between gap-4 mt-2">
          
          {/* Upload Button */}
          <label className="flex flex-col items-center justify-center w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer backdrop-blur-sm transition-colors border border-white/10">
            <ImageIcon size={24} className="text-white" />
            <input 
              type="file" 
              accept="image/*" 
              onChange={onImageUpload} 
              className="hidden" 
              aria-label="Upload Image"
            />
          </label>

          {/* Camera Toggle */}
          <button 
            onClick={toggleCamera}
            className="flex flex-col items-center justify-center w-16 h-16 bg-white text-black rounded-full shadow-lg hover:scale-105 transition-transform active:scale-95"
            aria-label="Toggle Camera"
          >
            <Camera size={28} />
          </button>

          {/* Lock Button (only if image exists) */}
          {hasImage ? (
            <button 
              onClick={() => {
                setIsLocked(true);
                logger.info('Controls locked');
              }}
              className="flex flex-col items-center justify-center w-14 h-14 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-full backdrop-blur-sm transition-colors border border-blue-500/20"
              aria-label="Lock Controls"
            >
              <Lock size={24} />
            </button>
          ) : (
            <div className="w-14 h-14" /> /* Spacer */
          )}
        </div>
      </div>
    </div>
  );
}
