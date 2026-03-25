'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './transacciones.module.css';

const TYPE_LABELS: Record<string, string> = {
  deposit: 'Depósito',
  withdrawal: 'Retiro',
  transfer_in: 'Transferencia recibida',
  transfer_out: 'Transferencia enviada',
  investment_gain: 'Ganancia inversión',
};

const TYPE_ICONS: Record<string, string> = {
  deposit: 'fa-circle-down',
  withdrawal: 'fa-circle-up',
  transfer_in: 'fa-arrow-right-to-bracket',
  transfer_out: 'fa-arrow-right-from-bracket',
  investment_gain: 'fa-seedling',
};

const TYPE_COLORS: Record<string, string> = {
  deposit: '#10b981',
  withdrawal: '#ef4444',
  transfer_in: '#3b82f6',
  transfer_out: '#f59e0b',
  investment_gain: '#8b5cf6',
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'USD' }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

type FilterType = 'all' | 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'investment_gain';

export default function TransaccionesPage() {
  const { transactions } = useAuth();
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const filtered = transactions.filter(tx => {
    if (filter !== 'all' && tx.type !== filter) return false;
    if (search && !tx.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalIn = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Historial de Transacciones</h1>
          <p className={styles.subtitle}>Todos tus movimientos en un solo lugar</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon} style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
            <i className="fas fa-circle-down" />
          </div>
          <div>
            <p className={styles.summaryLabel}>Total ingresos</p>
            <p className={styles.summaryValue} style={{ color: '#059669' }}>+{formatCurrency(totalIn)}</p>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon} style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}>
            <i className="fas fa-circle-up" />
          </div>
          <div>
            <p className={styles.summaryLabel}>Total egresos</p>
            <p className={styles.summaryValue} style={{ color: '#ef4444' }}>{formatCurrency(totalOut)}</p>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon} style={{ background: 'rgba(37, 99, 235, 0.12)', color: '#2563eb' }}>
            <i className="fas fa-receipt" />
          </div>
          <div>
            <p className={styles.summaryLabel}>Transacciones</p>
            <p className={styles.summaryValue} style={{ color: '#1e40af' }}>{transactions.length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrapper}>
          <i className={`fas fa-magnifying-glass ${styles.searchIcon}`} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Buscar transacción..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filterChips}>
          {(['all', 'deposit', 'withdrawal', 'transfer_in', 'transfer_out', 'investment_gain'] as FilterType[]).map(f => (
            <button
              key={f}
              className={`${styles.chip} ${filter === f ? styles.chipActive : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Todos' : TYPE_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction list */}
      <div className={styles.txCard}>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fas fa-inbox" />
            <p>No hay transacciones que coincidan</p>
          </div>
        ) : (
          <div className={styles.txList}>
            {filtered.map((tx, i) => (
              <div key={tx.id} className={styles.txRow} style={{ animationDelay: `${i * 0.04}s` }}>
                <div className={styles.txIcon} style={{ background: `${TYPE_COLORS[tx.type]}18`, color: TYPE_COLORS[tx.type] }}>
                  <i className={`fas ${TYPE_ICONS[tx.type]}`} />
                </div>
                <div className={styles.txBody}>
                  <div className={styles.txMain}>
                    <span className={styles.txDesc}>{tx.description}</span>
                    <span className={`${styles.txAmount} ${tx.amount > 0 ? styles.txPos : styles.txNeg}`}>
                      {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                  <div className={styles.txMeta}>
                    <span className={styles.txType} style={{ background: `${TYPE_COLORS[tx.type]}14`, color: TYPE_COLORS[tx.type] }}>
                      {TYPE_LABELS[tx.type]}
                    </span>
                    <span className={styles.txDate}>{formatDate(tx.date)}</span>
                    <span className={`${styles.txStatus} ${styles.txStatusDone}`}>
                      <i className="fas fa-circle-check" /> Completado
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
