'use client';

import { utils, write } from 'xlsx';
import { db, storage } from '../../../../firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

// Function to create and download Excel file with voter data
export function downloadExcelFile(data, filename = 'voter_data.xlsx') {
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
}

// Function to create initial Excel template
export function createExcelTemplate() {
  return [{
    surname: '',
    middlename: '',
    firstname: '',
    phonenumber: '',
    gender: '',
    ward: '',
    unit: '',
    nin: ''
  }];
}

// Function to save Excel data to Firebase
export async function saveExcelToFirebase(data, sheetName, userId) {
  try {
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
    
    // Create worksheet
    const ws = utils.json_to_sheet(data);
    
    // Create workbook
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Voter Data');
    
    // Write to buffer as base64
    const wbout = write(wb, { bookType: 'xlsx', type: 'base64' });
    
    // Upload to Firebase Storage
    const storageRef = ref(storage, `excel-sheets/${userId}/${sheetName}.xlsx`);
    
    // Upload with proper metadata
    const metadata = {
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    
    await uploadString(storageRef, wbout, 'base64', metadata);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    // Save metadata to Firestore
    const sheetData = {
      name: sheetName.trim(),
      userId: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      downloadURL: downloadURL,
      recordCount: data.length - 1 // Subtract 1 for header row
    };
    
    // Check if sheet already exists
    const q = query(
      collection(db, 'excelSheets'),
      where('name', '==', sheetName.trim()),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    let docId;
    if (querySnapshot.empty) {
      // Create new document
      const docRef = await addDoc(collection(db, 'excelSheets'), sheetData);
      docId = docRef.id;
      console.log('Created new Excel sheet with ID:', docId);
    } else {
      // Update existing document
      const docSnapshot = querySnapshot.docs[0];
      docId = docSnapshot.id;
      const docRef = doc(db, 'excelSheets', docId);
      
      // Merge existing data with new data
      const existingData = docSnapshot.data();
      const updatedData = {
        ...existingData,
        ...sheetData,
        recordCount: data.length - 1, // Update record count
        updatedAt: new Date()
      };
      
      await updateDoc(docRef, updatedData);
      console.log('Updated existing Excel sheet with ID:', docId);
    }
    
    return docId;
  } catch (error) {
    console.error('Error saving Excel to Firebase:', error);
    // More specific error handling
    if (error.code === 'storage/unauthorized') {
      throw new Error('Unauthorized access to Firebase Storage. Please check your Firebase rules and CORS configuration.');
    } else if (error.code === 'storage/canceled') {
      throw new Error('Upload was canceled.');
    } else if (error.message.includes('CORS') || error.message.includes('preflight')) {
      throw new Error('CORS error when accessing Firebase Storage. Please check your CORS configuration.');
    } else if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please check your Firebase security rules.');
    } else {
      throw new Error('Failed to save Excel sheet to Firebase: ' + error.message);
    }
  }
}

// Function to fetch Excel data from Firebase
export async function fetchExcelFromFirebase(sheetName, userId) {
  try {
    // Validate inputs
    if (!sheetName || typeof sheetName !== 'string' || sheetName.trim() === '') {
      throw new Error('Invalid sheet name: Sheet name must be a non-empty string');
    }
    
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new Error('Invalid user ID: User ID must be a non-empty string');
    }
    
    // Query Firestore for the sheet
    const q = query(
      collection(db, 'excelSheets'),
      where('name', '==', sheetName.trim()),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const sheetDoc = querySnapshot.docs[0];
      return {
        id: sheetDoc.id,
        ...sheetDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching Excel from Firebase:', error);
    // If it's a permissions error, we treat it as "sheet not found" to allow creation of new sheets
    if (error.code === 'permission-denied' || error.message.includes('Missing or insufficient permissions')) {
      console.warn('Insufficient permissions to check for existing sheet. Proceeding with new sheet creation.');
      return null; // Treat as "not found" to allow creating new sheet
    }
    throw new Error('Failed to fetch Excel sheet from Firebase: ' + error.message);
  }
}

// Function to fetch all Excel sheets for admin
export async function fetchAllExcelSheetsForAdmin() {
  try {
    // First, check if we can access the collection
    const sheetsCollection = collection(db, 'excelSheets');
    const querySnapshot = await getDocs(sheetsCollection);
    
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
    
    // Handle specific error cases
    if (error.code === 'permission-denied' || error.message.includes('Missing or insufficient permissions')) {
      throw new Error('Permission denied. Please check your Firebase security rules for admin access.');
    } else if (error.code === 'unavailable') {
      throw new Error('Firebase service is temporarily unavailable. Please try again later.');
    } else {
      throw new Error('Failed to fetch all Excel sheets: ' + error.message);
    }
  }
}

// Function to fetch a specific Excel sheet by ID
export async function fetchExcelSheetById(sheetId) {
  try {
    if (!sheetId || typeof sheetId !== 'string' || sheetId.trim() === '') {
      throw new Error('Invalid sheet ID: Sheet ID must be a non-empty string');
    }
    
    const docRef = doc(db, 'excelSheets', sheetId.trim());
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const sheetData = {
        id: docSnap.id,
        ...docSnap.data()
      };
      
      // Format dates properly
      if (sheetData.createdAt && sheetData.createdAt.seconds) {
        sheetData.createdAt = new Date(sheetData.createdAt.seconds * 1000);
      }
      
      if (sheetData.updatedAt && sheetData.updatedAt.seconds) {
        sheetData.updatedAt = new Date(sheetData.updatedAt.seconds * 1000);
      }
      
      return sheetData;
    } else {
      throw new Error('Sheet not found');
    }
  } catch (error) {
    console.error('Error fetching Excel sheet by ID:', error);
    throw new Error('Failed to fetch Excel sheet: ' + error.message);
  }
}