import { useRef, useEffect, useState, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent, forwardRef, useImperativeHandle } from 'react';
import { logger } from '../utils/logger';

interface DrawingCanvasProps {
  width: number;
  height: number;
  color: string;
  brushSize: number;
  isEnabled: boolean;
  clearTrigger: number; // Increment to clear
}

export interface DrawingCanvasRef {
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

type Point = { x: number; y: number };
type Stroke = {
  points: Point[];
  color: string;
  size: number;
};

export const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(({ 
  width, 
  height, 
  color, 
  brushSize, 
  isEnabled,
  clearTrigger 
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentStroke = useRef<Stroke | null>(null);
  
  const history = useRef<Stroke[]>([]);
  const redoStack = useRef<Stroke[]>([]);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    undo: () => {
      if (history.current.length === 0) return;
      const stroke = history.current.pop();
      if (stroke) {
        redoStack.current.push(stroke);
        redraw();
        logger.info('Undo performed');
      }
    },
    redo: () => {
      if (redoStack.current.length === 0) return;
      const stroke = redoStack.current.pop();
      if (stroke) {
        history.current.push(stroke);
        redraw();
        logger.info('Redo performed');
      }
    },
    clear: () => {
      history.current = [];
      redoStack.current = [];
      redraw();
    }
  }));

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    history.current.forEach(stroke => {
      if (stroke.points.length < 2) return;
      
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    });
  };

  // Handle clearing via prop (legacy support if needed, but ref.clear is better)
  useEffect(() => {
    if (clearTrigger > 0) {
       history.current = [];
       redoStack.current = [];
       redraw();
       logger.info('Canvas cleared via trigger');
    }
  }, [clearTrigger]);

  // Handle resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Resize
    canvas.width = width;
    canvas.height = height;

    // Redraw history
    redraw();
  }, [width, height]);

  const startDrawing = (x: number, y: number) => {
    if (!isEnabled) return;
    setIsDrawing(true);
    currentStroke.current = {
      points: [{ x, y }],
      color,
      size: brushSize
    };
    
    // Clear redo stack on new action
    redoStack.current = [];
    
    logger.info('Drawing started', { x, y, color, brushSize });
  };

  const draw = (x: number, y: number) => {
    if (!isDrawing || !isEnabled || !currentStroke.current || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const points = currentStroke.current.points;
    const lastPoint = points[points.length - 1];

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    currentStroke.current.points.push({ x, y });
  };

  const stopDrawing = () => {
    if (isDrawing && currentStroke.current) {
      setIsDrawing(false);
      history.current.push(currentStroke.current);
      currentStroke.current = null;
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
});
