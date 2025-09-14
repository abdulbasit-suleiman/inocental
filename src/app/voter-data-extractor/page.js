'use client';

import Image from "next/image";
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { createExcelTemplate, downloadExcelFile, downloadExcelFromBase64, saveExcelToFirebase, fetchExcelFromFirebase } from './utils/excelUtils';
import { auth } from '../../firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

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
  const [userId, setUserId] = useState(null); // Will be set after auth
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Handle URL parameter for sheet name and authenticate user
  useEffect(() => {
    if (urlSheetName) {
      setSheetName(urlSheetName);
    }
    
    // Handle authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setIsAuthenticated(true);
        console.log('User authenticated with ID:', user.uid);
      } else {
        // Sign in anonymously if not authenticated
        signInAnonymously(auth)
          .then((userCredential) => {
            const user = userCredential.user;
            setUserId(user.uid);
            setIsAuthenticated(true);
            console.log('Anonymous user signed in with ID:', user.uid);
          })
          .catch((error) => {
            console.error('Error signing in anonymously:', error);
            // Generate a temporary user ID for demo purposes
            const tempUserId = 'temp-' + Date.now();
            setUserId(tempUserId);
            setIsAuthenticated(true);
            setError('Authentication failed. Using temporary ID for demo.');
          });
      }
    });
    
    return () => unsubscribe();
  }, [urlSheetName]);

  // Create initial Excel template
  const handleCreateTemplate = async () => {
    // Validate sheet name
    if (!sheetName || sheetName.trim() === '') {
      setError('Please enter a valid sheet name');
      return;
    }
    
    if (!isAuthenticated || !userId) {
      setError('Authentication required. Please wait and try again.');
      return;
    }
    
    setError('');
    setSuccessMessage('');
    
    const trimmedSheetName = sheetName.trim();
    
    try {
      // Check if sheet already exists
      setSuccessMessage('Checking for existing sheet...');
      const existingSheet = await fetchExcelFromFirebase(trimmedSheetName, userId);
      if (existingSheet) {
        // Load existing sheet data
        setSuccessMessage(`Loading existing sheet: ${trimmedSheetName}`);
        
        // Import the parse function dynamically
        const { parseExcelFromBase64 } = await import('./utils/excelUtils');
        
        // Parse the Excel data from base64
        if (existingSheet.excelData) {
          try {
            const parsedData = parseExcelFromBase64(existingSheet.excelData);
            setExcelData(parsedData);
            setSuccessMessage(`Loaded existing sheet: ${trimmedSheetName} with ${parsedData.length - 1} entries`);
          } catch (parseError) {
            console.error('Error parsing Excel data:', parseError);
            // Fallback to template
            const template = createExcelTemplate();
            setExcelData(template);
            setSuccessMessage(`Loaded template for: ${trimmedSheetName} (could not parse existing data)`);
          }
        } else {
          // Fallback to template
          const template = createExcelTemplate();
          setExcelData(template);
          setSuccessMessage(`Loaded template for: ${trimmedSheetName}`);
        }
      } else {
        // Create new sheet
        const template = createExcelTemplate();
        setExcelData(template);
        setSuccessMessage(`Created new Excel template for: ${trimmedSheetName}`);
      }
    } catch (error) {
      console.error('Error checking/creating sheet:', error);
      // If there's an error fetching, still create a new template
      const template = createExcelTemplate();
      setExcelData(template);
      setSuccessMessage('Created new Excel template (could not check for existing sheet)');
    }
    
    setStep('capture');
  };

  const handleImageCapture = (imageSrc) => {
    setCapturedImage(imageSrc);
    setStep('form');
  };

  const handleProcessImage = async () => {
    if (!capturedImage) {
      setError('No image captured');
      return;
    }
    
    if (!isAuthenticated || !userId) {
      setError('Authentication required. Please wait and try again.');
      return;
    }
    
    setIsProcessing(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // Import the OCR utils dynamically to avoid server-side issues
      const { processImageWithOCR, preprocessImageForOCR } = await import('./utils/ocrUtils');
      
      setSuccessMessage('Preprocessing image for better OCR results...');
      
      // Preprocess image for better OCR results
      const processedImage = await preprocessImageForOCR(capturedImage);
      
      setSuccessMessage('Extracting data from image (this should take just a few seconds)...');
      
      // Process the image with optimized OCR method (faster single pass)
      const ocrData = await processImageWithOCR(processedImage);
      
      setVoterData(ocrData);
      setSuccessMessage('Data extracted successfully! Please review and edit as needed.');
    } catch (error) {
      console.error('Error processing image:', error);
      setError('Failed to process image: ' + error.message);
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
    // Validate required fields
    if (!voterData.surname || !voterData.firstname || !voterData.phonenumber || 
        !voterData.applicationnumber || !voterData.dateofbirth || !voterData.gender || 
        !voterData.ward || !voterData.unit || !voterData.nin) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (!isAuthenticated || !userId) {
      setError('Authentication required. Please wait and try again.');
      return;
    }
    
    // Add the current voter data to the excel data
    const newData = [...excelData];
    newData.push(voterData);
    setExcelData(newData);
    
    setSuccessMessage('Data added to Excel sheet');
    
    // Reset for next entry
    setVoterData({});
    setCapturedImage(null);
    setStep('capture');
    setError('');
  };

  const handleDownloadExcel = () => {
    if (excelData.length <= 1) {
      setError('No data to download. Please add at least one entry.');
      return;
    }
    
    // Export to Excel
    downloadExcelFile(excelData, `${sheetName || 'voter_data'}.xlsx`);
    setSuccessMessage('Excel file downloaded successfully');
  };

  const handleSaveToFirebase = async () => {
    if (!sheetName || sheetName.trim() === '') {
      setError('Please enter a sheet name');
      return;
    }
    
    if (excelData.length <= 1) {
      setError('No data to save. Please add at least one entry.');
      return;
    }
    
    if (!isAuthenticated || !userId) {
      setError('Authentication required. Please wait and try again.');
      return;
    }
    
    setError('');
    setSuccessMessage('');
    
    try {
      const docId = await saveExcelToFirebase(excelData, sheetName.trim(), userId);
      setSuccessMessage(`Excel sheet saved to Firebase successfully! Document ID: ${docId}`);
    } catch (error) {
      console.error('Error saving to Firebase:', error);
      if (error.message.includes('CORS')) {
        setError('CORS error when saving to Firebase. Please check the Firebase Rules Setup documentation for instructions on configuring CORS.');
      } else if (error.message.includes('Unauthorized')) {
        setError('Unauthorized access to Firebase. Please check your Firebase security rules.');
      } else {
        setError('Failed to save Excel sheet to Firebase: ' + error.message);
      }
    }
  };

  // Clear messages after a few seconds
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError('');
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  // Show loading state while authenticating
  if (!isAuthenticated) {
    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ textAlign: 'center', color: 'var(--foreground)', marginBottom: '30px' }}>Voter Data Extractor</h1>
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'var(--card-background)', borderRadius: '8px' }}>
          <p>Authenticating user...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: 'var(--foreground)', marginBottom: '30px' }}>Voter Data Extractor</h1>
      
      {/* Error and success messages */}
      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '15px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}
      
      {successMessage && (
        <div style={{
          backgroundColor: '#e8f5e9',
          color: '#2e7d32',
          padding: '15px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {successMessage}
        </div>
      )}
      
      {step === 'create' && (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'var(--card-background)', borderRadius: '8px' }}>
          <h2>Create New Voter Data Sheet</h2>
          <p>This will create an Excel template with the required fields:</p>
          <ul style={{ textAlign: 'left', display: 'inline-block', fontSize: '18px', color: 'var(--text-muted)' }}>
            <li>Surname</li>
            <li>Middle Name</li>
            <li>First Name</li>
            <li>Phone Number</li>
            <li>Application Number</li>
            <li>Date of Birth</li>
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
            disabled={!sheetName || sheetName.trim() === '' || !isAuthenticated}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              backgroundColor: (sheetName && sheetName.trim() !== '' && isAuthenticated) ? 'var(--button-success)' : 'var(--button-secondary)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (sheetName && sheetName.trim() !== '' && isAuthenticated) ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
              marginTop: '20px',
              opacity: (sheetName && sheetName.trim() !== '' && isAuthenticated) ? 1 : 0.6
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
                disabled={excelData.length <= 1 || !isAuthenticated}
                style={{
                  padding: '10px 20px',
                  backgroundColor: (excelData.length > 1 && isAuthenticated) ? 'var(--button-primary)' : 'var(--button-secondary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: (excelData.length > 1 && isAuthenticated) ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold',
                  marginRight: '10px',
                  opacity: (excelData.length > 1 && isAuthenticated) ? 1 : 0.6
                }}
              >
                Download Sheet ({excelData.length - 1} entries)
              </button>
              <button 
                onClick={handleSaveToFirebase}
                disabled={!isAuthenticated}
                style={{
                  padding: '10px 20px',
                  backgroundColor: isAuthenticated ? 'var(--button-success)' : 'var(--button-secondary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isAuthenticated ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold',
                  opacity: isAuthenticated ? 1 : 0.6
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
                disabled={isProcessing || !isAuthenticated}
                style={{
                  padding: '10px 15px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  backgroundColor: isAuthenticated ? 'var(--button-success)' : 'var(--button-secondary)',
                  color: 'white',
                  marginTop: '10px',
                  marginLeft: '10px',
                  opacity: (isProcessing || !isAuthenticated) ? 0.6 : 1,
                  cursor: (isProcessing || !isAuthenticated) ? 'not-allowed' : 'pointer'
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
                  disabled={!voterData.surname || !voterData.firstname || !voterData.phonenumber || 
                           !voterData.applicationnumber || !voterData.dateofbirth || !voterData.gender || 
                           !voterData.ward || !voterData.unit || !voterData.nin || !isAuthenticated}
                  style={{
                    padding: '12px 25px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    backgroundColor: (!voterData.surname || !voterData.firstname || !voterData.phonenumber || 
                                   !voterData.applicationnumber || !voterData.dateofbirth || !voterData.gender || 
                                   !voterData.ward || !voterData.unit || !voterData.nin || !isAuthenticated) ? 'var(--button-secondary)' : 'var(--button-primary)',
                    color: 'white',
                    fontSize: '16px',
                    opacity: (!voterData.surname || !voterData.firstname || !voterData.phonenumber || 
                             !voterData.applicationnumber || !voterData.dateofbirth || !voterData.gender || 
                             !voterData.ward || !voterData.unit || !voterData.nin || !isAuthenticated) ? 0.6 : 1,
                    cursor: (!voterData.surname || !voterData.firstname || !voterData.phonenumber || 
                            !voterData.applicationnumber || !voterData.dateofbirth || !voterData.gender || 
                            !voterData.ward || !voterData.unit || !voterData.nin || !isAuthenticated) ? 'not-allowed' : 'pointer'
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