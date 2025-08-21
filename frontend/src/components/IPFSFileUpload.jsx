import React, { useState, useRef } from 'react';
import './IPFSFileUpload.css';

const IPFSFileUpload = ({ onFileUploaded, disabled = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);

  // File type validation
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/markdown',
    'application/rtf'
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file) => {
    if (file.size > maxFileSize) {
      throw new Error(`File size must be less than 10MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type not supported. Allowed types: PDF, DOC, DOCX, TXT, PPT, PPTX, MD, RTF`);
    }

    return true;
  };

  const uploadToIPFS = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Validate file
      validateFile(file);

      console.log('🚀 Starting IPFS upload for:', file.name);
      console.log('📊 File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);

      // Add comprehensive metadata
      const metadata = JSON.stringify({
        name: file.name,
        keyvalues: {
          uploader: 'decentralized-notes-marketplace',
          timestamp: new Date().toISOString(),
          fileType: file.type,
          fileSize: file.size,
          category: 'study-notes',
          version: '1.0'
        }
      });
      formData.append('pinataMetadata', metadata);

      // Add IPFS options
      const options = JSON.stringify({
        cidVersion: 1, // Use CIDv1 for better compatibility
        wrapWithDirectory: false
      });
      formData.append('pinataOptions', options);

      setUploadProgress(25);

      // Upload via proxy server
      const proxyUrl = 'http://localhost:3001/api/pinata/upload';
      console.log('📤 Uploading to proxy server:', proxyUrl);

      const response = await fetch(proxyUrl, {
        method: 'POST',
        body: formData
      });

      setUploadProgress(70);

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      console.log('✅ Upload successful:', result);

      setUploadProgress(100);

      // Create file data object
      const fileData = {
        name: file.name,
        size: file.size,
        type: file.type,
        hash: result.IpfsHash,
        timestamp: new Date().toISOString(),
        ipfsUrl: `https://purple-tragic-krill-401.mypinata.cloud/ipfs/${result.IpfsHash}`,
        pinataUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
        originalFile: file
      };

      setUploadedFile(fileData);
      
      // Notify parent component
      if (onFileUploaded) {
        onFileUploaded(fileData);
      }

      console.log('🎉 File upload completed successfully!');

    } catch (error) {
      console.error('💥 Upload error:', error);
      setError(error.message);
      
      // Reset progress on error
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (file) => {
    if (!file || disabled) return;
    
    try {
      setError(null);
      await uploadToIPFS(file);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileUploaded) {
      onFileUploaded(null);
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
    if (type.includes('text') || type.includes('plain')) return '📄';
    if (type.includes('presentation') || type.includes('powerpoint')) return '📊';
    if (type.includes('markdown')) return '📝';
    return '📄';
  };

  if (uploadedFile) {
    return (
      <div className="ipfs-upload-success">
        <div className="uploaded-file-card">
          <div className="file-header">
            <div className="file-icon">{getFileIcon(uploadedFile.type)}</div>
            <div className="file-info">
              <h4 className="file-name">{uploadedFile.name}</h4>
              <p className="file-meta">
                {formatFileSize(uploadedFile.size)} • {uploadedFile.type.split('/')[1]?.toUpperCase()}
              </p>
            </div>
            <button 
              className="remove-button"
              onClick={handleRemoveFile}
              disabled={disabled}
            >
              ✕
            </button>
          </div>
          
          <div className="ipfs-details">
            <div className="ipfs-hash">
              <label>IPFS Hash:</label>
              <code>{uploadedFile.hash}</code>
            </div>
            <div className="ipfs-links">
              <a 
                href={uploadedFile.ipfsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ipfs-link"
              >
                🌐 View on IPFS
              </a>
              <a 
                href={`https://app.pinata.cloud/pinmanager?search=${uploadedFile.hash}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="pinata-link"
              >
                📌 View on Pinata
              </a>
            </div>
          </div>
          
          <div className="success-message">
            ✅ File uploaded to IPFS successfully! This file is now permanently stored on the decentralized web.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ipfs-upload-container">
      <h3 className="upload-title">📁 Upload Study Notes File</h3>
      <p className="upload-description">
        Upload your study notes file to IPFS for decentralized, permanent storage.
      </p>

      <div 
        className={`upload-dropzone ${isDragOver ? 'drag-over' : ''} ${disabled ? 'disabled' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        {isUploading ? (
          <div className="upload-progress-container">
            <div className="upload-spinner">🔄</div>
            <h4>Uploading to IPFS...</h4>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="progress-text">{uploadProgress}% Complete</p>
          </div>
        ) : (
          <div className="upload-prompt">
            <div className="upload-icon">📁</div>
            <h4>Drop your file here or click to browse</h4>
            <p className="upload-hint">
              Supported formats: PDF, DOC, DOCX, TXT, PPT, PPTX, MD, RTF
            </p>
            <p className="upload-limit">Maximum file size: 10MB</p>
            
            <div className="upload-features">
              <div className="feature-item">
                <span className="feature-icon">🌐</span>
                <span>Decentralized Storage</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <span>Immutable Ownership</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🚀</span>
                <span>Global Access</span>
              </div>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleInputChange}
          accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.md,.rtf"
          disabled={disabled || isUploading}
          style={{ display: 'none' }}
        />
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">❌</span>
          <span>{error}</span>
        </div>
      )}

      <div className="upload-info">
        <h4>Why IPFS?</h4>
        <ul>
          <li>🌐 <strong>Decentralized:</strong> No single point of failure</li>
          <li>🔒 <strong>Immutable:</strong> Files cannot be changed or deleted</li>
          <li>📍 <strong>Content-Addressed:</strong> Unique hash proves file integrity</li>
          <li>🚀 <strong>Global:</strong> Accessible from anywhere in the world</li>
          <li>⚡ <strong>Efficient:</strong> Deduplication saves storage space</li>
        </ul>
      </div>
    </div>
  );
};

export default IPFSFileUpload;
