'use client';

import Tesseract from 'tesseract.js';

// Function to process image with Tesseract.js OCR
export async function processImageWithOCR(imageSrc) {
  try {
    // Perform OCR on the image
    const result = await Tesseract.recognize(
      imageSrc,
      'eng',
      { 
        logger: info => console.log(info),
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@.-() '
      }
    );
    
    // Extract text from the result
    const text = result.data.text;
    console.log('OCR Result:', text);
    
    // Parse the extracted text to find voter information
    // This is a simplified parsing - in a real implementation, you would have more sophisticated logic
    const voterData = parseVoterData(text);
    
    return voterData;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to process image with OCR');
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

// Function to process image with multiple OCR methods for better accuracy
export async function processImageWithMultipleOCR(imageSrc) {
  try {
    // Method 1: Standard Tesseract
    const result1 = await Tesseract.recognize(
      imageSrc,
      'eng',
      { 
        logger: info => console.log('Tesseract 1:', info)
      }
    );
    
    // Method 2: Tesseract with different configuration
    const result2 = await Tesseract.recognize(
      imageSrc,
      'eng',
      {
        logger: info => console.log('Tesseract 2:', info),
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@.-() '
      }
    );
    
    // Method 3: Tesseract with different page segmentation mode
    const result3 = await Tesseract.recognize(
      imageSrc,
      'eng',
      {
        logger: info => console.log('Tesseract 3:', info),
        tessedit_pageseg_mode: Tesseract.PSM.AUTO
      }
    );
    
    // Method 4: Tesseract with OSD (Orientation and Script Detection)
    const result4 = await Tesseract.recognize(
      imageSrc,
      'eng',
      {
        logger: info => console.log('Tesseract 4:', info),
        tessedit_pageseg_mode: Tesseract.PSM.AUTO_OSD
      }
    );
    
    // Combine results for better accuracy
    const combinedText = result1.data.text + ' ' + result2.data.text + ' ' + result3.data.text + ' ' + result4.data.text;
    console.log('Combined OCR Result:', combinedText);
    
    // Parse the combined text
    const voterData = parseVoterData(combinedText);
    
    return voterData;
  } catch (error) {
    console.error('Multi-OCR Error:', error);
    throw new Error('Failed to process image with multiple OCR methods');
  }
}

// Function to preprocess image for better OCR results
export function preprocessImageForOCR(imageSrc) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image
      ctx.drawImage(img, 0, 0);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Apply simple thresholding to improve OCR
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const threshold = avg > 128 ? 255 : 0;
        data[i] = threshold;     // red
        data[i + 1] = threshold; // green
        data[i + 2] = threshold; // blue
      }
      
      // Put processed data back
      ctx.putImageData(imageData, 0, 0);
      
      // Return processed image as data URL
      resolve(canvas.toDataURL('image/jpeg'));
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