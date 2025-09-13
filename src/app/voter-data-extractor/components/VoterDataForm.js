'use client';

export default function VoterDataForm({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange(field, value);
  };

  return (
    <div style={{ backgroundColor: 'var(--card-background)', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h3>Enter Voter Information</h3>
      <p>Fill in the details below:</p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
        gap: '20px', 
        marginTop: '20px' 
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--foreground)' }}>
            Surname *
          </label>
          <input
            type="text"
            value={data.surname || ''}
            onChange={(e) => handleChange('surname', e.target.value)}
            placeholder="Enter surname"
            style={{
              padding: '12px',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              fontSize: '16px',
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--foreground)' }}>
            Middle Name
          </label>
          <input
            type="text"
            value={data.middlename || ''}
            onChange={(e) => handleChange('middlename', e.target.value)}
            placeholder="Enter middle name"
            style={{
              padding: '12px',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              fontSize: '16px',
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--foreground)' }}>
            First Name *
          </label>
          <input
            type="text"
            value={data.firstname || ''}
            onChange={(e) => handleChange('firstname', e.target.value)}
            placeholder="Enter first name"
            style={{
              padding: '12px',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              fontSize: '16px',
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--foreground)' }}>
            Phone Number *
          </label>
          <input
            type="text"
            value={data.phonenumber || ''}
            onChange={(e) => handleChange('phonenumber', e.target.value)}
            placeholder="Enter phone number"
            style={{
              padding: '12px',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              fontSize: '16px',
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--foreground)' }}>
            Gender *
          </label>
          <select
            value={data.gender || ''}
            onChange={(e) => handleChange('gender', e.target.value)}
            style={{
              padding: '12px',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              fontSize: '16px',
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)'
            }}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--foreground)' }}>
            Ward *
          </label>
          <input
            type="text"
            value={data.ward || ''}
            onChange={(e) => handleChange('ward', e.target.value)}
            placeholder="Enter ward"
            style={{
              padding: '12px',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              fontSize: '16px',
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--foreground)' }}>
            Unit *
          </label>
          <input
            type="text"
            value={data.unit || ''}
            onChange={(e) => handleChange('unit', e.target.value)}
            placeholder="Enter unit"
            style={{
              padding: '12px',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              fontSize: '16px',
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--foreground)' }}>
            NIN *
          </label>
          <input
            type="text"
            value={data.nin || ''}
            onChange={(e) => handleChange('nin', e.target.value)}
            placeholder="Enter NIN"
            style={{
              padding: '12px',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              fontSize: '16px',
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)'
            }}
          />
        </div>
      </div>
    </div>
  );
}