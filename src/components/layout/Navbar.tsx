'use client';

import React from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';
import { Button } from '../ui/Button';
import { useScroll } from '@/hooks/useScroll';
import { cn } from '@/lib/utils';

export const Navbar: React.FC = () => {
    const scrolled = useScroll();

    return (
        <nav className={cn(styles.navbar, scrolled && styles.scrolled)}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    <span className={styles.logoText}>Pro</span>Bank
                </Link>

                <div className={styles.links}>
                    <Link href="/banca-personas" className={styles.link}>Banca Personas</Link>
                    <Link href="#features" className={styles.link}>Features</Link>
                    <Link href="#solutions" className={styles.link}>Solutions</Link>
                </div>

                <div className={styles.actions}>
                    <Button variant="ghost" size="sm">Login</Button>
                    <Link href="/registro">
                        <Button variant="primary" size="sm">Hacerse Cliente</Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
};
