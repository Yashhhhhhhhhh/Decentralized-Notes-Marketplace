import React, { useState } from 'react';
import { useNotesContract } from '../hooks/useNotesContract';
import { useIPFS } from '../hooks/useIPFS';
import { useWeb3 } from '../contexts/Web3Context';

function CreateNoteForm() {
  const { createNote, isLoading } = useNotesContract();
  const { uploadFile, isUploading } = useIPFS();
  const { state } = useWeb3();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    price: '',
    tags: '',
    difficulty: 'beginner'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'Economics', 'History', 'Literature', 'Psychology', 'Engineering',
    'Business', 'Art', 'Music', 'Philosophy', 'Languages'
  ];

  const difficulties = [
    { value: 'beginner', label: '🟢 Beginner', description: 'Basic concepts and fundamentals' },
    { value: 'intermediate', label: '🟡 Intermediate', description: 'Moderate complexity topics' },
    { value: 'advanced', label: '🔴 Advanced', description: 'Complex and specialized content' },
    { value: 'expert', label: '🟣 Expert', description: 'Highly specialized professional level' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview for certain file types
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreviewUrl(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.title.trim()) errors.push('Title is required');
    if (!formData.description.trim()) errors.push('Description is required');
    if (!formData.subject) errors.push('Subject is required');
    if (!formData.price || parseFloat(formData.price) <= 0) errors.push('Valid price is required');
    if (!selectedFile) errors.push('File upload is required');
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!state.isConnected) {
      setSubmitStatus('❌ Please connect your wallet first');
      return;
    }

    const errors = validateForm();
    if (errors.length > 0) {
      setSubmitStatus(`❌ ${errors[0]}`);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('🔄 Creating your note NFT...');

    try {
      // Step 1: Upload file to IPFS
      setSubmitStatus('📁 Uploading file to IPFS...');
      let ipfsHash;
      
      if (selectedFile) {
        try {
          ipfsHash = await uploadFile(selectedFile);
          setSubmitStatus('✅ File uploaded to IPFS! Creating NFT...');
        } catch (ipfsError) {
          console.warn('IPFS upload failed, using demo hash:', ipfsError);
          ipfsHash = `QmDemoHash${Date.now()}`; // Fallback for demo
          setSubmitStatus('⚠️ Using demo IPFS hash. Creating NFT...');
        }
      } else {
        ipfsHash = `QmDemoHash${Date.now()}`;
      }

      // Step 2: Create note on blockchain
      setSubmitStatus('⛓️ Creating note on blockchain...');
      const receipt = await createNote(
        formData.title,
        formData.description,
        ipfsHash,
        formData.price,
        formData.subject
      );

      // Step 3: Success
      setSubmitStatus(`✅ Note created successfully! Transaction: ${receipt.hash.slice(0, 10)}...`);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        subject: '',
        price: '',
        tags: '',
        difficulty: 'beginner'
      });
      setSelectedFile(null);
      setPreviewUrl(null);

      // Clear status after delay
      setTimeout(() => setSubmitStatus(''), 5000);

    } catch (error) {
      console.error('Creation failed:', error);
      setSubmitStatus(`❌ Failed to create note: ${error.message}`);
    }

    setIsSubmitting(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    if (!file) return '📄';
    const type = file.type.toLowerCase();
    if (type.includes('pdf')) return '📕';
    if (type.includes('doc')) return '📘';
    if (type.includes('image')) return '🖼️';
    if (type.includes('video')) return '🎥';
    if (type.includes('audio')) return '🎵';
    return '📄';
  };

  return (
    <div className="create-note-form">
      <div className="form-header">
        <h2>📝 Create New Study Note</h2>
        <p>Upload your study materials and mint them as NFTs on the blockchain</p>
      </div>

      <form onSubmit={handleSubmit} className="note-form">
        {/* Basic Information */}
        <div className="form-section">
          <h3>📋 Basic Information</h3>
          
          <div className="form-group">
            <label className="form-label required">
              📖 Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Advanced Calculus - Limits and Derivatives"
              className="form-input"
              maxLength={100}
            />
            <div className="char-count">{formData.title.length}/100</div>
          </div>

          <div className="form-group">
            <label className="form-label required">
              📝 Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Detailed description of your notes: topics covered, learning objectives, target audience..."
              className="form-textarea"
              rows={4}
              maxLength={500}
            />
            <div className="char-count">{formData.description.length}/500</div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">
                📚 Subject
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">Select a subject</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                🎯 Difficulty Level
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="form-select"
              >
                {difficulties.map(diff => (
                  <option key={diff.value} value={diff.value}>
                    {diff.label}
                  </option>
                ))}
              </select>
              <small className="form-help">
                {difficulties.find(d => d.value === formData.difficulty)?.description}
              </small>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              🏷️ Tags (optional)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="e.g., calculus, derivatives, math, university"
              className="form-input"
            />
            <small className="form-help">Separate tags with commas to help others find your notes</small>
          </div>
        </div>

        {/* File Upload */}
        <div className="form-section">
          <h3>📁 File Upload</h3>
          
          <div className="file-upload-area">
            <input
              type="file"
              id="file-upload"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
              className="file-input"
            />
            <label htmlFor="file-upload" className="file-upload-label">
              {selectedFile ? (
                <div className="file-selected">
                  <div className="file-icon">{getFileIcon(selectedFile)}</div>
                  <div className="file-info">
                    <div className="file-name">{selectedFile.name}</div>
                    <div className="file-size">{formatFileSize(selectedFile.size)}</div>
                  </div>
                  <div className="file-status">✅ Ready to upload</div>
                </div>
              ) : (
                <div className="file-placeholder">
                  <div className="upload-icon">📤</div>
                  <div className="upload-text">
                    <strong>Click to upload your study notes</strong>
                    <br />
                    <small>PDF, DOC, PPT, images up to 10MB</small>
                  </div>
                </div>
              )}
            </label>
          </div>

          {previewUrl && (
            <div className="file-preview">
              <h4>📷 Preview</h4>
              <img src={previewUrl} alt="File preview" className="preview-image" />
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="form-section">
          <h3>💰 Pricing</h3>
          
          <div className="form-group">
            <label className="form-label required">
              💵 Price (ETH)
            </label>
            <div className="price-input-group">
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.01"
                step="0.001"
                min="0.001"
                className="form-input price-input"
              />
              <span className="price-suffix">ETH</span>
            </div>
            <small className="form-help">
              Recommended: 0.01-0.1 ETH for study notes. Platform fee: 2.5%
            </small>
          </div>

          {formData.price && (
            <div className="pricing-breakdown">
              <div className="breakdown-item">
                <span>Your earnings:</span>
                <strong>{(parseFloat(formData.price) * 0.975).toFixed(4)} ETH</strong>
              </div>
              <div className="breakdown-item">
                <span>Platform fee (2.5%):</span>
                <span>{(parseFloat(formData.price) * 0.025).toFixed(4)} ETH</span>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            disabled={isSubmitting || isLoading || isUploading || !state.isConnected}
            className={`submit-button ${
              isSubmitting || isLoading || isUploading || !state.isConnected
                ? 'disabled'
                : 'primary'
            }`}
          >
            {isSubmitting || isLoading || isUploading ? (
              <>🔄 Creating Note...</>
            ) : !state.isConnected ? (
              <>🔌 Connect Wallet First</>
            ) : (
              <>🚀 Create Note NFT</>
            )}
          </button>
        </div>

        {/* Status Message */}
        {submitStatus && (
          <div className={`status-message ${
            submitStatus.includes('✅') ? 'success' :
            submitStatus.includes('❌') ? 'error' :
            submitStatus.includes('⚠️') ? 'warning' : 'info'
          }`}>
            {submitStatus}
          </div>
        )}

        {/* Info Box */}
        <div className="info-box">
          <h4>💡 Tips for Success</h4>
          <ul>
            <li>📝 Write clear, descriptive titles that help students find your notes</li>
            <li>📚 Include detailed descriptions of topics covered and learning objectives</li>
            <li>💰 Price competitively based on content quality and complexity</li>
            <li>🏷️ Use relevant tags to improve discoverability</li>
            <li>📁 Ensure files are high quality and well-organized</li>
          </ul>
        </div>
      </form>
    </div>
  );
}

export default CreateNoteForm;
