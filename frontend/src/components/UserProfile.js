import React, { useState, useEffect } from 'react';
import { useNotesContract } from '../hooks/useNotesContract';
import { useWeb3 } from '../contexts/Web3Context';

function UserProfile() {
  const { getMyNotes, getAllNotes, withdrawEarnings } = useNotesContract();
  const { state } = useWeb3();
  
  const [myNotes, setMyNotes] = useState([]);
  const [purchasedNotes, setPurchasedNotes] = useState([]);
  const [earnings, setEarnings] = useState('0');
  const [stats, setStats] = useState({
    totalSales: 0,
    totalEarnings: '0',
    totalRatings: 0,
    averageRating: 0,
    totalDownloads: 0
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (state.isConnected) {
      loadUserData();
    }
  }, [state.isConnected]);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      // Load user's created notes
      const userNotes = await getMyNotes();
      setMyNotes(userNotes);

      // Calculate statistics from user's notes
      const totalDownloads = userNotes.reduce((sum, note) => sum + note.downloadCount, 0);
      const totalRatings = userNotes.reduce((sum, note) => sum + note.ratingCount, 0);
      const totalRatingSum = userNotes.reduce((sum, note) => sum + (note.rating * note.ratingCount), 0);
      const averageRating = totalRatings > 0 ? (totalRatingSum / totalRatings).toFixed(1) : 0;
      
      setStats({
        totalSales: totalDownloads,
        totalEarnings: '0', // This would need to be tracked separately
        totalRatings,
        averageRating,
        totalDownloads
      });

      // Load all notes to find purchased ones (simplified for demo)
      const allNotes = await getAllNotes();
      // In a real app, you'd track purchases separately
      setPurchasedNotes([]);
      
    } catch (error) {
      console.error('Error loading user data:', error);
    }
    setIsLoading(false);
  };

  const handleWithdrawEarnings = async () => {
    try {
      setIsLoading(true);
      const receipt = await withdrawEarnings();
      alert(`✅ Earnings withdrawn successfully! Transaction: ${receipt.hash.slice(0, 10)}...`);
      setEarnings('0');
    } catch (error) {
      alert(`❌ Withdrawal failed: ${error.message}`);
    }
    setIsLoading(false);
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const StarRating = ({ rating }) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : ''} readonly`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (!state.isConnected) {
    return (
      <div className="profile-not-connected">
        <div className="card">
          <h2>👤 User Profile</h2>
          <p>Please connect your wallet to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          👤
        </div>
        <div className="profile-info">
          <h1 className="profile-name">
            {formatAddress(state.account)}
          </h1>
          <div className="profile-balance">
            💰 {parseFloat(state.balance).toFixed(4)} ETH
          </div>
          <div className="profile-network">
            🌐 Connected to {state.chainId === 1337 ? 'Localhost' : `Network ${state.chainId}`}
          </div>
        </div>
        <div className="profile-actions">
          <button
            onClick={handleWithdrawEarnings}
            disabled={parseFloat(earnings) === 0 || isLoading}
            className="button button-success"
          >
            💸 Withdraw Earnings
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-value">{myNotes.length}</div>
          <div className="stat-label">Notes Created</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📥</div>
          <div className="stat-value">{stats.totalDownloads}</div>
          <div className="stat-label">Total Downloads</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{stats.averageRating}</div>
          <div className="stat-label">Avg Rating</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">0.0</div>
          <div className="stat-label">ETH Earned</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="profile-tabs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab('mynotes')}
          className={`tab-button ${activeTab === 'mynotes' ? 'active' : ''}`}
        >
          📝 My Notes ({myNotes.length})
        </button>
        <button
          onClick={() => setActiveTab('purchased')}
          className={`tab-button ${activeTab === 'purchased' ? 'active' : ''}`}
        >
          🛒 Purchased ({purchasedNotes.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
        >
          📈 Analytics
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="card">
              <h3>🎯 Performance Overview</h3>
              <div className="performance-metrics">
                <div className="metric">
                  <strong>Creator Score:</strong>
                  <div className="score-bar">
                    <div 
                      className="score-fill" 
                      style={{width: `${Math.min(100, (stats.averageRating / 5) * 100)}%`}}
                    ></div>
                  </div>
                  <span>{stats.averageRating}/5</span>
                </div>
                
                <div className="achievements">
                  <h4>🏆 Achievements</h4>
                  <div className="achievement-list">
                    {myNotes.length >= 1 && (
                      <div className="achievement">✅ First Note Created</div>
                    )}
                    {myNotes.length >= 5 && (
                      <div className="achievement">🌟 Prolific Creator (5+ notes)</div>
                    )}
                    {stats.totalDownloads >= 10 && (
                      <div className="achievement">🔥 Popular Creator (10+ downloads)</div>
                    )}
                    {stats.averageRating >= 4 && (
                      <div className="achievement">⭐ Quality Creator (4+ rating)</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mynotes' && (
          <div className="my-notes-section">
            <div className="section-header">
              <h3>📝 My Created Notes</h3>
              <div className="notes-summary">
                {myNotes.length} notes • {stats.totalDownloads} total downloads
              </div>
            </div>
            
            {isLoading ? (
              <div className="loading-section">
                <div className="loading-spinner">🔄</div>
                <p>Loading your notes...</p>
              </div>
            ) : myNotes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h4>No notes created yet</h4>
                <p>Create your first note to start earning!</p>
              </div>
            ) : (
              <div className="notes-list">
                {myNotes.map(note => (
                  <div key={note.id} className="note-item">
                    <div className="note-info">
                      <h4 className="note-title">{note.title}</h4>
                      <p className="note-description">{note.description}</p>
                      <div className="note-meta">
                        <span className="note-subject">📚 {note.subject}</span>
                        <span className="note-price">💰 {parseFloat(note.price).toFixed(4)} ETH</span>
                      </div>
                    </div>
                    <div className="note-stats">
                      <div className="stat">
                        <strong>📥 {note.downloadCount}</strong>
                        <span>Downloads</span>
                      </div>
                      <div className="stat">
                        <StarRating rating={note.rating} />
                        <span>({note.ratingCount} reviews)</span>
                      </div>
                      <div className="stat">
                        <strong>{note.forSale ? '🟢' : '🔴'}</strong>
                        <span>{note.forSale ? 'For Sale' : 'Not Listed'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'purchased' && (
          <div className="purchased-section">
            <div className="section-header">
              <h3>🛒 Purchased Notes</h3>
            </div>
            
            <div className="empty-state">
              <div className="empty-icon">🛒</div>
              <h4>No purchased notes yet</h4>
              <p>Purchase notes from the marketplace to access them here.</p>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <div className="section-header">
              <h3>📈 Analytics Dashboard</h3>
            </div>
            
            <div className="analytics-grid">
              <div className="card">
                <h4>📊 Performance Trends</h4>
                <div className="trend-chart">
                  <div className="chart-placeholder">
                    📈 Chart visualization would go here
                    <br />
                    <small>Download trends, rating history, earnings over time</small>
                  </div>
                </div>
              </div>
              
              <div className="card">
                <h4>🎯 Subject Performance</h4>
                <div className="subject-breakdown">
                  {myNotes.reduce((acc, note) => {
                    acc[note.subject] = (acc[note.subject] || 0) + 1;
                    return acc;
                  }, Object.create(null)).__proto__ = null, Object.entries(myNotes.reduce((acc, note) => {
                    acc[note.subject] = (acc[note.subject] || 0) + 1;
                    return acc;
                  }, {})).map(([subject, count]) => (
                    <div key={subject} className="subject-stat">
                      <span>{subject}</span>
                      <strong>{count} notes</strong>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="card">
                <h4>💡 Insights</h4>
                <div className="insights">
                  <div className="insight">
                    <span className="insight-icon">⚡</span>
                    <span>Most popular subject: {
                      myNotes.length > 0 
                        ? Object.entries(myNotes.reduce((acc, note) => {
                            acc[note.subject] = (acc[note.subject] || 0) + note.downloadCount;
                            return acc;
                          }, {})).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'
                        : 'None'
                    }</span>
                  </div>
                  <div className="insight">
                    <span className="insight-icon">🎯</span>
                    <span>Avg downloads per note: {
                      myNotes.length > 0 
                        ? (stats.totalDownloads / myNotes.length).toFixed(1)
                        : '0'
                    }</span>
                  </div>
                  <div className="insight">
                    <span className="insight-icon">⭐</span>
                    <span>Quality score: {stats.averageRating > 4 ? 'Excellent' : stats.averageRating > 3 ? 'Good' : 'Improving'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
