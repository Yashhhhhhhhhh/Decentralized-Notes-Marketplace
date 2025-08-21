import React from 'react';
import styles from './Layout.module.css';

const Layout = ({ children, className }) => {
  return (
    <div className={`${styles.layout} ${className || ''}`}>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
