'use client';

import Tesseract from 'tesseract.js';

// Function to process image with optimized Tesseract.js OCR
export async function processImageWithOCR(imageSrc) {
  try {
    // Create a promise that rejects after a timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OCR processing timed out after 30 seconds')), 30000);
    });
    
    // Perform OCR on the image with optimized settings for speed
    const ocrPromise = Tesseract.recognize(
      imageSrc,
      'eng',
      { 
        logger: info => {
          // Only log progress if needed for debugging
          if (info.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(info.progress * 100)}%`);
          }
        },
        // Optimized settings for faster processing
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
        preserve_interword_spaces: '1',
        // Limit character set for voter forms
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@.-()/# '
      }
    );
    
    // Race the OCR promise against the timeout
    const result = await Promise.race([ocrPromise, timeoutPromise]);
    
    // Extract text from the result
    const text = result.data.text;
    console.log('OCR Result:', text);
    
    // Parse the extracted text to find voter information
    const voterData = parseVoterData(text);
    
    return voterData;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to process image with OCR: ' + error.message);
  }
}

// Function to parse voter data from OCR text with better handling of incomplete data
function parseVoterData(text) {
  // Convert text to lowercase for easier matching
  const lowerText = text.toLowerCase();
  
  // Initialize data object with empty values
  const data = {
    surname: '',
    middlename: '',
    firstname: '',
    phonenumber: '',
    gender: '',
    ward: '',
    unit: '',
    nin: ''
  };
  
  // Try to extract information using multiple patterns for robustness
  // Surname extraction
  const surnamePatterns = [
    /surname[:\s]*([A-Z][a-zA-Z\s]{2,})/i,
    /last\s*name[:\s]*([A-Z][a-zA-Z\s]{2,})/i,
    /family\s*name[:\s]*([A-Z][a-zA-Z\s]{2,})/i
  ];
  
  for (const pattern of surnamePatterns) {
    const match = text.match(pattern);
    if (match && match[1].trim()) {
      data.surname = match[1].trim();
      break;
    }
  }
  
  // First name extraction
  const firstNamePatterns = [
    /first\s*name[:\s]*([A-Z][a-zA-Z\s]{2,})/i,
    /given\s*name[:\s]*([A-Z][a-zA-Z\s]{2,})/i
  ];
  
  for (const pattern of firstNamePatterns) {
    const match = text.match(pattern);
    if (match && match[1].trim()) {
      data.firstname = match[1].trim();
      break;
    }
  }
  
  // Middle name extraction
  const middleNamePatterns = [
    /middle\s*name[:\s]*([A-Z][a-zA-Z\s]{2,})/i,
    /other\s*name[:\s]*([A-Z][a-zA-Z\s]{2,})/i
  ];
  
  for (const pattern of middleNamePatterns) {
    const match = text.match(pattern);
    if (match && match[1].trim()) {
      data.middlename = match[1].trim();
      break;
    }
  }
  
  // Phone number extraction
  const phonePatterns = [
    /phone\s*[:\s]*([\d\s\-\(\)]{10,})/i,
    /tel\s*[:\s]*([\d\s\-\(\)]{10,})/i,
    /mobile\s*[:\s]*([\d\s\-\(\)]{10,})/i,
    /number\s*[:\s]*([\d\s\-\(\)]{10,})/i
  ];
  
  for (const pattern of phonePatterns) {
    const match = text.match(pattern);
    if (match && match[1].replace(/\D/g, '').trim()) {
      data.phonenumber = match[1].replace(/\D/g, '').trim();
      break;
    }
  }
  
  // Gender extraction
  if (lowerText.includes('male')) {
    data.gender = 'Male';
  } else if (lowerText.includes('female')) {
    data.gender = 'Female';
  } else if (lowerText.includes('other')) {
    data.gender = 'Other';
  }
  
  // Ward extraction
  const wardPatterns = [
    /ward[:\s]*([A-Za-z0-9\s]{2,})/i,
    /electoral\s*ward[:\s]*([A-Za-z0-9\s]{2,})/i
  ];
  
  for (const pattern of wardPatterns) {
    const match = text.match(pattern);
    if (match && match[1].trim()) {
      data.ward = match[1].trim();
      break;
    }
  }
  
  // Unit extraction
  const unitPatterns = [
    /unit[:\s]*([A-Za-z0-9\s]{2,})/i,
    /polling\s*unit[:\s]*([A-Za-z0-9\s]{2,})/i
  ];
  
  for (const pattern of unitPatterns) {
    const match = text.match(pattern);
    if (match && match[1].trim()) {
      data.unit = match[1].trim();
      break;
    }
  }
  
  // NIN extraction
  const ninPatterns = [
    /nin[:\s]*([0-9]{11})/i,
    /national\s*id[:\s]*([0-9]{11})/i,
    /national\s*identification\s*number[:\s]*([0-9]{11})/i
  ];
  
  for (const pattern of ninPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      data.nin = match[1];
      break;
    }
  }
  
  return data;
}

// Function to process image with a single, optimized OCR method for better performance
export async function processImageWithMultipleOCR(imageSrc) {
  try {
    // Create a promise that rejects after a timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OCR processing timed out after 30 seconds')), 30000);
    });
    
    // Single optimized OCR pass for better performance
    const ocrPromise = Tesseract.recognize(
      imageSrc,
      'eng',
      {
        logger: info => {
          // Only log progress if needed for debugging
          if (info.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(info.progress * 100)}%`);
          }
        },
        // Optimized settings for voter forms
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
        preserve_interword_spaces: '1',
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@.-()/# '
      }
    );
    
    // Race the OCR promise against the timeout
    const result = await Promise.race([ocrPromise, timeoutPromise]);
    
    // Parse the text
    const voterData = parseVoterData(result.data.text);
    
    return voterData;
  } catch (error) {
    console.error('Optimized OCR Error:', error);
    throw new Error('Failed to process image with optimized OCR: ' + error.message);
  }
}

// Function to preprocess image for better OCR results
export function preprocessImageForOCR(imageSrc) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions (scale down for better performance)
      const maxWidth = 800;
      const scale = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Apply contrast enhancement and thresholding to improve OCR
      for (let i = 0; i < data.length; i += 4) {
        // Increase contrast
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Convert to grayscale
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        
        // Apply threshold (higher contrast for text)
        const threshold = gray > 150 ? 255 : 0;
        
        data[i] = threshold;     // red
        data[i + 1] = threshold; // green
        data[i + 2] = threshold; // blue
      }
      
      // Put processed data back
      ctx.putImageData(imageData, 0, 0);
      
      // Return processed image as data URL
      resolve(canvas.toDataURL('image/jpeg', 0.8)); // Reduced quality for faster processing
    };
    img.src = imageSrc;
  });
}

// Advanced parsing function that combines multiple parsing strategies
export function advancedParseVoterData(text) {
  // Split text into lines for line-by-line analysis
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  // Initialize data object
  const data = {
    surname: '',
    middlename: '',
    firstname: '',
    phonenumber: '',
    gender: '',
    ward: '',
    unit: '',
    nin: ''
  };
  
  // Process each line to extract information
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Look for surname
    if (!data.surname) {
      const surnameMatch = line.match(/surname[:\s]*([A-Z][a-zA-Z\s]{2,})/i) ||
                          line.match(/last\s*name[:\s]*([A-Z][a-zA-Z\s]{2,})/i) ||
                          line.match(/family\s*name[:\s]*([A-Z][a-zA-Z\s]{2,})/i);
      if (surnameMatch && surnameMatch[1].trim()) {
        data.surname = surnameMatch[1].trim();
      }
    }
    
    // Look for first name
    if (!data.firstname) {
      const firstNameMatch = line.match(/first\s*name[:\s]*([A-Z][a-zA-Z\s]{2,})/i) ||
                            line.match(/given\s*name[:\s]*([A-Z][a-zA-Z\s]{2,})/i);
      if (firstNameMatch && firstNameMatch[1].trim()) {
        data.firstname = firstNameMatch[1].trim();
      }
    }
    
    // Look for middle name
    if (!data.middlename) {
      const middleNameMatch = line.match(/middle\s*name[:\s]*([A-Z][a-zA-Z\s]{2,})/i) ||
                             line.match(/other\s*name[:\s]*([A-Z][a-zA-Z\s]{2,})/i);
      if (middleNameMatch && middleNameMatch[1].trim()) {
        data.middlename = middleNameMatch[1].trim();
      }
    }
    
    // Look for phone number
    if (!data.phonenumber) {
      const phoneMatch = line.match(/phone\s*[:\s]*([\d\s\-\(\)]{10,})/i) ||
                        line.match(/tel\s*[:\s]*([\d\s\-\(\)]{10,})/i) ||
                        line.match(/mobile\s*[:\s]*([\d\s\-\(\)]{10,})/i) ||
                        line.match(/number\s*[:\s]*([\d\s\-\(\)]{10,})/i);
      if (phoneMatch && phoneMatch[1].replace(/\D/g, '').trim()) {
        data.phonenumber = phoneMatch[1].replace(/\D/g, '').trim();
      }
    }
    
    // Look for gender
    if (!data.gender) {
      if (lowerLine.includes('male')) {
        data.gender = 'Male';
      } else if (lowerLine.includes('female')) {
        data.gender = 'Female';
      } else if (lowerLine.includes('other')) {
        data.gender = 'Other';
      }
    }
    
    // Look for ward
    if (!data.ward) {
      const wardMatch = line.match(/ward[:\s]*([A-Za-z0-9\s]{2,})/i) ||
                       line.match(/electoral\s*ward[:\s]*([A-Za-z0-9\s]{2,})/i);
      if (wardMatch && wardMatch[1].trim()) {
        data.ward = wardMatch[1].trim();
      }
    }
    
    // Look for unit
    if (!data.unit) {
      const unitMatch = line.match(/unit[:\s]*([A-Za-z0-9\s]{2,})/i) ||
                       line.match(/polling\s*unit[:\s]*([A-Za-z0-9\s]{2,})/i);
      if (unitMatch && unitMatch[1].trim()) {
        data.unit = unitMatch[1].trim();
      }
    }
    
    // Look for NIN
    if (!data.nin) {
      const ninMatch = line.match(/nin[:\s]*([0-9]{11})/i) ||
                      line.match(/national\s*id[:\s]*([0-9]{11})/i) ||
                      line.match(/national\s*identification\s*number[:\s]*([0-9]{11})/i);
      if (ninMatch && ninMatch[1]) {
        data.nin = ninMatch[1];
      }
    }
  }
  
  return data;
}