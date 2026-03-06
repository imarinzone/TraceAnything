import { useEffect, useRef, useState } from 'react';
import { logger } from '../utils/logger';

interface CameraViewProps {
  facingMode: 'user' | 'environment';
}

export function CameraView({ facingMode }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let isMounted = true;

    const startCamera = async () => {
      logger.info('Starting camera', { facingMode, retryCount });
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (isMounted) setError("Camera API not supported in this browser.");
        logger.error('Camera API not supported');
        return;
      }

      try {
        if (isMounted) setError(null);
        
        // Stop any existing stream tracks
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }

        const constraints = {
          video: {
            facingMode: facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        };

        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          logger.info('Camera started with ideal constraints');
        } catch (err: any) {
          // Check for permission errors immediately
          const isPermissionError = 
            err?.name === 'NotAllowedError' || 
            err?.name === 'PermissionDeniedError' ||
            err?.message?.includes('Permission denied') ||
            err?.message?.includes('permission');

          if (isPermissionError) {
            throw err; // Re-throw to be caught by the outer catch
          }

          // Only try fallback if it wasn't a permission error
          console.warn("Ideal constraints failed, trying basic constraints", err);
          logger.warn('Ideal constraints failed, trying fallback', { error: err.message });
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: facingMode },
            audio: false 
          });
          logger.info('Camera started with fallback constraints');
        }
        
        if (isMounted && videoRef.current && stream) {
          videoRef.current.srcObject = stream;
        } else if (stream) {
           // If unmounted or no ref, stop the stream immediately
           stream.getTracks().forEach(track => track.stop());
        }
      } catch (err: any) {
        if (!isMounted) return;

        const isPermissionError = 
            err?.name === 'NotAllowedError' || 
            err?.name === 'PermissionDeniedError' ||
            err?.message?.includes('Permission denied') ||
            err?.message?.includes('permission');

        // Only log actual errors, not permission denials
        if (!isPermissionError) {
          console.error("Error accessing camera:", err);
          logger.error('Error accessing camera', { error: err.message, name: err.name });
        } else {
          logger.warn('Camera permission denied');
        }

        if (isPermissionError) {
            setError("Please give camera access to use the application.");
        } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
            setError("No camera found on this device.");
        } else if (err?.name === 'NotReadableError' || err?.name === 'TrackStartError') {
            setError("Camera is in use by another application.");
        } else {
            setError("Please give camera access to use the application.");
        }
      }
    };

    startCamera().catch(e => {
        console.error("Critical camera error:", e);
        logger.error('Critical camera error', { error: e.message });
        if (isMounted) setError("Failed to start camera.");
    });

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        logger.info('Camera stream stopped');
      }
    };
  }, [facingMode, retryCount]);

  return (
    <div className="absolute inset-0 bg-zinc-900 overflow-hidden flex items-center justify-center">
      {error ? (
        <div className="flex flex-col items-center justify-center p-8 text-center z-0">
          <p className="text-white/60 mb-6 max-w-xs leading-relaxed">{error}</p>
          <button 
            onClick={() => setRetryCount(c => c + 1)}
            className="px-6 py-2.5 bg-white/10 text-white rounded-full text-sm font-medium hover:bg-white/20 transition-colors backdrop-blur-md border border-white/10"
          >
            Enable Camera
          </button>
          <p className="text-white/20 text-xs mt-4">
            If the prompt doesn't appear, check your browser settings.
          </p>
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
