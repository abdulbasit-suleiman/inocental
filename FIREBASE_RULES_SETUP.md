# Firebase Security Rules Setup

This document explains how to set up the Firebase security rules for the Inocental Voter Data Extractor application.

## Recent Improvements

The application now includes graceful handling of Firebase permission errors. Even if the security rules are not properly configured, the app will continue to function by creating new sheets instead of crashing when checking for existing ones.

However, for full functionality including the ability to load existing sheets and save to Firebase Storage, proper Firebase security rules, CORS configuration, and Authentication should be deployed.

## Prerequisites

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

## Enable Anonymous Authentication

1. Go to the Firebase Console
2. Select your project
3. Navigate to Authentication > Sign-in method
4. Enable "Anonymous" sign-in provider

## Deploying Firestore Rules

1. Navigate to your project directory:
   ```bash
   cd path/to/your/project
   ```

2. Initialize Firebase project (if not already done):
   ```bash
   firebase init
   ```
   Select Firestore and Storage when prompted.

3. Deploy the rules:
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only storage
   ```

## Deploying CORS Configuration for Firebase Storage

Firebase Storage requires explicit CORS configuration to allow requests from localhost during development:

1. Make sure you have Google Cloud SDK installed (comes with gsutil)
2. Deploy the CORS configuration:
   ```bash
   gsutil cors set storage-cors.json gs://studentattendance-29930.firebasestorage.app
   ```

## Manual Rule Setup

If you prefer to set up the rules manually through the Firebase Console:

### Firestore Rules
1. Go to the Firebase Console
2. Select your project
3. Navigate to Firestore Database > Rules
4. Replace the existing rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own excel sheets
    match /excelSheets/{sheetId} {
      allow read, write: if request.auth != null;
      
      // Allow creation of new sheets
      allow create: if request.auth != null;
      
      // Allow updates to existing sheets
      allow update: if request.auth != null;
    }
    
    // Allow users to query sheets by name and userId
    match /excelSheets {
      allow list: if request.auth != null;
    }
  }
}
```

### Storage Rules
1. Go to the Firebase Console
2. Select your project
3. Navigate to Storage > Rules
4. Replace the existing rules with:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow users to read/write their own excel sheets
    match /excel-sheets/{userId}/{sheetName}.xlsx {
      allow read, write: if request.auth != null;
    }
    
    // Allow creation of new files
    match /excel-sheets/{userId}/{sheetName} {
      allow create: if request.auth != null;
    }
  }
}
```

## Testing the Rules

After deploying the rules:
1. Restart your development server
2. Try creating a new Excel sheet
3. Try saving a sheet to Firebase Storage
4. The permissions and CORS errors should be resolved
5. The app should now be able to check for and load existing sheets

## Troubleshooting

If you still encounter permission errors:

1. Ensure you're using the correct Firebase project
2. Check that the rules were deployed successfully
3. Verify your Firebase configuration in the `firebase` file
4. Make sure Anonymous Authentication is enabled
5. For CORS issues, ensure the CORS configuration was deployed successfully

For more information about Firebase Security Rules, visit:
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage Security Rules](https://firebase.google.com/docs/storage/security)
- [CORS Configuration](https://cloud.google.com/storage/docs/configuring-cors)