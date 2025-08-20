import React, { useState, useEffect } from 'react';
import { useNotesContract } from '../hooks/useNotesContract';
import { useWeb3 } from '../contexts/Web3Context';

function AdminDashboard() {
  const { getAllNotes, contract } = useNotesContract();
  const { state } = useWeb3();
  
  const [allNotes, setAllNotes] = useState([]);
  const [users, setUsers] = useState([]);
  const [platformStats, setPlatformStats] = useState({
    totalNotes: 0,
    totalUsers: 0,
    totalTransactions: 0,
    totalVolume: '0',
    platformFees: '0'
  });
  const [selectedNote, setSelectedNote] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Check if current user is admin (simplified - in real app, this would be in contract)
  const isAdmin = state.account?.toLowerCase() === process.env.REACT_APP_ADMIN_ADDRESS?.toLowerCase();

  useEffect(() => {
    if (state.isConnected && isAdmin) {
      loadAdminData();
    }
  }, [state.isConnected, isAdmin]);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const notes = await getAllNotes();
      setAllNotes(notes);

      // Extract unique users
      const uniqueUsers = [...new Set(notes.map(note => note.author))];
      const usersData = uniqueUsers.map(address => ({
        address,
        notesCount: notes.filter(note => note.author === address).length,
        totalDownloads: notes.filter(note => note.author === address)
          .reduce((sum, note) => sum + note.downloadCount, 0),
        averageRating: calculateUserAverageRating(notes.filter(note => note.author === address))
      }));
      setUsers(usersData);

      // Calculate platform statistics
      const totalVolume = notes.reduce((sum, note) => 
        sum + (parseFloat(note.price) * note.downloadCount), 0
      );
      
      setPlatformStats({
        totalNotes: notes.length,
        totalUsers: uniqueUsers.length,
        totalTransactions: notes.reduce((sum, note) => sum + note.downloadCount, 0),
        totalVolume: totalVolume.toFixed(4),
        platformFees: (totalVolume * 0.025).toFixed(4) // 2.5% platform fee
      });

    } catch (error) {
      console.error('Error loading admin data:', error);
    }
    setIsLoading(false);
  };

  const calculateUserAverageRating = (userNotes) => {
    if (userNotes.length === 0) return 0;
    const totalRating = userNotes.reduce((sum, note) => sum + note.rating, 0);
    return (totalRating / userNotes.length).toFixed(1);
  };

  const handleModerateNote = async (noteId, action) => {
    try {
      // In a real implementation, this would call contract function
      alert(`🔧 Admin action "${action}" would be performed on note ${noteId}`);
      loadAdminData(); // Refresh data
    } catch (error) {
      alert(`❌ Admin action failed: ${error.message}`);
    }
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!state.isConnected) {
    return (
      <div className="admin-not-connected">
        <div className="card">
          <h2>🔒 Admin Dashboard</h2>
          <p>Please connect your wallet to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-unauthorized">
        <div className="card">
          <h2>🚫 Access Denied</h2>
          <p>You don't have admin privileges to access this dashboard.</p>
          <p>Current account: {formatAddress(state.account)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>🛡️ Admin Dashboard</h1>
        <p>Platform management and moderation tools</p>
      </div>

      {/* Platform Statistics */}
      <div className="admin-stats">
        <div className="stat-card admin">
          <div className="stat-icon">📚</div>
          <div className="stat-value">{platformStats.totalNotes}</div>
          <div className="stat-label">Total Notes</div>
        </div>
        <div className="stat-card admin">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{platformStats.totalUsers}</div>
          <div className="stat-label">Active Users</div>
        </div>
        <div className="stat-card admin">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{platformStats.totalVolume}</div>
          <div className="stat-label">Total Volume (ETH)</div>
        </div>
        <div className="stat-card admin">
          <div className="stat-icon">🏦</div>
          <div className="stat-value">{platformStats.platformFees}</div>
          <div className="stat-label">Platform Fees (ETH)</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`tab-button ${activeTab === 'notes' ? 'active' : ''}`}
        >
          📝 All Notes ({allNotes.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
        >
          👥 Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('moderation')}
          className={`tab-button ${activeTab === 'moderation' ? 'active' : ''}`}
        >
          🛡️ Moderation
        </button>
      </div>

      {/* Tab Content */}
      <div className="admin-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="card">
              <h3>📈 Platform Analytics</h3>
              <div className="analytics-grid">
                <div className="metric">
                  <strong>Average Note Price:</strong>
                  <span>{allNotes.length > 0 ? (allNotes.reduce((sum, note) => sum + parseFloat(note.price), 0) / allNotes.length).toFixed(4) : '0'} ETH</span>
                </div>
                <div className="metric">
                  <strong>Most Popular Subject:</strong>
                  <span>{allNotes.length > 0 ? 
                    Object.entries(allNotes.reduce((acc, note) => {
                      acc[note.subject] = (acc[note.subject] || 0) + note.downloadCount;
                      return acc;
                    }, {})).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'
                    : 'None'
                  }</span>
                </div>
                <div className="metric">
                  <strong>Platform Growth:</strong>
                  <span>📈 {((platformStats.totalUsers / Math.max(1, platformStats.totalUsers - 1)) * 100 - 100).toFixed(1)}% this period</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3>🎯 Recent Activity</h3>
              <div className="activity-list">
                <div className="activity-item">
                  <span className="activity-icon">📝</span>
                  <span>New note created: "Advanced Physics"</span>
                  <span className="activity-time">2 minutes ago</span>
                </div>
                <div className="activity-item">
                  <span className="activity-icon">💰</span>
                  <span>Purchase completed: 0.05 ETH</span>
                  <span className="activity-time">15 minutes ago</span>
                </div>
                <div className="activity-item">
                  <span className="activity-icon">⭐</span>
                  <span>New 5-star rating submitted</span>
                  <span className="activity-time">1 hour ago</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="notes-management">
            <div className="section-header">
              <h3>📝 Notes Management</h3>
              <div className="management-controls">
                <button onClick={loadAdminData} className="button button-secondary">
                  🔄 Refresh
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="loading-section">
                <div className="loading-spinner">🔄</div>
                <p>Loading notes...</p>
              </div>
            ) : (
              <div className="notes-table">
                <div className="table-header">
                  <div>Title</div>
                  <div>Author</div>
                  <div>Price</div>
                  <div>Downloads</div>
                  <div>Rating</div>
                  <div>Actions</div>
                </div>
                {allNotes.map(note => (
                  <div key={note.id} className="table-row">
                    <div className="note-title-cell">
                      <strong>{note.title}</strong>
                      <small>{note.subject}</small>
                    </div>
                    <div>{formatAddress(note.author)}</div>
                    <div>{parseFloat(note.price).toFixed(4)} ETH</div>
                    <div>{note.downloadCount}</div>
                    <div>⭐ {note.rating}/5 ({note.ratingCount})</div>
                    <div className="action-buttons">
                      <button
                        onClick={() => setSelectedNote(note)}
                        className="button button-small button-info"
                      >
                        👁️ View
                      </button>
                      <button
                        onClick={() => handleModerateNote(note.id, 'flag')}
                        className="button button-small button-warning"
                      >
                        🚩 Flag
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-management">
            <div className="section-header">
              <h3>👥 Users Management</h3>
            </div>

            <div className="users-table">
              <div className="table-header">
                <div>Address</div>
                <div>Notes Created</div>
                <div>Total Downloads</div>
                <div>Avg Rating</div>
                <div>Actions</div>
              </div>
              {users.map(user => (
                <div key={user.address} className="table-row">
                  <div className="user-address">
                    {formatAddress(user.address)}
                  </div>
                  <div>{user.notesCount}</div>
                  <div>{user.totalDownloads}</div>
                  <div>⭐ {user.averageRating}/5</div>
                  <div className="action-buttons">
                    <button className="button button-small button-info">
                      👁️ Profile
                    </button>
                    <button className="button button-small button-warning">
                      ⚠️ Warn
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'moderation' && (
          <div className="moderation-section">
            <div className="section-header">
              <h3>🛡️ Moderation Queue</h3>
            </div>

            <div className="moderation-stats">
              <div className="mod-stat">
                <strong>Pending Reports:</strong> 0
              </div>
              <div className="mod-stat">
                <strong>Resolved Today:</strong> 3
              </div>
              <div className="mod-stat">
                <strong>Auto-Moderation:</strong> ✅ Active
              </div>
            </div>

            <div className="moderation-queue">
              <div className="empty-state">
                <div className="empty-icon">✅</div>
                <h4>No pending moderation items</h4>
                <p>All content has been reviewed and approved.</p>
              </div>
            </div>

            <div className="moderation-tools">
              <h4>🔧 Moderation Tools</h4>
              <div className="tools-grid">
                <button className="tool-button">
                  📊 Generate Report
                </button>
                <button className="tool-button">
                  🚫 Ban User
                </button>
                <button className="tool-button">
                  💰 Adjust Fees
                </button>
                <button className="tool-button">
                  ⚙️ Platform Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Note Detail Modal */}
      {selectedNote && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>📝 Note Details</h3>
              <button
                onClick={() => setSelectedNote(null)}
                className="close-modal"
              >
                ✕
              </button>
            </div>
            <div className="modal-content">
              <div className="note-detail">
                <h4>{selectedNote.title}</h4>
                <p><strong>Description:</strong> {selectedNote.description}</p>
                <p><strong>Subject:</strong> {selectedNote.subject}</p>
                <p><strong>Author:</strong> {formatAddress(selectedNote.author)}</p>
                <p><strong>Price:</strong> {parseFloat(selectedNote.price).toFixed(4)} ETH</p>
                <p><strong>Downloads:</strong> {selectedNote.downloadCount}</p>
                <p><strong>Rating:</strong> ⭐ {selectedNote.rating}/5 ({selectedNote.ratingCount} reviews)</p>
                <p><strong>For Sale:</strong> {selectedNote.forSale ? '✅ Yes' : '❌ No'}</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="button button-warning">
                🚩 Flag Content
              </button>
              <button className="button button-danger">
                🚫 Remove Note
              </button>
              <button
                onClick={() => setSelectedNote(null)}
                className="button button-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
