import React, { useState, useEffect } from 'react';
import styles from './BrowsePage.module.css';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Header from '../../components/layout/Header';

const BrowsePage = ({ contract, account }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    loadNotes();
  }, [contract]);

  const loadNotes = async () => {
    if (!contract) return;
    
    setLoading(true);
    try {
      // Get all notes (this would need to be implemented in the contract)
      const totalSupply = await contract.totalSupply();
      const notesData = [];
      
      for (let i = 1; i <= totalSupply; i++) {
        try {
          const owner = await contract.ownerOf(i);
          const price = await contract.notePrices(i);
          const tokenURI = await contract.tokenURI(i);
          
          notesData.push({
            id: i,
            owner,
            price: price.toString(),
            tokenURI,
            available: owner !== account
          });
        } catch (error) {
          console.log(`Note ${i} not found or error:`, error);
        }
      }
      
      setNotes(notesData);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const buyNote = async (noteId, price) => {
    if (!contract || !account) return;
    
    try {
      const tx = await contract.purchaseNote(noteId, { value: price });
      await tx.wait();
      loadNotes(); // Refresh the list
      alert('Note purchased successfully!');
    } catch (error) {
      console.error('Error purchasing note:', error);
      alert('Failed to purchase note. Check console for details.');
    }
  };

  const filteredNotes = notes.filter(note =>
    note.tokenURI.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseInt(a.price) - parseInt(b.price);
      case 'price-high':
        return parseInt(b.price) - parseInt(a.price);
      case 'recent':
      default:
        return b.id - a.id;
    }
  });

  return (
    <div className={styles.browsePage}>
      <Header
        title="Browse Notes"
        subtitle="Discover and purchase unique notes from other students"
      >
        <Button onClick={loadNotes} disabled={loading}>
          {loading ? '🔄 Loading...' : '🔄 Refresh'}
        </Button>
      </Header>

      <div className={styles.filters}>
        <div className={styles.searchSection}>
          <Input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="🔍"
          />
        </div>
        
        <div className={styles.sortSection}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="recent">Most Recent</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <Card>
            <div className={styles.loadingContent}>
              <span className={styles.spinner}>🔄</span>
              <p>Loading notes...</p>
            </div>
          </Card>
        </div>
      ) : (
        <div className={styles.notesGrid}>
          {sortedNotes.length === 0 ? (
            <Card className={styles.emptyState}>
              <div className={styles.emptyContent}>
                <span className={styles.emptyIcon}>📚</span>
                <h3>No notes found</h3>
                <p>Be the first to create and share a note!</p>
              </div>
            </Card>
          ) : (
            sortedNotes.map((note) => (
              <Card key={note.id} className={styles.noteCard}>
                <div className={styles.noteHeader}>
                  <h3 className={styles.noteTitle}>Note #{note.id}</h3>
                  <span className={styles.notePrice}>
                    {parseInt(note.price) / 1e18} ETH
                  </span>
                </div>
                
                <div className={styles.noteContent}>
                  <p className={styles.noteUri}>📄 {note.tokenURI}</p>
                  <p className={styles.noteOwner}>
                    👤 {note.owner.slice(0, 6)}...{note.owner.slice(-4)}
                  </p>
                </div>
                
                <div className={styles.noteActions}>
                  {note.available ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => buyNote(note.id, note.price)}
                      className={styles.buyButton}
                    >
                      💰 Buy Note
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" disabled>
                      {note.owner === account ? '✅ You own this' : '❌ Not available'}
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default BrowsePage;
