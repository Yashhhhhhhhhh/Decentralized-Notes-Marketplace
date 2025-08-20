import React, { useState } from 'react';

// IPFS File Upload Component
function FileUploadComponent({ onFileUploaded, addNotification }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);

  const uploadToIPFS = async (file) => {
    setUploading(true);
    setUploadProgress(0);
    
    try {
      console.log('=== IPFS UPLOAD VIA PROXY DEBUG ===');
      console.log('Starting IPFS upload for file:', file.name);
      console.log('File size:', file.size, 'bytes');
      console.log('File type:', file.type);
      
      // Create FormData for proxy server
      const formData = new FormData();
      formData.append('file', file);
      
      // Add metadata
      const metadata = JSON.stringify({
        name: file.name,
        keyvalues: {
          uploader: 'notes-marketplace',
          timestamp: new Date().toISOString(),
          fileType: file.type
        }
      });
      formData.append('pinataMetadata', metadata);

      // Add options
      const options = JSON.stringify({
        cidVersion: 0,
      });
      formData.append('pinataOptions', options);

      // Update progress
      setUploadProgress(30);

      console.log('📤 Making request to proxy server...');
      const proxyUrl = 'http://localhost:3001/api/pinata/upload';
      console.log('URL:', proxyUrl);

      // Upload via proxy server
      const response = await fetch(proxyUrl, {
        method: 'POST',
        body: formData
      });

      setUploadProgress(70);

      console.log('📨 Proxy response received:');
      console.log('- Status:', response.status);
      console.log('- Status text:', response.statusText);
      console.log('- Ok:', response.ok);
      console.log('- Headers:', [...response.headers.entries()]);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Proxy error response:', errorText);
        throw new Error(`Proxy upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Pinata upload successful:', result);
      setUploadProgress(100);
      
      if (onFileUploaded) {
        onFileUploaded({
          name: file.name,
          size: file.size,
          hash: result.IpfsHash,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          pinataResponse: result
        });
      }
      
      if (addNotification) {
        addNotification({
          type: 'success',
          message: `File "${file.name}" uploaded to IPFS successfully! Hash: ${result.IpfsHash}`
        });
      }
      
      setSelectedFile(null);
      setUploadProgress(0);
    } catch (error) {
      console.error('💥 IPFS upload error:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      setUploadProgress(0);
      
      // Fallback to mock upload for demo purposes
      console.log('🔄 Falling back to mock upload for demo...');
      const mockHash = 'Qm' + Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
      
      if (onFileUploaded) {
        onFileUploaded({
          name: file.name,
          size: file.size,
          hash: mockHash,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          isMockUpload: true
        });
      }
      
      if (addNotification) {
        addNotification({
          type: 'warning',
          message: `Demo mode: File "${file.name}" simulated upload. Hash: ${mockHash} (Real upload failed: ${error.message})`
        });
      }
      
      setSelectedFile(null);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    console.log('File dropped');
    const files = Array.from(e.dataTransfer.files);
    console.log('Dropped files:', files);
    
    if (files.length > 0) {
      const file = files[0];
      console.log('Processing file:', file.name, file.size, file.type);
      setSelectedFile(file);
      await uploadToIPFS(file);
    }
  };

  const handleFileInput = async (e) => {
    console.log('File input changed');
    const files = Array.from(e.target.files);
    console.log('Selected files:', files);
    
    if (files.length > 0) {
      const file = files[0];
      console.log('Processing selected file:', file.name, file.size, file.type);
      setSelectedFile(file);
      await uploadToIPFS(file);
    }
  };

  const fileInputRef = React.useRef(null);

  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Choose Files button clicked');
    console.log('File input ref:', fileInputRef.current);
    fileInputRef.current?.click();
  };

  return (
    <div className="upload-area">
      <div
        className={`upload-dropzone ${dragOver ? 'dragover' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => { 
          e.preventDefault(); 
          e.stopPropagation();
          setDragOver(true); 
          console.log('Drag over');
        }}
        onDragEnter={(e) => { 
          e.preventDefault(); 
          e.stopPropagation();
          setDragOver(true); 
        }}
        onDragLeave={(e) => { 
          e.preventDefault(); 
          e.stopPropagation();
          // Only set dragOver to false if we're leaving the dropzone itself
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setDragOver(false); 
          }
        }}
        onClick={handleButtonClick}
      >
        <div className="upload-icon">📁</div>
        <div className="upload-text">Drop your files here</div>
        <div className="upload-subtext">or click to browse</div>
        <input 
          ref={fileInputRef}
          type="file"
          className="file-input"
          onChange={handleFileInput}
          accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
          style={{ display: 'none' }}
        />
        {!uploading && (
          <button 
            className="upload-button"
            onClick={handleButtonClick}
            type="button"
          >
            Choose Files
          </button>
        )}
      </div>

      {selectedFile && (
        <div className="file-preview">
          <div className="file-icon">📄</div>
          <div className="file-info">
            <div className="file-name">{selectedFile.name}</div>
            <div className="file-size">{(selectedFile.size / 1024).toFixed(2)} KB</div>
          </div>
          {!uploading && (
            <button 
              className="remove-file"
              onClick={() => setSelectedFile(null)}
            >
              ✕
            </button>
          )}
        </div>
      )}

      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <div className="progress-text">
            Uploading... {uploadProgress}%
          </div>
        </div>
      )}
    </div>
  );
}

// Main IPFS File Manager Component
function IPFSFileManager({ addNotification }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleVerifyFile = async (fileRecord) => {
    try {
      // Verify file exists on your custom Pinata gateway
      const ipfsUrl = `https://purple-tragic-krill-401.mypinata.cloud/ipfs/${fileRecord.hash}`;
      const response = await fetch(ipfsUrl, { method: 'HEAD' });
      
      if (response.ok) {
        if (addNotification) {
          addNotification({
            type: 'success',
            message: `✅ File verified on IPFS! Accessible at: ${ipfsUrl}`
          });
        }
      } else {
        throw new Error('File not found on IPFS');
      }
      
      return {
        isValid: true,
        owner: '0x1234...5678', // This would come from blockchain
        timestamp: new Date().toISOString(),
        ipfsUrl: ipfsUrl
      };
    } catch (error) {
      if (addNotification) {
        addNotification({
          type: 'error',
          message: `❌ Verification failed: ${error.message}`
        });
      }
    }
  };

  const handleViewOnPinata = (fileRecord) => {
    const pinataUrl = `https://app.pinata.cloud/pinmanager?search=${fileRecord.hash}`;
    window.open(pinataUrl, '_blank');
  };

  const handleFileUploaded = (fileData) => {
    setFiles(prev => [...prev, fileData]);
  };

  const handleDeleteFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (addNotification) {
      addNotification({
        type: 'info',
        message: 'File deleted successfully'
      });
    }
  };

  const handleShareFile = (fileRecord) => {
    // Use your custom Pinata gateway
    const shareUrl = `https://purple-tragic-krill-401.mypinata.cloud/ipfs/${fileRecord.hash}`;
    navigator.clipboard.writeText(shareUrl);
    if (addNotification) {
      addNotification({
        type: 'success',
        message: `Shareable Pinata link copied to clipboard! ${shareUrl}`
      });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return '📕';
    if (type.includes('doc')) return '📘';
    if (type.includes('text')) return '📄';
    if (type.includes('image')) return '🖼️';
    return '📄';
  };

  return (
    <div className="ipfs-file-manager">
      <div className="ipfs-header">
        <h3>📁 IPFS File Manager</h3>
        <p>Upload and manage your files on the decentralized web with ownership verification</p>
        <div className="ipfs-info">
          <div className="info-item">
            <span className="info-icon">🌐</span>
            <span>Files uploaded to <strong>Pinata IPFS</strong></span>
          </div>
          <div className="info-item">
            <span className="info-icon">🔗</span>
            <span>Gateway: <code>purple-tragic-krill-401.mypinata.cloud</code></span>
          </div>
          <div className="info-item">
            <span className="info-icon">✅</span>
            <span>Files will appear in your Pinata dashboard</span>
          </div>
        </div>
      </div>

      <div className="upload-section">
        <FileUploadComponent 
          onFileUploaded={handleFileUploaded} 
          addNotification={addNotification}
        />
      </div>

      <div className="files-section">
        <div className="files-header">
          <h4>Your Files ({files.length})</h4>
          <button 
            className="refresh-files"
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1000);
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {files.length === 0 ? (
          <div className="empty-files">
            <div className="empty-files-icon">📭</div>
            <p>No files uploaded yet</p>
            <p>Upload your first file to get started!</p>
          </div>
        ) : (
          <div className="files-grid">
            {files.map((file, index) => (
              <div key={index} className="file-card">
                <div className="file-card-header">
                  <div className="file-card-icon">{getFileIcon(file.type)}</div>
                  <div className="file-card-name">{file.name}</div>
                </div>
                <div className="file-card-meta">
                  <div>Size: {formatFileSize(file.size)}</div>
                  <div>Type: {file.type}</div>
                  <div>Hash: {file.hash?.slice(0, 15)}...</div>
                  <div>IPFS URL: purple-tragic-krill-401.mypinata.cloud/ipfs/{file.hash}</div>
                  <div>Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}</div>
                </div>
                <div className="file-card-actions">
                  <button 
                    className="file-action"
                    onClick={() => handleVerifyFile(file)}
                    title="Verify file exists on IPFS"
                  >
                    ✅ Verify
                  </button>
                  <button 
                    className="file-action"
                    onClick={() => handleShareFile(file)}
                    title="Copy shareable IPFS link"
                  >
                    📤 Share
                  </button>
                  <button 
                    className="file-action"
                    onClick={() => handleViewOnPinata(file)}
                    title="View on Pinata dashboard"
                  >
                    🌐 Pinata
                  </button>
                  <button 
                    className="file-action delete"
                    onClick={() => handleDeleteFile(index)}
                    title="Remove from local list"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default IPFSFileManager;
