import React, { useState, useEffect } from 'react';
import { useNotesContract } from '../hooks/useNotesContract';
import { useWeb3 } from '../contexts/Web3Context';

function RecommendationEngine() {
  const { getAllNotes, getMyNotes } = useNotesContract();
  const { state } = useWeb3();
  
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState({
    purchaseHistory: [],
    preferences: {
      subjects: {},
      priceRange: { min: 0, max: 1 },
      authors: {}
    }
  });

  useEffect(() => {
    if (state.isConnected) {
      generateRecommendations();
    }
  }, [state.isConnected]);

  const generateRecommendations = async () => {
    setIsLoading(true);
    try {
      const allNotes = await getAllNotes();
      const userNotes = state.isConnected ? await getMyNotes() : [];
      
      // Build user profile from interaction history
      const profile = buildUserProfile(userNotes, allNotes);
      setUserProfile(profile);
      
      // Generate different types of recommendations
      const recommendedNotes = [
        ...getSubjectBasedRecommendations(allNotes, profile, 3),
        ...getPriceBasedRecommendations(allNotes, profile, 2),
        ...getAuthorBasedRecommendations(allNotes, profile, 2),
        ...getPopularRecommendations(allNotes, 3),
        ...getNewReleaseRecommendations(allNotes, 2)
      ];

      // Remove duplicates and user's own notes
      const uniqueRecommendations = removeDuplicates(recommendedNotes, userNotes);
      
      setRecommendations(uniqueRecommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    }
    setIsLoading(false);
  };

  const buildUserProfile = (userNotes, allNotes) => {
    const profile = {
      purchaseHistory: [],
      preferences: {
        subjects: {},
        priceRange: { min: 0, max: 1 },
        authors: {}
      }
    };

    // Analyze user's created notes to understand preferences
    userNotes.forEach(note => {
      profile.preferences.subjects[note.subject] = 
        (profile.preferences.subjects[note.subject] || 0) + 1;
      
      profile.preferences.authors[note.author] = 
        (profile.preferences.authors[note.author] || 0) + 1;
    });

    // Calculate price preferences
    if (userNotes.length > 0) {
      const prices = userNotes.map(note => parseFloat(note.price));
      profile.preferences.priceRange.min = Math.min(...prices);
      profile.preferences.priceRange.max = Math.max(...prices);
    }

    return profile;
  };

  const getSubjectBasedRecommendations = (allNotes, profile, count) => {
    const preferredSubjects = Object.keys(profile.preferences.subjects)
      .sort((a, b) => profile.preferences.subjects[b] - profile.preferences.subjects[a]);
    
    const recommendations = [];
    
    preferredSubjects.forEach(subject => {
      const subjectNotes = allNotes
        .filter(note => note.subject === subject && note.forSale)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, Math.ceil(count / preferredSubjects.length));
      
      recommendations.push(...subjectNotes.map(note => ({
        ...note,
        recommendationType: 'subject',
        reason: `Because you create ${subject} notes`
      })));
    });

    return recommendations.slice(0, count);
  };

  const getPriceBasedRecommendations = (allNotes, profile, count) => {
    const { min, max } = profile.preferences.priceRange;
    
    return allNotes
      .filter(note => {
        const price = parseFloat(note.price);
        return note.forSale && price >= min && price <= max * 1.5; // Slightly expand range
      })
      .sort((a, b) => b.rating - a.rating)
      .slice(0, count)
      .map(note => ({
        ...note,
        recommendationType: 'price',
        reason: `In your preferred price range`
      }));
  };

  const getAuthorBasedRecommendations = (allNotes, profile, count) => {
    const preferredAuthors = Object.keys(profile.preferences.authors);
    
    const recommendations = [];
    
    preferredAuthors.forEach(author => {
      const authorNotes = allNotes
        .filter(note => note.author === author && note.forSale)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, Math.ceil(count / preferredAuthors.length));
      
      recommendations.push(...authorNotes.map(note => ({
        ...note,
        recommendationType: 'author',
        reason: `From a creator in your network`
      })));
    });

    return recommendations.slice(0, count);
  };

  const getPopularRecommendations = (allNotes, count) => {
    return allNotes
      .filter(note => note.forSale)
      .sort((a, b) => {
        // Score based on downloads and rating
        const scoreA = a.downloadCount * 0.7 + a.rating * 0.3;
        const scoreB = b.downloadCount * 0.7 + b.rating * 0.3;
        return scoreB - scoreA;
      })
      .slice(0, count)
      .map(note => ({
        ...note,
        recommendationType: 'popular',
        reason: `Popular in the community`
      }));
  };

  const getNewReleaseRecommendations = (allNotes, count) => {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    return allNotes
      .filter(note => note.forSale && note.createdAt > oneDayAgo)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, count)
      .map(note => ({
        ...note,
        recommendationType: 'new',
        reason: `New release`
      }));
  };

  const removeDuplicates = (recommendations, userNotes) => {
    const userNoteIds = new Set(userNotes.map(note => note.id));
    const seenIds = new Set();
    
    return recommendations.filter(note => {
      if (seenIds.has(note.id) || userNoteIds.has(note.id)) {
        return false;
      }
      seenIds.add(note.id);
      return true;
    });
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'subject': return '📚';
      case 'price': return '💰';
      case 'author': return '👤';
      case 'popular': return '🔥';
      case 'new': return '✨';
      default: return '💡';
    }
  };

  const getRecommendationColor = (type) => {
    switch (type) {
      case 'subject': return '#3b82f6';
      case 'price': return '#10b981';
      case 'author': return '#8b5cf6';
      case 'popular': return '#f59e0b';
      case 'new': return '#ec4899';
      default: return '#6b7280';
    }
  };

  return {
    recommendations,
    isLoading,
    userProfile,
    generateRecommendations,
    getRecommendationIcon,
    getRecommendationColor
  };
}

function RecommendationCard({ note, onPurchase }) {
  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'trending': return '🔥';
      case 'popular': return '⭐';
      case 'similar': return '🔗';
      case 'for_you': return '🎯';
      default: return '📝';
    }
  };

  const getRecommendationColor = (type) => {
    switch (type) {
      case 'trending': return '#ef4444';
      case 'popular': return '#f59e0b';
      case 'similar': return '#3b82f6';
      case 'for_you': return '#10b981';
      default: return '#6b7280';
    }
  };
  
  return (
    <div className="recommendation-card">
      <div 
        className="recommendation-badge"
        style={{ backgroundColor: getRecommendationColor(note.recommendationType) }}
      >
        <span className="badge-icon">{getRecommendationIcon(note.recommendationType)}</span>
        <span className="badge-text">{note.reason}</span>
      </div>
      
      <div className="note-preview">
        <h4 className="note-title">{note.title}</h4>
        <p className="note-description">{note.description}</p>
        
        <div className="note-meta">
          <span className="note-subject">📚 {note.subject}</span>
          <span className="note-price">💰 {parseFloat(note.price).toFixed(4)} ETH</span>
          <span className="note-rating">⭐ {note.rating}/5</span>
        </div>
        
        <div className="note-stats">
          <span>📥 {note.downloadCount} downloads</span>
          <span>👤 {note.author.slice(0, 6)}...{note.author.slice(-4)}</span>
        </div>
      </div>
      
      <div className="recommendation-actions">
        <button
          onClick={() => onPurchase && onPurchase(note)}
          className="purchase-button"
        >
          🛒 Buy Now
        </button>
        <button className="preview-button">
          👁️ Preview
        </button>
      </div>
    </div>
  );
}

function RecommendationSection({ onPurchase, maxRecommendations = 6, addNotification }) {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { state } = useWeb3();

  const generateRecommendations = async () => {
    setIsLoading(true);
    try {
      // Mock recommendations data
      const mockRecommendations = [
        {
          id: 1,
          title: "Advanced Calculus Notes",
          description: "Comprehensive study guide covering limits, derivatives, and integrals",
          subject: "Mathematics",
          price: "0.05",
          rating: 4.8,
          author: "0x1234...5678",
          recommendationType: "trending",
          reason: "Trending",
          views: 1250,
          purchases: 89
        },
        {
          id: 2,
          title: "React.js Complete Guide",
          description: "From basics to advanced concepts in React development",
          subject: "Computer Science",
          price: "0.08",
          rating: 4.9,
          author: "0x8765...4321",
          recommendationType: "for_you",
          reason: "For You",
          views: 980,
          purchases: 67
        },
        {
          id: 3,
          title: "Organic Chemistry Reactions",
          description: "Detailed mechanisms and reaction pathways",
          subject: "Chemistry",
          price: "0.06",
          rating: 4.7,
          author: "0x5555...9999",
          recommendationType: "popular",
          reason: "Popular",
          views: 1450,
          purchases: 102
        }
      ];
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setRecommendations(mockRecommendations.slice(0, maxRecommendations));
      
      if (addNotification) {
        addNotification({
          type: 'success',
          message: 'Recommendations updated!'
        });
      }
    } catch (error) {
      if (addNotification) {
        addNotification({
          type: 'error',
          message: 'Failed to load recommendations'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const displayedRecommendations = recommendations.slice(0, maxRecommendations);

  if (!state.isConnected) {
    return (
      <div className="recommendations-section">
        <div className="section-header">
          <h3>💡 Personalized Recommendations</h3>
          <p>Connect your wallet to get personalized note recommendations</p>
        </div>
        <div className="connect-prompt">
          <div className="connect-icon">🔌</div>
          <p>Connect your wallet to unlock personalized recommendations based on your interests and purchase history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-section">
      <div className="section-header">
        <h3>💡 Recommended For You</h3>
        <button 
          onClick={generateRecommendations}
          className="refresh-recommendations"
          disabled={isLoading}
        >
          {isLoading ? '🔄' : '🔄'} Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="loading-recommendations">
          <div className="loading-spinner">🔄</div>
          <p>Generating personalized recommendations...</p>
        </div>
      ) : displayedRecommendations.length === 0 ? (
        <div className="no-recommendations">
          <div className="empty-icon">💡</div>
          <h4>No recommendations available</h4>
          <p>Create or purchase some notes to get personalized recommendations</p>
        </div>
      ) : (
        <>
          <div className="recommendations-grid">
            {displayedRecommendations.map(note => (
              <RecommendationCard
                key={`${note.id}-${note.recommendationType}`}
                note={note}
                onPurchase={onPurchase}
              />
            ))}
          </div>
          
          {recommendations.length > maxRecommendations && (
            <div className="view-more">
              <button className="view-more-button">
                View {recommendations.length - maxRecommendations} More Recommendations
              </button>
            </div>
          )}
        </>
      )}

      <div className="recommendation-types">
        <h4>🎯 How we recommend</h4>
        <div className="types-grid">
          <div className="type-item">
            <span className="type-icon">📚</span>
            <span>Subject preferences</span>
          </div>
          <div className="type-item">
            <span className="type-icon">💰</span>
            <span>Price range</span>
          </div>
          <div className="type-item">
            <span className="type-icon">👤</span>
            <span>Favorite authors</span>
          </div>
          <div className="type-item">
            <span className="type-icon">🔥</span>
            <span>Community trends</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecommendationEngine;
