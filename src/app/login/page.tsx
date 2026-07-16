'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { ProFinanceLogo } from '@/components/ui/ProFinanceLogo';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }
    setIsLoading(true);
    setError(null);
    const result = await login(email, password);
    setIsLoading(false);
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className={styles.page}>
      <AnimatedBackground />

      <div className={styles.container}>
        <div className={styles.card}>
          <Link href="/" className={styles.backLink}>
            <i className="fas fa-arrow-left" /> Volver al inicio
          </Link>

          <div className={styles.logoArea}>
            <ProFinanceLogo size={64} />
            <h1 className={styles.brand}>
              Pro<span className={styles.brandHighlight}>Finance</span>
            </h1>
            <p className={styles.subtitle}>Portal de Clientes</p>
          </div>

          <h2 className={styles.title}>Bienvenido de vuelta</h2>
          <p className={styles.description}>Ingresa con tus credenciales para acceder a tu banca</p>

          {error && (
            <div className={styles.errorAlert}>
              <i className="fas fa-circle-exclamation" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Correo electrónico</label>
              <div className={styles.inputWrapper}>
                <i className={`fas fa-envelope ${styles.inputIcon}`} />
                <input
                  type="email"
                  className={styles.input}
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Contraseña</label>
              <div className={styles.inputWrapper}>
                <i className={`fas fa-lock ${styles.inputIcon}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.toggleBtn}
                  onClick={() => setShowPassword(p => !p)}
                  tabIndex={-1}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? (
                <><span className={styles.spinner} /> Verificando...</>
              ) : (
                <><i className="fas fa-right-to-bracket" /> Ingresar al Dashboard</>
              )}
            </button>
          </form>

          <div className={styles.divider}>
            <span>¿Primera vez aquí?</span>
          </div>

          <Link href="/configurar-acceso" className={styles.setupLink}>
            <i className="fas fa-user-gear" />
            Configura tu acceso al portal
          </Link>

          <div className={styles.demoInfo}>
            <p className={styles.demoTitle}><i className="fas fa-circle-info" /> Acceso demo</p>
            <p>Email: <code>demo@profinance.com</code></p>
            <p>Configura tu contraseña en &quot;Configura tu acceso&quot;</p>
            <p className={styles.demoDoc}>Documento: <code>12345678</code></p>
          </div>
        </div>

        <p className={styles.footer}>
          © 2025 ProFinance · Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}
