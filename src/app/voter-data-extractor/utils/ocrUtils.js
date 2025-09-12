'use client';

// Mock OCR function - in a real implementation you would use Tesseract.js or similar
export async function processImageWithOCR(imageSrc) {
  // Simulate OCR processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return mock data for demonstration
  // In a real implementation, you would process the image and extract text
  return {
    surname: 'Smith',
    middlename: 'John',
    firstname: 'Michael',
    phonenumber: '08012345678',
    gender: 'Male',
    ward: 'Ward 5',
    unit: 'Unit 12',
    nin: '12345678901'
  };
}