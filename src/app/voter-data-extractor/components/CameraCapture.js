'use client';

import { useState, useRef, useEffect } from 'react';

export default function CameraCapture({ onCapture }) {
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' for front camera, 'environment' for back camera
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    setIsLoading(true);
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
      alert('Could not access the camera. Please check permissions and ensure you\'re using a secure connection (https).');
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const switchCamera = async () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    // Small delay to ensure camera is fully stopped before restarting
    setTimeout(startCamera, 500);
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

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '20px', border: '2px dashed var(--border-color)', borderRadius: '10px', backgroundColor: 'var(--card-background)' }}>
      {!stream ? (
        <div style={{ padding: '40px 20px' }}>
          <h3 style={{ fontSize: '22px', marginBottom: '15px', color: 'var(--foreground)' }}>📸 Camera Capture</h3>
          <p style={{ fontSize: '16px', marginBottom: '25px', color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 25px' }}>
            Click below to start your camera and preview the voter form before capturing.
          </p>
          <button 
            onClick={startCamera}
            disabled={isLoading}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              backgroundColor: isLoading ? 'var(--button-secondary)' : 'var(--button-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Starting Camera...' : 'Start Camera'}
          </button>
          {isLoading && (
            <p style={{ marginTop: '15px', color: 'var(--text-muted)' }}>
              Please allow camera access when prompted...
            </p>
          )}
        </div>
      ) : (
        <div>
          <h3 style={{ fontSize: '20px', marginBottom: '15px', color: 'var(--foreground)' }}>📷 Live Camera Preview</h3>
          <p style={{ marginBottom: '15px', color: 'var(--text-muted)' }}>
            Position the voter form in the frame below and click "Capture Image" when ready
          </p>
          <div style={{ 
            position: 'relative', 
            display: 'inline-block',
            border: '3px solid var(--button-primary)',
            borderRadius: '8px',
            overflow: 'hidden',
            margin: '0 auto 20px',
            maxWidth: '100%'
          }}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              style={{ 
                width: '100%', 
                maxHeight: '70vh', 
                display: 'block',
                backgroundColor: 'black'
              }}
              onLoadedData={() => {
                // Ensure video is playing
                if (videoRef.current) {
                  videoRef.current.play().catch(e => console.log('Autoplay prevented:', e));
                }
              }}
            />
            {/* Overlay grid to help with framing */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              border: '2px solid rgba(255,255,255,0.3)'
            }}>
              {/* Grid lines */}
              <div style={{position: 'absolute', top: '33%', left: 0, right: 0, height: '1px', backgroundColor: 'rgba(255,255,255,0.3)'}}></div>
              <div style={{position: 'absolute', top: '66%', left: 0, right: 0, height: '1px', backgroundColor: 'rgba(255,255,255,0.3)'}}></div>
              <div style={{position: 'absolute', left: '33%', top: 0, bottom: 0, width: '1px', backgroundColor: 'rgba(255,255,255,0.3)'}}></div>
              <div style={{position: 'absolute', left: '66%', top: 0, bottom: 0, width: '1px', backgroundColor: 'rgba(255,255,255,0.3)'}}></div>
              
              {/* Center target */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80px',
                height: '80px',
                border: '2px solid rgba(255,255,255,0.7)',
                borderRadius: '50%',
                pointerEvents: 'none'
              }}></div>
            </div>
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div style={{ margin: '20px 0', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
            <button 
              onClick={switchCamera}
              style={{
                padding: '12px 20px',
                backgroundColor: 'var(--button-warning)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>🔄</span>
              <span>Switch Camera</span>
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
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>📷</span>
              <span>Capture Image</span>
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
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>❌</span>
              <span>Cancel</span>
            </button>
          </div>
          <div style={{ 
            marginTop: '15px', 
            padding: '12px', 
            backgroundColor: 'rgba(255, 255, 0, 0.1)', 
            border: '1px solid rgba(255, 255, 0, 0.3)', 
            borderRadius: '4px',
            maxWidth: '500px',
            margin: '15px auto 0'
          }}>
            <p style={{ 
              margin: 0, 
              fontSize: '14px', 
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}>
              <span style={{ fontSize: '16px' }}>💡</span>
              <span>Make sure the entire voter form is visible in the frame before capturing. You can switch cameras if needed.</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}