'use client';

// Function to create and download Excel file with voter data
export function downloadExcelFile(data, filename = 'voter_data.xlsx') {
  // In a real implementation, you would use a library like xlsx to create the Excel file
  // For now, we'll simulate the process and create a downloadable JSON file
  
  // Create CSV content
  const headers = ['surname', 'middlename', 'firstname', 'phonenumber', 'gender', 'ward', 'unit', 'nin'];
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => 
        `"${row[header] || ''}"`
      ).join(',')
    )
  ].join('\n');
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.replace('.xlsx', '.csv'));
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