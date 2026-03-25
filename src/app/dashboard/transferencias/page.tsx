'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './transferencias.module.css';

type Step = 'form' | 'confirm' | 'success';

const QUICK_AMOUNTS = [50, 100, 200, 500];

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'USD' }).format(n);
}

export default function TransferenciasPage() {
  const { user, addTransaction } = useAuth();
  const [step, setStep] = useState<Step>('form');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

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

  const handleConfirm = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    addTransaction({
      type: 'transfer_out',
      amount: -parseFloat(amount),
      description: `Transferencia enviada - ${recipient}`,
      status: 'completed',
      counterparty: recipient,
    });
    setIsLoading(false);
    setStep('success');
  };

  const handleReset = () => {
    setStep('form');
    setRecipient('');
    setAmount('');
    setDescription('');
    setError(null);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Transferencias</h1>
        <p className={styles.subtitle}>Envía dinero de forma rápida y segura</p>
      </div>

      <div className={styles.layout}>
        {/* Transfer form / confirm / success */}
        <div className={styles.mainCard}>
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
                  {isLoading ? <><span className={styles.spinner} /> Procesando...</> : <><i className="fas fa-check" /> Confirmar envío</>}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className={styles.successStep}>
              <div className={styles.successIcon}><i className="fas fa-check" /></div>
              <h2 className={styles.successTitle}>¡Transferencia exitosa!</h2>
              <p className={styles.successDesc}>
                Has enviado <strong>{formatCurrency(parseFloat(amount))}</strong> a <strong>{recipient}</strong> exitosamente.
              </p>
              <p className={styles.successSub}>La transacción ha sido registrada en tu historial.</p>
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
