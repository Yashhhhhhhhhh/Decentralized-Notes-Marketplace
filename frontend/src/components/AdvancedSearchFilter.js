import React, { useState, useEffect } from 'react';

const AdvancedSearchFilter = ({ notes, onFilteredNotes, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [authorFilter, setAuthorFilter] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Extract unique subjects and authors
  const subjects = [...new Set(notes.map(note => note.subject))].filter(Boolean);
  const authors = [...new Set(notes.map(note => note.author))].filter(Boolean);

  // Search suggestions
  useEffect(() => {
    if (searchTerm.length > 2) {
      const titleSuggestions = notes
        .filter(note => note.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .map(note => note.title)
        .slice(0, 5);
      setSuggestions(titleSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchTerm, notes]);

  // Apply filters
  useEffect(() => {
    let filtered = [...notes];

    // Text search
    if (searchTerm) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Subject filter
    if (selectedSubject) {
      filtered = filtered.filter(note => note.subject === selectedSubject);
    }

    // Price range filter
    filtered = filtered.filter(note => {
      const price = parseFloat(note.price);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter(note => (note.rating || 0) >= minRating);
    }

    // Author filter
    if (authorFilter) {
      filtered = filtered.filter(note => 
        note.author.toLowerCase().includes(authorFilter.toLowerCase())
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'price-low':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-high':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'popular':
          return (b.downloadCount || 0) - (a.downloadCount || 0);
        default:
          return 0;
      }
    });

    onFilteredNotes(filtered);
  }, [searchTerm, selectedSubject, priceRange, minRating, sortBy, authorFilter, notes, onFilteredNotes]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSubject('');
    setPriceRange([0, 1000]);
    setMinRating(0);
    setSortBy('newest');
    setAuthorFilter('');
  };

  return (
    <div className="search-filter-container">
      <div className="search-section">
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Search notes by title, description, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="search-button">🔍</button>
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => {
                    setSearchTerm(suggestion);
                    setShowSuggestions(false);
                  }}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Subject</label>
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
        </div>

        <div className="filter-group">
          <label>Price Range (ETH)</label>
          <div className="price-range">
            <input
              type="number"
              min="0"
              step="0.001"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([parseFloat(e.target.value), priceRange[1]])}
              className="price-input"
            />
            <span>to</span>
            <input
              type="number"
              min="0"
              step="0.001"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseFloat(e.target.value)])}
              className="price-input"
            />
          </div>
        </div>

        <div className="filter-group">
          <label>Minimum Rating</label>
          <div className="rating-filter">
            {[1, 2, 3, 4, 5].map(rating => (
              <button
                key={rating}
                className={`rating-star ${rating <= minRating ? 'active' : ''}`}
                onClick={() => setMinRating(rating === minRating ? 0 : rating)}
              >
                ⭐
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label>Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="popular">Most Downloaded</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Author</label>
          <input
            type="text"
            placeholder="Filter by author address..."
            value={authorFilter}
            onChange={(e) => setAuthorFilter(e.target.value)}
            className="filter-input"
          />
        </div>

        <button onClick={clearFilters} className="clear-filters-btn">
          Clear All Filters
        </button>
      </div>
    </div>
  );
};

export default AdvancedSearchFilter;
