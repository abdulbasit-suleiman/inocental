'use client';

import { utils, write, read } from 'xlsx';
import { db, storage } from '../../../../firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

// Function to create and download Excel file with voter data
export function downloadExcelFile(data, filename = 'voter_data.xlsx') {
  // Validate data
  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error('Invalid data: Data must be a non-empty array');
  }
  
  try {
    // Create worksheet
    const ws = utils.json_to_sheet(data);
    
    // Create workbook
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Voter Data');
    
    // Write to buffer
    const wbout = write(wb, { bookType: 'xlsx', type: 'array' });
    
    // Create blob and download
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading Excel file:', error);
    throw new Error('Failed to download Excel file: ' + error.message);
  }
}

// Function to download Excel file from base64 data stored in Firestore
export function downloadExcelFromBase64(base64Data, filename = 'voter_data.xlsx') {
  try {
    // Convert base64 to binary
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Create blob and download
    const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading Excel from base64:', error);
    throw new Error('Failed to download Excel file: ' + error.message);
  }
}

// Function to create initial Excel template
export function createExcelTemplate() {
  return [{
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
  }];
}

// Function to save Excel data to Firebase
export async function saveExcelToFirebase(data, sheetName, userId) {
  try {
    console.log('Saving to Firebase with params:', { data: data.length, sheetName, userId });
    
    // Validate inputs
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid data: Data must be a non-empty array');
    }
    
    if (!sheetName || typeof sheetName !== 'string' || sheetName.trim() === '') {
      throw new Error('Invalid sheet name: Sheet name must be a non-empty string');
    }
    
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new Error('Invalid user ID: User ID must be a non-empty string');
    }
    
    const trimmedSheetName = sheetName.trim();
    const trimmedUserId = userId.trim();
    
    console.log('Creating Excel workbook...');
    
    // Create worksheet
    const ws = utils.json_to_sheet(data);
    
    // Create workbook
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Voter Data');
    
    // Write to buffer as base64
    const wbout = write(wb, { bookType: 'xlsx', type: 'base64' });
    
    console.log('Saving Excel data as base64 to Firestore...');
    
    // Save metadata and Excel data to Firestore
    const sheetData = {
      name: trimmedSheetName,
      userId: trimmedUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
      recordCount: data.length - 1, // Subtract 1 for header row
      excelData: wbout // Store Excel as base64
    };
    
    // Check if sheet already exists
    const q = query(
      collection(db, 'excelsheet'),
      where('name', '==', trimmedSheetName),
      where('userId', '==', trimmedUserId)
    );
    
    const querySnapshot = await getDocs(q);
    
    let docId;
    if (querySnapshot.empty) {
      // Create new document
      console.log('Creating new document...');
      const docRef = await addDoc(collection(db, 'excelsheet'), sheetData);
      docId = docRef.id;
      console.log('Created new Excel sheet with ID:', docId);
    } else {
      // Update existing document
      console.log('Updating existing document...');
      const docSnapshot = querySnapshot.docs[0];
      docId = docSnapshot.id;
      const docRef = doc(db, 'excelsheet', docId);
      
      // Update the document with new data
      const updatedData = {
        ...sheetData,
        updatedAt: new Date()
      };
      
      await updateDoc(docRef, updatedData);
      console.log('Updated existing Excel sheet with ID:', docId);
    }
    
    return docId;
  } catch (error) {
    console.error('Error saving Excel to Firebase:', error);
    // Handle permission errors specifically
    if (error.message.includes('Missing or insufficient permissions')) {
      throw new Error('Permission denied: Please check your Firebase security rules.');
    }
    throw new Error('Failed to save Excel sheet to Firebase: ' + error.message);
  }
}

// Function to fetch Excel data from Firebase
export async function fetchExcelFromFirebase(sheetName, userId) {
  try {
    console.log('Fetching from Firebase with params:', { sheetName, userId });
    
    // Validate inputs
    if (!sheetName || typeof sheetName !== 'string' || sheetName.trim() === '') {
      throw new Error('Invalid sheet name: Sheet name must be a non-empty string');
    }
    
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new Error('Invalid user ID: User ID must be a non-empty string');
    }
    
    const trimmedSheetName = sheetName.trim();
    const trimmedUserId = userId.trim();
    
    // Query Firestore for the sheet in the excelsheet collection
    const q = query(
      collection(db, 'excelsheet'),
      where('name', '==', trimmedSheetName),
      where('userId', '==', trimmedUserId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const sheetDoc = querySnapshot.docs[0];
      const result = {
        id: sheetDoc.id,
        ...sheetDoc.data()
      };
      console.log('Found existing sheet:', result);
      return result;
    }
    
    console.log('No existing sheet found');
    return null;
  } catch (error) {
    console.error('Error fetching Excel from Firebase:', error);
    // Handle permission errors specifically
    if (error.message.includes('Missing or insufficient permissions')) {
      console.warn('Insufficient permissions to check for existing sheet. Proceeding with new sheet creation.');
      return null; // Treat as "not found" to allow creating new sheet
    }
    return null;
  }
}

// Function to fetch all Excel sheets for admin
export async function fetchAllExcelSheetsForAdmin() {
  try {
    console.log('Fetching all sheets for admin...');
    
    // Query all documents in the excelsheet collection
    const querySnapshot = await getDocs(collection(db, 'excelsheet'));
    
    const sheets = [];
    
    for (const docSnapshot of querySnapshot.docs) {
      const sheetData = {
        id: docSnapshot.id,
        ...docSnapshot.data()
      };
      
      // Format dates properly
      if (sheetData.createdAt && sheetData.createdAt.seconds) {
        sheetData.createdAt = new Date(sheetData.createdAt.seconds * 1000);
      }
      
      if (sheetData.updatedAt && sheetData.updatedAt.seconds) {
        sheetData.updatedAt = new Date(sheetData.updatedAt.seconds * 1000);
      }
      
      sheets.push(sheetData);
    }
    
    console.log(`Fetched ${sheets.length} Excel sheets for admin`);
    return sheets;
  } catch (error) {
    console.error('Error fetching all Excel sheets:', error);
    // Handle permission errors specifically
    if (error.message.includes('Missing or insufficient permissions')) {
      throw new Error('Permission denied: Please check your Firebase security rules for admin access.');
    }
    throw new Error('Failed to fetch all Excel sheets: ' + error.message);
  }
}

// Function to fetch Excel data from Firebase and download it
export async function fetchAndDownloadExcel(sheetName, userId) {
  try {
    const sheet = await fetchExcelFromFirebase(sheetName, userId);
    if (sheet && sheet.excelData) {
      downloadExcelFromBase64(sheet.excelData, `${sheetName}.xlsx`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error fetching and downloading Excel:', error);
    throw new Error('Failed to fetch and download Excel file: ' + error.message);
  }
}

// Function to parse base64 Excel data back to array of objects
export function parseExcelFromBase64(base64Data) {
  try {
    // Convert base64 to binary
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Read workbook from binary data
    const workbook = read(bytes, { type: 'array' });
    
    // Get first worksheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to JSON
    const data = utils.sheet_to_json(worksheet);
    
    return data;
  } catch (error) {
    console.error('Error parsing Excel from base64:', error);
    throw new Error('Failed to parse Excel data: ' + error.message);
  }
}