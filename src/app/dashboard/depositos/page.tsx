'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './depositos.module.css';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'USD' }).format(n);
}

const PLANS = [
  { id: 'conservador', label: 'Conservador', rate: 0.0004, rateLabel: '0.04% diario', rateAnnual: '14.6% anual', color: '#2563eb', icon: 'fa-shield', desc: 'Ideal para capital seguro con rendimiento estable' },
  { id: 'moderado', label: 'Moderado', rate: 0.0008, rateLabel: '0.08% diario', rateAnnual: '29.2% anual', color: '#7c3aed', icon: 'fa-chart-line', desc: 'Balance perfecto entre seguridad y crecimiento', popular: true },
  { id: 'agresivo', label: 'Crecimiento', rate: 0.0015, rateLabel: '0.15% diario', rateAnnual: '54.8% anual', color: '#059669', icon: 'fa-rocket', desc: 'Máximo rendimiento para inversores activos' },
];

export default function DepositosPage() {
  const { user, addTransaction } = useAuth();
  const [depositAmt, setDepositAmt] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('moderado');
  const [depositStep, setDepositStep] = useState<'form' | 'success'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const DAILY_RATE = 0.0008;
  const dailyGain = user.investmentBalance * DAILY_RATE;
  const monthlyGain = dailyGain * 30;
  const yearlyGain = dailyGain * 365;

  const plan = PLANS.find(p => p.id === selectedPlan) ?? PLANS[1];
  const previewAmt = parseFloat(depositAmt) || 0;
  const previewDaily = previewAmt * plan.rate;
  const previewMonthly = previewDaily * 30;

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmt);
    if (!depositAmt || isNaN(amt) || amt <= 0) { setError('Ingresa un monto válido.'); return; }
    if (amt < 10) { setError('El monto mínimo de inversión es $10.00.'); return; }
    setError(null);
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    addTransaction({
      type: 'deposit',
      amount: amt,
      description: `Depósito de inversión - Plan ${plan.label}`,
      status: 'completed',
    });
    setIsLoading(false);
    setDepositStep('success');
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Depósitos & Inversiones</h1>
        <p className={styles.subtitle}>Haz crecer tu dinero con rendimientos diarios garantizados</p>
      </div>

      {/* Investment stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard} style={{ background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)' }}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Capital Invertido</span>
            <div className={styles.statIconBlue}><i className="fas fa-chart-line" /></div>
          </div>
          <p className={styles.statValue}>{formatCurrency(user.investmentBalance)}</p>
          <p className={styles.statSub}>En tu portafolio activo</p>
        </div>

        <div className={styles.statCard} style={{ background: 'linear-gradient(135deg, #065f46, #059669)' }}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Ganancia de Hoy</span>
            <div className={styles.statIconGreen}><i className="fas fa-seedling" /></div>
          </div>
          <p className={styles.statValue}>+{formatCurrency(dailyGain)}</p>
          <p className={styles.statSub}>0.08% diario acumulado</p>
        </div>

        <div className={styles.statCard} style={{ background: 'linear-gradient(135deg, #4c1d95, #7c3aed)' }}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Proyección Mensual</span>
            <div className={styles.statIconPurple}><i className="fas fa-calendar-check" /></div>
          </div>
          <p className={styles.statValue}>+{formatCurrency(monthlyGain)}</p>
          <p className={styles.statSub}>Estimado próximos 30 días</p>
        </div>

        <div className={styles.statCard} style={{ background: 'linear-gradient(135deg, #7c2d12, #ea580c)' }}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Rendimiento Anual</span>
            <div className={styles.statIconOrange}><i className="fas fa-trophy" /></div>
          </div>
          <p className={styles.statValue}>+{formatCurrency(yearlyGain)}</p>
          <p className={styles.statSub}>~29.2% TIR estimado</p>
        </div>
      </div>

      {/* Progress bar visual */}
      <div className={styles.growthCard}>
        <div className={styles.growthHeader}>
          <div>
            <h3 className={styles.growthTitle}>Crecimiento de tu inversión</h3>
            <p className={styles.growthSub}>Simulación basada en rendimiento actual</p>
          </div>
          <div className={styles.growthBadge}><i className="fas fa-arrow-trend-up" /> Activo</div>
        </div>
        <div className={styles.growthTimeline}>
          {['Hoy', '1 mes', '3 meses', '6 meses', '1 año'].map((label, i) => {
            const mult = [1, 1.024, 1.074, 1.151, 1.292][i];
            const val = user.investmentBalance * mult;
            const pct = Math.min(100, (val / (user.investmentBalance * 1.35)) * 100);
            return (
              <div key={label} className={styles.growthItem}>
                <div className={styles.growthBar}>
                  <div className={styles.growthFill} style={{ height: `${pct}%`, background: `hsl(${217 + i * 12}, 80%, ${50 + i * 4}%)` }} />
                </div>
                <p className={styles.growthLabel}>{label}</p>
                <p className={styles.growthVal}>{formatCurrency(val)}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.bottomGrid}>
        {/* Investment plans */}
        <div className={styles.plansSection}>
          <h3 className={styles.sectionTitle}>Planes de Inversión</h3>
          <div className={styles.plansList}>
            {PLANS.map(p => (
              <button
                key={p.id}
                className={`${styles.planCard} ${selectedPlan === p.id ? styles.planSelected : ''}`}
                onClick={() => setSelectedPlan(p.id)}
                style={selectedPlan === p.id ? { borderColor: p.color, background: `${p.color}08` } : {}}
              >
                {p.popular && <span className={styles.popularBadge}>Popular</span>}
                <div className={styles.planIcon} style={{ background: `${p.color}18`, color: p.color }}>
                  <i className={`fas ${p.icon}`} />
                </div>
                <div className={styles.planInfo}>
                  <p className={styles.planName}>{p.label}</p>
                  <p className={styles.planRate} style={{ color: p.color }}>{p.rateLabel}</p>
                  <p className={styles.planAnnual}>{p.rateAnnual}</p>
                  <p className={styles.planDesc}>{p.desc}</p>
                </div>
                {selectedPlan === p.id && <i className={`fas fa-circle-check ${styles.planCheck}`} style={{ color: p.color }} />}
              </button>
            ))}
          </div>
        </div>

        {/* Deposit form */}
        <div className={styles.depositCard}>
          {depositStep === 'form' ? (
            <>
              <h3 className={styles.sectionTitle}>Realizar Depósito</h3>
              <p className={styles.depositSub}>Plan seleccionado: <strong style={{ color: plan.color }}>{plan.label} — {plan.rateLabel}</strong></p>

              {error && <div className={styles.errorAlert}><i className="fas fa-circle-exclamation" /> {error}</div>}

              <form onSubmit={handleDeposit} className={styles.depositForm}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Monto a depositar</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.prefix}>$</span>
                    <input
                      type="number" className={styles.input}
                      placeholder="0.00" value={depositAmt}
                      onChange={e => setDepositAmt(e.target.value)}
                      min="10" step="0.01"
                    />
                  </div>
                  {previewAmt > 0 && (
                    <div className={styles.preview}>
                      <div className={styles.previewRow}>
                        <span>Ganancia diaria:</span>
                        <strong style={{ color: '#059669' }}>+{formatCurrency(previewDaily)}</strong>
                      </div>
                      <div className={styles.previewRow}>
                        <span>Ganancia mensual:</span>
                        <strong style={{ color: '#059669' }}>+{formatCurrency(previewMonthly)}</strong>
                      </div>
                    </div>
                  )}
                </div>

                <button type="submit" className={styles.depositBtn} disabled={isLoading}>
                  {isLoading
                    ? <><span className={styles.spinner} /> Procesando...</>
                    : <><i className="fas fa-circle-down" /> Depositar ahora</>
                  }
                </button>
              </form>

              <div className={styles.securityNote}>
                <i className="fas fa-lock" />
                <span>Fondos protegidos y asegurados. Retiro disponible en cualquier momento.</span>
              </div>
            </>
          ) : (
            <div className={styles.depositSuccess}>
              <div className={styles.successIcon}><i className="fas fa-check" /></div>
              <h3 className={styles.successTitle}>¡Depósito realizado!</h3>
              <p className={styles.successDesc}>Tu inversión de <strong>{formatCurrency(parseFloat(depositAmt))}</strong> está activa.</p>
              <p className={styles.successSub}>Comenzarás a generar <strong>{formatCurrency(parseFloat(depositAmt) * plan.rate)}</strong> diarios.</p>
              <button className={styles.depositBtn} onClick={() => { setDepositStep('form'); setDepositAmt(''); }}>
                <i className="fas fa-plus" /> Nuevo depósito
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
