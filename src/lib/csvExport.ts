// CSV Export Utilities

export const downloadCSV = (data: any[], filename: string) => {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values with commas, quotes, or newlines
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const formatApplicationForCSV = (applications: any[]) => {
  return applications.map(app => ({
    'Application ID': app.application_id,
    'Name': app.full_name,
    'Role': app.role,
    'Age': app.age,
    'Email': app.gmail_id,
    'WhatsApp': app.whatsapp_number,
    'State': app.state,
    'District': app.district,
    'Block/Panchayat': app.block_panchayat,
    'BPO': app.bpo_name,
    'PCO': app.pco_name,
    'Education': app.education,
    'Status': app.status,
    'Applied Date': new Date(app.created_at).toLocaleDateString('en-IN'),
    'Reviewed Date': app.reviewed_at ? new Date(app.reviewed_at).toLocaleDateString('en-IN') : 'N/A',
    'Reviewed By': app.reviewed_by || 'N/A',
  }));
};
