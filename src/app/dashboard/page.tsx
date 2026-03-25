'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const TX_ICONS: Record<string, string> = {
  deposit: 'fa-circle-down',
  withdrawal: 'fa-circle-up',
  transfer_in: 'fa-arrow-right-to-bracket',
  transfer_out: 'fa-arrow-right-from-bracket',
  investment_gain: 'fa-seedling',
};

const TX_COLORS: Record<string, string> = {
  deposit: '#10b981',
  withdrawal: '#ef4444',
  transfer_in: '#3b82f6',
  transfer_out: '#f59e0b',
  investment_gain: '#8b5cf6',
};

export default function DashboardPage() {
  const { user, transactions } = useAuth();
  if (!user) return null;

  const recentTx = transactions.slice(0, 5);
  const totalBalance = user.checkingBalance + user.savingsBalance + user.investmentBalance;
  const dailyGain = user.investmentBalance * 0.0008;
  const monthlyGain = dailyGain * 30;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className={styles.page}>
      {/* Welcome header */}
      <div className={styles.welcomeHeader}>
        <div>
          <p className={styles.greetingText}>{greeting},</p>
          <h1 className={styles.welcomeName}>{user.name.split(' ')[0]} 👋</h1>
          <p className={styles.welcomeSub}>Aquí está el resumen de tu cuenta</p>
        </div>
        <div className={styles.dateTag}>
          <i className="fas fa-calendar" />
          {new Date().toLocaleDateString('es-HN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* Balance total hero card */}
      <div className={styles.heroCard}>
        <div className={styles.heroLeft}>
          <p className={styles.heroLabel}>Patrimonio Total</p>
          <h2 className={styles.heroBalance}>{formatCurrency(totalBalance)}</h2>
          <div className={styles.heroMeta}>
            <span className={styles.heroBadge}>
              <i className="fas fa-arrow-trend-up" /> +{formatCurrency(dailyGain)} hoy
            </span>
            <span className={styles.heroSub}>Ganancia mensual estimada: {formatCurrency(monthlyGain)}</span>
          </div>
        </div>
        <div className={styles.heroRight}>
          <div className={styles.heroIcon}><i className="fas fa-wallet" /></div>
        </div>
      </div>

      {/* Account cards */}
      <div className={styles.accountGrid}>
        <div className={styles.accountCard}>
          <div className={styles.acIcon} style={{ background: 'rgba(37, 99, 235, 0.12)', color: '#2563eb' }}>
            <i className="fas fa-building-columns" />
          </div>
          <div>
            <p className={styles.acLabel}>Cuenta Corriente</p>
            <p className={styles.acBalance}>{formatCurrency(user.checkingBalance)}</p>
          </div>
          <Link href="/dashboard/transacciones" className={styles.acAction}>
            <i className="fas fa-chevron-right" />
          </Link>
        </div>

        <div className={styles.accountCard}>
          <div className={styles.acIcon} style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
            <i className="fas fa-piggy-bank" />
          </div>
          <div>
            <p className={styles.acLabel}>Cuenta de Ahorro</p>
            <p className={styles.acBalance}>{formatCurrency(user.savingsBalance)}</p>
          </div>
          <Link href="/dashboard/depositos" className={styles.acAction}>
            <i className="fas fa-chevron-right" />
          </Link>
        </div>

        <div className={styles.accountCard}>
          <div className={styles.acIcon} style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#7c3aed' }}>
            <i className="fas fa-chart-line" />
          </div>
          <div>
            <p className={styles.acLabel}>Inversiones</p>
            <p className={styles.acBalance}>{formatCurrency(user.investmentBalance)}</p>
          </div>
          <Link href="/dashboard/depositos" className={styles.acAction}>
            <i className="fas fa-chevron-right" />
          </Link>
        </div>
      </div>

      {/* Quick actions */}
      <div className={styles.quickActions}>
        <p className={styles.sectionTitle}>Acciones Rápidas</p>
        <div className={styles.actionsGrid}>
          <Link href="/dashboard/transferencias" className={styles.actionBtn}>
            <div className={styles.actionIcon} style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}>
              <i className="fas fa-paper-plane" />
            </div>
            <span>Transferir</span>
          </Link>
          <Link href="/dashboard/depositos" className={styles.actionBtn}>
            <div className={styles.actionIcon} style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
              <i className="fas fa-circle-down" />
            </div>
            <span>Depositar</span>
          </Link>
          <Link href="/dashboard/transacciones" className={styles.actionBtn}>
            <div className={styles.actionIcon} style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>
              <i className="fas fa-list-ul" />
            </div>
            <span>Movimientos</span>
          </Link>
          <Link href="/dashboard/depositos" className={styles.actionBtn}>
            <div className={styles.actionIcon} style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
              <i className="fas fa-seedling" />
            </div>
            <span>Invertir</span>
          </Link>
        </div>
      </div>

      {/* Recent transactions */}
      <div className={styles.recentSection}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionTitle}>Últimos Movimientos</p>
          <Link href="/dashboard/transacciones" className={styles.seeAll}>Ver todos <i className="fas fa-arrow-right" /></Link>
        </div>
        <div className={styles.txList}>
          {recentTx.map(tx => (
            <div key={tx.id} className={styles.txRow}>
              <div className={styles.txIconWrap} style={{ background: `${TX_COLORS[tx.type]}18`, color: TX_COLORS[tx.type] }}>
                <i className={`fas ${TX_ICONS[tx.type]}`} />
              </div>
              <div className={styles.txInfo}>
                <p className={styles.txDesc}>{tx.description}</p>
                <p className={styles.txDate}>{formatDate(tx.date)}</p>
              </div>
              <div className={`${styles.txAmount} ${tx.amount > 0 ? styles.txPos : styles.txNeg}`}>
                {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
