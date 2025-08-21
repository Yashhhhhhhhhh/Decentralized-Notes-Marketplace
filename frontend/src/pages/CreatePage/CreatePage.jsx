import React, { useState } from 'react';
import styles from './CreatePage.module.css';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Header from '../../components/layout/Header';
import IPFSFileUpload from '../../components/IPFSFileUpload';
import { notesContract } from '../../contractConnection';

const CreatePage = ({ contract, account }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    subject: '',
    price: '0.01'
  });
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [notification, setNotification] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUploaded = (fileData) => {
    setUploadedFile(fileData);
    console.log('📁 File uploaded to IPFS:', fileData);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.subject) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    // Check if file is uploaded for better user experience
    if (!uploadedFile) {
      const confirmWithoutFile = window.confirm(
        'No file has been uploaded to IPFS. Do you want to create a text-only note? For best results, upload a file containing your study materials.'
      );
      if (!confirmWithoutFile) return;
    }

    setLoading(true);
    
    try {
      console.log('🚀 Creating note with the following data:', {
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        price: formData.price,
        hasFile: !!uploadedFile,
        fileHash: uploadedFile?.hash
      });

      // Use the IPFS hash from uploaded file, or create a fallback
      let ipfsHash;
      
      if (uploadedFile) {
        // Use the actual IPFS hash from the uploaded file
        ipfsHash = uploadedFile.hash;
        showNotification('Using uploaded file from IPFS', 'info');
      } else {
        // Create a dummy IPFS hash for text-only notes
        ipfsHash = 'QmTextOnly' + Date.now();
        showNotification('Creating text-only note (no file uploaded)', 'warning');
      }

      // Create metadata URI (required 6th parameter)
      const metadata = {
        title: formData.title,
        description: formData.description,
        content: formData.content,
        subject: formData.subject,
        ipfsHash: ipfsHash,
        createdAt: new Date().toISOString(),
        hasUploadedFile: !!uploadedFile,
        type: uploadedFile ? 'file-note' : 'text-note'
      };
      const metadataURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

      console.log('📝 Calling notesContract.createNote function...');
      console.log('Parameters:', {
        title: formData.title,
        description: formData.description,
        ipfsHash: ipfsHash,
        price: formData.price,
        subject: formData.subject,
        metadataURI: metadataURI.substring(0, 50) + '...'
      });

      // Use the same working logic as the Test Contract page
      const receipt = await notesContract.createNote(
        formData.title,
        formData.description,
        ipfsHash,
        parseFloat(formData.price), // This will be converted to wei in the contract function
        formData.subject,
        metadataURI
      );

      showNotification('Transaction submitted to blockchain...', 'info');
      console.log('⏳ Transaction submitted:', receipt.hash);
      
      showNotification(
        `🎉 Note created successfully! ${uploadedFile ? 'File is permanently stored on IPFS.' : 'Text note created.'} Transaction: ${receipt.hash.slice(0, 10)}...`,
        'success'
      );
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        content: '',
        subject: '',
        price: '0.01'
      });
      setUploadedFile(null);
      
    } catch (error) {
      console.error('💥 Error creating note:', error);
      
      let errorMessage = 'Failed to create note. ';
      if (error.message.includes('user rejected')) {
        errorMessage += 'Transaction was rejected by user.';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage += 'Insufficient funds for transaction.';
      } else if (error.message.includes('gas')) {
        errorMessage += 'Gas estimation failed. Check network connection.';
      } else {
        errorMessage += error.message;
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.createPage}>
      <Header
        title="Create Note"
        subtitle="Share your knowledge and earn from your notes"
      />

      {notification && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          <span className={styles.notificationIcon}>
            {notification.type === 'success' ? '✅' : 
             notification.type === 'error' ? '❌' : 
             notification.type === 'warning' ? '⚠️' : 'ℹ️'}
          </span>
          <span>{notification.message}</span>
          <button 
            className={styles.closeNotification}
            onClick={() => setNotification(null)}
          >
            ✕
          </button>
        </div>
      )}

      <div className={styles.content}>
        <Card className={styles.formCard}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* File Upload Section */}
            <div className={styles.formSection}>
              <IPFSFileUpload 
                onFileUploaded={handleFileUploaded}
                disabled={loading}
              />
            </div>

            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>📝 Note Details</h3>
              
              <div className={styles.inputGroup}>
                <label htmlFor="title" className={styles.label}>
                  Title *
                </label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Enter note title..."
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="description" className={styles.label}>
                  Description *
                </label>
                <Input
                  id="description"
                  name="description"
                  type="text"
                  placeholder="Brief description of your note..."
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="subject" className={styles.label}>
                  Subject *
                </label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="e.g., Mathematics, Physics, Computer Science..."
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="content" className={styles.label}>
                  Additional Text Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  className={styles.textarea}
                  placeholder="Optional: Add additional text content or notes here..."
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={6}
                />
                <p className={styles.helperText}>
                  This text will be stored on the blockchain along with your uploaded file.
                </p>
              </div>
            </div>

            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>💰 Pricing</h3>
              
              <div className={styles.inputGroup}>
                <label htmlFor="price" className={styles.label}>
                  Price (ETH) *
                </label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.001"
                  min="0.001"
                  placeholder="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
                <p className={styles.helperText}>
                  Set a fair price for your note. Consider the value and effort put into creating it.
                </p>
              </div>
            </div>

            <div className={styles.actions}>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                className={styles.submitButton}
              >
                {loading ? '🔄 Creating on Blockchain...' : '✨ Create Note NFT'}
              </Button>
              
              <p className={styles.helperText}>
                ℹ️ Make sure MetaMask is connected and you're on Sepolia testnet
              </p>
            </div>
          </form>
        </Card>

        <Card className={styles.previewCard}>
          <h3 className={styles.previewTitle}>📋 Preview</h3>
          
          <div className={styles.preview}>
            <div className={styles.previewHeader}>
              <h4 className={styles.previewNoteTitle}>
                {formData.title || 'Note Title'}
              </h4>
              <span className={styles.previewPrice}>
                {formData.price || '0.01'} ETH
              </span>
            </div>

            <div className={styles.previewMeta}>
              <span className={styles.previewSubject}>
                📚 {formData.subject || 'Subject'}
              </span>
              <span className={styles.previewCreator}>
                👤 Your Connected Wallet
              </span>
            </div>
            
            {formData.description && (
              <p className={styles.previewDescription}>
                {formData.description}
              </p>
            )}

            {uploadedFile && (
              <div className={styles.previewFile}>
                <h5>📁 Attached File:</h5>
                <div className={styles.previewFileInfo}>
                  <span className={styles.fileName}>{uploadedFile.name}</span>
                  <span className={styles.fileSize}>
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <div className={styles.ipfsInfo}>
                  <strong>IPFS Hash:</strong> <code>{uploadedFile.hash}</code>
                </div>
              </div>
            )}
            
            <div className={styles.previewContent}>
              {formData.content ? (
                <pre className={styles.previewText}>{formData.content}</pre>
              ) : (
                <p className={styles.placeholderText}>
                  {uploadedFile 
                    ? "Your uploaded file will be the main content, with any additional text shown here..." 
                    : "Your note content will appear here..."
                  }
                </p>
              )}
            </div>
          </div>

          <div className={styles.blockchainInfo}>
            <h4>🔗 Blockchain Features</h4>
            <ul>
              <li>✅ Immutable ownership record</li>
              <li>🌐 Decentralized file storage via IPFS</li>
              <li>� Automated royalty payments</li>
              <li>🔒 Cryptographic proof of authenticity</li>
              <li>📊 Transparent transaction history</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CreatePage;
