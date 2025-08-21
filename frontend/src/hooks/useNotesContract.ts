import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';
import { Note, ContractState } from '../types';

// You'll need to replace this with your actual contract ABI
const CONTRACT_ABI = [
  // Updated to match your deployed contract
  "function createNote(string memory title, string memory description, string memory ipfsHash, uint256 price, string memory subject, string memory metadataURI) external returns (uint256)",
  "function purchaseNote(uint256 tokenId) external payable",
  "function rateNote(uint256 tokenId, uint8 rating) external",
  "function updatePrice(uint256 tokenId, uint256 newPrice) external",
  "function updateSaleStatus(uint256 tokenId, bool forSale) external",
  "function withdrawEarnings() external",
  "function getNotesByAuthor(address author) external view returns (uint256[] memory)",
  "function getNotesBySubject(string memory subject) external view returns (uint256[] memory)",
  "function getUserPurchases(address user) external view returns (uint256[] memory)",
  "function getTotalNotes() external view returns (uint256)",
  "function hasUserPurchased(address user, uint256 tokenId) external view returns (bool)",
  "function notes(uint256) external view returns (uint256 id, string memory title, string memory description, string memory ipfsHash, address author, uint256 price, bool forSale, uint256 createdAt, string memory subject, uint8 rating, uint256 ratingCount, uint256 totalRating, uint256 downloadCount)",
  "function authorEarnings(address) external view returns (uint256)",
  "function userProfiles(address) external view returns (string memory name, string memory bio, bool verified, uint256 totalEarnings, uint256 notesCreated, uint8 reputation)"
];

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || '';

export function useNotesContract() {
  const { state: web3State, addTransaction, updateTransaction } = useWeb3();
  const [contractState, setContractState] = useState<ContractState>({
    contract: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (web3State.isConnected && web3State.account) {
      initializeContract();
    } else {
      setContractState({
        contract: null,
        isLoading: false,
        error: null,
      });
    }
  }, [web3State.isConnected, web3State.account]);

  const initializeContract = async () => {
    try {
      setContractState(prev => ({ ...prev, isLoading: true, error: null }));

      if (!CONTRACT_ADDRESS) {
        throw new Error('Contract address not configured');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setContractState({
        contract,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setContractState({
        contract: null,
        isLoading: false,
        error: error.message || 'Failed to initialize contract',
      });
    }
  };

  const createNote = useCallback(async (
    title: string,
    description: string,
    ipfsHash: string,
    price: string,
    subject: string
  ) => {
    if (!contractState.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const priceInWei = ethers.parseEther(price);
      
      // Create metadata URI for the 6th parameter
      const metadata = {
        title,
        description,
        subject,
        ipfsHash,
        createdAt: new Date().toISOString(),
        creator: web3State.account
      };
      const metadataURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
      
      // Estimate gas with all 6 parameters
      const gasEstimate = await contractState.contract.createNote.estimateGas(
        title,
        description,
        ipfsHash,
        priceInWei,
        subject,
        metadataURI
      );

      // Add 20% buffer to gas estimate
      const gasLimit = (gasEstimate * BigInt(120)) / BigInt(100);

      const tx = await contractState.contract.createNote(
        title,
        description,
        ipfsHash,
        priceInWei,
        subject,
        metadataURI,
        { gasLimit }
      );

      // Add transaction to state
      addTransaction({
        hash: tx.hash,
        type: 'CREATE_NOTE',
        status: 'PENDING',
        timestamp: Date.now(),
      });

      const receipt = await tx.wait();

      // Update transaction status
      updateTransaction(tx.hash, {
        status: 'SUCCESS',
        gasUsed: receipt.gasUsed.toString(),
        gasFee: (receipt.gasUsed * receipt.gasPrice).toString(),
      });

      return receipt;
    } catch (error: any) {
      // Update transaction status if hash exists
      if (error.hash) {
        updateTransaction(error.hash, {
          status: 'FAILED',
        });
      }
      throw error;
    }
  }, [contractState.contract, addTransaction, updateTransaction, web3State.account]);

  const purchaseNote = useCallback(async (tokenId: number, price: string) => {
    if (!contractState.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const priceInWei = ethers.parseEther(price);
      
      const gasEstimate = await contractState.contract.purchaseNote.estimateGas(
        tokenId,
        { value: priceInWei }
      );

      const gasLimit = (gasEstimate * BigInt(120)) / BigInt(100);

      const tx = await contractState.contract.purchaseNote(tokenId, {
        value: priceInWei,
        gasLimit,
      });

      addTransaction({
        hash: tx.hash,
        type: 'PURCHASE_NOTE',
        status: 'PENDING',
        timestamp: Date.now(),
        noteId: tokenId,
        amount: price,
      });

      const receipt = await tx.wait();

      updateTransaction(tx.hash, {
        status: 'SUCCESS',
        gasUsed: receipt.gasUsed.toString(),
        gasFee: (receipt.gasUsed * receipt.gasPrice).toString(),
      });

      return receipt;
    } catch (error: any) {
      if (error.hash) {
        updateTransaction(error.hash, { status: 'FAILED' });
      }
      throw error;
    }
  }, [contractState.contract, addTransaction, updateTransaction]);

  const rateNote = useCallback(async (tokenId: number, rating: number) => {
    if (!contractState.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const gasEstimate = await contractState.contract.rateNote.estimateGas(tokenId, rating);
      const gasLimit = (gasEstimate * BigInt(120)) / BigInt(100);

      const tx = await contractState.contract.rateNote(tokenId, rating, { gasLimit });

      addTransaction({
        hash: tx.hash,
        type: 'RATE_NOTE',
        status: 'PENDING',
        timestamp: Date.now(),
        noteId: tokenId,
      });

      const receipt = await tx.wait();

      updateTransaction(tx.hash, {
        status: 'SUCCESS',
        gasUsed: receipt.gasUsed.toString(),
        gasFee: (receipt.gasUsed * receipt.gasPrice).toString(),
      });

      return receipt;
    } catch (error: any) {
      if (error.hash) {
        updateTransaction(error.hash, { status: 'FAILED' });
      }
      throw error;
    }
  }, [contractState.contract, addTransaction, updateTransaction]);

  const updatePrice = useCallback(async (tokenId: number, newPrice: string) => {
    if (!contractState.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const priceInWei = ethers.parseEther(newPrice);
      const tx = await contractState.contract.updatePrice(tokenId, priceInWei);
      
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      throw error;
    }
  }, [contractState.contract]);

  const updateSaleStatus = useCallback(async (tokenId: number, forSale: boolean) => {
    if (!contractState.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await contractState.contract.updateSaleStatus(tokenId, forSale);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      throw error;
    }
  }, [contractState.contract]);

  const withdrawEarnings = useCallback(async () => {
    if (!contractState.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await contractState.contract.withdrawEarnings();

      addTransaction({
        hash: tx.hash,
        type: 'WITHDRAW',
        status: 'PENDING',
        timestamp: Date.now(),
      });

      const receipt = await tx.wait();

      updateTransaction(tx.hash, {
        status: 'SUCCESS',
        gasUsed: receipt.gasUsed.toString(),
        gasFee: (receipt.gasUsed * receipt.gasPrice).toString(),
      });

      return receipt;
    } catch (error: any) {
      if (error.hash) {
        updateTransaction(error.hash, { status: 'FAILED' });
      }
      throw error;
    }
  }, [contractState.contract, addTransaction, updateTransaction]);

  const getAllNotes = useCallback(async (): Promise<Note[]> => {
    if (!contractState.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const totalNotes = await contractState.contract.getTotalNotes();
      const notes: Note[] = [];

      for (let i = 0; i < totalNotes; i++) {
        try {
          const noteData = await contractState.contract.notes(i);
          const note: Note = {
            id: Number(noteData.id),
            title: noteData.title,
            description: noteData.description,
            ipfsHash: noteData.ipfsHash,
            author: noteData.author,
            price: ethers.formatEther(noteData.price),
            forSale: noteData.forSale,
            createdAt: Number(noteData.createdAt),
            subject: noteData.subject,
            rating: Number(noteData.rating),
            ratingCount: Number(noteData.ratingCount),
            totalRating: Number(noteData.totalRating),
            downloadCount: Number(noteData.downloadCount),
          };
          notes.push(note);
        } catch (error) {
          console.warn(`Failed to fetch note ${i}:`, error);
        }
      }

      return notes;
    } catch (error) {
      throw error;
    }
  }, [contractState.contract]);

  const getUserNotes = useCallback(async (userAddress?: string): Promise<Note[]> => {
    if (!contractState.contract) {
      throw new Error('Contract not initialized');
    }

    const address = userAddress || web3State.account;
    if (!address) {
      throw new Error('No user address provided');
    }

    try {
      const noteIds = await contractState.contract.getNotesByAuthor(address);
      const notes: Note[] = [];

      for (const id of noteIds) {
        try {
          const noteData = await contractState.contract.notes(id);
          const note: Note = {
            id: Number(noteData.id),
            title: noteData.title,
            description: noteData.description,
            ipfsHash: noteData.ipfsHash,
            author: noteData.author,
            price: ethers.formatEther(noteData.price),
            forSale: noteData.forSale,
            createdAt: Number(noteData.createdAt),
            subject: noteData.subject,
            rating: Number(noteData.rating),
            ratingCount: Number(noteData.ratingCount),
            totalRating: Number(noteData.totalRating),
            downloadCount: Number(noteData.downloadCount),
          };
          notes.push(note);
        } catch (error) {
          console.warn(`Failed to fetch note ${id}:`, error);
        }
      }

      return notes;
    } catch (error) {
      throw error;
    }
  }, [contractState.contract, web3State.account]);

  const getUserPurchases = useCallback(async (userAddress?: string): Promise<Note[]> => {
    if (!contractState.contract) {
      throw new Error('Contract not initialized');
    }

    const address = userAddress || web3State.account;
    if (!address) {
      throw new Error('No user address provided');
    }

    try {
      const noteIds = await contractState.contract.getUserPurchases(address);
      const notes: Note[] = [];

      for (const id of noteIds) {
        try {
          const noteData = await contractState.contract.notes(id);
          const note: Note = {
            id: Number(noteData.id),
            title: noteData.title,
            description: noteData.description,
            ipfsHash: noteData.ipfsHash,
            author: noteData.author,
            price: ethers.formatEther(noteData.price),
            forSale: noteData.forSale,
            createdAt: Number(noteData.createdAt),
            subject: noteData.subject,
            rating: Number(noteData.rating),
            ratingCount: Number(noteData.ratingCount),
            totalRating: Number(noteData.totalRating),
            downloadCount: Number(noteData.downloadCount),
          };
          notes.push(note);
        } catch (error) {
          console.warn(`Failed to fetch note ${id}:`, error);
        }
      }

      return notes;
    } catch (error) {
      throw error;
    }
  }, [contractState.contract, web3State.account]);

  const getAuthorEarnings = useCallback(async (address?: string): Promise<string> => {
    if (!contractState.contract) {
      throw new Error('Contract not initialized');
    }

    const authorAddress = address || web3State.account;
    if (!authorAddress) {
      throw new Error('No address provided');
    }

    try {
      const earnings = await contractState.contract.authorEarnings(authorAddress);
      return ethers.formatEther(earnings);
    } catch (error) {
      throw error;
    }
  }, [contractState.contract, web3State.account]);

  const hasUserPurchased = useCallback(async (tokenId: number, userAddress?: string): Promise<boolean> => {
    if (!contractState.contract) {
      throw new Error('Contract not initialized');
    }

    const address = userAddress || web3State.account;
    if (!address) {
      return false;
    }

    try {
      return await contractState.contract.hasUserPurchased(address, tokenId);
    } catch (error) {
      console.warn('Failed to check purchase status:', error);
      return false;
    }
  }, [contractState.contract, web3State.account]);

  return {
    ...contractState,
    createNote,
    purchaseNote,
    rateNote,
    updatePrice,
    updateSaleStatus,
    withdrawEarnings,
    getAllNotes,
    getUserNotes,
    getUserPurchases,
    getAuthorEarnings,
    hasUserPurchased,
  };
}
