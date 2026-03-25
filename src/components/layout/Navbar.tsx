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
                    <span className={styles.logoText}>
                        Pro<span className={styles.logoHighlight}>Finance</span>
                    </span>
                </Link>

                <div className={styles.links}>
                    <Link href="/banca-personas" className={styles.link}>Banca Personas</Link>
                    <Link href="/#features" className={styles.link}>Características</Link>
                    <Link href="/" className={styles.link}>Soluciones</Link>
                </div>

                <div className={styles.actions}>
                    <Link href="/login">
                        <Button variant="ghost" size="sm">Ingresar</Button>
                    </Link>
                    <Link href="/registro">
                        <Button variant="primary" size="sm">Súmate como Cliente</Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
};
