// 🚀 CONTRACT CONNECTION COMPONENT - SEPOLIA DEPLOYMENT
// Your contract: 0x34FC410F17117e620B0C80EE5f4419B2658Ab5DC

import { ethers } from 'ethers';

// ============ CONTRACT CONFIGURATION ============

export const CONTRACT_ADDRESS = "0x34FC410F17117e620B0C80EE5f4419B2658Ab5DC";
export const NETWORK_ID = 11155111; // Sepolia
export const NETWORK_NAME = "sepolia";

// ============ CONTRACT ABI ============
export const CONTRACT_ABI = [
  // Constructor
  "constructor()",
  
  // Core Functions
  "function createNote(string title, string description, string ipfsHash, uint256 price, string subject, string metadataURI) returns (uint256)",
  "function purchaseNote(uint256 tokenId) payable",
  "function rateNote(uint256 tokenId, uint8 rating)",
  "function withdrawEarnings()",
  "function updatePrice(uint256 tokenId, uint256 newPrice)",
  "function toggleSaleStatus(uint256 tokenId)",
  
  // View Functions
  "function getAllNotes() view returns (tuple(uint256 id, string title, string description, string ipfsHash, address author, uint256 price, bool forSale, uint256 createdAt, string subject, uint8 averageRating, uint256 ratingCount, uint256 downloadCount)[])",
  "function getNotesByAuthor(address author) view returns (uint256[])",
  "function getNotesBySubject(string subject) view returns (uint256[])",
  "function getNoteDetails(uint256 tokenId) view returns (tuple(uint256 id, string title, string description, string ipfsHash, address author, uint256 price, bool forSale, uint256 createdAt, string subject, uint8 averageRating, uint256 ratingCount, uint256 downloadCount))",
  "function hasUserPurchased(address user, uint256 tokenId) view returns (bool)",
  "function getTotalNotes() view returns (uint256)",
  "function getUserRating(address user, uint256 tokenId) view returns (uint8)",
  
  // ERC721 Functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function balanceOf(address owner) view returns (uint256)",
  
  // Admin Functions
  "function owner() view returns (address)",
  "function withdrawPlatformFees()",
  
  // Constants
  "function PLATFORM_FEE_BASIS_POINTS() view returns (uint256)",
  
  // Events
  "event NoteCreated(uint256 indexed tokenId, address indexed author, string title, string subject, uint256 price, string ipfsHash)",
  "event NotePurchased(uint256 indexed tokenId, address indexed buyer, address indexed seller, uint256 price)",
  "event NoteRated(uint256 indexed tokenId, address indexed rater, uint8 rating, uint8 newAverageRating)"
];

// ============ CONTRACT CONNECTION CLASS ============

export class NotesMarketplaceContract {
  constructor() {
    this.contract = null;
    this.signer = null;
    this.provider = null;
  }

  // Initialize connection
  async connect() {
    try {
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Create provider and signer
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
        
        // Connect to contract
        this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer);
        
        // Verify network
        const network = await this.provider.getNetwork();
        if (Number(network.chainId) !== NETWORK_ID) {
          await this.switchToSepolia();
        }
        
        console.log("✅ Connected to NotesMarketplace on Sepolia!");
        console.log("📍 Contract Address:", CONTRACT_ADDRESS);
        
        return true;
      } else {
        throw new Error("MetaMask not installed");
      }
    } catch (error) {
      console.error("❌ Connection failed:", error);
      return false;
    }
  }

  // Switch to Sepolia network
  async switchToSepolia() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xAA36A7' }], // Sepolia chain ID in hex
      });
    } catch (error) {
      // If network doesn't exist, add it
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0xAA36A7',
            chainName: 'Sepolia Test Network',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18
            },
            rpcUrls: ['https://sepolia.infura.io/v3/'],
            blockExplorerUrls: ['https://sepolia.etherscan.io/']
          }]
        });
      }
    }
  }

  // ============ CONTRACT FUNCTIONS ============

  // Get contract info
  async getContractInfo() {
    if (!this.contract) await this.connect();
    
    const name = await this.contract.name();
    const symbol = await this.contract.symbol();
    const totalNotes = await this.contract.getTotalNotes();
    const platformFee = await this.contract.PLATFORM_FEE_BASIS_POINTS();
    
    return {
      name,
      symbol,
      totalNotes: totalNotes.toString(),
      platformFee: platformFee.toString(),
      address: CONTRACT_ADDRESS
    };
  }

  // Create a new note
  async createNote(title, description, ipfsHash, price, subject, metadataURI) {
    if (!this.contract) await this.connect();
    
    const priceInWei = ethers.parseEther(price.toString());
    const tx = await this.contract.createNote(
      title,
      description,
      ipfsHash,
      priceInWei,
      subject,
      metadataURI
    );
    
    const receipt = await tx.wait();
    console.log("✅ Note created! Transaction:", receipt.hash);
    return receipt;
  }

  // Purchase a note
  async purchaseNote(tokenId, price) {
    if (!this.contract) await this.connect();
    
    const priceInWei = ethers.parseEther(price.toString());
    const tx = await this.contract.purchaseNote(tokenId, {
      value: priceInWei
    });
    
    const receipt = await tx.wait();
    console.log("✅ Note purchased! Transaction:", receipt.hash);
    return receipt;
  }

  // Rate a note
  async rateNote(tokenId, rating) {
    if (!this.contract) await this.connect();
    
    const tx = await this.contract.rateNote(tokenId, rating);
    const receipt = await tx.wait();
    console.log("✅ Note rated! Transaction:", receipt.hash);
    return receipt;
  }

  // Get all notes
  async getAllNotes() {
    if (!this.contract) await this.connect();
    
    const notes = await this.contract.getAllNotes();
    return notes.map(note => ({
      id: note.id.toString(),
      title: note.title,
      description: note.description,
      ipfsHash: note.ipfsHash,
      author: note.author,
      price: ethers.formatEther(note.price),
      forSale: note.forSale,
      createdAt: new Date(Number(note.createdAt) * 1000),
      subject: note.subject,
      averageRating: note.averageRating,
      ratingCount: note.ratingCount.toString(),
      downloadCount: note.downloadCount.toString()
    }));
  }

  // Get note details
  async getNoteDetails(tokenId) {
    if (!this.contract) await this.connect();
    
    const note = await this.contract.getNoteDetails(tokenId);
    return {
      id: note.id.toString(),
      title: note.title,
      description: note.description,
      ipfsHash: note.ipfsHash,
      author: note.author,
      price: ethers.formatEther(note.price),
      forSale: note.forSale,
      createdAt: new Date(Number(note.createdAt) * 1000),
      subject: note.subject,
      averageRating: note.averageRating,
      ratingCount: note.ratingCount.toString(),
      downloadCount: note.downloadCount.toString()
    };
  }

  // Check if user purchased a note
  async hasUserPurchased(userAddress, tokenId) {
    if (!this.contract) await this.connect();
    return await this.contract.hasUserPurchased(userAddress, tokenId);
  }

  // Get user's current address
  async getCurrentUser() {
    if (!this.signer) await this.connect();
    return await this.signer.getAddress();
  }

  // Withdraw earnings
  async withdrawEarnings() {
    if (!this.contract) await this.connect();
    
    const tx = await this.contract.withdrawEarnings();
    const receipt = await tx.wait();
    console.log("✅ Earnings withdrawn! Transaction:", receipt.hash);
    return receipt;
  }

  // Listen to events
  setupEventListeners(onNoteCreated, onNotePurchased, onNoteRated) {
    if (!this.contract) return;

    this.contract.on("NoteCreated", (tokenId, author, title, subject, price, ipfsHash, event) => {
      if (onNoteCreated) {
        onNoteCreated({
          tokenId: tokenId.toString(),
          author,
          title,
          subject,
          price: ethers.formatEther(price),
          ipfsHash,
          transactionHash: event.log.transactionHash
        });
      }
    });

    this.contract.on("NotePurchased", (tokenId, buyer, seller, price, event) => {
      if (onNotePurchased) {
        onNotePurchased({
          tokenId: tokenId.toString(),
          buyer,
          seller,
          price: ethers.formatEther(price),
          transactionHash: event.log.transactionHash
        });
      }
    });

    this.contract.on("NoteRated", (tokenId, rater, rating, newAverageRating, event) => {
      if (onNoteRated) {
        onNoteRated({
          tokenId: tokenId.toString(),
          rater,
          rating,
          newAverageRating,
          transactionHash: event.log.transactionHash
        });
      }
    });
  }
}

// ============ EXPORT SINGLETON ============

export const notesContract = new NotesMarketplaceContract();

// ============ QUICK TEST FUNCTIONS ============

export const testConnection = async () => {
  try {
    const connected = await notesContract.connect();
    if (connected) {
      const info = await notesContract.getContractInfo();
      console.log("🎉 CONTRACT CONNECTION SUCCESS!");
      console.log("📋 Contract Info:", info);
      console.log("🌍 Global Access: https://sepolia.etherscan.io/address/" + CONTRACT_ADDRESS);
      return info;
    }
  } catch (error) {
    console.error("❌ Connection test failed:", error);
    return null;
  }
};

// ============ USAGE EXAMPLE ============

/*
// In your React component:

import { notesContract, testConnection } from './contractConnection';

// Test connection
useEffect(() => {
  testConnection();
}, []);

// Create a note
const createNote = async () => {
  await notesContract.createNote(
    "My Study Note",
    "Description here",
    "QmHashHere",
    0.01, // 0.01 ETH
    "Computer Science",
    "https://metadata-uri.com"
  );
};

// Get all notes
const loadNotes = async () => {
  const notes = await notesContract.getAllNotes();
  setNotes(notes);
};

*/
