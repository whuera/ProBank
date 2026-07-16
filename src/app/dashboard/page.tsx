'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { useAuth } from '@/context/AuthContext';
import type { Transaction } from '@/context/AuthContext';
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

function getRiskLevel(score: number): { label: string; color: string; bg: string } {
  if (score >= 0.7) return { label: 'Alto', color: '#f87171', bg: 'rgba(239, 68, 68, 0.1)' };
  if (score >= 0.4) return { label: 'Medio', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)' };
  return { label: 'Bajo', color: '#34d399', bg: 'rgba(52, 211, 153, 0.1)' };
}

function RiskChart({ transactions }: { transactions: Transaction[] }) {
  const scored = transactions.filter(t => t.riskScore !== undefined);
  if (scored.length === 0) {
    return (
      <div className={styles.riskEmpty}>
        <i className="fas fa-shield-halved" />
        <p>Aún no hay transacciones evaluadas</p>
        <p className={styles.riskEmptySub}>Realiza una transferencia para ver el análisis de riesgo</p>
      </div>
    );
  }

  const high = scored.filter(t => (t.riskScore ?? 0) >= 0.7).length;
  const medium = scored.filter(t => (t.riskScore ?? 0) >= 0.4 && (t.riskScore ?? 0) < 0.7).length;
  const low = scored.filter(t => (t.riskScore ?? 0) < 0.4).length;
  const total = scored.length;

  const segments = [
    { count: low, color: '#16a34a', label: 'Bajo' },
    { count: medium, color: '#d97706', label: 'Medio' },
    { count: high, color: '#dc2626', label: 'Alto' },
  ];

  // Donut chart
  const radius = 54;
  const stroke = 14;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className={styles.riskChartWrap}>
      <div className={styles.riskDonut}>
        <svg width="140" height="140" viewBox="0 0 140 140">
          {segments.map((seg, i) => {
            const pct = seg.count / total;
            const dash = pct * circumference;
            const gap = circumference - dash;
            const currentOffset = offset;
            offset += dash;
            if (seg.count === 0) return null;
            return (
              <circle
                key={i}
                cx="70" cy="70" r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={stroke}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-currentOffset}
                strokeLinecap="round"
                transform="rotate(-90 70 70)"
              />
            );
          })}
          <text x="70" y="64" textAnchor="middle" className={styles.donutNumber}>{total}</text>
          <text x="70" y="82" textAnchor="middle" className={styles.donutLabel}>evaluadas</text>
        </svg>
      </div>
      <div className={styles.riskLegend}>
        {segments.map((seg, i) => (
          <div key={i} className={styles.legendRow}>
            <span className={styles.legendDot} style={{ background: seg.color }} />
            <span className={styles.legendLabel}>{seg.label}</span>
            <span className={styles.legendCount}>{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Bar chart showing recent scored transactions
function RiskBarChart({ transactions }: { transactions: Transaction[] }) {
  const scored = transactions.filter(t => t.riskScore !== undefined).slice(0, 8).reverse();
  if (scored.length === 0) return null;

  const barMax = 1;

  return (
    <div className={styles.barChart}>
      <div className={styles.barChartGrid}>
        {[1, 0.75, 0.5, 0.25, 0].map(v => (
          <div key={v} className={styles.barGridLine}>
            <span className={styles.barGridLabel}>{v.toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className={styles.barChartBars}>
        {scored.map(tx => {
          const score = tx.riskScore ?? 0;
          const pct = (score / barMax) * 100;
          const risk = getRiskLevel(score);
          return (
            <div key={tx.id} className={styles.barCol}>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{ height: `${Math.max(pct, 4)}%`, background: risk.color }}
                  title={`Score: ${score.toFixed(2)}`}
                />
              </div>
              <span className={styles.barLabel}>
                {new Date(tx.date).toLocaleDateString('es-HN', { day: '2-digit', month: 'short' })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TotpSetup() {
  const { totpEnabled, totpSecret, setupTotp, enableTotp, disableTotp, getTotpUri } = useAuth();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (totpSecret && showSetup) {
      const uri = getTotpUri();
      if (uri) {
        QRCode.toDataURL(uri, {
          width: 200,
          margin: 2,
          color: { dark: '#f8fafc', light: '#00000000' },
        }).then(setQrDataUrl);
      }
    }
  }, [totpSecret, showSetup, getTotpUri]);

  const handleStartSetup = () => {
    setupTotp();
    setShowSetup(true);
    setError(null);
    setVerifyCode('');
  };

  const handleVerify = () => {
    if (verifyCode.length !== 6) {
      setError('Ingresa el código de 6 dígitos.');
      return;
    }
    const ok = enableTotp(verifyCode);
    if (ok) {
      setShowSetup(false);
      setVerifyCode('');
      setError(null);
    } else {
      setError('Código incorrecto. Verifica e intenta de nuevo.');
      setVerifyCode('');
      inputRef.current?.focus();
    }
  };

  if (totpEnabled) {
    return (
      <div className={styles.totpCard}>
        <div className={styles.totpHeader}>
          <div className={styles.totpActiveBadge}>
            <i className="fas fa-circle-check" /> Authenticator activo
          </div>
        </div>
        <p className={styles.totpDesc}>
          Tu cuenta está protegida con Microsoft Authenticator. Los códigos TOTP se aceptan automáticamente en transferencias de alto riesgo.
        </p>
        <button className={styles.totpDisableBtn} onClick={disableTotp}>
          <i className="fas fa-xmark" /> Desactivar Authenticator
        </button>
      </div>
    );
  }

  if (showSetup) {
    return (
      <div className={styles.totpCard}>
        <h3 className={styles.totpSetupTitle}>Configurar Authenticator</h3>
        <p className={styles.totpDesc}>
          Escanea el código QR con Microsoft Authenticator, Google Authenticator u otra app compatible.
        </p>
        {qrDataUrl && (
          <div className={styles.qrWrapper}>
            <img src={qrDataUrl} alt="Código QR TOTP" width={200} height={200} />
          </div>
        )}
        {totpSecret && (
          <div className={styles.totpSecretBox}>
            <span className={styles.totpSecretLabel}>Clave manual:</span>
            <code className={styles.totpSecretCode}>{totpSecret}</code>
          </div>
        )}
        <div className={styles.totpVerify}>
          <label className={styles.totpVerifyLabel}>Ingresa el código de la app para verificar:</label>
          <div className={styles.totpVerifyRow}>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              maxLength={6}
              className={styles.totpVerifyInput}
              placeholder="000000"
              value={verifyCode}
              onChange={e => { setVerifyCode(e.target.value.replace(/\D/g, '')); setError(null); }}
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
            />
            <button className={styles.totpVerifyBtn} onClick={handleVerify} disabled={verifyCode.length < 6}>
              <i className="fas fa-check" /> Activar
            </button>
          </div>
          {error && <p className={styles.totpError}><i className="fas fa-circle-exclamation" /> {error}</p>}
        </div>
        <button className={styles.totpCancelBtn} onClick={() => setShowSetup(false)}>Cancelar</button>
      </div>
    );
  }

  return (
    <div className={styles.totpCard}>
      <div className={styles.totpPromo}>
        <div className={styles.totpPromoIcon}><i className="fas fa-mobile-screen" /></div>
        <div>
          <h3 className={styles.totpPromoTitle}>Microsoft Authenticator</h3>
          <p className={styles.totpDesc}>
            Vincula tu app de autenticación para generar códigos TOTP automáticos. Compatible con Microsoft Authenticator, Google Authenticator y más.
          </p>
        </div>
      </div>
      <button className={styles.totpSetupBtn} onClick={handleStartSetup}>
        <i className="fas fa-qrcode" /> Configurar Authenticator
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const { user, transactions, securityTokens, generateTokens } = useAuth();
  const [showAllTokens, setShowAllTokens] = useState(false);
  if (!user) return null;

  const recentTx = transactions.slice(0, 5);
  const totalBalance = user.checkingBalance + user.savingsBalance + user.investmentBalance;
  const dailyGain = user.investmentBalance * 0.0008;
  const monthlyGain = dailyGain * 30;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  const scoredTx = transactions.filter(t => t.riskScore !== undefined);
  const flaggedCount = scoredTx.filter(t => (t.riskScore ?? 0) >= 0.5).length;

  const availableTokens = securityTokens.filter(t => !t.used);
  const usedTokens = securityTokens.filter(t => t.used);
  const displayedTokens = showAllTokens ? securityTokens : securityTokens.slice(0, 6);

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
          <div className={styles.acIcon} style={{ background: 'rgba(88, 166, 255, 0.1)', color: '#58a6ff' }}>
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
          <div className={styles.acIcon} style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399' }}>
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
          <div className={styles.acIcon} style={{ background: 'rgba(167, 139, 250, 0.1)', color: '#a78bfa' }}>
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

      {/* Risk analysis section */}
      <div className={styles.riskSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.riskSectionTitle}>
            <i className="fas fa-shield-halved" />
            <p className={styles.sectionTitle}>Análisis de Riesgo</p>
          </div>
          {flaggedCount > 0 && (
            <span className={styles.flaggedBadge}>
              <i className="fas fa-triangle-exclamation" /> {flaggedCount} marcada{flaggedCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className={styles.riskGrid}>
          <div className={styles.riskCardChart}>
            <p className={styles.riskCardLabel}>Distribución por nivel</p>
            <RiskChart transactions={transactions} />
          </div>
          <div className={styles.riskCardChart}>
            <p className={styles.riskCardLabel}>Score por transacción reciente</p>
            <RiskBarChart transactions={transactions} />
            {scoredTx.length === 0 && (
              <p className={styles.riskEmptySub} style={{ textAlign: 'center', marginTop: 16 }}>
                Sin datos aún
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Security Tokens Panel */}
      <div className={styles.tokenSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.riskSectionTitle}>
            <i className="fas fa-key" />
            <p className={styles.sectionTitle}>Tokens de Seguridad</p>
          </div>
          <div className={styles.tokenHeaderActions}>
            <span className={styles.tokenCount}>
              <i className="fas fa-circle-check" style={{ color: '#34d399' }} /> {availableTokens.length} disponible{availableTokens.length !== 1 ? 's' : ''}
              {usedTokens.length > 0 && (
                <span style={{ color: '#94a3b8', marginLeft: 8 }}>
                  <i className="fas fa-circle-xmark" /> {usedTokens.length} usado{usedTokens.length !== 1 ? 's' : ''}
                </span>
              )}
            </span>
          </div>
        </div>
        <p className={styles.tokenSectionDesc}>
          Los tokens son códigos de un solo uso necesarios para autorizar transferencias con score de riesgo alto.
          Puedes generar nuevos tokens o vincular una app de autenticación.
        </p>

        {/* TOTP Authenticator Setup */}
        <TotpSetup />

        <div className={styles.tokenGrid}>
          {displayedTokens.length === 0 && (
            <div className={styles.tokenEmpty}>
              <i className="fas fa-key" />
              <p>No tienes tokens generados</p>
              <p className={styles.tokenEmptySub}>Genera tokens para poder realizar transferencias de alto riesgo</p>
            </div>
          )}
          {displayedTokens.map((t, i) => (
            <div key={i} className={`${styles.tokenItem} ${t.used ? styles.tokenUsed : ''}`}>
              <div className={styles.tokenCode}>
                {t.used ? '******' : t.code}
              </div>
              <div className={styles.tokenMeta}>
                <span className={t.used ? styles.tokenBadgeUsed : styles.tokenBadgeActive}>
                  {t.used ? 'Usado' : 'Activo'}
                </span>
                <span className={styles.tokenDate}>
                  {new Date(t.createdAt).toLocaleDateString('es-HN', { day: '2-digit', month: 'short' })}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.tokenActions}>
          <button className={styles.generateBtn} onClick={() => generateTokens(5)}>
            <i className="fas fa-plus" /> Generar 5 tokens
          </button>
          {securityTokens.length > 6 && (
            <button className={styles.showAllBtn} onClick={() => setShowAllTokens(!showAllTokens)}>
              {showAllTokens ? 'Ver menos' : `Ver todos (${securityTokens.length})`}
            </button>
          )}
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
          {recentTx.map(tx => {
            const risk = tx.riskScore !== undefined ? getRiskLevel(tx.riskScore) : null;
            return (
              <div key={tx.id} className={styles.txRow}>
                <div className={styles.txIconWrap} style={{ background: `${TX_COLORS[tx.type]}18`, color: TX_COLORS[tx.type] }}>
                  <i className={`fas ${TX_ICONS[tx.type]}`} />
                </div>
                <div className={styles.txInfo}>
                  <div className={styles.txDescRow}>
                    <p className={styles.txDesc}>{tx.description}</p>
                    {risk && (
                      <span className={styles.txRiskBadge} style={{ color: risk.color, background: risk.bg }}>
                        <i className="fas fa-shield-halved" /> {risk.label}
                      </span>
                    )}
                  </div>
                  <p className={styles.txDate}>
                    {formatDate(tx.date)}
                    {tx.riskScore !== undefined && (
                      <span style={{ color: getRiskLevel(tx.riskScore).color, marginLeft: 8 }}>
                        Score: {tx.riskScore.toFixed(2)}
                      </span>
                    )}
                  </p>
                </div>
                <div className={`${styles.txAmount} ${tx.amount > 0 ? styles.txPos : styles.txNeg}`}>
                  {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
