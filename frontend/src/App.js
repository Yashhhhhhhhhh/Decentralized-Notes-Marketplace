import React, { useState, useEffect } from 'react';
import { Web3Provider, useWeb3 } from './contexts/Web3Context';
import { useNotesContract } from './hooks/useNotesContract';

// New refactored components
import Layout from './components/layout/Layout';
import Navigation from './components/layout/Navigation';
import BrowsePage from './pages/BrowsePage';
import CreatePage from './pages/CreatePage';

// Legacy components (to be refactored)
import NotesMarketplace from './components/NotesMarketplace';
import CreateNoteForm from './components/CreateNoteForm';
import UserProfile from './components/UserProfile';
import AdminDashboard from './components/AdminDashboard';
import NotificationSystem from './components/NotificationSystem';
import SearchAndFilter from './components/SearchAndFilter';
import RecommendationEngine from './components/RecommendationEngine';
import IPFSFileManager from './components/IPFSFileManager';
import PinataDebugUploader from './components/PinataDebugUploader';
import EnvTester from './components/EnvTester';
import NetworkSelector from './components/NetworkSelector';
import ContractTestComponent from './ContractTestComponent';
import CreateNoteTestComponent from './components/CreateNoteTestComponent';

import { getCurrentNetwork, getContractAddress } from './config/networks';
import './styles/global.css';

// Demo Components
function WalletConnection() {
  const { state, connectWallet, disconnectWallet } = useWeb3();
  const currentNetwork = getCurrentNetwork();

  const getNetworkInfo = (chainId) => {
    switch (chainId) {
      case 11155111:
        return { name: 'Sepolia Testnet', color: '#10b981', emoji: '✅' };
      case 1:
        return { name: 'Ethereum Mainnet', color: '#ef4444', emoji: '⚠️' };
      case 137:
        return { name: 'Polygon Mainnet', color: '#8b5cf6', emoji: '🔷' };
      case 80001:
        return { name: 'Polygon Mumbai', color: '#10b981', emoji: '🟣' };
      case 1337:
        return { name: 'Localhost', color: '#10b981', emoji: '🏠' };
      default:
        return { name: `Network ${chainId}`, color: '#6b7280', emoji: '❓' };
    }
  };

  const networkInfo = state.chainId ? getNetworkInfo(state.chainId) : null;
  const isCorrectNetwork = state.chainId === currentNetwork.chainId;
  const contractAddress = getContractAddress();

  return (
    <div className="card">
      <h2 className="card-title">🦊 MetaMask Connection</h2>
      
      {state.isLoading && (
        <div className="loading-text">
          🔄 Connecting to wallet...
        </div>
      )}

      {state.error && (
        <div className="error-box">
          ❌ {state.error}
        </div>
      )}

      {!state.isConnected ? (
        <div>
          <p className="subtitle">
            Connect your MetaMask wallet to interact with the contract
          </p>
          <button 
            onClick={connectWallet}
            className="button button-primary button-large"
          >
            Connect MetaMask
          </button>
        </div>
      ) : (
        <div>
          <div className="success-box">
            <strong>✅ Wallet Connected!</strong>
            <div className="wallet-info">
              <div>📍 <strong>Address:</strong> {state.account?.slice(0, 6)}...{state.account?.slice(-4)}</div>
              <div>💰 <strong>Balance:</strong> {parseFloat(state.balance).toFixed(4)} ETH</div>
              {networkInfo && (
                <div style={{ color: networkInfo.color }}>
                  {networkInfo.emoji} <strong>Network:</strong> {networkInfo.name}
                </div>
              )}
            </div>
          </div>

          {!isCorrectNetwork && (
            <div className="warning-box">
              ⚠️ Please switch to Localhost or Sepolia Testnet for this demo
            </div>
          )}

          <button 
            onClick={disconnectWallet}
            className="button button-secondary"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}

function ContractInfo() {
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  const { contract, isLoading, error } = useNotesContract();
  const { state } = useWeb3();

  return (
    <div className="card">
      <h2 className="card-title">📋 Contract Information</h2>
      
      <div className="info-section">
        <strong>Contract Address:</strong>
        <div className="code-block">
          {contractAddress || 'Not configured'}
        </div>
      </div>

      <div className="info-section">
        <strong>Connection Status:</strong>
        <div className="status-info">
          {!state.isConnected ? (
            <span className="status-pending">⏳ Wallet not connected</span>
          ) : isLoading ? (
            <span className="status-loading">🔄 Initializing contract...</span>
          ) : error ? (
            <span className="status-error">❌ {error}</span>
          ) : contract ? (
            <span className="status-success">✅ Contract connected and ready!</span>
          ) : (
            <span className="status-pending">⏸️ Contract not initialized</span>
          )}
        </div>
      </div>

      {contract && (
        <div className="success-box">
          🎉 Ready to interact with the blockchain!
        </div>
      )}
    </div>
  );
}

function CreateNoteDemo() {
  const { createNote, isLoading } = useNotesContract();
  const { state } = useWeb3();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    price: ''
  });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!state.isConnected) {
      setStatus('❌ Please connect your wallet first');
      return;
    }

    try {
      setStatus('🔄 Creating note on blockchain...');
      
      // For demo purposes, we'll use a dummy IPFS hash
      const dummyIpfsHash = 'QmDummyHashForDemo' + Date.now();
      
      const receipt = await createNote(
        formData.title,
        formData.description,
        dummyIpfsHash,
        formData.price,
        formData.subject
      );

      setStatus(`✅ Note created successfully! Transaction: ${receipt.hash.slice(0, 10)}...`);
      setFormData({ title: '', description: '', subject: '', price: '' });
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">📝 Create Note Demo</h2>
      
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label className="form-label">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Advanced Calculus Notes"
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detailed study notes covering..."
            required
            rows={3}
            className="form-textarea"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Subject</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g. Mathematics"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Price (ETH)</label>
            <input
              type="number"
              step="0.001"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0.01"
              required
              className="form-input"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !state.isConnected}
          className={`button ${(!state.isConnected || isLoading) ? 'button-disabled' : 'button-success'} button-large button-full`}
        >
          {isLoading ? '🔄 Creating...' : '📝 Create Note as NFT'}
        </button>
      </form>

      {status && (
        <div className={`status-message ${status.includes('✅') ? 'status-success' : status.includes('❌') ? 'status-error' : 'status-warning'}`}>
          {status}
        </div>
      )}
    </div>
  );
}

function PinataSetup() {
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [status, setStatus] = useState('');

  const testConnection = async () => {
    if (!apiKey || !secretKey) {
      setStatus('❌ Please enter both API keys');
      return;
    }

    try {
      setStatus('🔄 Testing Pinata connection...');
      
      const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
        method: 'GET',
        headers: {
          'pinata_api_key': apiKey,
          'pinata_secret_api_key': secretKey
        }
      });

      if (response.ok) {
        setStatus('✅ Pinata connection successful!');
        localStorage.setItem('pinata_api_key', apiKey);
        localStorage.setItem('pinata_secret_key', secretKey);
      } else {
        setStatus('❌ Invalid Pinata credentials');
      }
    } catch (error) {
      setStatus('❌ Connection failed: ' + error.message);
    }
  };

  useEffect(() => {
    const savedApiKey = localStorage.getItem('pinata_api_key');
    const savedSecretKey = localStorage.getItem('pinata_secret_key');
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedSecretKey) setSecretKey(savedSecretKey);
  }, []);

  return (
    <div className="card">
      <h2 className="card-title">📁 Pinata IPFS Setup</h2>
      
      <div className="info-box">
        <p>
          📝 <strong>Quick Setup:</strong> Get free API keys from{' '}
          <a href="https://pinata.cloud" target="_blank" rel="noopener noreferrer" className="link">
            pinata.cloud
          </a>
          {' '}for IPFS file storage (optional for basic demo)
        </p>
      </div>

      <div className="form">
        <div className="form-group">
          <label className="form-label">Pinata API Key</label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Pinata API key"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Pinata Secret Key</label>
          <input
            type="password"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder="Enter your Pinata secret key"
            className="form-input"
          />
        </div>

        <button
          onClick={testConnection}
          className="button button-purple"
        >
          🧪 Test Connection
        </button>
      </div>

      {status && (
        <div className={`status-message ${status.includes('✅') ? 'status-success' : status.includes('❌') ? 'status-error' : 'status-warning'}`}>
          {status}
        </div>
      )}
    </div>
  );
}

function DemoApp() {
  const [currentPage, setCurrentPage] = useState('browse');
  const [searchFilters, setSearchFilters] = useState({});
  const [notifications, setNotifications] = useState([]);
  const { state, connectWallet } = useWeb3();
  const { contract } = useNotesContract();

  const addNotification = (notification) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { ...notification, id }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleSearch = (filters) => {
    setSearchFilters(filters);
    addNotification({
      type: 'info',
      message: `Search applied with ${Object.keys(filters).length} filters`
    });
  };

  const isAdmin = state.account?.toLowerCase() === process.env.REACT_APP_ADMIN_ADDRESS?.toLowerCase();

  const handleConnectWallet = () => {
    if (!state.isConnected) {
      connectWallet();
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'browse':
        return <BrowsePage contract={contract} account={state.account} />;
      case 'create':
        return <CreatePage contract={contract} account={state.account} />;
      case 'my-notes':
        return <UserProfile addNotification={addNotification} />;
      case 'test':
        return (
          <div>
            <ContractTestComponent />
            <CreateNoteTestComponent />
          </div>
        );
      case 'marketplace':
        return (
          <div>
            <SearchAndFilter onSearch={handleSearch} />
            <NotesMarketplace filters={searchFilters} addNotification={addNotification} />
            <RecommendationEngine addNotification={addNotification} />
          </div>
        );
      case 'ipfs':
        return (
          <div>
            <EnvTester />
            <PinataDebugUploader />
            <IPFSFileManager addNotification={addNotification} />
          </div>
        );
      case 'admin':
        return <AdminDashboard addNotification={addNotification} />;
      default:
        return <BrowsePage contract={contract} account={state.account} />;
    }
  };

  return (
    <div className="app">
      <Navigation
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isConnected={state.isConnected}
        onConnect={handleConnectWallet}
      />
      
      <Layout>
        {renderCurrentPage()}
      </Layout>

      <NotificationSystem 
        notifications={notifications} 
        onRemove={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
      />
    </div>
  );
}

function App() {
  return (
    <Web3Provider>
      <DemoApp />
    </Web3Provider>
  );
}

export default App;