'use client';

import Tesseract from 'tesseract.js';

// Function to process image with enhanced OCR using multiple preprocessing techniques
export async function processImageWithOCR(imageSrc) {
  try {
    console.log('Starting enhanced OCR processing...');
    
    // Preprocess image with multiple enhancement techniques
    console.log('Preprocessing image with enhancement techniques...');
    
    // Technique 1: Basic contrast enhancement
    const enhancedImage1 = await preprocessImageForOCR(imageSrc);
    
    // Technique 2: Noise reduction
    const enhancedImage2 = await preprocessImageWithNoiseReduction(imageSrc);
    
    // Technique 3: Sharpening
    const enhancedImage3 = await preprocessImageWithSharpening(imageSrc);
    
    // Original image for comparison
    const originalImage = imageSrc;
    
    // Process images with different OCR configurations
    console.log('Performing multi-pass OCR with different configurations...');
    
    // Configuration 1: Standard settings
    const ocrPromise1 = withTimeout(Tesseract.recognize(
      enhancedImage1,
      'eng',
      {
        logger: info => {
          if (info.status === 'recognizing text' && info.progress > 0.1) {
            console.log(`OCR Pass 1 Progress: ${Math.round(info.progress * 100)}%`);
          }
        },
        // Optimized settings for voter forms
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
        preserve_interword_spaces: '1',
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@.-()/# ',
        tessedit_ocr_engine_mode: Tesseract.OEM.TESSERACT_ONLY,
        tessedit_read_timeout: 15
      }
    ), 15000); // 15 second timeout
    
    // Configuration 2: Different page segmentation mode
    const ocrPromise2 = withTimeout(Tesseract.recognize(
      enhancedImage2,
      'eng',
      {
        logger: info => {
          if (info.status === 'recognizing text' && info.progress > 0.1) {
            console.log(`OCR Pass 2 Progress: ${Math.round(info.progress * 100)}%`);
          }
        },
        tessedit_pageseg_mode: Tesseract.PSM.AUTO,
        preserve_interword_spaces: '1',
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@.-()/# ',
        tessedit_ocr_engine_mode: Tesseract.OEM.TESSERACT_ONLY,
        tessedit_read_timeout: 15
      }
    ), 15000); // 15 second timeout
    
    // Configuration 3: OSD (Orientation and Script Detection)
    const ocrPromise3 = withTimeout(Tesseract.recognize(
      enhancedImage3,
      'eng',
      {
        logger: info => {
          if (info.status === 'recognizing text' && info.progress > 0.1) {
            console.log(`OCR Pass 3 Progress: ${Math.round(info.progress * 100)}%`);
          }
        },
        tessedit_pageseg_mode: Tesseract.PSM.AUTO_OSD,
        preserve_interword_spaces: '1',
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@.-()/# ',
        tessedit_ocr_engine_mode: Tesseract.OEM.TESSERACT_ONLY,
        tessedit_read_timeout: 15
      }
    ), 15000); // 15 second timeout
    
    // Configuration 4: Original image with different settings
    const ocrPromise4 = withTimeout(Tesseract.recognize(
      originalImage,
      'eng',
      {
        logger: info => {
          if (info.status === 'recognizing text' && info.progress > 0.1) {
            console.log(`OCR Pass 4 Progress: ${Math.round(info.progress * 100)}%`);
          }
        },
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_COLUMN,
        preserve_interword_spaces: '1',
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@.-()/# ',
        tessedit_ocr_engine_mode: Tesseract.OEM.TESSERACT_ONLY,
        tessedit_read_timeout: 15
      }
    ), 15000); // 15 second timeout
    
    // Run all OCR passes in parallel with timeout
    console.log('Running OCR passes in parallel...');
    const [result1, result2, result3, result4] = await Promise.all([
      ocrPromise1, ocrPromise2, ocrPromise3, ocrPromise4
    ]);
    
    // Extract text from all results
    const text1 = result1.data.text;
    const text2 = result2.data.text;
    const text3 = result3.data.text;
    const text4 = result4.data.text;
    
    console.log('OCR Results:');
    console.log('Pass 1:', text1.substring(0, 100) + '...');
    console.log('Pass 2:', text2.substring(0, 100) + '...');
    console.log('Pass 3:', text3.substring(0, 100) + '...');
    console.log('Pass 4:', text4.substring(0, 100) + '...');
    
    // Combine texts for better coverage
    const combinedText = text1 + ' ' + text2 + ' ' + text3 + ' ' + text4;
    console.log('Combined text length:', combinedText.length);
    
    // Parse the combined text using intelligent parsing
    console.log('Parsing combined text with advanced parser...');
    const voterData = advancedParseVoterData(combinedText);
    
    // Validate and clean the extracted data
    console.log('Validating extracted data...');
    const validatedData = validateAndCleanVoterData(voterData);
    
    console.log('Final extracted voter data:', validatedData);
    return validatedData;
  } catch (error) {
    console.error('Enhanced OCR Error:', error);
    throw new Error('Failed to process image with enhanced OCR: ' + error.message);
  }
}

// Function to validate and clean extracted voter data
function validateAndCleanVoterData(data) {
  // Clean and validate each field
  const cleanedData = {};
  
  // Validate names (should be alphabetic)
  const nameRegex = /^[A-Za-z\s]+$/;
  cleanedData.surname = data.surname && nameRegex.test(data.surname) ? 
    data.surname.trim().replace(/\s+/g, ' ') : '';
  cleanedData.middlename = data.middlename && nameRegex.test(data.middlename) ? 
    data.middlename.trim().replace(/\s+/g, ' ') : '';
  cleanedData.firstname = data.firstname && nameRegex.test(data.firstname) ? 
    data.firstname.trim().replace(/\s+/g, ' ') : '';
  
  // Validate phone number (Nigerian format)
  const phoneRegex = /^(0(?:80|81|70|71|90|91)\d{8})$/;
  cleanedData.phonenumber = data.phonenumber && phoneRegex.test(data.phonenumber) ? 
    data.phonenumber : '';
  
  // Validate application number (PRE format)
  const appRegex = /^(PRE\d{8})$/;
  cleanedData.applicationnumber = data.applicationnumber && appRegex.test(data.applicationnumber) ? 
    data.applicationnumber.toUpperCase() : '';
  
  // Validate date of birth (basic format check)
  const dobRegex = /^[\d\/\-\.]{8,}$/;
  cleanedData.dateofbirth = data.dateofbirth && dobRegex.test(data.dateofbirth) ? 
    data.dateofbirth.trim() : '';
  
  // Validate gender
  if (data.gender && (data.gender.toLowerCase() === 'male' || data.gender.toLowerCase() === 'female')) {
    cleanedData.gender = data.gender.charAt(0).toUpperCase() + data.gender.slice(1).toLowerCase();
  } else {
    cleanedData.gender = '';
  }
  
  // Validate ward (alphanumeric with spaces)
  const wardRegex = /^[A-Za-z0-9\s]+$/;
  cleanedData.ward = data.ward && wardRegex.test(data.ward) ? 
    data.ward.trim().replace(/\s+/g, ' ') : '';
  
  // Validate unit (alphanumeric with common punctuation)
  const unitRegex = /^[A-Za-z0-9\s\-\,\.#]+$/;
  cleanedData.unit = data.unit && unitRegex.test(data.unit) ? 
    data.unit.trim().replace(/\s+/g, ' ') : '';
  
  // Validate NIN (11 digits)
  const ninRegex = /^\d{11}$/;
  cleanedData.nin = data.nin && ninRegex.test(data.nin) && 
    !data.nin.startsWith('0') && 
    !['080', '081', '070', '071', '090', '091'].includes(data.nin.substring(0, 3)) ? 
    data.nin : '';
  
  return cleanedData;
}

// Function to parse voter data from OCR text with intelligent field detection
function parseVoterData(text) {
  // Initialize data object with empty values
  const data = {
    surname: '',
    middlename: '',
    firstname: '',
    phonenumber: '',
    applicationnumber: '',
    dateofbirth: '',
    gender: '',
    ward: '',
    unit: '',
    nin: ''
  };
  
  // Clean and normalize text
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  // Intelligent field extraction with fuzzy matching
  const extractFieldIntelligently = (fieldType, line) => {
    const lowerLine = line.toLowerCase();
    
    switch (fieldType) {
      case 'phone':
        // Look for phone number patterns
        const phonePatterns = [
          /(0(?:80|81|70|71|90|91)\d{8})/g,
          /phone\D*(0(?:80|81|70|71|90|91)\d{8})/i,
          /tel\D*(0(?:80|81|70|71|90|91)\d{8})/i,
          /mobile\D*(0(?:80|81|70|71|90|91)\d{8})/i,
          /number\D*(0(?:80|81|70|71|90|91)\d{8})/i,
          // Fuzzy matching for misspellings like "pone numbe"
          /(0(?:80|81|70|71|90|91)\d{8})/g
        ];
        
        for (const pattern of phonePatterns) {
          const match = line.match(pattern);
          if (match && match[1]) {
            return match[1];
          }
        }
        return '';
        
      case 'date':
        // Look for date patterns
        const datePatterns = [
          /date\s*of\s*birth\D*([0-9\/\-\.]{8,})/i,
          /dob\D*([0-9\/\-\.]{8,})/i,
          /birth\s*date\D*([0-9\/\-\.]{8,})/i,
          /d\.o\.b\D*([0-9\/\-\.]{8,})/i,
          // Various date formats
          /([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/g,
          /([0-9]{4}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{1,2})/g,
          // Fuzzy matching for dates
          /([0-9]{1,2}[\-\/][0-9]{1,2}[\-\/][0-9]{2,4})/i
        ];
        
        for (const pattern of datePatterns) {
          const match = line.match(pattern);
          if (match && match[1] && match[1].trim()) {
            return match[1].trim();
          }
        }
        return '';
        
      case 'name':
        // Look for name patterns
        const namePatterns = [
          /surname[^\w]*([A-Z][a-zA-Z\s]{1,30})/i,
          /last\s*name[^\w]*([A-Z][a-zA-Z\s]{1,30})/i,
          /family\s*name[^\w]*([A-Z][a-zA-Z\s]{1,30})/i,
          /first\s*name[^\w]*([A-Z][a-zA-Z\s]{1,30})/i,
          /given\s*name[^\w]*([A-Z][a-zA-Z\s]{1,30})/i,
          /middle\s*name[^\w]*([A-Z][a-zA-Z\s]{1,30})/i,
          /other\s*name[^\w]*([A-Z][a-zA-Z\s]{1,30})/i,
          // Fuzzy matching for misspellings
          /sur\s*name[^\w]*([A-Z][a-zA-Z\s]{1,30})/i,
          /fir\s*name[^\w]*([A-Z][a-zA-Z\s]{1,30})/i
        ];
        
        for (const pattern of namePatterns) {
          const match = line.match(pattern);
          if (match && match[1] && match[1].trim()) {
            return match[1].trim();
          }
        }
        return '';
        
      case 'application':
        // Look for application number patterns
        const appPatterns = [
          /(PRE\d{8})/gi,
          /application\s*number\D*(PRE\d{8})/i,
          /app\s*no\D*(PRE\d{8})/i,
          /application\s*no\D*(PRE\d{8})/i
        ];
        
        for (const pattern of appPatterns) {
          const match = line.match(pattern);
          if (match && match[1]) {
            return match[1].toUpperCase();
          }
        }
        return '';
        
      case 'gender':
        // Look for gender patterns
        if (lowerLine.includes('male') && !lowerLine.includes('female')) {
          return 'Male';
        } else if (lowerLine.includes('female')) {
          return 'Female';
        }
        return '';
        
      case 'ward':
        // Look for ward patterns
        const wardPatterns = [
          /ward[^\w]*([A-Za-z0-9\s]{2,50})/i,
          /electoral\s*ward[^\w]*([A-Za-z0-9\s]{2,50})/i,
          /ward\s*no[^\w]*([A-Za-z0-9\s]{2,50})/i
        ];
        
        for (const pattern of wardPatterns) {
          const match = line.match(pattern);
          if (match && match[1] && match[1].trim()) {
            return match[1].trim();
          }
        }
        return '';
        
      case 'unit':
        // Look for unit patterns
        const unitPatterns = [
          /unit[^\w]*([A-Za-z0-9\s\-\,\.#]{5,100})/i,
          /polling\s*unit[^\w]*([A-Za-z0-9\s\-\,\.#]{5,100})/i,
          /address[^\w]*([A-Za-z0-9\s\-\,\.#]{5,100})/i,
          /unit\s*no[^\w]*([A-Za-z0-9\s\-\,\.#]{5,100})/i
        ];
        
        for (const pattern of unitPatterns) {
          const match = line.match(pattern);
          if (match && match[1] && match[1].trim()) {
            return match[1].trim();
          }
        }
        return '';
        
      case 'nin':
        // Look for NIN patterns
        const ninPatterns = [
          /nin[^\w]*(\d{11})/i,
          /national\s*id[^\w]*(\d{11})/i,
          /national\s*identification\s*number[^\w]*(\d{11})/i,
          /n\.i\.n[^\w]*(\d{11})/i
        ];
        
        // Look for context-specific NIN first
        for (const pattern of ninPatterns) {
          const match = line.match(pattern);
          if (match && match[1]) {
            return match[1];
          }
        }
        
        // If no context-specific NIN found, look for any 11-digit number
        const genericNinPattern = /\b(\d{11})\b/g;
        const genericNinMatch = line.match(genericNinPattern);
        if (genericNinMatch && genericNinMatch[1]) {
          const candidate = genericNinMatch[1];
          // Additional validation to reduce false positives
          if (!candidate.startsWith('0') || 
              !(candidate.startsWith('080') || candidate.startsWith('081') || 
                candidate.startsWith('070') || candidate.startsWith('071') || 
                candidate.startsWith('090') || candidate.startsWith('091'))) {
            return candidate;
          }
        }
        return '';
        
      default:
        return '';
    }
  };
  
  // Split text into lines for better processing
  const lines = cleanText.split('\n').filter(line => line.trim().length > 0);
  
  // Process each line to extract information
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Extract phone number
    if (!data.phonenumber) {
      const phoneNumber = extractFieldIntelligently('phone', line);
      if (phoneNumber) {
        data.phonenumber = phoneNumber;
      }
    }
    
    // Extract date of birth
    if (!data.dateofbirth) {
      const dateOfBirth = extractFieldIntelligently('date', line);
      if (dateOfBirth) {
        data.dateofbirth = dateOfBirth;
      }
    }
    
    // Extract application number
    if (!data.applicationnumber) {
      const appNumber = extractFieldIntelligently('application', line);
      if (appNumber) {
        data.applicationnumber = appNumber;
      }
    }
    
    // Extract gender
    if (!data.gender) {
      const gender = extractFieldIntelligently('gender', line);
      if (gender) {
        data.gender = gender;
      }
    }
    
    // Extract ward
    if (!data.ward) {
      const ward = extractFieldIntelligently('ward', line);
      if (ward) {
        data.ward = ward;
      }
    }
    
    // Extract unit
    if (!data.unit) {
      const unit = extractFieldIntelligently('unit', line);
      if (unit) {
        data.unit = unit;
      }
    }
    
    // Extract NIN
    if (!data.nin) {
      const nin = extractFieldIntelligently('nin', line);
      if (nin) {
        data.nin = nin;
      }
    }
    
    // Extract names (surname, first name, middle name)
    if (!data.surname || !data.firstname || !data.middlename) {
      // Look for explicit name fields
      if (!data.surname) {
        const surnamePatterns = [
          /surname[^\w]*([A-Z][a-zA-Z\s]{1,30})/i,
          /last\s*name[^\w]*([A-Z][a-zA-Z\s]{1,30})/i,
          /family\s*name[^\w]*([A-Z][a-zA-Z\s]{1,30})/i
        ];
        
        for (const pattern of surnamePatterns) {
          const match = line.match(pattern);
          if (match && match[1] && match[1].trim()) {
            data.surname = match[1].trim();
            break;
          }
        }
      }
      
      if (!data.firstname) {
        const firstNamePatterns = [
          /first\s*name[^\w]*([A-Z][a-zA-Z\s]{1,30})/i,
          /given\s*name[^\w]*([A-Z][a-zA-Z\s]{1,30})/i
        ];
        
        for (const pattern of firstNamePatterns) {
          const match = line.match(pattern);
          if (match && match[1] && match[1].trim()) {
            data.firstname = match[1].trim();
            break;
          }
        }
      }
      
      if (!data.middlename) {
        const middleNamePatterns = [
          /middle\s*name[^\w]*([A-Z][a-zA-Z\s]{1,30})/i,
          /other\s*name[^\w]*([A-Z][a-zA-Z\s]{1,30})/i
        ];
        
        for (const pattern of middleNamePatterns) {
          const match = line.match(pattern);
          if (match && match[1] && match[1].trim()) {
            data.middlename = match[1].trim();
            break;
          }
        }
      }
    }
  }
  
  // Clean up extracted data
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'string') {
      // Remove extra spaces
      data[key] = data[key].replace(/\s+/g, ' ').trim();
      // Remove trailing colons or other punctuation
      data[key] = data[key].replace(/[:\.\-]+$/, '').trim();
    }
  });
  
  return data;
}

// Function to process image with a single, optimized OCR method for better performance
export async function processImageWithMultipleOCR(imageSrc) {
  try {
    // Create a promise that rejects after a timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OCR processing timed out after 15 seconds')), 15000);
    });
    
    // Use a faster configuration for Tesseract
    const ocrPromise = Tesseract.recognize(
      imageSrc,
      'eng',
      {
        logger: info => {
          // Only log progress if needed for debugging
          if (info.status === 'recognizing text' && info.progress > 0.1) {
            console.log(`OCR Progress: ${Math.round(info.progress * 100)}%`);
          }
        },
        // Faster settings for voter forms
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
        preserve_interword_spaces: '1',
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@.-()/# ',
        // Additional performance settings
        tessedit_ocr_engine_mode: Tesseract.OEM.TESSERACT_ONLY,
        // Reduce accuracy for speed
        tessedit_read_timeout: 10
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

// Function to preprocess image for better OCR results with multiple enhancement techniques
export function preprocessImageForOCR(imageSrc) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions (balance between quality and performance)
      const maxWidth = 1200; // Increased for better quality
      const scale = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Apply multiple enhancement techniques
      for (let i = 0; i < data.length; i += 4) {
        // Increase contrast
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Convert to grayscale using luminance formula
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        
        // Apply adaptive threshold with gamma correction
        const normalized = gray / 255.0;
        const gammaCorrected = Math.pow(normalized, 0.7); // Increase brightness
        const enhanced = gammaCorrected * 255;
        
        // Apply threshold (higher contrast for text)
        const threshold = enhanced > 180 ? 255 : 0;
        
        data[i] = threshold;     // red
        data[i + 1] = threshold; // green
        data[i + 2] = threshold; // blue
      }
      
      // Put processed data back
      ctx.putImageData(imageData, 0, 0);
      
      // Return processed image as data URL
      resolve(canvas.toDataURL('image/jpeg', 0.9)); // Higher quality
    };
    img.src = imageSrc;
  });
}

// Function to preprocess image with noise reduction
export function preprocessImageWithNoiseReduction(imageSrc) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions
      const maxWidth = 1200;
      const scale = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Apply median filter for noise reduction
      const filteredData = new Uint8ClampedArray(data.length);
      
      for (let i = 0; i < data.length; i += 4) {
        // For edge pixels, just copy the data
        if (i < canvas.width * 4 || i >= data.length - canvas.width * 4 || 
            i % (canvas.width * 4) < 4 || i % (canvas.width * 4) >= canvas.width * 4 - 4) {
          filteredData[i] = data[i];
          filteredData[i + 1] = data[i + 1];
          filteredData[i + 2] = data[i + 2];
          filteredData[i + 3] = data[i + 3];
          continue;
        }
        
        // Get neighborhood pixel values
        const neighbors = [];
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nIndex = i + (dy * canvas.width + dx) * 4;
            if (nIndex >= 0 && nIndex < data.length) {
              neighbors.push(data[nIndex]); // Use red channel for grayscale
            }
          }
        }
        
        // Sort and get median value
        neighbors.sort((a, b) => a - b);
        const median = neighbors[Math.floor(neighbors.length / 2)];
        
        // Apply to all channels
        filteredData[i] = median;
        filteredData[i + 1] = median;
        filteredData[i + 2] = median;
        filteredData[i + 3] = data[i + 3]; // Keep alpha
      }
      
      // Put filtered data back
      ctx.putImageData(new ImageData(filteredData, canvas.width, canvas.height), 0, 0);
      
      // Return processed image as data URL
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.src = imageSrc;
  });
}

// Utility function to add timeout to promises
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms))
  ]);
}

// Advanced parsing function that combines multiple parsing strategies with intelligent field detection
export function advancedParseVoterData(text) {
  // Split text into lines for line-by-line analysis
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  // Initialize data object
  const data = {
    surname: '',
    middlename: '',
    firstname: '',
    phonenumber: '',
    applicationnumber: '',
    dateofbirth: '',
    gender: '',
    ward: '',
    unit: '',
    nin: ''
  };
  
  // Intelligent field extraction helper
  const extractFieldIntelligently = (fieldType, line, context) => {
    const lowerLine = line.toLowerCase();
    const lowerContext = context ? context.toLowerCase() : '';
    
    switch (fieldType) {
      case 'phone':
        // Multiple patterns for phone numbers including fuzzy matches
        const phonePatterns = [
          /(0(?:80|81|70|71|90|91)\d{8})/, // Standard Nigerian format
          /phone\D*(0(?:80|81|70|71|90|91)\d{8})/i,
          /tel\D*(0(?:80|81|70|71|90|91)\d{8})/i,
          /mobile\D*(0(?:80|81|70|71|90|91)\d{8})/i,
          /number\D*(0(?:80|81|70|71|90|91)\d{8})/i,
          // Fuzzy matches for common misspellings
          /(pone\D*\d{10,11})/i, // "pone" instead of "phone"
          /(numbe\D*\d{10,11})/i // "numbe" instead of "number"
        ];
        
        for (const pattern of phonePatterns) {
          const match = line.match(pattern);
          if (match && match[1]) {
            // Extract just the digits for clean phone number
            const digitsOnly = match[1].replace(/\D/g, '');
            if (digitsOnly.length === 11 && 
                (digitsOnly.startsWith('080') || digitsOnly.startsWith('081') || 
                 digitsOnly.startsWith('070') || digitsOnly.startsWith('071') || 
                 digitsOnly.startsWith('090') || digitsOnly.startsWith('091'))) {
              return digitsOnly;
            }
          }
        }
        return '';
        
      case 'date':
        // Multiple patterns for dates including fuzzy matches
        const datePatterns = [
          /date\s*of\s*birth\D*([0-9\/\-\.]{8,})/i,
          /dob\D*([0-9\/\-\.]{8,})/i,
          /birth\s*date\D*([0-9\/\-\.]{8,})/i,
          /d\.o\.b\D*([0-9\/\-\.]{8,})/i,
          // Common date formats
          /([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/,
          /([0-9]{4}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{1,2})/,
          // Fuzzy matches for common variations
          /([0-9]{1,2}[\-\/][0-9]{1,2}[\-\/][0-9]{2,4})/
        ];
        
        for (const pattern of datePatterns) {
          const match = line.match(pattern);
          if (match && match[1] && match[1].trim()) {
            return match[1].trim();
          }
        }
        return '';
        
      case 'name':
        // Patterns for names including fuzzy matches
        const namePatterns = [
          /surname[^\w]*([A-Z][a-zA-Z\s]{1,30})/i,
          /last\s*name[^\w]*([A-Z][a-zA-Z\s]{1,30})/i,
          /family\s*name[^\w]*([A-Z][a-zA-Z\s]{1,30})/i,
          /first\s*name[^\w]*([A-Z][a-zA-Z\s]{1,30})/i,
          /given\s*name[^\w]*([A-Z][a-zA-Z\s]{1,30})/i,
          /middle\s*name[^\w]*([A-Z][a-zA-Z\s]{1,30})/i,
          /other\s*name[^\w]*([A-Z][a-zA-Z\s]{1,30})/i,
          // Fuzzy matches for common misspellings
          /sur\s*name[^\w]*([A-Z][a-zA-Z\s]{1,30})/i,
          /fir\s*name[^\w]*([A-Z][a-zA-Z\s]{1,30})/i
        ];
        
        for (const pattern of namePatterns) {
          const match = line.match(pattern);
          if (match && match[1] && match[1].trim()) {
            return match[1].trim();
          }
        }
        return '';
        
      case 'application':
        // Patterns for application numbers including fuzzy matches
        const appPatterns = [
          /(PRE\d{8})/gi,
          /application\s*number\D*(PRE\d{8})/i,
          /app\s*no\D*(PRE\d{8})/i,
          /application\s*no\D*(PRE\d{8})/i,
          // Fuzzy matches for common variations
          /appli\D*(PRE\d{8})/i
        ];
        
        for (const pattern of appPatterns) {
          const match = line.match(pattern);
          if (match && match[1]) {
            return match[1].toUpperCase();
          }
        }
        return '';
        
      case 'gender':
        // Patterns for gender including fuzzy matches
        if (lowerLine.includes('male') && !lowerLine.includes('female')) {
          return 'Male';
        } else if (lowerLine.includes('female')) {
          return 'Female';
        } else if (lowerLine.includes('m') && !lowerLine.includes('f')) {
          // Fuzzy match for single letter
          return 'Male';
        } else if (lowerLine.includes('f')) {
          return 'Female';
        }
        return '';
        
      case 'ward':
        // Patterns for ward including fuzzy matches
        const wardPatterns = [
          /ward[^\w]*([A-Za-z0-9\s]{2,50})/i,
          /electoral\s*ward[^\w]*([A-Za-z0-9\s]{2,50})/i,
          /ward\s*no[^\w]*([A-Za-z0-9\s]{2,50})/i,
          // Fuzzy matches for common variations
          /war[^\w]*([A-Za-z0-9\s]{2,50})/i
        ];
        
        for (const pattern of wardPatterns) {
          const match = line.match(pattern);
          if (match && match[1] && match[1].trim()) {
            return match[1].trim();
          }
        }
        return '';
        
      case 'unit':
        // Patterns for unit including fuzzy matches
        const unitPatterns = [
          /unit[^\w]*([A-Za-z0-9\s\-\,\.#]{5,100})/i,
          /polling\s*unit[^\w]*([A-Za-z0-9\s\-\,\.#]{5,100})/i,
          /address[^\w]*([A-Za-z0-9\s\-\,\.#]{5,100})/i,
          /unit\s*no[^\w]*([A-Za-z0-9\s\-\,\.#]{5,100})/i
        ];
        
        for (const pattern of unitPatterns) {
          const match = line.match(pattern);
          if (match && match[1] && match[1].trim()) {
            return match[1].trim();
          }
        }
        return '';
        
      case 'nin':
        // Patterns for NIN including fuzzy matches
        const ninPatterns = [
          /nin[^\w]*(\d{11})/i,
          /national\s*id[^\w]*(\d{11})/i,
          /national\s*identification\s*number[^\w]*(\d{11})/i,
          /n\.i\.n[^\w]*(\d{11})/i,
          // Fuzzy matches for common variations
          /nat\s*id[^\w]*(\d{11})/i
        ];
        
        // Look for context-specific NIN first
        for (const pattern of ninPatterns) {
          const match = line.match(pattern);
          if (match && match[1]) {
            return match[1];
          }
        }
        
        // If no context-specific NIN found, look for any 11-digit number
        const genericNinPattern = /\b(\d{11})\b/g;
        const genericNinMatches = line.match(genericNinPattern);
        if (genericNinMatches) {
          for (const candidate of genericNinMatches) {
            // Additional validation to reduce false positives
            if (!candidate.startsWith('0') || 
                !(candidate.startsWith('080') || candidate.startsWith('081') || 
                  candidate.startsWith('070') || candidate.startsWith('071') || 
                  candidate.startsWith('090') || candidate.startsWith('091'))) {
              return candidate;
            }
          }
        }
        return '';
        
      default:
        return '';
    }
  };
  
  // Context-aware processing
  let contextBuffer = '';
  
  // Process each line to extract information
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();
    
    // Build context buffer (current line + surrounding lines)
    contextBuffer = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 2)).join(' ');
    
    // Look for phone number
    if (!data.phonenumber) {
      const phoneNumber = extractFieldIntelligently('phone', line, contextBuffer);
      if (phoneNumber) {
        data.phonenumber = phoneNumber;
      }
    }
    
    // Look for date of birth
    if (!data.dateofbirth) {
      const dateOfBirth = extractFieldIntelligently('date', line, contextBuffer);
      if (dateOfBirth) {
        data.dateofbirth = dateOfBirth;
      }
    }
    
    // Look for application number
    if (!data.applicationnumber) {
      const appNumber = extractFieldIntelligently('application', line, contextBuffer);
      if (appNumber) {
        data.applicationnumber = appNumber;
      }
    }
    
    // Look for gender
    if (!data.gender) {
      const gender = extractFieldIntelligently('gender', line, contextBuffer);
      if (gender) {
        data.gender = gender;
      }
    }
    
    // Look for ward
    if (!data.ward) {
      const ward = extractFieldIntelligently('ward', line, contextBuffer);
      if (ward) {
        data.ward = ward;
      }
    }
    
    // Look for unit
    if (!data.unit) {
      const unit = extractFieldIntelligently('unit', line, contextBuffer);
      if (unit) {
        data.unit = unit;
      }
    }
    
    // Look for NIN
    if (!data.nin) {
      const nin = extractFieldIntelligently('nin', line, contextBuffer);
      if (nin) {
        data.nin = nin;
      }
    }
    
    // Look for names (surname, first name, middle name)
    if (!data.surname || !data.firstname || !data.middlename) {
      // Check for explicit name fields
      if (!data.surname) {
        const surnamePatterns = [
          /surname[^\w]*([A-Z][a-zA-Z\s]{1,30})/i,
          /last\s*name[^\w]*([A-Z][a-zA-Z\s]{1,30})/i,
          /family\s*name[^\w]*([A-Z][a-zA-Z\s]{1,30})/i,
          // Fuzzy matches
          /sur\s*name[^\w]*([A-Z][a-zA-Z\s]{1,30})/i
        ];
        
        for (const pattern of surnamePatterns) {
          const match = line.match(pattern);
          if (match && match[1] && match[1].trim()) {
            data.surname = match[1].trim();
            break;
          }
        }
      }
      
      if (!data.firstname) {
        const firstNamePatterns = [
          /first\s*name[^\w]*([A-Z][a-zA-Z\s]{1,30})/i,
          /given\s*name[^\w]*([A-Z][a-zA-Z\s]{1,30})/i,
          // Fuzzy matches
          /fir\s*name[^\w]*([A-Z][a-zA-Z\s]{1,30})/i
        ];
        
        for (const pattern of firstNamePatterns) {
          const match = line.match(pattern);
          if (match && match[1] && match[1].trim()) {
            data.firstname = match[1].trim();
            break;
          }
        }
      }
      
      if (!data.middlename) {
        const middleNamePatterns = [
          /middle\s*name[^\w]*([A-Z][a-zA-Z\s]{1,30})/i,
          /other\s*name[^\w]*([A-Z][a-zA-Z\s]{1,30})/i
        ];
        
        for (const pattern of middleNamePatterns) {
          const match = line.match(pattern);
          if (match && match[1] && match[1].trim()) {
            data.middlename = match[1].trim();
            break;
          }
        }
      }
    }
  }
  
  // Post-processing cleanup
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'string') {
      // Remove extra spaces
      data[key] = data[key].replace(/\s+/g, ' ').trim();
      // Remove trailing colons or other punctuation
      data[key] = data[key].replace(/[:\.\-]+$/, '').trim();
    }
  });
  
  return data;
}