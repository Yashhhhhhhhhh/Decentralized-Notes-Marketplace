import React from 'react';
import styles from './Navigation.module.css';
import Button from '../../ui/Button';

const Navigation = ({ currentPage, onPageChange, isConnected, onConnect }) => {
  const pages = [
    { id: 'browse', label: '📚 Browse Notes', icon: '📚' },
    { id: 'create', label: '✏️ Create Note', icon: '✏️' },
    { id: 'my-notes', label: '📝 My Notes', icon: '📝' },
    { id: 'test', label: '🔧 Test Contract', icon: '🔧' }
  ];

  return (
    <nav className={styles.navigation}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <span className={styles.logo}>📚</span>
          <span className={styles.title}>NotesMarketplace</span>
        </div>
        
        <div className={styles.menu}>
          {pages.map((page) => (
            <Button
              key={page.id}
              variant={currentPage === page.id ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onPageChange(page.id)}
              className={styles.navButton}
            >
              <span className={styles.icon}>{page.icon}</span>
              <span className={styles.label}>{page.label}</span>
            </Button>
          ))}
        </div>
        
        <div className={styles.actions}>
          <Button
            variant={isConnected ? 'success' : 'primary'}
            size="sm"
            onClick={onConnect}
            disabled={isConnected}
          >
            {isConnected ? '✅ Connected' : '🔗 Connect Wallet'}
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
