/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, ChangeEvent, useRef, useEffect } from 'react';
import { CameraView } from './components/CameraView';
import { OverlayImage } from './components/OverlayImage';
import { Controls } from './components/Controls';
import { DrawingCanvas, DrawingCanvasRef } from './components/DrawingCanvas';
import { LockSlider } from './components/LockSlider';
import { motion, AnimatePresence } from 'motion/react';
import { Upload } from 'lucide-react';
import { logger } from './utils/logger';

export default function App() {
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [opacity, setOpacity] = useState(0.5);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  // New State
  const [filter, setFilter] = useState('none');
  const [isLocked, setIsLocked] = useState(false);
  
  // Drawing State
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingColor, setDrawingColor] = useState('#ef4444');
  const [brushSize, setBrushSize] = useState(4);
  const [clearTrigger, setClearTrigger] = useState(0);
  
  // Dimensions for canvas
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    logger.info('App mounted');
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({
          width: clientWidth,
          height: clientHeight
        });
        logger.info('Dimensions updated', { width: clientWidth, height: clientHeight });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => {
      logger.info('App unmounted');
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  const toggleCamera = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    logger.info('Camera toggled', { newMode });
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      logger.info('Image uploaded', { fileName: file.name, fileSize: file.size });
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      // Reset transformations on new image
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setOpacity(0.5);
      setFilter('none');
      setIsLocked(false);
    }
  };

  const clearImage = () => {
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
      setImageSrc(null);
      setIsLocked(false);
      logger.info('Image cleared');
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-black overflow-hidden touch-none">
      {/* Camera Layer */}
      <CameraView facingMode={facingMode} />

      {/* Overlay Layer */}
      <AnimatePresence>
        {imageSrc && (
          <OverlayImage 
            imageSrc={imageSrc}
            opacity={opacity}
            scale={scale}
            rotation={rotation}
            position={position}
            onTransformChange={(updates) => {
              if (updates.scale !== undefined) setScale(updates.scale);
              if (updates.rotation !== undefined) setRotation(updates.rotation);
              if (updates.position !== undefined) setPosition(updates.position);
            }}
            filter={filter}
            isLocked={isLocked}
          />
        )}
      </AnimatePresence>

      {/* Drawing Layer */}
      <DrawingCanvas 
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        color={drawingColor}
        brushSize={brushSize}
        isEnabled={isDrawingMode && !isLocked} // Disable drawing when locked? Or allow? "once locked all other information ... removed and only a slider ... and the image overlay" -> So drawing should probably be disabled or at least controls hidden.
        clearTrigger={clearTrigger}
      />

      {/* UI Layer */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-20">
        {/* Header - Hide when locked */}
        {!isLocked && (
          <div className="p-4 bg-gradient-to-b from-black/80 to-transparent text-white flex justify-between items-start pointer-events-auto">
            <div>
              <h1 className="text-xl font-bold tracking-tight">TraceAR</h1>
              <p className="text-xs text-gray-400">Overlay & Trace</p>
            </div>
            
            {!imageSrc && (
               <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-medium text-white/80">
                 Select an image to start
               </div>
            )}
          </div>
        )}

        {/* Empty State / Call to Action */}
        {!imageSrc && !isLocked && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center p-6 max-w-xs mx-auto"
            >
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
                <Upload className="text-white/80" size={32} />
              </div>
              <h2 className="text-white font-semibold text-lg mb-2">Upload Reference Image</h2>
              <p className="text-gray-400 text-sm">
                Choose an image from your gallery to overlay on the camera feed.
              </p>
            </motion.div>
          </div>
        )}

        {/* Controls */}
        <div className="pointer-events-auto">
          <Controls 
            opacity={opacity}
            setOpacity={setOpacity}
            // Scale and Rotation removed from Controls props
            facingMode={facingMode}
            toggleCamera={toggleCamera}
            onImageUpload={handleImageUpload}
            hasImage={!!imageSrc}
            clearImage={clearImage}
            
            filter={filter}
            setFilter={setFilter}
            isLocked={isLocked}
            setIsLocked={setIsLocked}
            
            isDrawingMode={isDrawingMode}
            setIsDrawingMode={setIsDrawingMode}
            drawingColor={drawingColor}
            setDrawingColor={setDrawingColor}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
            clearDrawing={() => setClearTrigger(prev => prev + 1)}
            undoDrawing={() => canvasRef.current?.undo()}
            redoDrawing={() => canvasRef.current?.redo()}
          />
        </div>
      </div>

      {/* Lock Slider Overlay */}
      <AnimatePresence>
        {isLocked && (
          <div className="absolute inset-0 z-30 pointer-events-auto">
             <LockSlider onUnlock={() => setIsLocked(false)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

