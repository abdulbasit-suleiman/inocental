'use client';

export default function VoterForm({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange(field, value);
  };

  return (
    <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
      <h2>Extracted Voter Information</h2>
      <p>Please review and edit the extracted information below:</p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '15px', 
        marginTop: '20px' 
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>
            Full Name
          </label>
          <input
            type="text"
            value={data.fullName || ''}
            onChange={(e) => handleChange('fullName', e.target.value)}
            placeholder="Full Name"
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>
            Voter ID
          </label>
          <input
            type="text"
            value={data.voterId || ''}
            onChange={(e) => handleChange('voterId', e.target.value)}
            placeholder="Voter ID"
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>
            Address
          </label>
          <input
            type="text"
            value={data.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Address"
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>
            Date of Birth
          </label>
          <input
            type="text"
            value={data.dateOfBirth || ''}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            placeholder="Date of Birth"
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>
            Gender
          </label>
          <input
            type="text"
            value={data.gender || ''}
            onChange={(e) => handleChange('gender', e.target.value)}
            placeholder="Gender"
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>
            Constituency
          </label>
          <input
            type="text"
            value={data.constituency || ''}
            onChange={(e) => handleChange('constituency', e.target.value)}
            placeholder="Constituency"
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>
            Ward
          </label>
          <input
            type="text"
            value={data.ward || ''}
            onChange={(e) => handleChange('ward', e.target.value)}
            placeholder="Ward"
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>
            Polling Station
          </label>
          <input
            type="text"
            value={data.pollingStation || ''}
            onChange={(e) => handleChange('pollingStation', e.target.value)}
            placeholder="Polling Station"
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>
      </div>
    </div>
  );
}