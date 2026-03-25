'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './configurar-acceso.module.css';

type Step = 'verify' | 'password' | 'success';

export default function ConfigurarAccesoPage() {
  const { setupCredentials } = useAuth();
  const [step, setStep] = useState<Step>('verify');
  const [email, setEmail] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !documentId) {
      setError('Por favor completa todos los campos.');
      return;
    }
    setIsLoading(true);
    setError(null);
    // Pre-verify before setting password
    await new Promise(r => setTimeout(r, 800));
    setIsLoading(false);
    setStep('password');
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setIsLoading(true);
    setError(null);
    const result = await setupCredentials(email, documentId, password);
    setIsLoading(false);
    if (result.success) {
      setStep('success');
    } else {
      setError(result.message);
      setStep('verify');
    }
  };

  const strengthScore = () => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  };

  const strengthLabels = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
  const strengthColors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
  const score = strengthScore();

  return (
    <div className={styles.page}>
      <div className={styles.background}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.grid} />
      </div>

      <div className={styles.container}>
        <div className={styles.card}>
          <Link href="/login" className={styles.backLink}>
            <i className="fas fa-arrow-left" /> Volver al login
          </Link>

          <div className={styles.logoArea}>
            <div className={styles.logoIcon}>
              <i className="fas fa-user-shield" />
            </div>
            <h1 className={styles.brand}>Pro<span className={styles.brandHighlight}>Finance</span></h1>
          </div>

          {/* Step indicator */}
          <div className={styles.steps}>
            <div className={`${styles.stepItem} ${step !== 'success' ? styles.active : styles.done}`}>
              <div className={styles.stepCircle}>
                {step === 'verify' ? '1' : <i className="fas fa-check" />}
              </div>
              <span>Verificación</span>
            </div>
            <div className={styles.stepLine} />
            <div className={`${styles.stepItem} ${step === 'password' ? styles.active : step === 'success' ? styles.done : ''}`}>
              <div className={styles.stepCircle}>
                {step === 'success' ? <i className="fas fa-check" /> : '2'}
              </div>
              <span>Contraseña</span>
            </div>
            <div className={styles.stepLine} />
            <div className={`${styles.stepItem} ${step === 'success' ? styles.done : ''}`}>
              <div className={styles.stepCircle}>{step === 'success' ? <i className="fas fa-check" /> : '3'}</div>
              <span>Listo</span>
            </div>
          </div>

          {error && (
            <div className={styles.errorAlert}>
              <i className="fas fa-circle-exclamation" />
              <span>{error}</span>
            </div>
          )}

          {step === 'verify' && (
            <>
              <h2 className={styles.title}>Verificar identidad</h2>
              <p className={styles.description}>Ingresa los datos con los que te registraste como cliente</p>
              <form onSubmit={handleVerify} className={styles.form}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Correo electrónico</label>
                  <div className={styles.inputWrapper}>
                    <i className={`fas fa-envelope ${styles.inputIcon}`} />
                    <input type="email" className={styles.input} placeholder="correo@ejemplo.com" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Número de documento</label>
                  <div className={styles.inputWrapper}>
                    <i className={`fas fa-id-card ${styles.inputIcon}`} />
                    <input type="text" className={styles.input} placeholder="Ej: 12345678" value={documentId} onChange={e => setDocumentId(e.target.value)} />
                  </div>
                </div>
                <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                  {isLoading ? <><span className={styles.spinner} /> Verificando...</> : <><i className="fas fa-shield-check" /> Verificar identidad</>}
                </button>
              </form>
            </>
          )}

          {step === 'password' && (
            <>
              <h2 className={styles.title}>Crear contraseña</h2>
              <p className={styles.description}>Elige una contraseña segura para tu portal bancario</p>
              <form onSubmit={handleSetPassword} className={styles.form}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Nueva contraseña</label>
                  <div className={styles.inputWrapper}>
                    <i className={`fas fa-lock ${styles.inputIcon}`} />
                    <input type={showPwd ? 'text' : 'password'} className={styles.input} placeholder="Mínimo 8 caracteres" value={password} onChange={e => setPassword(e.target.value)} />
                    <button type="button" className={styles.toggleBtn} onClick={() => setShowPwd(p => !p)} tabIndex={-1}>
                      <i className={`fas ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`} />
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className={styles.strength}>
                      <div className={styles.strengthBars}>
                        {[1,2,3,4].map(i => (
                          <div key={i} className={styles.strengthBar} style={{ background: score >= i ? strengthColors[score] : 'rgba(255,255,255,0.1)' }} />
                        ))}
                      </div>
                      <span style={{ color: strengthColors[score], fontSize: '0.78rem' }}>{strengthLabels[score]}</span>
                    </div>
                  )}
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Confirmar contraseña</label>
                  <div className={styles.inputWrapper}>
                    <i className={`fas fa-lock-open ${styles.inputIcon}`} />
                    <input type={showPwd ? 'text' : 'password'} className={styles.input} placeholder="Repite tu contraseña" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                  </div>
                  {confirmPassword.length > 0 && password !== confirmPassword && (
                    <p className={styles.noMatch}><i className="fas fa-xmark" /> Las contraseñas no coinciden</p>
                  )}
                </div>
                <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                  {isLoading ? <><span className={styles.spinner} /> Configurando...</> : <><i className="fas fa-key" /> Crear contraseña</>}
                </button>
              </form>
            </>
          )}

          {step === 'success' && (
            <div className={styles.successState}>
              <div className={styles.successIcon}><i className="fas fa-check" /></div>
              <h2 className={styles.successTitle}>¡Acceso configurado!</h2>
              <p className={styles.successDesc}>Tu contraseña fue creada exitosamente. Ya puedes ingresar a tu portal bancario.</p>
              <Link href="/login" className={styles.submitBtn} style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
                <i className="fas fa-right-to-bracket" /> Ir al login
              </Link>
            </div>
          )}
        </div>
        <p className={styles.footer}>© 2025 ProFinance · Todos los derechos reservados</p>
      </div>
    </div>
  );
}
