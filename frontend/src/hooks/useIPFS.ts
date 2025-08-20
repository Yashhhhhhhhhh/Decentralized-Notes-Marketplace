import { useState, useCallback } from 'react';
import axios from 'axios';
import { IPFSFile, IPFSUploadResponse } from '../types';

const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.REACT_APP_PINATA_SECRET_API_KEY;
const PINATA_JWT = process.env.REACT_APP_PINATA_JWT;

interface IPFSState {
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
}

interface IPFSService {
  uploadFile: (file: File, metadata?: any) => Promise<IPFSUploadResponse>;
  uploadMetadata: (metadata: any) => Promise<IPFSUploadResponse>;
  retrieveFile: (hash: string) => string;
  pinFile: (hash: string) => Promise<void>;
  validateFile: (file: File) => { isValid: boolean; error?: string };
}

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function useIPFS(): IPFSState & IPFSService {
  const [state, setState] = useState<IPFSState>({
    isUploading: false,
    uploadProgress: 0,
    error: null,
  });

  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: 'File type not supported. Please upload PDF, DOC, DOCX, TXT, or MD files.',
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: 'File size too large. Maximum size is 10MB.',
      };
    }

    return { isValid: true };
  }, []);

  const uploadFile = useCallback(async (
    file: File,
    metadata?: any
  ): Promise<IPFSUploadResponse> => {
    const validation = validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      throw new Error('Pinata API credentials not configured');
    }

    setState(prev => ({ ...prev, isUploading: true, uploadProgress: 0, error: null }));

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Add metadata if provided
      if (metadata) {
        formData.append('pinataMetadata', JSON.stringify({
          name: metadata.name || file.name,
          keyvalues: metadata,
        }));
      }

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_KEY,
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setState(prev => ({ ...prev, uploadProgress: progress }));
            }
          },
        }
      );

      const result: IPFSUploadResponse = {
        hash: response.data.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
        size: response.data.PinSize,
      };

      setState(prev => ({ ...prev, isUploading: false, uploadProgress: 100 }));
      return result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
      setState(prev => ({ ...prev, isUploading: false, error: errorMessage }));
      throw new Error(errorMessage);
    }
  }, [validateFile]);

  const uploadMetadata = useCallback(async (metadata: any): Promise<IPFSUploadResponse> => {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      throw new Error('Pinata API credentials not configured');
    }

    setState(prev => ({ ...prev, isUploading: true, uploadProgress: 0, error: null }));

    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        metadata,
        {
          headers: {
            'Content-Type': 'application/json',
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_KEY,
          },
        }
      );

      const result: IPFSUploadResponse = {
        hash: response.data.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
        size: response.data.PinSize,
      };

      setState(prev => ({ ...prev, isUploading: false, uploadProgress: 100 }));
      return result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Metadata upload failed';
      setState(prev => ({ ...prev, isUploading: false, error: errorMessage }));
      throw new Error(errorMessage);
    }
  }, []);

  const retrieveFile = useCallback((hash: string): string => {
    // Primary gateway
    const primaryGateway = `https://gateway.pinata.cloud/ipfs/${hash}`;
    
    // Fallback gateways (you can add more)
    const fallbackGateways = [
      `https://ipfs.io/ipfs/${hash}`,
      `https://cloudflare-ipfs.com/ipfs/${hash}`,
      `https://dweb.link/ipfs/${hash}`,
    ];

    // For now, return the primary gateway
    // In production, you might want to implement gateway fallback logic
    return primaryGateway;
  }, []);

  const pinFile = useCallback(async (hash: string): Promise<void> => {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      throw new Error('Pinata API credentials not configured');
    }

    try {
      await axios.post(
        'https://api.pinata.cloud/pinning/pinByHash',
        {
          hashToPin: hash,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_KEY,
          },
        }
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to pin file');
    }
  }, []);

  return {
    ...state,
    uploadFile,
    uploadMetadata,
    retrieveFile,
    pinFile,
    validateFile,
  };
}

// Utility functions for file handling
export const generateFilePreview = (file: File): Promise<string | null> => {
  return new Promise((resolve) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    } else {
      resolve(null);
    }
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (fileType: string): string => {
  switch (fileType) {
    case 'application/pdf':
      return '📄';
    case 'application/msword':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return '📝';
    case 'text/plain':
      return '📃';
    case 'text/markdown':
      return '📋';
    default:
      return '📎';
  }
};
