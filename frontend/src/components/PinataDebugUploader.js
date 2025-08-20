import React, { useState, useRef } from 'react';

function PinataDebugUploader() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const testUpload = async () => {
    const file = fileInputRef.current?.files[0];
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Environment variables check:');
      console.log('REACT_APP_PINATA_JWT exists:', !!process.env.REACT_APP_PINATA_JWT);
      console.log('REACT_APP_PINATA_JWT value (first 50 chars):', process.env.REACT_APP_PINATA_JWT?.substring(0, 50));
      console.log('REACT_APP_PINATA_API_KEY exists:', !!process.env.REACT_APP_PINATA_API_KEY);
      console.log('All environment variables:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP')));
      
      const formData = new FormData();
      formData.append('file', file);
      
      const metadata = JSON.stringify({
        name: file.name,
        keyvalues: {
          test: 'debug-upload',
          timestamp: new Date().toISOString()
        }
      });
      formData.append('pinataMetadata', metadata);

      console.log('Making request to Pinata...');
      
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_PINATA_JWT}`,
        },
        body: formData
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }

      const data = JSON.parse(responseText);
      setResult(data);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '2px solid red', margin: '20px' }}>
      <h3>🔧 Pinata Debug Uploader</h3>
      <div style={{ marginBottom: '10px' }}>
        <strong>Environment Check:</strong>
        <ul>
          <li>JWT Available: {process.env.REACT_APP_PINATA_JWT ? '✅' : '❌'}</li>
          <li>API Key Available: {process.env.REACT_APP_PINATA_API_KEY ? '✅' : '❌'}</li>
        </ul>
      </div>
      
      <input 
        ref={fileInputRef}
        type="file" 
        style={{ marginBottom: '10px' }}
      />
      <br />
      
      <button 
        onClick={testUpload} 
        disabled={uploading}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: uploading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }}
      >
        {uploading ? 'Uploading...' : 'Test Pinata Upload'}
      </button>

      {error && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#ffe6e6', border: '1px solid red' }}>
          <strong>Error:</strong>
          <pre>{error}</pre>
        </div>
      )}

      {result && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e6ffe6', border: '1px solid green' }}>
          <strong>Success!</strong>
          <pre>{JSON.stringify(result, null, 2)}</pre>
          <p>
            <strong>IPFS URL:</strong> 
            <a href={`https://purple-tragic-krill-401.mypinata.cloud/ipfs/${result.IpfsHash}`} target="_blank" rel="noopener noreferrer">
              purple-tragic-krill-401.mypinata.cloud/ipfs/{result.IpfsHash}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

export default PinataDebugUploader;
