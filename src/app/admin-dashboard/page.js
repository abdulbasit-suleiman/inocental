'use client';

import { useState, useEffect } from 'react';
import { fetchAllExcelSheetsForAdmin } from '../voter-data-extractor/utils/excelUtils';

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAccess = () => {
    if (inputValue === 'Admin001') {
      setIsAdmin(true);
    } else {
      // For other values, redirect to voter data extractor with the input as sheet name
      window.location.href = `/voter-data-extractor?sheetName=${encodeURIComponent(inputValue)}`;
    }
  };

  const fetchSheets = async () => {
    setLoading(true);
    setError('');
    try {
      const allSheets = await fetchAllExcelSheetsForAdmin();
      setSheets(allSheets);
    } catch (error) {
      console.error('Error fetching sheets:', error);
      setError('Failed to fetch Excel sheets: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchSheets();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        padding: '20px',
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)'
      }}>
        <h1 style={{ marginBottom: '30px' }}>Admin Dashboard Access</h1>
        <div style={{ 
          backgroundColor: 'var(--card-background)', 
          padding: '40px', 
          borderRadius: '8px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <p style={{ marginBottom: '20px', fontSize: '18px' }}>
            Enter access code to continue
          </p>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter access code"
            style={{
              padding: '15px',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              fontSize: '16px',
              width: '100%',
              maxWidth: '300px',
              marginBottom: '20px',
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)'
            }}
          />
          <button
            onClick={handleAccess}
            style={{
              padding: '15px 30px',
              backgroundColor: 'var(--button-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            Submit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      backgroundColor: 'var(--background)',
      color: 'var(--foreground)',
      minHeight: '100vh'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <h1>Admin Dashboard - All Excel Sheets</h1>
        <button
          onClick={fetchSheets}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? 'var(--button-secondary)' : 'var(--button-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

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

      {sheets.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          backgroundColor: 'var(--card-background)',
          borderRadius: '8px'
        }}>
          <h2>No Excel Sheets Found</h2>
          <p>There are currently no Excel sheets in the database.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {sheets.map((sheet) => (
            <div 
              key={sheet.id} 
              style={{
                backgroundColor: 'var(--card-background)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <h3 style={{ marginBottom: '10px', color: 'var(--foreground)' }}>{sheet.name}</h3>
              <p style={{ marginBottom: '8px', color: 'var(--text-muted)' }}>
                <strong>User ID:</strong> {sheet.userId}
              </p>
              <p style={{ marginBottom: '8px', color: 'var(--text-muted)' }}>
                <strong>Created:</strong> {sheet.createdAt ? new Date(sheet.createdAt.seconds * 1000).toLocaleString() : 'N/A'}
              </p>
              <p style={{ marginBottom: '15px', color: 'var(--text-muted)' }}>
                <strong>Updated:</strong> {sheet.updatedAt ? new Date(sheet.updatedAt.seconds * 1000).toLocaleString() : 'N/A'}
              </p>
              <a
                href={sheet.downloadURL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '10px 15px',
                  backgroundColor: 'var(--button-success)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  width: '100%'
                }}
              >
                Download Excel Sheet
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}