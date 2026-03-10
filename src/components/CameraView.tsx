import { useEffect, useRef, useState } from 'react';
import { logger } from '../utils/logger';

interface CameraViewProps {
  facingMode: 'user' | 'environment';
}

export function CameraView({ facingMode }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Function to stop the current stream
  const stopStream = () => {
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
  };

  useEffect(() => {
    let isMounted = true;

    const startCamera = async () => {
      logger.info('Starting camera sequence', { facingMode, retryCount });
      
      // 1. Stop any existing stream first
      stopStream();

      // 2. Wait a tick to ensure hardware release (helps on some Android devices)
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (isMounted) setError("Camera API not supported in this browser.");
        return;
      }

      try {
        if (isMounted) setError(null);

        // 3. Define constraints
        // Try 'exact' first for stronger preference, but fallback to 'ideal' if that fails
        const constraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        };

        logger.info('Requesting stream with constraints', constraints);
        
        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (!isMounted) {
          newStream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = newStream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
          // Ensure video plays (sometimes needed on iOS)
          try {
            await videoRef.current.play();
          } catch (playError) {
            logger.warn('Video play failed', playError);
          }
        }
        
        logger.info('Camera started successfully', { 
          id: newStream.id, 
          tracks: newStream.getVideoTracks().length,
          label: newStream.getVideoTracks()[0]?.label
        });

      } catch (err: any) {
        if (!isMounted) return;
        
        logger.error('Camera start failed', err);
        
        // Handle specific errors
        if (err.name === 'OverconstrainedError') {
           // Fallback to basic constraints if ideal failed
           try {
             logger.info('Retrying with basic constraints');
             const fallbackStream = await navigator.mediaDevices.getUserMedia({
               video: true, // Just get ANY video
               audio: false
             });
             if (isMounted) {
               streamRef.current = fallbackStream;
               if (videoRef.current) videoRef.current.srcObject = fallbackStream;
             } else {
               fallbackStream.getTracks().forEach(t => t.stop());
             }
           } catch (fallbackErr) {
             setError("Could not start camera even with basic settings.");
           }
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError("Camera permission denied. Please allow access.");
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError("No camera device found.");
        } else {
          setError(`Camera error: ${err.message || err.name}`);
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      stopStream();
    };
  }, [facingMode, retryCount]);

  return (
    <div className="absolute inset-0 bg-zinc-900 overflow-hidden flex items-center justify-center">
      {error ? (
        <div className="flex flex-col items-center justify-center p-8 text-center z-10">
          <p className="text-white/60 mb-6 max-w-xs leading-relaxed">{error}</p>
          <button 
            onClick={() => setRetryCount(c => c + 1)}
            className="px-6 py-2.5 bg-white/10 text-white rounded-full text-sm font-medium hover:bg-white/20 transition-colors backdrop-blur-md border border-white/10"
          >
            Retry Camera
          </button>
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
