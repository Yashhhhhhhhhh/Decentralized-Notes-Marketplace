import React, { useState, useEffect } from 'react';
import { Web3Provider, useWeb3 } from './contexts/Web3Context';
import { useNotesContract } from './hooks/useNotesContract';
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
import './App.css';

// Demo Components
function WalletConnection() {
  const { state, connectWallet, disconnectWallet } = useWeb3();

  const getNetworkInfo = (chainId) => {
    switch (chainId) {
      case 11155111:
        return { name: 'Sepolia Testnet', color: '#10b981', emoji: '✅' };
      case 1:
        return { name: 'Ethereum Mainnet', color: '#ef4444', emoji: '⚠️' };
      case 137:
        return { name: 'Polygon Mainnet', color: '#8b5cf6', emoji: '🔷' };
      case 1337:
        return { name: 'Localhost', color: '#10b981', emoji: '🏠' };
      default:
        return { name: `Network ${chainId}`, color: '#6b7280', emoji: '❓' };
    }
  };

  const networkInfo = state.chainId ? getNetworkInfo(state.chainId) : null;
  const isCorrectNetwork = state.chainId === 1337 || state.chainId === 11155111;

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
  const [currentPage, setCurrentPage] = useState('home');
  const [searchFilters, setSearchFilters] = useState({});
  const [notifications, setNotifications] = useState([]);
  const { state } = useWeb3();

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

  const navigation = [
    { id: 'home', label: '🏠 Home', icon: '🏠' },
    { id: 'marketplace', label: '🛒 Marketplace', icon: '🛒' },
    { id: 'create', label: '📝 Create Note', icon: '📝' },
    { id: 'ipfs', label: '📁 Files', icon: '📁' },
    { id: 'profile', label: '👤 Profile', icon: '👤', requiresWallet: true },
    { id: 'admin', label: '🛡️ Admin', icon: '🛡️', requiresWallet: true, adminOnly: true }
  ];

  const isAdmin = state.account?.toLowerCase() === process.env.REACT_APP_ADMIN_ADDRESS?.toLowerCase();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'marketplace':
        return (
          <div>
            <SearchAndFilter onSearch={handleSearch} />
            <NotesMarketplace filters={searchFilters} addNotification={addNotification} />
            <RecommendationEngine addNotification={addNotification} />
          </div>
        );
      case 'create':
        return <CreateNoteForm addNotification={addNotification} />;
      case 'ipfs':
        return (
          <div>
            <EnvTester />
            <PinataDebugUploader />
            <IPFSFileManager addNotification={addNotification} />
          </div>
        );
      case 'profile':
        return <UserProfile addNotification={addNotification} />;
      case 'admin':
        return <AdminDashboard addNotification={addNotification} />;
      case 'home':
      default:
        return (
          <div className="home-page">
            <WalletConnection />
            <ContractInfo />
            
            <div className="grid-2">
              <CreateNoteDemo />
              <PinataSetup />
            </div>

            <div className="card demo-instructions">
              <h2 className="card-title">🎯 Demo Instructions</h2>
              <div className="grid-3">
                <div className="instruction-card">
                  <h3 className="instruction-title">1️⃣ Connect</h3>
                  <p className="instruction-text">Connect MetaMask and switch to localhost or testnet</p>
                </div>
                <div className="instruction-card">
                  <h3 className="instruction-title">2️⃣ Create</h3>
                  <p className="instruction-text">Create your first study note as an NFT</p>
                </div>
                <div className="instruction-card">
                  <h3 className="instruction-title">3️⃣ Demo</h3>
                  <p className="instruction-text">Perfect for hackathon presentations!</p>
                </div>
              </div>
            </div>

            {/* Feature Showcase */}
            <div className="features-showcase">
              <h2 className="section-title">🚀 Platform Features</h2>
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">🔐</div>
                  <h3>Blockchain Security</h3>
                  <p>Notes are secured as NFTs on the blockchain, ensuring true ownership and preventing fraud</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">💰</div>
                  <h3>Fair Creator Economy</h3>
                  <p>Creators earn directly from their work with transparent, automated payments</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">⭐</div>
                  <h3>Quality Assurance</h3>
                  <p>Community-driven rating system ensures high-quality educational content</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🌐</div>
                  <h3>Decentralized Storage</h3>
                  <p>Files stored on IPFS for permanent, censorship-resistant access</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🔍</div>
                  <h3>Smart Search & Filter</h3>
                  <p>Advanced filtering by subject, price, rating, difficulty, and file type with real-time suggestions</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🤖</div>
                  <h3>AI Recommendations</h3>
                  <p>Personalized note recommendations based on your study patterns and purchase history</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">📁</div>
                  <h3>IPFS File Manager</h3>
                  <p>Decentralized file management with drag & drop uploads and ownership verification</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">📊</div>
                  <h3>Analytics Dashboard</h3>
                  <p>Track your performance, earnings, and note popularity with detailed analytics</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🔔</div>
                  <h3>Real-time Notifications</h3>
                  <p>Stay updated with sales, new reviews, recommendations, and platform updates</p>
                </div>
              </div>
            </div>

            {/* Technology Stack */}
            <div className="tech-stack">
              <h3>🛠️ Built with Modern Web3 Technology</h3>
              <div className="tech-grid">
                <div className="tech-item">
                  <span className="tech-icon">⚡</span>
                  <span>React + TypeScript</span>
                </div>
                <div className="tech-item">
                  <span className="tech-icon">🔗</span>
                  <span>Ethereum & Polygon</span>
                </div>
                <div className="tech-item">
                  <span className="tech-icon">📄</span>
                  <span>Solidity Smart Contracts</span>
                </div>
                <div className="tech-item">
                  <span className="tech-icon">🌐</span>
                  <span>IPFS Storage</span>
                </div>
                <div className="tech-item">
                  <span className="tech-icon">🦊</span>
                  <span>MetaMask Integration</span>
                </div>
                <div className="tech-item">
                  <span className="tech-icon">🛠️</span>
                  <span>Hardhat Development</span>
                </div>
              </div>
            </div>

            {/* Demo Instructions */}
            <div className="demo-instructions">
              <h3>🎮 Try the Advanced Features</h3>
              <div className="instruction-steps">
                <div className="step">
                  <span className="step-number">1</span>
                  <div className="step-content">
                    <h4>🔍 Smart Search</h4>
                    <p>Use advanced filters and real-time search suggestions in the Marketplace</p>
                  </div>
                </div>
                <div className="step">
                  <span className="step-number">2</span>
                  <div className="step-content">
                    <h4>🤖 AI Recommendations</h4>
                    <p>Get personalized note recommendations based on your preferences</p>
                  </div>
                </div>
                <div className="step">
                  <span className="step-number">3</span>
                  <div className="step-content">
                    <h4>📁 IPFS Manager</h4>
                    <p>Upload and manage your files with decentralized storage</p>
                  </div>
                </div>
                <div className="step">
                  <span className="step-number">4</span>
                  <div className="step-content">
                    <h4>📊 Track Analytics</h4>
                    <p>Monitor your performance and earnings in the Profile section</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo" onClick={() => setCurrentPage('home')}>
            <h1 className="main-title">🎓 Decentralized Notes Marketplace</h1>
            <p className="main-subtitle">Buy, sell, and trade study notes as NFTs on the blockchain</p>
          </div>
          
          <nav className="navigation">
            {navigation.map(item => {
              // Hide wallet-required items if not connected
              if (item.requiresWallet && !state.isConnected) return null;
              
              // Hide admin-only items if not admin
              if (item.adminOnly && !isAdmin) return null;

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`nav-button ${currentPage === item.id ? 'active' : ''}`}
                  title={item.label}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="header-actions">
            {state.isConnected && (
              <div className="wallet-info">
                <div className="wallet-address">
                  👤 {state.account?.slice(0, 6)}...{state.account?.slice(-4)}
                </div>
                <div className="wallet-balance">
                  💰 {parseFloat(state.balance).toFixed(4)} ETH
                </div>
              </div>
            )}
            <NotificationSystem 
              notifications={notifications} 
              onRemove={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
            />
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          {renderCurrentPage()}
        </div>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>🎓 Marketplace</h4>
            <div className="footer-links">
              <button onClick={() => setCurrentPage('marketplace')} className="footer-link">Browse Notes</button>
              <button onClick={() => setCurrentPage('create')} className="footer-link">Create Note</button>
            </div>
          </div>
          <div className="footer-section">
            <h4>🔗 Blockchain</h4>
            <div className="footer-info">
              <div>Contract: {process.env.REACT_APP_CONTRACT_ADDRESS?.slice(0, 10)}...</div>
              <div>Network: {state.chainId === 1337 ? 'Localhost' : `Chain ${state.chainId}`}</div>
            </div>
          </div>
          <div className="footer-section">
            <h4>📊 Stats</h4>
            <div className="footer-stats">
              <div>✅ Secure & Decentralized</div>
              <div>💰 Fair Creator Economy</div>
              <div>⭐ Quality Assured</div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>Built with ❤️ for the blockchain hackathon • Powered by Ethereum & IPFS</p>
        </div>
      </footer>
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