'use client';

import Image from "next/image";
import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components that use client-side APIs
const CameraCapture = dynamic(() => import('./components/CameraCapture'), { ssr: false });
const VoterForm = dynamic(() => import('./components/VoterForm'), { ssr: false });

export default function VoterFormOCR() {
  const [capturedImage, setCapturedImage] = useState(null);
  const [voterData, setVoterData] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleImageCapture = (imageSrc) => {
    setCapturedImage(imageSrc);
    setVoterData({});
  };

  const handleProcessImage = async () => {
    if (!capturedImage) return;
    
    setIsProcessing(true);
    try {
      // For now, we'll use mock data since we can't run OCR in the browser without additional setup
      // In a real implementation, you would call the OCR processing function here
      const mockData = {
        fullName: 'John Doe',
        voterId: 'V123456789',
        address: '123 Main Street, City, State 12345',
        dateOfBirth: '01/01/1990',
        gender: 'Male',
        constituency: 'Central District',
        ward: 'Ward 5',
        pollingStation: 'Central High School'
      };
      setVoterData(mockData);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportToExcel = async () => {
    setIsExporting(true);
    try {
      // In a real implementation, you would export to Excel here
      alert('In a real implementation, this would export to Excel');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export to Excel. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDataChange = (field, value) => {
    setVoterData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Voter Form OCR Extractor</h1>
      
      {!capturedImage ? (
        <CameraCapture onCapture={handleImageCapture} />
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', marginTop: '20px' }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <h2>Captured Image</h2>
            <div style={{ maxWidth: '100%', height: 'auto', overflow: 'hidden' }}>
              <Image 
                src={capturedImage} 
                alt="Captured voter form" 
                width={500} 
                height={300} 
                style={{ maxWidth: '100%', height: 'auto' }} 
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button 
                onClick={() => setCapturedImage(null)}
                style={{
                  padding: '10px 15px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  backgroundColor: '#f0f0f0'
                }}
              >
                Retake Photo
              </button>
              <button 
                onClick={handleProcessImage} 
                disabled={isProcessing}
                style={{
                  padding: '10px 15px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  opacity: isProcessing ? 0.6 : 1,
                  cursor: isProcessing ? 'not-allowed' : 'pointer'
                }}
              >
                {isProcessing ? 'Processing...' : 'Extract Data'}
              </button>
            </div>
          </div>
          
          {Object.keys(voterData).length > 0 && (
            <div style={{ flex: '1', minWidth: '300px' }}>
              <VoterForm data={voterData} onChange={handleDataChange} />
              <button 
                onClick={handleExportToExcel} 
                disabled={isExporting}
                style={{
                  padding: '10px 15px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  marginTop: '20px',
                  opacity: isExporting ? 0.6 : 1,
                  cursor: isExporting ? 'not-allowed' : 'pointer'
                }}
              >
                {isExporting ? 'Exporting...' : 'Export to Excel'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}