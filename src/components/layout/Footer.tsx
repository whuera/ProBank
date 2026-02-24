import React from 'react';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
    return (
        <footer className={styles.footer}>
            <p className={styles.copyright}>&copy; {new Date().getFullYear()} ProFinance – Soluciones Bancarias Modernas</p>
        </footer>
    );
};
