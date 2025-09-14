'use client';

import Image from "next/image";
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { createExcelTemplate, downloadExcelFile, saveExcelToFirebase, fetchExcelFromFirebase } from './utils/excelUtils';
import { auth } from '../../firebase';
import { signInAnonymously } from 'firebase/auth';

// Dynamically import components that use client-side APIs
const CameraCapture = dynamic(() => import('./components/CameraCapture'), { ssr: false });
const VoterDataForm = dynamic(() => import('./components/VoterDataForm'), { ssr: false });

function VoterDataExtractorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSheetName = searchParams.get('sheetName');
  
  const [step, setStep] = useState('create'); // 'create', 'capture', 'form', 'download'
  const [capturedImage, setCapturedImage] = useState(null);
  const [voterData, setVoterData] = useState({});
  const [excelData, setExcelData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sheetName, setSheetName] = useState('');
  const [userId, setUserId] = useState('user-' + Date.now()); // Simple user ID for demo

  // Handle URL parameter for sheet name and authenticate user
  useEffect(() => {
    if (urlSheetName) {
      setSheetName(urlSheetName);
    }
    
    // Sign in anonymously
    signInAnonymously(auth)
      .then((userCredential) => {
        // Signed in..
        const user = userCredential.user;
        setUserId(user.uid);
        console.log('Anonymous user signed in:', user.uid);
      })
      .catch((error) => {
        console.error('Error signing in anonymously:', error);
        // Fallback to simple user ID
      });
  }, [urlSheetName]);

  // Create initial Excel template
  const handleCreateTemplate = async () => {
    // Check if sheet already exists
    if (sheetName) {
      try {
        const existingSheet = await fetchExcelFromFirebase(sheetName, userId);
        if (existingSheet) {
          // Load existing sheet data
          alert(`Loading existing sheet: ${sheetName}`);
          // In a real implementation, you would fetch the actual Excel data
          const template = createExcelTemplate();
          setExcelData(template);
        } else {
          // Create new sheet
          const template = createExcelTemplate();
          setExcelData(template);
        }
      } catch (error) {
        console.error('Error checking sheet:', error);
        // If there's an error fetching, still create a new template
        const template = createExcelTemplate();
        setExcelData(template);
      }
    } else {
      const template = createExcelTemplate();
      setExcelData(template);
    }
    
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
      // Import the OCR utils dynamically to avoid server-side issues
      const { processImageWithMultipleOCR, preprocessImageForOCR, advancedParseVoterData } = await import('./utils/ocrUtils');
      
      // Preprocess image for better OCR results
      const processedImage = await preprocessImageForOCR(capturedImage);
      
      // Process the image with multiple OCR methods for better accuracy
      const ocrData = await processImageWithMultipleOCR(processedImage);
      
      // Use advanced parsing as a fallback
      if (!ocrData.surname || !ocrData.firstname || !ocrData.phonenumber) {
        // If basic parsing didn't get all required fields, try advanced parsing
        const advancedData = advancedParseVoterData(processedImage);
        // Merge the data, prioritizing non-empty values
        Object.keys(advancedData).forEach(key => {
          if (!ocrData[key] && advancedData[key]) {
            ocrData[key] = advancedData[key];
          }
        });
      }
      
      setVoterData(ocrData);
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
    downloadExcelFile(excelData, `${sheetName || 'voter_data'}.xlsx`);
  };

  const handleSaveToFirebase = async () => {
    if (!sheetName) {
      alert('Please enter a sheet name');
      return;
    }
    
    try {
      await saveExcelToFirebase(excelData, sheetName, userId);
      alert('Excel sheet saved to Firebase successfully!');
    } catch (error) {
      console.error('Error saving to Firebase:', error);
      if (error.message.includes('CORS')) {
        alert('CORS error when saving to Firebase. Please check the Firebase Rules Setup documentation for instructions on configuring CORS.');
      } else if (error.message.includes('Unauthorized')) {
        alert('Unauthorized access to Firebase. Please check your Firebase security rules.');
      } else {
        alert('Failed to save Excel sheet to Firebase: ' + error.message);
      }
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: 'var(--foreground)', marginBottom: '30px' }}>Voter Data Extractor</h1>
      
      {step === 'create' && (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'var(--card-background)', borderRadius: '8px' }}>
          <h2>Create New Voter Data Sheet</h2>
          <p>This will create an Excel template with the required fields:</p>
          <ul style={{ textAlign: 'left', display: 'inline-block', fontSize: '18px', color: 'var(--text-muted)' }}>
            <li>Surname</li>
            <li>Middle Name</li>
            <li>First Name</li>
            <li>Phone Number</li>
            <li>Gender</li>
            <li>Ward</li>
            <li>Unit</li>
            <li>NIN</li>
          </ul>
          
          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: 'var(--foreground)' }}>
              Excel Sheet Name:
            </label>
            <input
              type="text"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              placeholder="Enter sheet name"
              style={{
                padding: '12px',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                fontSize: '16px',
                width: '300px',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)'
              }}
            />
          </div>
          
          <button 
            onClick={handleCreateTemplate}
            disabled={!sheetName}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              backgroundColor: sheetName ? 'var(--button-success)' : 'var(--button-secondary)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: sheetName ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
              marginTop: '20px',
              opacity: sheetName ? 1 : 0.6
            }}
          >
            Create Excel Template
          </button>
        </div>
      )}
      
      {step === 'capture' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <h2>Capture Voter Form</h2>
            <div>
              <button 
                onClick={handleDownloadExcel}
                disabled={excelData.length <= 1}
                style={{
                  padding: '10px 20px',
                  backgroundColor: excelData.length <= 1 ? 'var(--button-secondary)' : 'var(--button-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: excelData.length <= 1 ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  marginRight: '10px',
                  opacity: excelData.length <= 1 ? 0.6 : 1
                }}
              >
                Download Sheet ({excelData.length - 1} entries)
              </button>
              <button 
                onClick={handleSaveToFirebase}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--button-success)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Save to Firebase
              </button>
            </div>
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
              <div style={{ maxWidth: '100%', height: 'auto', border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <Image 
                  src={capturedImage} 
                  alt="Captured voter form" 
                  width={500} 
                  height={300} 
                  style={{ maxWidth: '100%', height: 'auto' }} 
                />
              </div>
              <button 
                onClick={() => setStep('capture')}
                style={{
                  padding: '10px 15px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  backgroundColor: 'var(--button-secondary)',
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
                  backgroundColor: 'var(--button-success)',
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
                    backgroundColor: (!voterData.surname || !voterData.firstname || !voterData.phonenumber || !voterData.gender || !voterData.ward || !voterData.unit || !voterData.nin) ? 'var(--button-secondary)' : 'var(--button-primary)',
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
                    backgroundColor: 'var(--button-secondary)',
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

// Wrapper component to handle server-side rendering
export default function VoterDataExtractor() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ textAlign: 'center', color: 'var(--foreground)', marginBottom: '30px' }}>Voter Data Extractor</h1>
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'var(--card-background)', borderRadius: '8px' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return <VoterDataExtractorContent />;
}