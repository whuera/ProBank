'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';
import { ProFinanceLogo } from '../ui/ProFinanceLogo';
import { useScroll } from '@/hooks/useScroll';
import { cn } from '@/lib/utils';

const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/banca-personas', label: 'Banca Personas' },
    { href: '/#features', label: 'Características' },
    { href: '/soluciones', label: 'Soluciones' },
];

export const Navbar: React.FC = () => {
    const scrolled = useScroll();
    const pathname = usePathname();

    return (
        <nav className={cn(styles.navbar, scrolled && styles.scrolled)}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    <ProFinanceLogo size={30} />
                    <span className={styles.logoText}>
                        Pro<span className={styles.logoHighlight}>Finance</span>
                    </span>
                </Link>

                {/* Pill-shaped centered nav with all options */}
                <div className={styles.pillNav}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                styles.pillLink,
                                pathname === link.href && styles.pillLinkActive
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}

                    <div className={styles.pillDivider}></div>

                    <Link
                        href="/login"
                        className={cn(
                            styles.pillLink,
                            pathname === '/login' && styles.pillLinkActive
                        )}
                    >
                        Ingresar
                    </Link>
                    <Link
                        href="/registro"
                        className={cn(styles.pillLink, styles.pillLinkCta)}
                    >
                        Súmate como Cliente
                    </Link>
                </div>
            </div>
        </nav>
    );
};
