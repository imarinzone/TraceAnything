import { useEffect, useRef, useState, useCallback } from 'react';
import { logger } from '../utils/logger';

interface CameraViewProps {
  facingMode: 'user' | 'environment';
}

export function CameraView({ facingMode }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);

  // Function to stop the current stream
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        logger.info('Track stopped', { kind: track.kind, label: track.label });
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    logger.info('Starting camera sequence', { facingMode });
    
    // 1. Stop any existing stream first
    stopStream();

    // 2. Wait a tick to ensure hardware release (helps on some Android devices)
    await new Promise(resolve => setTimeout(resolve, 100));

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Camera API not supported in this browser.");
      return;
    }

    try {
      setError(null);
      setIsPermissionDenied(false);

      // 3. Define constraints
      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      logger.info('Requesting stream with constraints', constraints);
      
      // This call MUST be triggered by a user gesture on strict mobile browsers
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      streamRef.current = newStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        // Ensure video plays (sometimes needed on iOS/Android)
        try {
          await videoRef.current.play();
        } catch (playError) {
          logger.warn('Video play failed', playError);
        }
      }
      
      logger.info('Camera started successfully');

    } catch (err: any) {
      logger.error('Camera start failed', err);
      
      const isDenied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
      
      if (isDenied) {
        setError("Camera access was denied.");
        setIsPermissionDenied(true);
      } else if (err.name === 'OverconstrainedError') {
         // Fallback to basic constraints if ideal failed
         try {
           logger.info('Retrying with basic constraints');
           const fallbackStream = await navigator.mediaDevices.getUserMedia({
             video: true, // Just get ANY video
             audio: false
           });
           streamRef.current = fallbackStream;
           if (videoRef.current) {
             videoRef.current.srcObject = fallbackStream;
             await videoRef.current.play();
           }
         } catch (fallbackErr: any) {
           if (fallbackErr.name === 'NotAllowedError' || fallbackErr.name === 'PermissionDeniedError') {
             setError("Camera access was denied.");
             setIsPermissionDenied(true);
           } else {
             setError("Could not start camera even with basic settings.");
           }
         }
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError("No camera device found.");
      } else {
        setError(`Camera error: ${err.message || err.name}`);
      }
    }
  }, [facingMode, stopStream]);

  useEffect(() => {
    startCamera();
    return () => stopStream();
  }, [startCamera, stopStream]);

  return (
    <div className="absolute inset-0 bg-zinc-900 overflow-hidden flex items-center justify-center">
      {error ? (
        <div className="flex flex-col items-center justify-center p-8 text-center z-10 bg-black/80 absolute inset-0">
          <div className="bg-zinc-900 p-6 rounded-2xl border border-white/10 max-w-sm w-full shadow-2xl">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Camera Access Required</h3>
            <p className="text-white/60 mb-6 text-sm leading-relaxed">
              {isPermissionDenied 
                ? "Please grant camera permissions to use this app. If the prompt doesn't appear, you may need to enable it in your device's App Settings or browser Site Settings."
                : error}
            </p>
            <button 
              onClick={startCamera}
              className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors active:scale-95"
            >
              Grant Permission & Retry
            </button>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute min-w-full min-h-full object-cover"
        />
      )}
    </div>
  );
}
