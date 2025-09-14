'use client';

import { utils, write } from 'xlsx';
import { db, storage } from '../../../../firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
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
      name: sheetName,
      userId: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      downloadURL: downloadURL
    };
    
    // Check if sheet already exists
    const q = query(
      collection(db, 'excelSheets'),
      where('name', '==', sheetName),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // Create new document
      const docRef = await addDoc(collection(db, 'excelSheets'), sheetData);
      return docRef.id;
    } else {
      // Update existing document
      const docId = querySnapshot.docs[0].id;
      const docRef = doc(db, 'excelSheets', docId);
      await updateDoc(docRef, { ...sheetData, updatedAt: new Date() });
      return docId;
    }
  } catch (error) {
    console.error('Error saving Excel to Firebase:', error);
    // More specific error handling
    if (error.code === 'storage/unauthorized') {
      throw new Error('Unauthorized access to Firebase Storage. Please check your Firebase rules and CORS configuration.');
    } else if (error.code === 'storage/canceled') {
      throw new Error('Upload was canceled.');
    } else if (error.message.includes('CORS') || error.message.includes('preflight')) {
      throw new Error('CORS error when accessing Firebase Storage. Please check your CORS configuration.');
    } else {
      throw new Error('Failed to save Excel sheet to Firebase: ' + error.message);
    }
  }
}

// Function to fetch Excel data from Firebase
export async function fetchExcelFromFirebase(sheetName, userId) {
  try {
    // Query Firestore for the sheet
    const q = query(
      collection(db, 'excelSheets'),
      where('name', '==', sheetName),
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
    const querySnapshot = await getDocs(collection(db, 'excelSheets'));
    const sheets = [];
    
    querySnapshot.forEach((doc) => {
      sheets.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return sheets;
  } catch (error) {
    console.error('Error fetching all Excel sheets:', error);
    throw new Error('Failed to fetch all Excel sheets: ' + error.message);
  }
}