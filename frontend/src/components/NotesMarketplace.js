import React, { useState, useEffect } from 'react';
import { useNotesContract } from '../hooks/useNotesContract';
import { useWeb3 } from '../contexts/Web3Context';

function NotesMarketplace() {
  const { 
    getAllNotes, 
    purchaseNote, 
    rateNote, 
    getMyNotes, 
    isLoading 
  } = useNotesContract();
  const { state } = useWeb3();
  
  const [notes, setNotes] = useState([]);
  const [myNotes, setMyNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10 });
  const [ratingFilter, setRatingFilter] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMyNotes, setShowMyNotes] = useState(false);
  const notesPerPage = 6;

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Economics', 'History', 'Literature'];

  useEffect(() => {
    loadNotes();
    if (state.isConnected) {
      loadMyNotes();
    }
  }, [state.isConnected]);

  const loadNotes = async () => {
    try {
      const allNotes = await getAllNotes();
      setNotes(allNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const loadMyNotes = async () => {
    try {
      const userNotes = await getMyNotes();
      setMyNotes(userNotes);
    } catch (error) {
      console.error('Error loading my notes:', error);
    }
  };

  const handlePurchase = async (noteId, price) => {
    try {
      const receipt = await purchaseNote(noteId, price);
      alert(`✅ Note purchased successfully! Transaction: ${receipt.hash.slice(0, 10)}...`);
      loadNotes();
    } catch (error) {
      alert(`❌ Purchase failed: ${error.message}`);
    }
  };

  const handleRating = async (noteId, rating) => {
    try {
      const receipt = await rateNote(noteId, rating);
      alert(`✅ Rating submitted! Transaction: ${receipt.hash.slice(0, 10)}...`);
      loadNotes();
    } catch (error) {
      alert(`❌ Rating failed: ${error.message}`);
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !selectedSubject || note.subject === selectedSubject;
    const matchesPrice = parseFloat(note.price) >= priceRange.min && parseFloat(note.price) <= priceRange.max;
    const matchesRating = note.rating >= ratingFilter;
    
    return matchesSearch && matchesSubject && matchesPrice && matchesRating;
  });

  const sortedNotes = filteredNotes.sort((a, b) => {
    switch (sortBy) {
      case 'price_low': return parseFloat(a.price) - parseFloat(b.price);
      case 'price_high': return parseFloat(b.price) - parseFloat(a.price);
      case 'rating': return b.rating - a.rating;
      case 'downloads': return b.downloadCount - a.downloadCount;
      case 'newest':
      default: return b.createdAt - a.createdAt;
    }
  });

  const currentNotes = showMyNotes ? myNotes : sortedNotes;
  const indexOfLastNote = currentPage * notesPerPage;
  const indexOfFirstNote = indexOfLastNote - notesPerPage;
  const paginatedNotes = currentNotes.slice(indexOfFirstNote, indexOfLastNote);
  const totalPages = Math.ceil(currentNotes.length / notesPerPage);

  const StarRating = ({ rating, onRate, readOnly = true }) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            className={`star ${star <= rating ? 'filled' : ''} ${readOnly ? 'readonly' : ''}`}
            onClick={() => !readOnly && onRate && onRate(star)}
            disabled={readOnly}
          >
            ★
          </button>
        ))}
        {rating > 0 && <span className="rating-text">({rating}/5)</span>}
      </div>
    );
  };

  const NoteCard = ({ note }) => {
    const [showRating, setShowRating] = useState(false);
    const [pendingRating, setPendingRating] = useState(0);
    const isOwner = note.author.toLowerCase() === state.account?.toLowerCase();
    const priceInEth = parseFloat(note.price).toFixed(4);

    return (
      <div className="note-card">
        <div className="note-header">
          <h3 className="note-title">{note.title}</h3>
          <div className="note-subject">{note.subject}</div>
        </div>
        
        <div className="note-content">
          <p className="note-description">{note.description}</p>
          
          <div className="note-meta">
            <div className="note-price">💰 {priceInEth} ETH</div>
            <div className="note-downloads">📥 {note.downloadCount} downloads</div>
          </div>

          <div className="note-rating">
            <StarRating rating={note.rating} />
            {note.ratingCount > 0 && (
              <span className="rating-count">({note.ratingCount} reviews)</span>
            )}
          </div>

          <div className="note-author">
            👤 {note.author.slice(0, 6)}...{note.author.slice(-4)}
            {isOwner && <span className="owner-badge">You</span>}
          </div>
        </div>

        <div className="note-actions">
          {!isOwner && note.forSale && (
            <button
              onClick={() => handlePurchase(note.id, note.price)}
              className="button button-primary"
              disabled={isLoading}
            >
              🛒 Buy Note
            </button>
          )}

          {!isOwner && !showRating && (
            <button
              onClick={() => setShowRating(true)}
              className="button button-secondary"
            >
              ⭐ Rate Note
            </button>
          )}

          {showRating && (
            <div className="rating-section">
              <div>Rate this note:</div>
              <StarRating 
                rating={pendingRating} 
                onRate={setPendingRating}
                readOnly={false}
              />
              <div className="rating-actions">
                <button
                  onClick={() => {
                    if (pendingRating > 0) {
                      handleRating(note.id, pendingRating);
                      setShowRating(false);
                      setPendingRating(0);
                    }
                  }}
                  className="button button-success button-small"
                  disabled={pendingRating === 0}
                >
                  Submit
                </button>
                <button
                  onClick={() => {
                    setShowRating(false);
                    setPendingRating(0);
                  }}
                  className="button button-secondary button-small"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {isOwner && (
            <div className="owner-actions">
              <span className="owner-text">📝 Your Note</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="marketplace">
      <div className="marketplace-header">
        <h1>📚 Notes Marketplace</h1>
        <p>Discover and purchase high-quality study notes from verified creators</p>
      </div>

      {/* Navigation Tabs */}
      <div className="marketplace-tabs">
        <button
          onClick={() => setShowMyNotes(false)}
          className={`tab-button ${!showMyNotes ? 'active' : ''}`}
        >
          🌍 All Notes ({notes.length})
        </button>
        {state.isConnected && (
          <button
            onClick={() => setShowMyNotes(true)}
            className={`tab-button ${showMyNotes ? 'active' : ''}`}
          >
            📝 My Notes ({myNotes.length})
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="marketplace-filters">
        <div className="filter-row">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="filter-select"
          >
            <option value="">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="newest">Newest First</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="downloads">Most Downloaded</option>
          </select>
        </div>

        <div className="filter-row">
          <div className="price-filter">
            <label>💰 Price Range (ETH):</label>
            <input
              type="number"
              step="0.001"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => setPriceRange({...priceRange, min: parseFloat(e.target.value) || 0})}
              className="price-input"
            />
            <span>to</span>
            <input
              type="number"
              step="0.001"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => setPriceRange({...priceRange, max: parseFloat(e.target.value) || 10})}
              className="price-input"
            />
          </div>

          <div className="rating-filter">
            <label>⭐ Min Rating:</label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(parseInt(e.target.value))}
              className="rating-select"
            >
              <option value={0}>All Ratings</option>
              <option value={1}>1+ Stars</option>
              <option value={2}>2+ Stars</option>
              <option value={3}>3+ Stars</option>
              <option value={4}>4+ Stars</option>
              <option value={5}>5 Stars Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        {showMyNotes ? (
          <p>📝 Showing {myNotes.length} of your notes</p>
        ) : (
          <p>📚 Showing {filteredNotes.length} of {notes.length} notes</p>
        )}
      </div>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="loading-section">
          <div className="loading-spinner">🔄</div>
          <p>Loading notes from blockchain...</p>
        </div>
      ) : paginatedNotes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No notes found</h3>
          <p>
            {showMyNotes 
              ? "You haven't created any notes yet. Start by creating your first note!"
              : "No notes match your search criteria. Try adjusting your filters."
            }
          </p>
        </div>
      ) : (
        <>
          <div className="notes-grid">
            {paginatedNotes.map(note => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                ← Previous
              </button>
              
              <div className="pagination-info">
                Page {currentPage} of {totalPages}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default NotesMarketplace;
