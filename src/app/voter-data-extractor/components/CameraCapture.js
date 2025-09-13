'use client';

import { useState, useRef } from 'react';

export default function CameraCapture({ onCapture }) {
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' for front camera, 'environment' for back camera
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access the camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const switchCamera = () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL and pass to parent
      const imageData = canvas.toDataURL('image/jpeg');
      onCapture(imageData);
      stopCamera();
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px', border: '2px dashed var(--border-color)', borderRadius: '10px', backgroundColor: 'var(--card-background)' }}>
      {!stream ? (
        <div style={{ padding: '40px 20px' }}>
          <p style={{ fontSize: '18px', marginBottom: '20px', color: 'var(--foreground)' }}>Click the button below to start the camera and capture a voter form</p>
          <button 
            onClick={startCamera}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              backgroundColor: 'var(--button-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Start Camera
          </button>
        </div>
      ) : (
        <div>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            style={{ width: '100%', maxHeight: '70vh', borderRadius: '8px' }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div style={{ margin: '20px 0', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
            <button 
              onClick={switchCamera}
              style={{
                padding: '12px 20px',
                backgroundColor: 'var(--button-warning)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Switch Camera
            </button>
            <button 
              onClick={captureImage}
              style={{
                padding: '12px 20px',
                backgroundColor: 'var(--button-success)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Capture Image
            </button>
            <button 
              onClick={stopCamera}
              style={{
                padding: '12px 20px',
                backgroundColor: 'var(--button-danger)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}