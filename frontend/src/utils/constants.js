export const SUPPORTED_NETWORKS = {
  ETHEREUM_MAINNET: 1,
  SEPOLIA_TESTNET: 11155111,
  POLYGON_MAINNET: 137,
  POLYGON_MUMBAI: 80001,
  LOCALHOST: 1337
};

export const DEFAULT_NETWORK = SUPPORTED_NETWORKS.SEPOLIA_TESTNET;

export const TRANSACTION_TYPES = {
  MINT_NOTE: 'mintNote',
  PURCHASE_NOTE: 'purchaseNote',
  SET_PRICE: 'setPrice',
  TRANSFER: 'transfer'
};

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export const FILE_TYPES = {
  PDF: 'application/pdf',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  TXT: 'text/plain',
  MD: 'text/markdown'
};

export const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md'];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Engineering',
  'Economics',
  'Business',
  'Literature',
  'History',
  'Philosophy',
  'Psychology',
  'Other'
];

export const DIFFICULTY_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert'
];

export const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating-high', label: 'Highest Rated' },
  { value: 'popularity', label: 'Most Popular' }
];

export const PRICE_RANGES = [
  { min: 0, max: 0.01, label: 'Under 0.01 ETH' },
  { min: 0.01, max: 0.05, label: '0.01 - 0.05 ETH' },
  { min: 0.05, max: 0.1, label: '0.05 - 0.1 ETH' },
  { min: 0.1, max: 0.5, label: '0.1 - 0.5 ETH' },
  { min: 0.5, max: null, label: 'Over 0.5 ETH' }
];

export const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/'
];

export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet first',
  NETWORK_NOT_SUPPORTED: 'Please switch to a supported network',
  INSUFFICIENT_BALANCE: 'Insufficient balance for this transaction',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit',
  INVALID_FILE_TYPE: 'File type not supported',
  REQUIRED_FIELD: 'This field is required'
};
