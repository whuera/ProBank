'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './tarjeta.module.css';

function ChipSVG() {
  return (
    <svg width="48" height="38" viewBox="0 0 48 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="38" rx="6" fill="#c9a227" />
      <rect x="2" y="2" width="44" height="34" rx="4" fill="#dbb944" />
      <rect x="8" y="12" width="32" height="14" rx="3" fill="#b8921e" />
      <line x1="0" y1="12" x2="48" y2="12" stroke="#c9a227" strokeWidth="1.5" />
      <line x1="0" y1="26" x2="48" y2="26" stroke="#c9a227" strokeWidth="1.5" />
      <line x1="16" y1="0" x2="16" y2="38" stroke="#c9a227" strokeWidth="1.5" />
      <line x1="32" y1="0" x2="32" y2="38" stroke="#c9a227" strokeWidth="1.5" />
      <rect x="20" y="14" width="8" height="10" rx="2" fill="#b8921e" />
    </svg>
  );
}

export default function TarjetaPage() {
  const { user, card, generateCard, toggleCardStatus } = useAuth();
  const [flipped, setFlipped] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [showPan, setShowPan] = useState(false);

  if (!user) return null;

  const maskedNumber = card
    ? `**** **** **** ${card.cardNumber.slice(-4)}`
    : '';

  const fullNumber = card
    ? card.cardNumber.replace(/(.{4})/g, '$1 ').trim()
    : '';

  const displayNumber = showPan ? fullNumber : maskedNumber;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Tarjeta de Débito VISA</h1>
        <p className={styles.pageSubtitle}>
          <i className="fas fa-link" />
          Tarjeta virtual vinculada a tu Cuenta Corriente
        </p>
      </div>

      {/* No-card state */}
      {!card && (
        <div className={styles.noCardSection}>
          <div className={styles.ghostCard}>
            <i className="fas fa-credit-card" />
            <p>VISA VIRTUAL</p>
          </div>

          <h2 className={styles.noCardTitle}>Genera tu tarjeta VISA virtual</h2>
          <p className={styles.noCardDesc}>
            Tu tarjeta de débito VISA virtual está vinculada directamente a tu cuenta corriente.
            Úsala para pagos en línea, suscripciones y compras digitales dentro del sistema ProFinance.
            Es completamente gratuita y se genera al instante.
          </p>

          <div className={styles.noCardFeatures}>
            <span className={styles.featureChip}><i className="fas fa-check" /> Gratuita</span>
            <span className={styles.featureChip}><i className="fas fa-check" /> Número Luhn válido</span>
            <span className={styles.featureChip}><i className="fas fa-check" /> CVV incluido</span>
            <span className={styles.featureChip}><i className="fas fa-check" /> Vinculada a cuenta corriente</span>
          </div>

          <button className={styles.generateBtn} onClick={generateCard}>
            <i className="fas fa-credit-card" /> Generar mi tarjeta VISA
          </button>
        </div>
      )}

      {/* Card state */}
      {card && (
        <>
          {/* 3D Flip Card */}
          <div className={styles.cardSection}>
            <div className={styles.cardScene}>
              <div
                className={`${styles.cardInner} ${flipped ? styles.flipped : ''}`}
                onClick={() => setFlipped(f => !f)}
                title="Click para girar la tarjeta"
              >
                {/* Front */}
                <div className={styles.cardFront}>
                  {card.status === 'frozen' && !flipped && (
                    <div className={styles.frozenOverlay}>
                      <i className="fas fa-snowflake" />
                      <span>CONGELADA</span>
                    </div>
                  )}

                  <div className={styles.cardTopRow}>
                    <div className={styles.cardChip}><ChipSVG /></div>
                    <div>
                      <div className={styles.visaLogo}>VISA</div>
                      <div className={styles.virtualBadge}>DEBIT · VIRTUAL</div>
                    </div>
                  </div>

                  <div className={styles.cardNumber}>{displayNumber}</div>

                  <div className={styles.cardBottomRow}>
                    <div className={styles.cardHolder}>
                      <p className={styles.cardHolderLabel}>TITULAR</p>
                      <p className={styles.cardHolderName}>{card.cardholderName}</p>
                    </div>
                    <div className={styles.cardExpiry}>
                      <p className={styles.cardExpiryLabel}>VENCE</p>
                      <p className={styles.cardExpiryValue}>{card.expiryMonth}/{card.expiryYear}</p>
                    </div>
                  </div>
                </div>

                {/* Back */}
                <div className={styles.cardBack}>
                  <div className={styles.magneticStripe} />

                  <div className={styles.signaturePanel}>
                    <span className={styles.signatureText}>ProFinance</span>
                    <div className={styles.cvvBox}>
                      <span className={styles.cvvLabel}>CVV</span>
                      <span className={`${styles.cvvValue} ${!showCvv ? styles.cvvHidden : ''}`}>
                        {showCvv ? card.cvv : '•••'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.cardBackBottom}>
                    <div className={styles.cardBackVisaLogo}>VISA</div>
                    <div className={styles.cardBackInfo}>
                      <p className={styles.cardBackInfoLine}>VISA Debit · Virtual</p>
                      <p className={styles.cardBackInfoLine}>No válida para uso físico</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className={styles.cardControls}>
              <button className={`${styles.controlBtn} ${styles.flipBtn}`} onClick={() => setFlipped(f => !f)}>
                <i className="fas fa-rotate" /> {flipped ? 'Ver frente' : 'Ver reverso'}
              </button>

              <button
                className={`${styles.controlBtn} ${styles.panBtn}`}
                onClick={() => setShowPan(v => !v)}
              >
                <i className={`fas ${showPan ? 'fa-eye-slash' : 'fa-eye'}`} />
                {showPan ? 'Ocultar PAN' : 'Ver PAN'}
              </button>

              <button
                className={`${styles.controlBtn} ${styles.cvvBtn}`}
                onClick={() => { setShowCvv(v => !v); if (!flipped) setFlipped(true); }}
              >
                <i className={`fas ${showCvv ? 'fa-eye-slash' : 'fa-eye'}`} />
                {showCvv ? 'Ocultar CVV' : 'Ver CVV'}
              </button>

              <button
                className={`${styles.controlBtn} ${card.status === 'active' ? styles.freezeBtn : styles.activateBtn}`}
                onClick={toggleCardStatus}
              >
                <i className={`fas ${card.status === 'active' ? 'fa-snowflake' : 'fa-circle-check'}`} />
                {card.status === 'active' ? 'Congelar' : 'Activar'}
              </button>

              <span className={`${styles.statusBadge} ${card.status === 'active' ? styles.statusActive : styles.statusFrozen}`}>
                <i className={`fas ${card.status === 'active' ? 'fa-circle-check' : 'fa-snowflake'}`} />
                {card.status === 'active' ? 'Activa' : 'Congelada'}
              </span>
            </div>
          </div>

          {/* Card details */}
          <div className={styles.detailsSection}>
            <p className={styles.sectionTitle}>Detalles de la tarjeta</p>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <p className={styles.detailLabel}>Número (PAN)</p>
                <p className={styles.detailValue}>{displayNumber}</p>
              </div>
              <div className={styles.detailItem}>
                <p className={styles.detailLabel}>Titular</p>
                <p className={styles.detailValuePlain}>{card.cardholderName}</p>
              </div>
              <div className={styles.detailItem}>
                <p className={styles.detailLabel}>Vencimiento</p>
                <p className={styles.detailValue}>{card.expiryMonth}/{card.expiryYear}</p>
              </div>
              <div className={styles.detailItem}>
                <p className={styles.detailLabel}>Red</p>
                <p className={styles.detailValuePlain}>{card.network}</p>
              </div>
              <div className={styles.detailItem}>
                <p className={styles.detailLabel}>Tipo</p>
                <p className={styles.detailValuePlain}>Virtual</p>
              </div>
              <div className={styles.detailItem}>
                <p className={styles.detailLabel}>Vinculada a</p>
                <p className={styles.detailValuePlain}>Cuenta Corriente N° {user.accountNumber}</p>
              </div>
              <div className={styles.detailItem}>
                <p className={styles.detailLabel}>Emitida el</p>
                <p className={styles.detailValuePlain}>
                  {new Date(card.createdAt).toLocaleDateString('es-HN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className={styles.infoSection}>
            <p className={styles.infoTitle}><i className="fas fa-circle-info" /> Información importante</p>
            <ul className={styles.infoList}>
              <li><i className="fas fa-circle-dot" /> Esta tarjeta es exclusivamente virtual y no tiene versión física.</li>
              <li><i className="fas fa-circle-dot" /> Los débitos se procesan directamente desde tu Cuenta Corriente ProFinance.</li>
              <li><i className="fas fa-circle-dot" /> Puedes congelar la tarjeta en cualquier momento para bloquear nuevas compras.</li>
              <li><i className="fas fa-circle-dot" /> El CVV es confidencial, no lo compartas con nadie.</li>
              <li><i className="fas fa-circle-dot" /> Usa esta tarjeta para pagos dentro del ecosistema ProFinance.</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
