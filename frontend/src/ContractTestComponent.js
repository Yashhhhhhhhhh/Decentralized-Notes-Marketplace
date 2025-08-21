import React, { useState, useEffect } from 'react';
import { notesContract, testConnection, CONTRACT_ADDRESS } from './contractConnection';

const ContractTestComponent = () => {
  const [contractInfo, setContractInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    initializeContract();
  }, []);

  const initializeContract = async () => {
    try {
      setLoading(true);
      
      // Test connection
      const info = await testConnection();
      
      if (info) {
        setContractInfo(info);
        setConnected(true);
        
        // Get user address
        const address = await notesContract.getCurrentUser();
        setUserAddress(address);
        
        // Load notes
        const allNotes = await notesContract.getAllNotes();
        setNotes(allNotes);
        
        console.log("🎉 Frontend connected to deployed contract!");
      }
    } catch (error) {
      console.error("❌ Initialization failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const createTestNote = async () => {
    try {
      setLoading(true);
      
      await notesContract.createNote(
        "Frontend Test Note",
        "This note was created from the React frontend!",
        "QmTestHashFromFrontend123",
        0.001, // 0.001 ETH
        "Frontend Development",
        "https://example.com/metadata/frontend-test"
      );
      
      // Reload notes
      const allNotes = await notesContract.getAllNotes();
      setNotes(allNotes);
      
      alert("✅ Test note created successfully!");
    } catch (error) {
      console.error("❌ Failed to create note:", error);
      alert("❌ Failed to create note: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>🔄 Connecting to Contract...</h2>
        <p>Contract Address: {CONTRACT_ADDRESS}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 NotesMarketplace Frontend Test</h1>
      
      {/* Connection Status */}
      <div style={{ 
        background: connected ? '#d4edda' : '#f8d7da', 
        border: `1px solid ${connected ? '#c3e6cb' : '#f5c6cb'}`,
        borderRadius: '5px',
        padding: '15px',
        marginBottom: '20px'
      }}>
        <h3>🔗 Connection Status</h3>
        <p><strong>Status:</strong> {connected ? '✅ Connected' : '❌ Disconnected'}</p>
        <p><strong>Contract:</strong> {CONTRACT_ADDRESS}</p>
        <p><strong>Network:</strong> Sepolia Testnet</p>
        <p><strong>Your Address:</strong> {userAddress}</p>
        
        <a 
          href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#007bff', textDecoration: 'none' }}
        >
          🌍 View on Etherscan →
        </a>
      </div>

      {/* Contract Info */}
      {contractInfo && (
        <div style={{ 
          background: '#e7f3ff',
          border: '1px solid #b8daff',
          borderRadius: '5px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <h3>📋 Contract Information</h3>
          <p><strong>Name:</strong> {contractInfo.name}</p>
          <p><strong>Symbol:</strong> {contractInfo.symbol}</p>
          <p><strong>Total Notes:</strong> {contractInfo.totalNotes}</p>
          <p><strong>Platform Fee:</strong> {contractInfo.platformFee} basis points (2.5%)</p>
        </div>
      )}

      {/* Test Actions */}
      <div style={{ 
        background: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '5px',
        padding: '15px',
        marginBottom: '20px'
      }}>
        <h3>🧪 Test Actions</h3>
        <button 
          onClick={createTestNote}
          disabled={!connected || loading}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: connected ? 'pointer' : 'not-allowed',
            marginRight: '10px'
          }}
        >
          {loading ? '⏳ Creating...' : '📝 Create Test Note'}
        </button>
        
        <button 
          onClick={initializeContract}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔄 Refresh Connection
        </button>
      </div>

      {/* Notes List */}
      <div style={{ 
        background: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '5px',
        padding: '15px'
      }}>
        <h3>📚 Notes in Marketplace ({notes.length})</h3>
        
        {notes.length === 0 ? (
          <p>No notes found. Create the first one! 🚀</p>
        ) : (
          <div>
            {notes.map((note, index) => (
              <div key={note.id} style={{
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '5px',
                padding: '15px',
                marginBottom: '10px'
              }}>
                <h4>📖 {note.title}</h4>
                <p><strong>Description:</strong> {note.description}</p>
                <p><strong>Subject:</strong> {note.subject}</p>
                <p><strong>Price:</strong> {note.price} ETH</p>
                <p><strong>Author:</strong> {note.author}</p>
                <p><strong>Rating:</strong> {note.averageRating}/5 ({note.ratingCount} ratings)</p>
                <p><strong>Downloads:</strong> {note.downloadCount}</p>
                <p><strong>For Sale:</strong> {note.forSale ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Created:</strong> {note.createdAt.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Success Message */}
      {connected && (
        <div style={{ 
          background: '#d1ecf1',
          border: '1px solid #bee5eb',
          borderRadius: '5px',
          padding: '15px',
          marginTop: '20px',
          textAlign: 'center'
        }}>
          <h3>🎉 SUCCESS!</h3>
          <p>✅ Your contract is LIVE on Sepolia testnet!</p>
          <p>✅ Frontend is connected and working!</p>
          <p>✅ Ready for hackathon demo!</p>
          
          <div style={{ marginTop: '15px' }}>
            <strong>Share your marketplace:</strong><br/>
            <code style={{ 
              background: '#f8f9fa', 
              padding: '5px 10px', 
              borderRadius: '3px',
              fontSize: '14px'
            }}>
              {CONTRACT_ADDRESS}
            </code>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractTestComponent;
