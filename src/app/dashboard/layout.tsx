'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProFinanceLogo } from '@/components/ui/ProFinanceLogo';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import styles from './layout.module.css';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Inicio', icon: 'fa-house' },
  { href: '/dashboard/transacciones', label: 'Transacciones', icon: 'fa-list-ul' },
  { href: '/dashboard/transferencias', label: 'Transferencias', icon: 'fa-paper-plane' },
  { href: '/dashboard/depositos', label: 'Depósitos & Inversiones', icon: 'fa-chart-line' },
  { href: '/dashboard/tarjeta', label: 'Tarjeta VISA', icon: 'fa-credit-card' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);      // mobile slide-in
  const [collapsed, setCollapsed] = useState(false);          // desktop icon-only

  // Persist collapsed preference
  useEffect(() => {
    const stored = localStorage.getItem('pf_sidebar_collapsed');
    if (stored !== null) setCollapsed(stored === 'true');
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('pf_sidebar_collapsed', String(next));
      return next;
    });
  };

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  // Close mobile sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  const handleLogout = () => { logout(); router.push('/login'); };

  if (isLoading || !user) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner} />
        <p>Cargando tu banca...</p>
      </div>
    );
  }

  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className={styles.shell}>
      <AnimatedBackground />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className={styles.mobileOverlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={[
        styles.sidebar,
        collapsed ? styles.collapsed : '',
        sidebarOpen ? styles.sidebarOpen : '',
      ].join(' ')}>

        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.sidebarLogo}>
            <ProFinanceLogo size={32} />
            <span className={styles.logoText}>
              Pro<span className={styles.logoAccent}>Finance</span>
            </span>
          </Link>

          {/* Desktop: pin / collapse */}
          <button
            className={styles.collapseBtn}
            onClick={toggleCollapsed}
            title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            <i className={`fas ${collapsed ? 'fa-angles-right' : 'fa-angles-left'}`} />
          </button>

          {/* Mobile: close */}
          <button className={styles.closeSidebar} onClick={() => setSidebarOpen(false)}>
            <i className="fas fa-xmark" />
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          <p className={styles.navSection}>MENÚ PRINCIPAL</p>
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${pathname === item.href ? styles.navItemActive : ''}`}
              data-tooltip={item.label}
            >
              <span className={styles.navIcon}><i className={`fas ${item.icon}`} /></span>
              <span className={styles.navLabel}>{item.label}</span>
              {pathname === item.href && <span className={styles.navIndicator} />}
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userCard}>
            <div className={styles.userAvatar}>{initials}</div>
            <div className={styles.userInfo}>
              <p className={styles.userName}>{user.name.split(' ')[0]}</p>
              <p className={styles.userEmail}>{user.email}</p>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Cerrar sesión">
            <i className="fas fa-right-from-bracket" />
            <span className={styles.logoutText}>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`${styles.main} ${collapsed ? styles.mainCollapsed : ''}`}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            {/* Mobile hamburger */}
            <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
              <i className="fas fa-bars" />
            </button>
            <div className={styles.breadcrumb}>
              {NAV_ITEMS.find(n => n.href === pathname)?.label ?? 'Dashboard'}
            </div>
          </div>
          <div className={styles.topbarRight}>
            <div className={styles.accountBadge}>
              <i className="fas fa-building-columns" />
              <span className={styles.accountNum}>{user.accountNumber}</span>
            </div>
            <div className={styles.topbarAvatar}>{initials}</div>
          </div>
        </header>

        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
