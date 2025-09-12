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
    <div style={{ textAlign: 'center', padding: '20px', border: '2px dashed #ccc', borderRadius: '10px' }}>
      {!stream ? (
        <div style={{ padding: '40px 20px' }}>
          <p style={{ fontSize: '18px', marginBottom: '20px' }}>Click the button below to start the camera and capture a voter form</p>
          <button 
            onClick={startCamera}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              backgroundColor: '#2196F3',
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
          <div style={{ margin: '20px 0' }}>
            <button 
              onClick={switchCamera}
              style={{
                padding: '12px 20px',
                margin: '0 10px',
                backgroundColor: '#FF9800',
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
                margin: '0 10px',
                backgroundColor: '#4CAF50',
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
                margin: '0 10px',
                backgroundColor: '#f44336',
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