import { useRef, useEffect, useState, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react';
import { logger } from '../utils/logger';

interface DrawingCanvasProps {
  width: number;
  height: number;
  color: string;
  brushSize: number;
  isEnabled: boolean;
  clearTrigger: number; // Increment to clear
}

export function DrawingCanvas({ 
  width, 
  height, 
  color, 
  brushSize, 
  isEnabled,
  clearTrigger 
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // Handle clearing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    logger.info('Canvas cleared');
  }, [clearTrigger, width, height]);

  // Handle resize (naive approach - clears canvas on resize, acceptable for MVP)
  // Ideally we'd save the paths and redraw, but for now let's just keep it simple.
  // Actually, if width/height changes, the canvas clears. 
  // We can try to save the image data.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Save current content
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx?.drawImage(canvas, 0, 0);

    // Resize
    canvas.width = width;
    canvas.height = height;

    // Restore content (scaled or centered? just 0,0 for now)
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(tempCanvas, 0, 0);
    }
  }, [width, height]);

  const startDrawing = (x: number, y: number) => {
    if (!isEnabled) return;
    setIsDrawing(true);
    lastPos.current = { x, y };
    logger.info('Drawing started', { x, y, color, brushSize });
  };

  const draw = (x: number, y: number) => {
    if (!isDrawing || !isEnabled || !lastPos.current || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    lastPos.current = { x, y };
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      lastPos.current = null;
      logger.info('Drawing stopped');
    }
  };

  // Mouse events
  const handleMouseDown = (e: ReactMouseEvent) => startDrawing(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  const handleMouseMove = (e: ReactMouseEvent) => draw(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  const handleMouseUp = stopDrawing;

  // Touch events
  const handleTouchStart = (e: ReactTouchEvent) => {
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      startDrawing(touch.clientX - rect.left, touch.clientY - rect.top);
    }
  };

  const handleTouchMove = (e: ReactTouchEvent) => {
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      draw(touch.clientX - rect.left, touch.clientY - rect.top);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`absolute inset-0 touch-none ${isEnabled ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    />
  );
}
