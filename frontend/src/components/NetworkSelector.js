import React, { useState } from 'react';
import { SUPPORTED_NETWORKS, getCurrentNetwork, switchToNetwork } from '../config/networks';

const NetworkSelector = ({ currentChainId, onNetworkChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  
  const currentNetwork = getCurrentNetwork();
  
  const handleNetworkSwitch = async (networkKey) => {
    if (switching) return;
    
    setSwitching(true);
    try {
      await switchToNetwork(networkKey);
      onNetworkChange?.(SUPPORTED_NETWORKS[networkKey]);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch network:', error);
      alert(`Failed to switch network: ${error.message}`);
    } finally {
      setSwitching(false);
    }
  };

  const getNetworkStatus = (network) => {
    if (currentChainId === network.chainId) {
      return '✅ Connected';
    }
    return 'Switch';
  };

  const getNetworkColor = (network) => {
    if (currentChainId === network.chainId) {
      return 'border-green-500 bg-green-50';
    }
    return 'border-gray-300 hover:border-blue-500';
  };

  return (
    <div className="network-selector">
      {/* Current Network Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="network-button"
        disabled={switching}
      >
        <div className="network-info">
          <div className="network-indicator">
            <div className={`indicator-dot ${currentChainId === currentNetwork.chainId ? 'connected' : 'disconnected'}`}></div>
            <span className="network-name">{currentNetwork.displayName}</span>
          </div>
          <div className="dropdown-arrow">
            {isOpen ? '▲' : '▼'}
          </div>
        </div>
      </button>

      {/* Network Options Dropdown */}
      {isOpen && (
        <div className="network-dropdown">
          <div className="dropdown-header">
            <h3>Select Network</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="close-button"
            >
              ✕
            </button>
          </div>
          
          <div className="network-list">
            {Object.entries(SUPPORTED_NETWORKS).map(([key, network]) => (
              <div
                key={key}
                className={`network-option ${getNetworkColor(network)}`}
                onClick={() => handleNetworkSwitch(key)}
              >
                <div className="network-details">
                  <div className="network-header">
                    <h4>{network.displayName}</h4>
                    <span className="chain-id">Chain ID: {network.chainId}</span>
                  </div>
                  <div className="network-meta">
                    <span className="currency">{network.currency.symbol}</span>
                    {network.testnet && <span className="testnet-badge">Testnet</span>}
                  </div>
                </div>
                
                <div className="network-status">
                  {switching ? '⏳' : getNetworkStatus(network)}
                </div>
              </div>
            ))}
          </div>

          {/* Faucet Links for Current Network */}
          {currentNetwork.testnet && currentNetwork.faucets.length > 0 && (
            <div className="faucet-section">
              <h4>🚰 Get Free {currentNetwork.currency.symbol}</h4>
              <div className="faucet-links">
                {currentNetwork.faucets.map((faucet, index) => (
                  <a
                    key={index}
                    href={faucet}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="faucet-link"
                  >
                    Faucet {index + 1}
                  </a>
                ))}
              </div>
            </div>
          )}
          
          <div className="network-help">
            <p>💡 <strong>For Global Testing:</strong></p>
            <p>• <strong>Sepolia</strong>: Best for demos (free ETH)</p>
            <p>• <strong>Mumbai</strong>: Fast & cheap (free MATIC)</p>
            <p>• <strong>Localhost</strong>: Development only</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .network-selector {
          position: relative;
          z-index: 1000;
        }

        .network-button {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 8px 12px;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 180px;
        }

        .network-button:hover {
          border-color: #3b82f6;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
        }

        .network-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .network-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .network-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .indicator-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .indicator-dot.connected {
          background: #10b981;
          box-shadow: 0 0 4px rgba(16, 185, 129, 0.5);
        }

        .indicator-dot.disconnected {
          background: #ef4444;
        }

        .network-name {
          font-weight: 500;
          color: #374151;
        }

        .dropdown-arrow {
          color: #9ca3af;
          font-size: 12px;
        }

        .network-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          margin-top: 4px;
          max-height: 500px;
          overflow-y: auto;
        }

        .dropdown-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .dropdown-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          color: #9ca3af;
          padding: 4px;
        }

        .close-button:hover {
          color: #374151;
        }

        .network-list {
          padding: 8px;
        }

        .network-option {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .network-option:last-child {
          margin-bottom: 0;
        }

        .network-option:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .network-details {
          flex: 1;
        }

        .network-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .network-header h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }

        .chain-id {
          font-size: 12px;
          color: #6b7280;
        }

        .network-meta {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .currency {
          font-size: 12px;
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          color: #374151;
        }

        .testnet-badge {
          font-size: 10px;
          background: #fef3c7;
          color: #92400e;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 500;
        }

        .network-status {
          font-size: 12px;
          font-weight: 500;
          color: #059669;
        }

        .faucet-section {
          padding: 16px;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .faucet-section h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #374151;
        }

        .faucet-links {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .faucet-link {
          background: #3b82f6;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          text-decoration: none;
          font-size: 12px;
          transition: background 0.2s;
        }

        .faucet-link:hover {
          background: #2563eb;
        }

        .network-help {
          padding: 16px;
          border-top: 1px solid #e5e7eb;
          background: #f0f9ff;
        }

        .network-help p {
          margin: 0 0 4px 0;
          font-size: 12px;
          color: #374151;
        }

        .network-help strong {
          color: #1f2937;
        }

        @media (max-width: 640px) {
          .network-button {
            min-width: 150px;
          }
          
          .network-dropdown {
            left: -100px;
            right: -100px;
          }
        }
      `}</style>
    </div>
  );
};

export default NetworkSelector;
