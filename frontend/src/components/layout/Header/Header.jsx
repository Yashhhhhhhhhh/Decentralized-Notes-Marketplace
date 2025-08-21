import React from 'react';
import styles from './Header.module.css';
import Card from '../../ui/Card';

const Header = ({ title, subtitle, children }) => {
  return (
    <header className={styles.header}>
      <Card variant="elevated" className={styles.content}>
        <div className={styles.textSection}>
          {title && <h1 className={styles.title}>{title}</h1>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {children && (
          <div className={styles.actions}>
            {children}
          </div>
        )}
      </Card>
    </header>
  );
};

export default Header;
