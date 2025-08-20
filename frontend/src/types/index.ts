export interface Note {
  id: number;
  title: string;
  description: string;
  ipfsHash: string;
  author: string;
  price: string; // in ETH as string
  forSale: boolean;
  createdAt: number;
  subject: string;
  rating: number;
  ratingCount: number;
  totalRating: number;
  downloadCount: number;
}

export interface UserProfile {
  name: string;
  bio: string;
  verified: boolean;
  totalEarnings: string; // in ETH as string
  notesCreated: number;
  reputation: number;
}

export interface Transaction {
  hash: string;
  type: 'CREATE_NOTE' | 'PURCHASE_NOTE' | 'RATE_NOTE' | 'WITHDRAW';
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  timestamp: number;
  gasUsed?: string;
  gasFee?: string;
  noteId?: number;
  amount?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Web3State {
  isConnected: boolean;
  account: string | null;
  chainId: number | null;
  balance: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface ContractState {
  contract: any | null;
  isLoading: boolean;
  error: string | null;
}

export interface IPFSFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  file: File;
}

export interface IPFSUploadResponse {
  hash: string;
  url: string;
  size: number;
}

export interface SearchFilters {
  subject?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  sortBy?: 'newest' | 'price_low' | 'price_high' | 'rating' | 'downloads';
  author?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface NotificationProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export interface SubjectCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  noteCount: number;
}

export const SUBJECT_CATEGORIES: SubjectCategory[] = [
  { id: 'mathematics', name: 'Mathematics', icon: '📐', color: 'bg-blue-500', noteCount: 0 },
  { id: 'physics', name: 'Physics', icon: '⚛️', color: 'bg-purple-500', noteCount: 0 },
  { id: 'chemistry', name: 'Chemistry', icon: '🧪', color: 'bg-green-500', noteCount: 0 },
  { id: 'biology', name: 'Biology', icon: '🧬', color: 'bg-emerald-500', noteCount: 0 },
  { id: 'computer-science', name: 'Computer Science', icon: '💻', color: 'bg-indigo-500', noteCount: 0 },
  { id: 'engineering', name: 'Engineering', icon: '⚙️', color: 'bg-gray-500', noteCount: 0 },
  { id: 'economics', name: 'Economics', icon: '📈', color: 'bg-yellow-500', noteCount: 0 },
  { id: 'literature', name: 'Literature', icon: '📚', color: 'bg-red-500', noteCount: 0 },
  { id: 'history', name: 'History', icon: '🏛️', color: 'bg-amber-500', noteCount: 0 },
  { id: 'psychology', name: 'Psychology', icon: '🧠', color: 'bg-pink-500', noteCount: 0 },
  { id: 'other', name: 'Other', icon: '📄', color: 'bg-slate-500', noteCount: 0 },
];

export const NETWORK_CONFIG = {
  80001: {
    name: 'Polygon Mumbai',
    currency: 'MATIC',
    explorerUrl: 'https://mumbai.polygonscan.com',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
  },
  137: {
    name: 'Polygon',
    currency: 'MATIC',
    explorerUrl: 'https://polygonscan.com',
    rpcUrl: 'https://polygon-rpc.com',
  },
  1337: {
    name: 'Hardhat Local',
    currency: 'ETH',
    explorerUrl: 'http://localhost:8545',
    rpcUrl: 'http://localhost:8545',
  },
};
