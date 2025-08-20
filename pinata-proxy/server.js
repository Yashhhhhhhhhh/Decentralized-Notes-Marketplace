const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fetch = require('node-fetch');
const FormData = require('form-data');

const app = express();
const port = 3001;

// Configure multer for file uploads
const upload = multer();

app.use(cors());
app.use(express.json());

// Pinata JWT from your environment
const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiZDJmYzVmMy05NzY2LTRiODQtODc3NC05YmQ3NjI3YzAzZGIiLCJlbWFpbCI6Inlhc2hqYWRoYXZwcmFjdGljYWxzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJmYzI5Njk3MjA2OWI3YmNlMTZiYSIsInNjb3BlZEtleVNlY3JldCI6IjgxZjM2MWQ2ZjUyNGJjNTMyZjgyNjc3ZWU0ZTNmM2Y1MmY5NDkzNmZjYzM0MzczYzkyOTNmMzY0OWVlZmJjMTciLCJleHAiOjE3ODcyNTg3Mzh9.7O09ERXFZBBkQqLK_YgBUWvS1-f5l2Oq_Y9iKnR4eCU';

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Pinata proxy server is running' });
});

// Proxy endpoint for Pinata file upload
app.post('/api/pinata/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('Received upload request for file:', req.file?.originalname);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Create FormData for Pinata API
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // Add metadata if provided
    if (req.body.pinataMetadata) {
      formData.append('pinataMetadata', req.body.pinataMetadata);
    } else {
      const metadata = JSON.stringify({
        name: req.file.originalname,
        keyvalues: {
          uploader: 'notes-marketplace-proxy',
          timestamp: new Date().toISOString()
        }
      });
      formData.append('pinataMetadata', metadata);
    }

    // Add options
    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    console.log('Forwarding to Pinata API...');

    // Forward to Pinata API
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('Pinata API error:', result);
      return res.status(response.status).json(result);
    }

    console.log('Upload successful:', result.IpfsHash);
    res.json(result);

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Pinata proxy server running at http://localhost:${port}`);
  console.log('Endpoints:');
  console.log('- GET  /health');
  console.log('- POST /api/pinata/upload');
});
