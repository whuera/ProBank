'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './transferencias.module.css';

type Step = 'form' | 'confirm' | 'token' | 'success';

interface RiskData {
  score: number;
  predictedAmount: number;
  factors: string[];
}

const QUICK_AMOUNTS = [50, 100, 200, 500];
const TOKEN_LENGTH = 6;
const HIGH_RISK_THRESHOLD = 0.5;

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'USD' }).format(n);
}

export default function TransferenciasPage() {
  const { user, addTransaction, consumeToken, securityTokens, totpEnabled, verifyTotp } = useAuth();
  const [step, setStep] = useState<Step>('form');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [riskData, setRiskData] = useState<RiskData | null>(null);

  // Token input state — 6 individual digits
  const [tokenDigits, setTokenDigits] = useState<string[]>(Array(TOKEN_LENGTH).fill(''));
  const [tokenError, setTokenError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  if (!user) return null;

  const availableTokens = securityTokens.filter(t => !t.used).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!recipient) { setError('Ingresa el correo o número de cuenta del destinatario.'); return; }
    if (!amount || isNaN(amt) || amt <= 0) { setError('Ingresa un monto válido.'); return; }
    if (amt > user.checkingBalance) { setError(`Saldo insuficiente. Tu saldo disponible es ${formatCurrency(user.checkingBalance)}.`); return; }
    if (amt > 5000) { setError('El monto máximo por transferencia es $5,000.00.'); return; }
    setError(null);
    setStep('confirm');
  };

  const callRiskApi = async (): Promise<RiskData> => {
    const amt = parseFloat(amount);
    const now = new Date();
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_type: 'Debit',
          channel: 'Online',
          location: 'Los Angeles',
          customer_occupation: 'Doctor',
          customer_age: 30,
          transaction_duration: 45,
          login_attempts: 1,
          account_balance: user.checkingBalance,
          transaction_date: now.toISOString(),
        }),
      });
      const data = await res.json();
      const predicted = data.predicted_amount;
      const ratio = amt / Math.max(predicted, 1);
      const score = Math.min(parseFloat(Math.max(0, 1 - 1 / ratio).toFixed(2)), 1);

      const factors: string[] = [];
      if (ratio > 2) factors.push('Monto muy por encima del promedio habitual de esta cuenta');
      const hour = now.getHours();
      if (hour < 6 || hour >= 23) factors.push(`Horario inusual: ${now.toLocaleTimeString('es-HN', { hour: 'numeric', minute: '2-digit', hour12: true })}`);
      factors.push('Destinatario nuevo, sin transferencias previas');
      if (amt > 1000) factors.push('Transferencia superior a $1,000.00');

      return { score, predictedAmount: predicted, factors };
    } catch {
      return { score: 0, predictedAmount: 0, factors: ['No se pudo evaluar el riesgo'] };
    }
  };

  const executeTransfer = (risk: RiskData) => {
    const txId = `TX-${Date.now()}`;
    const now = new Date().toISOString();
    const amt = parseFloat(amount);

    addTransaction({
      type: 'transfer_out',
      amount: -amt,
      description: `Transferencia enviada - ${recipient}`,
      status: 'completed',
      counterparty: recipient,
      riskScore: risk.score,
    });

    // Send email notification to recipient (fire-and-forget)
    fetch('/api/send-transfer-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientEmail: recipient,
        senderName: user.name,
        amount: amt,
        description: description || undefined,
        transactionId: txId,
        date: now,
      }),
    }).catch(() => {
      // Email is non-blocking; silently ignore errors
    });
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    const risk = await callRiskApi();
    setRiskData(risk);
    setIsLoading(false);

    if (risk.score >= HIGH_RISK_THRESHOLD) {
      // High risk — require token verification
      setTokenDigits(Array(TOKEN_LENGTH).fill(''));
      setTokenError(null);
      setStep('token');
    } else {
      // Low risk — proceed directly
      executeTransfer(risk);
      setStep('success');
    }
  };

  const handleTokenDigitChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const next = [...tokenDigits];
    next[index] = value;
    setTokenDigits(next);
    setTokenError(null);

    if (value && index < TOKEN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleTokenKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !tokenDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleTokenPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, TOKEN_LENGTH);
    if (!pasted) return;
    const next = Array(TOKEN_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setTokenDigits(next);
    const focusIdx = Math.min(pasted.length, TOKEN_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleTokenSubmit = () => {
    const code = tokenDigits.join('');
    if (code.length < TOKEN_LENGTH) {
      setTokenError('Ingresa los 6 dígitos del token.');
      return;
    }
    // Try TOTP first if authenticator is enabled, then fall back to static tokens
    const validTotp = totpEnabled && verifyTotp(code);
    const validStatic = !validTotp && consumeToken(code);
    if (!validTotp && !validStatic) {
      setTokenError('Código inválido. Verifica tu Authenticator o usa un token estático.');
      setTokenDigits(Array(TOKEN_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      return;
    }
    if (!riskData) return;
    executeTransfer(riskData);
    setStep('success');
  };

  const handleReset = () => {
    setStep('form');
    setRecipient('');
    setAmount('');
    setDescription('');
    setError(null);
    setRiskData(null);
    setTokenDigits(Array(TOKEN_LENGTH).fill(''));
    setTokenError(null);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Transferencias</h1>
        <p className={styles.subtitle}>Envía dinero de forma rápida y segura</p>
      </div>

      <div className={styles.layout}>
        <div className={styles.mainCard}>
          {/* ── STEP: Form ── */}
          {step === 'form' && (
            <>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}><i className="fas fa-paper-plane" /></div>
                <div>
                  <h2 className={styles.cardTitle}>Nueva Transferencia</h2>
                  <p className={styles.cardSub}>Saldo disponible: <strong>{formatCurrency(user.checkingBalance)}</strong></p>
                </div>
              </div>

              {error && (
                <div className={styles.errorAlert}>
                  <i className="fas fa-circle-exclamation" /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Destinatario</label>
                  <p className={styles.labelHint}>Correo electrónico o número de cuenta ProFinance</p>
                  <div className={styles.inputWrapper}>
                    <i className={`fas fa-user ${styles.inputIcon}`} />
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="correo@ejemplo.com o PF-0001-XXXX"
                      value={recipient}
                      onChange={e => setRecipient(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Monto a transferir</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.currencyPrefix}>$</span>
                    <input
                      type="number"
                      className={`${styles.input} ${styles.inputCurrency}`}
                      placeholder="0.00"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                  <div className={styles.quickAmounts}>
                    {QUICK_AMOUNTS.map(qa => (
                      <button key={qa} type="button" className={styles.qaBtn} onClick={() => setAmount(String(qa))}>
                        ${qa}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Descripción <span className={styles.optional}>(opcional)</span></label>
                  <div className={styles.inputWrapper}>
                    <i className={`fas fa-comment ${styles.inputIcon}`} />
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Ej: Pago alquiler, deuda, etc."
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      maxLength={80}
                    />
                  </div>
                </div>

                <button type="submit" className={styles.submitBtn}>
                  <i className="fas fa-paper-plane" /> Continuar
                </button>
              </form>
            </>
          )}

          {/* ── STEP: Confirm ── */}
          {step === 'confirm' && (
            <div className={styles.confirmStep}>
              <div className={styles.confirmIcon}><i className="fas fa-paper-plane" /></div>
              <h2 className={styles.confirmTitle}>Confirmar transferencia</h2>
              <div className={styles.confirmDetails}>
                <div className={styles.confirmRow}>
                  <span>Destinatario</span>
                  <strong>{recipient}</strong>
                </div>
                <div className={styles.confirmRow}>
                  <span>Monto</span>
                  <strong className={styles.confirmAmount}>{formatCurrency(parseFloat(amount))}</strong>
                </div>
                {description && (
                  <div className={styles.confirmRow}>
                    <span>Descripción</span>
                    <strong>{description}</strong>
                  </div>
                )}
                <div className={styles.confirmRow}>
                  <span>Saldo después</span>
                  <strong>{formatCurrency(user.checkingBalance - parseFloat(amount))}</strong>
                </div>
              </div>
              <div className={styles.confirmActions}>
                <button className={styles.cancelBtn} onClick={() => setStep('form')} disabled={isLoading}>
                  <i className="fas fa-arrow-left" /> Editar
                </button>
                <button className={styles.confirmBtn} onClick={handleConfirm} disabled={isLoading}>
                  {isLoading ? <><span className={styles.spinner} /> Evaluando riesgo...</> : <><i className="fas fa-check" /> Confirmar envío</>}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP: Token verification (high risk) ── */}
          {step === 'token' && riskData && (
            <div className={styles.tokenStep}>
              <div className={styles.tokenShieldIcon}><i className="fas fa-shield-halved" /></div>
              <h2 className={styles.tokenTitle}>Verificación de seguridad</h2>
              <p className={styles.tokenDesc}>
                Esta transacción fue marcada con <strong>riesgo alto (score {riskData.score.toFixed(2)})</strong>.
                Ingresa un token de seguridad de 6 dígitos para continuar.
              </p>

              {/* Risk factors mini card */}
              <div className={styles.tokenRiskCard}>
                <p className={styles.tokenRiskLabel}>
                  <i className="fas fa-triangle-exclamation" /> Factores detectados
                </p>
                <ul className={styles.riskFactors}>
                  {riskData.factors.map((f, i) => (
                    <li key={i}>
                      <span className={styles.riskDotHigh} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Token input */}
              <div className={styles.tokenInputGroup}>
                <label className={styles.label}>Token de seguridad</label>
                <div className={styles.tokenDigits} onPaste={handleTokenPaste}>
                  {tokenDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className={`${styles.tokenDigitInput} ${tokenError ? styles.tokenDigitError : ''}`}
                      value={digit}
                      onChange={e => handleTokenDigitChange(i, e.target.value)}
                      onKeyDown={e => handleTokenKeyDown(i, e)}
                      autoFocus={i === 0}
                    />
                  ))}
                </div>
                {tokenError && (
                  <div className={styles.errorAlert} style={{ marginBottom: 0, marginTop: 8 }}>
                    <i className="fas fa-circle-exclamation" /> {tokenError}
                  </div>
                )}
                <p className={styles.tokenHint}>
                  {totpEnabled ? (
                    <><i className="fas fa-mobile-screen" /> Usa el código de tu <strong>Authenticator</strong> o un token estático</>
                  ) : (
                    <>
                      <i className="fas fa-key" /> Tokens disponibles: <strong>{availableTokens}</strong>
                      {availableTokens === 0 && (
                        <span className={styles.tokenNoTokens}> — Genera tokens o configura Authenticator desde tu Dashboard</span>
                      )}
                    </>
                  )}
                </p>
              </div>

              <div className={styles.confirmActions}>
                <button className={styles.cancelBtn} onClick={() => setStep('confirm')}>
                  <i className="fas fa-arrow-left" /> Volver
                </button>
                <button
                  className={styles.confirmBtn}
                  onClick={handleTokenSubmit}
                  disabled={tokenDigits.join('').length < TOKEN_LENGTH}
                >
                  <i className="fas fa-lock-open" /> Verificar y transferir
                </button>
              </div>
            </div>
          )}

          {/* ── STEP: Success ── */}
          {step === 'success' && (
            <div className={styles.successStep}>
              <div className={styles.riskHeader}>
                <div className={styles.riskHeaderLeft}>
                  <div className={riskData && riskData.score >= HIGH_RISK_THRESHOLD ? styles.riskIconWarning : styles.successIcon}>
                    <i className={riskData && riskData.score >= HIGH_RISK_THRESHOLD ? 'fas fa-exclamation' : 'fas fa-check'} />
                  </div>
                  <div>
                    <h2 className={styles.riskTitle}>Transferencia enviada</h2>
                    <p className={styles.riskSubtitle}>
                      {riskData && riskData.score >= HIGH_RISK_THRESHOLD ? 'Verificada con token de seguridad' : 'Procesada correctamente'}
                    </p>
                  </div>
                </div>
                <span className={styles.riskAmount}>-{formatCurrency(parseFloat(amount))}</span>
              </div>

              {riskData && (
                <div className={riskData.score >= HIGH_RISK_THRESHOLD ? styles.riskCard : styles.riskCardLow}>
                  <p className={riskData.score >= HIGH_RISK_THRESHOLD ? styles.riskScoreHigh : styles.riskScoreLow}>
                    Score de riesgo: {riskData.score.toFixed(2)} de 1.00
                  </p>
                  {riskData.predictedAmount > 0 && (
                    <p className={styles.riskPredicted}>
                      Monto promedio estimado por el modelo: {formatCurrency(riskData.predictedAmount)}
                    </p>
                  )}
                  <ul className={styles.riskFactors}>
                    {riskData.factors.map((f, i) => (
                      <li key={i}>
                        <span className={riskData.score >= HIGH_RISK_THRESHOLD ? styles.riskDotHigh : styles.riskDotLow} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button className={styles.submitBtn} onClick={handleReset}>
                <i className="fas fa-plus" /> Nueva transferencia
              </button>
            </div>
          )}
        </div>

        {/* Info sidebar */}
        <div className={styles.infoPanel}>
          <div className={styles.infoCard}>
            <div className={styles.infoHeader}>
              <i className="fas fa-circle-info" />
              <h3>Información</h3>
            </div>
            <ul className={styles.infoList}>
              <li><i className="fas fa-check-circle" /> Transferencias instantáneas entre cuentas ProFinance</li>
              <li><i className="fas fa-check-circle" /> Monto mínimo: $0.01</li>
              <li><i className="fas fa-check-circle" /> Monto máximo: $5,000 por operación</li>
              <li><i className="fas fa-check-circle" /> Sin costo adicional</li>
              <li><i className="fas fa-check-circle" /> Disponible 24/7</li>
            </ul>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoHeader}>
              <i className="fas fa-shield-halved" />
              <h3>Seguridad</h3>
            </div>
            <ul className={styles.infoList}>
              <li><i className="fas fa-check-circle" /> Cada transacción es evaluada por IA</li>
              <li><i className="fas fa-check-circle" /> Score alto requiere token de verificación</li>
              <li><i className="fas fa-check-circle" /> Genera tokens desde tu Dashboard</li>
            </ul>
          </div>

          <div className={styles.balanceCard}>
            <p className={styles.balanceLabel}>Saldo Corriente</p>
            <p className={styles.balanceAmount}>{formatCurrency(user.checkingBalance)}</p>
            <div className={styles.balancePill}>
              <i className="fas fa-shield-check" /> Fondos protegidos
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
