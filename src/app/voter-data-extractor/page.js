'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { createExcelTemplate, downloadExcelFile } from './utils/excelUtils';

// Dynamically import components that use client-side APIs
const CameraCapture = dynamic(() => import('./components/CameraCapture'), { ssr: false });
const VoterDataForm = dynamic(() => import('./components/VoterDataForm'), { ssr: false });

export default function VoterDataExtractor() {
  const [step, setStep] = useState('create'); // 'create', 'capture', 'form', 'download'
  const [capturedImage, setCapturedImage] = useState(null);
  const [voterData, setVoterData] = useState({});
  const [excelData, setExcelData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Create initial Excel template
  const handleCreateTemplate = () => {
    const template = createExcelTemplate();
    setExcelData(template);
    setStep('capture');
  };

  const handleImageCapture = (imageSrc) => {
    setCapturedImage(imageSrc);
    setStep('form');
  };

  const handleProcessImage = async () => {
    if (!capturedImage) return;
    
    setIsProcessing(true);
    try {
      // For now, we'll use mock data since we can't run OCR in the browser without additional setup
      // In a real implementation, you would call the OCR processing function here
      const mockData = {
        surname: 'Smith',
        middlename: 'John',
        firstname: 'Michael',
        phonenumber: '08012345678',
        gender: 'Male',
        ward: 'Ward 5',
        unit: 'Unit 12',
        nin: '12345678901'
      };
      setVoterData(mockData);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDataChange = (field, value) => {
    setVoterData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddToExcel = () => {
    // Add the current voter data to the excel data
    const newData = [...excelData];
    newData.push(voterData);
    setExcelData(newData);
    
    // Reset for next entry
    setVoterData({});
    setCapturedImage(null);
    setStep('capture');
  };

  const handleDownloadExcel = () => {
    // Export to Excel
    downloadExcelFile(excelData, 'voter_data.xlsx');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>Voter Data Extractor</h1>
      
      {step === 'create' && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h2>Create New Voter Data Sheet</h2>
          <p>This will create an Excel template with the required fields:</p>
          <ul style={{ textAlign: 'left', display: 'inline-block', fontSize: '18px' }}>
            <li>Surname</li>
            <li>Middle Name</li>
            <li>First Name</li>
            <li>Phone Number</li>
            <li>Gender</li>
            <li>Ward</li>
            <li>Unit</li>
            <li>NIN</li>
          </ul>
          <button 
            onClick={handleCreateTemplate}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginTop: '20px'
            }}
          >
            Create Excel Template
          </button>
        </div>
      )}
      
      {step === 'capture' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Capture Voter Form</h2>
            <button 
              onClick={handleDownloadExcel}
              disabled={excelData.length <= 1}
              style={{
                padding: '10px 20px',
                backgroundColor: excelData.length <= 1 ? '#ccc' : '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: excelData.length <= 1 ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                opacity: excelData.length <= 1 ? 0.6 : 1
              }}
            >
              Download Sheet ({excelData.length - 1} entries)
            </button>
          </div>
          <CameraCapture onCapture={handleImageCapture} />
        </div>
      )}
      
      {step === 'form' && (
        <div>
          <h2>Extracted Voter Information</h2>
          <p>Please review and edit the extracted information below:</p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', marginTop: '20px' }}>
            <div style={{ flex: '1', minWidth: '300px' }}>
              <h3>Captured Image</h3>
              <img src={capturedImage} alt="Captured voter form" style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ddd', borderRadius: '4px' }} />
              <button 
                onClick={() => setStep('capture')}
                style={{
                  padding: '10px 15px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  backgroundColor: '#f0f0f0',
                  marginTop: '10px'
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
                  marginTop: '10px',
                  marginLeft: '10px',
                  opacity: isProcessing ? 0.6 : 1,
                  cursor: isProcessing ? 'not-allowed' : 'pointer'
                }}
              >
                {isProcessing ? 'Processing...' : 'Extract Data'}
              </button>
            </div>
            
            <div style={{ flex: '1', minWidth: '300px' }}>
              <VoterDataForm data={voterData} onChange={handleDataChange} />
              <div style={{ marginTop: '20px' }}>
                <button 
                  onClick={handleAddToExcel}
                  disabled={!voterData.surname || !voterData.firstname || !voterData.phonenumber || !voterData.gender || !voterData.ward || !voterData.unit || !voterData.nin}
                  style={{
                    padding: '12px 25px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    backgroundColor: (!voterData.surname || !voterData.firstname || !voterData.phonenumber || !voterData.gender || !voterData.ward || !voterData.unit || !voterData.nin) ? '#ccc' : '#2196F3',
                    color: 'white',
                    fontSize: '16px',
                    opacity: (!voterData.surname || !voterData.firstname || !voterData.phonenumber || !voterData.gender || !voterData.ward || !voterData.unit || !voterData.nin) ? 0.6 : 1,
                    cursor: (!voterData.surname || !voterData.firstname || !voterData.phonenumber || !voterData.gender || !voterData.ward || !voterData.unit || !voterData.nin) ? 'not-allowed' : 'pointer'
                  }}
                >
                  Add to Excel Sheet
                </button>
                <button 
                  onClick={() => setStep('capture')}
                  style={{
                    padding: '12px 25px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    backgroundColor: '#f0f0f0',
                    marginLeft: '10px',
                    fontSize: '16px'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}