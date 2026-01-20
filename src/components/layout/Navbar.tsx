'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
                    <Image
                        src="/logo.png"
                        alt="ProBank Logo"
                        width={120}
                        height={34}
                        className={styles.logoImage}
                    />
                </Link>

                <div className={styles.links}>
                    <Link href="/banca-personas" className={styles.link}>Banca Personas</Link>
                    <Link href="/#features" className={styles.link}>Características</Link>
                    <Link href="/" className={styles.link}>Soluciones</Link>
                </div>

                <div className={styles.actions}>
                    <Button variant="ghost" size="sm">Ingresar</Button>
                    <Link href="/registro">
                        <Button variant="primary" size="sm">Sumate como Cliente</Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
};
