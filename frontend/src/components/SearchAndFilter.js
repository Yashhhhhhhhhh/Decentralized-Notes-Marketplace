import React, { useState, useEffect } from 'react';
import { useNotesContract } from '../hooks/useNotesContract';
import { useWeb3 } from '../contexts/Web3Context';

function SearchAndFilter() {
  const { getAllNotes } = useNotesContract();
  const [allNotes, setAllNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    subject: '',
    priceMin: '',
    priceMax: '',
    ratingMin: 0,
    authorAddress: '',
    sortBy: 'newest'
  });
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'Economics', 'History', 'Literature', 'Psychology', 'Engineering',
    'Business', 'Art', 'Music', 'Philosophy', 'Languages'
  ];

  const sortOptions = [
    { value: 'newest', label: '🕒 Newest First' },
    { value: 'oldest', label: '📅 Oldest First' },
    { value: 'price_low', label: '💰 Price: Low to High' },
    { value: 'price_high', label: '💸 Price: High to Low' },
    { value: 'rating', label: '⭐ Highest Rated' },
    { value: 'downloads', label: '📥 Most Downloaded' },
    { value: 'title', label: '🔤 Alphabetical' }
  ];

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allNotes, searchTerm, filters]);

  useEffect(() => {
    generateSuggestions();
  }, [searchTerm, allNotes]);

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const notes = await getAllNotes();
      setAllNotes(notes);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
    setIsLoading(false);
  };

  const generateSuggestions = () => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const titleSuggestions = allNotes
      .filter(note => note.title.toLowerCase().includes(term))
      .map(note => ({ type: 'title', text: note.title, note }))
      .slice(0, 3);

    const subjectSuggestions = subjects
      .filter(subject => subject.toLowerCase().includes(term))
      .map(subject => ({ type: 'subject', text: subject }))
      .slice(0, 2);

    const authorSuggestions = [...new Set(allNotes.map(note => note.author))]
      .filter(author => author.toLowerCase().includes(term))
      .map(author => ({ type: 'author', text: `${author.slice(0, 6)}...${author.slice(-4)}`, value: author }))
      .slice(0, 2);

    setSuggestions([...titleSuggestions, ...subjectSuggestions, ...authorSuggestions]);
  };

  const applyFilters = () => {
    let filtered = [...allNotes];

    // Text search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(term) ||
        note.description.toLowerCase().includes(term) ||
        note.subject.toLowerCase().includes(term)
      );
    }

    // Subject filter
    if (filters.subject) {
      filtered = filtered.filter(note => note.subject === filters.subject);
    }

    // Price range filter
    if (filters.priceMin !== '') {
      filtered = filtered.filter(note => parseFloat(note.price) >= parseFloat(filters.priceMin));
    }
    if (filters.priceMax !== '') {
      filtered = filtered.filter(note => parseFloat(note.price) <= parseFloat(filters.priceMax));
    }

    // Rating filter
    if (filters.ratingMin > 0) {
      filtered = filtered.filter(note => note.rating >= filters.ratingMin);
    }

    // Author filter
    if (filters.authorAddress) {
      filtered = filtered.filter(note => note.author.toLowerCase().includes(filters.authorAddress.toLowerCase()));
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'price_low':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price_high':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'rating':
          return b.rating - a.rating;
        case 'downloads':
          return b.downloadCount - a.downloadCount;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'newest':
        default:
          return b.createdAt - a.createdAt;
      }
    });

    setFilteredNotes(filtered);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      subject: '',
      priceMin: '',
      priceMax: '',
      ratingMin: 0,
      authorAddress: '',
      sortBy: 'newest'
    });
    setSuggestions([]);
  };

  const handleSuggestionClick = (suggestion) => {
    switch (suggestion.type) {
      case 'title':
        setSearchTerm(suggestion.text);
        break;
      case 'subject':
        setFilters(prev => ({ ...prev, subject: suggestion.text }));
        setSearchTerm('');
        break;
      case 'author':
        setFilters(prev => ({ ...prev, authorAddress: suggestion.value }));
        setSearchTerm('');
        break;
    }
    setSuggestions([]);
  };

  const getFilterCount = () => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (filters.subject) count++;
    if (filters.priceMin !== '' || filters.priceMax !== '') count++;
    if (filters.ratingMin > 0) count++;
    if (filters.authorAddress) count++;
    return count;
  };

  return (
    <div className="search-and-filter-container">
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        suggestions={suggestions}
        handleSuggestionClick={handleSuggestionClick}
      />
      
      <FilterPanel
        filters={filters}
        handleFilterChange={handleFilterChange}
        subjects={subjects}
        sortOptions={sortOptions}
        clearFilters={clearFilters}
        getFilterCount={getFilterCount}
      />

      <div className="search-results">
        {isLoading ? (
          <div className="loading-state">
            <span>🔄 Loading notes...</span>
          </div>
        ) : (
          <div className="results-summary">
            Found {filteredNotes.length} notes
            {getFilterCount() > 0 && ` with ${getFilterCount()} filter${getFilterCount() > 1 ? 's' : ''} applied`}
          </div>
        )}
        
        <div className="notes-grid">
          {filteredNotes.map((note, index) => (
            <div key={note.id || index} className="note-card">
              <h3>{note.title}</h3>
              <p>{note.description}</p>
              <div className="note-meta">
                <span className="note-subject">{note.subject}</span>
                <span className="note-price">{note.price} ETH</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SearchBar({ searchTerm, setSearchTerm, suggestions, handleSuggestionClick }) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  return (
    <div className="search-container">
      <div className="search-input-container">
        <div className="search-icon">🔍</div>
        <input
          type="text"
          placeholder="Search notes by title, description, or subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="search-input"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="search-clear"
          >
            ✕
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="search-suggestions">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="suggestion-item"
            >
              <span className="suggestion-icon">
                {suggestion.type === 'title' ? '📝' : 
                 suggestion.type === 'subject' ? '📚' : '👤'}
              </span>
              <span className="suggestion-text">{suggestion.text}</span>
              <span className="suggestion-type">{suggestion.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPanel({ filters, handleFilterChange, subjects, sortOptions, clearFilters, getFilterCount }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="filter-toggle"
        >
          <span>🔧 Filters</span>
          {getFilterCount() > 0 && (
            <span className="filter-badge">{getFilterCount()}</span>
          )}
          <span className={`filter-arrow ${isExpanded ? 'expanded' : ''}`}>▼</span>
        </button>
        
        {getFilterCount() > 0 && (
          <button onClick={clearFilters} className="clear-filters">
            Clear All
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="filter-content">
          <div className="filter-grid">
            {/* Subject Filter */}
            <div className="filter-group">
              <label className="filter-label">📚 Subject</label>
              <select
                value={filters.subject}
                onChange={(e) => handleFilterChange('subject', e.target.value)}
                className="filter-select"
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="filter-group">
              <label className="filter-label">💰 Price Range (ETH)</label>
              <div className="price-range">
                <input
                  type="number"
                  step="0.001"
                  placeholder="Min"
                  value={filters.priceMin}
                  onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                  className="price-input"
                />
                <span className="price-separator">-</span>
                <input
                  type="number"
                  step="0.001"
                  placeholder="Max"
                  value={filters.priceMax}
                  onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                  className="price-input"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div className="filter-group">
              <label className="filter-label">⭐ Minimum Rating</label>
              <select
                value={filters.ratingMin}
                onChange={(e) => handleFilterChange('ratingMin', parseInt(e.target.value))}
                className="filter-select"
              >
                <option value={0}>Any Rating</option>
                <option value={1}>1+ Stars</option>
                <option value={2}>2+ Stars</option>
                <option value={3}>3+ Stars</option>
                <option value={4}>4+ Stars</option>
                <option value={5}>5 Stars Only</option>
              </select>
            </div>

            {/* Author Filter */}
            <div className="filter-group">
              <label className="filter-label">👤 Author Address</label>
              <input
                type="text"
                placeholder="0x... or partial address"
                value={filters.authorAddress}
                onChange={(e) => handleFilterChange('authorAddress', e.target.value)}
                className="filter-input"
              />
            </div>

            {/* Sort Options */}
            <div className="filter-group">
              <label className="filter-label">📊 Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="filter-select"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SearchAndFilterComponent({ onSearch, onResultsChange }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = (query, newFilters) => {
    setSearchQuery(query);
    setFilters(newFilters);
    if (onSearch) {
      onSearch({ query, ...newFilters });
    }
  };

  useEffect(() => {
    if (onResultsChange) {
      onResultsChange(filteredNotes);
    }
  }, [filteredNotes, onResultsChange]);

  return (
    <div className="search-and-filter">
      <SearchBar
        searchTerm={searchQuery}
        setSearchTerm={setSearchQuery}
        suggestions={suggestions}
        handleSuggestionClick={(suggestion) => handleSearch(suggestion, filters)}
      />
      
      <FilterPanel
        filters={filters}
        handleFilterChange={(newFilters) => {
          setFilters(newFilters);
          handleSearch(searchQuery, newFilters);
        }}
        subjects={['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'Biology']}
        sortOptions={['price_asc', 'price_desc', 'rating_desc', 'newest']}
        clearFilters={() => {
          setFilters({});
          handleSearch(searchQuery, {});
        }}
        getFilterCount={() => Object.keys(filters).length}
      />

      <div className="search-results-summary">
        {loading ? (
          <span>🔄 Loading notes...</span>
        ) : (
          <span>
            📊 Found {filteredNotes.length} notes
            {Object.keys(filters).length > 0 && (
              <span className="filter-applied"> (filtered)</span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}

export default SearchAndFilter;
