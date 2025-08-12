
import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { SourceImage } from '../types';
import { CameraIcon } from './icons/CameraIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface CameraModalProps {
  onCapture: (image: SourceImage) => void;
  onClose: () => void;
}

export const CameraModal = ({ onCapture, onClose }: CameraModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cleanupCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  }, [stream]);

  useEffect(() => {
    const openCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" } 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please check permissions.");
      }
    };

    openCamera();

    return cleanupCamera;
  }, [cleanupCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      
      const mimeType = 'image/jpeg';
      const dataUrl = canvas.toDataURL(mimeType, 0.9);
      const base64 = dataUrl.split(',')[1];
      
      onCapture({ base64, mimeType });
      cleanupCamera();
    }
  };

  const handleClose = () => {
    cleanupCamera();
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="relative bg-gray-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
        <button onClick={handleClose} className="absolute top-2 right-2 z-10 p-2 text-white/70 hover:text-white transition-colors" aria-label="Close camera">
          <XCircleIcon className="w-8 h-8"/>
        </button>
        
        <div className="aspect-w-3 aspect-h-4">
            {error ? (
                <div className="flex items-center justify-center h-full text-red-400 p-4">{error}</div>
            ) : (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            )}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center">
            <button
                onClick={handleCapture}
                disabled={!!error}
                className="w-20 h-20 bg-white rounded-full border-4 border-white/50 ring-2 ring-offset-4 ring-offset-black/20 ring-white/50 flex items-center justify-center text-gray-800 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Capture photo"
            >
                <CameraIcon className="w-10 h-10" />
            </button>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};
