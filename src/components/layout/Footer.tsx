import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    <div className={styles.brand}>
                        <Link href="/" className={styles.logo}>
                            <span className={styles.logoText}>Pro</span>Bank
                        </Link>
                        <p className={styles.description}>
                            Redefiniendo el futuro de las finanzas con tecnología de vanguardia y diseño elegante.
                        </p>
                    </div>

                    <div className={styles.linksGroup}>
                        <h4>Productos</h4>
                        <Link href="/banca-personas">Banca Personas</Link>
                        <Link href="#">Tarjetas</Link>
                        <Link href="#">Préstamos</Link>
                    </div>

                    <div className={styles.linksGroup}>
                        <h4>Empresa</h4>
                        <Link href="#">Sobre Nosotros</Link>
                        <Link href="#">Carreras</Link>
                        <Link href="#">Contacto</Link>
                    </div>

                    <div className={styles.linksGroup}>
                        <h4>Legal</h4>
                        <Link href="#">Privacidad</Link>
                        <Link href="#">Términos</Link>
                        <Link href="#">Seguridad</Link>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p>&copy; {new Date().getFullYear()} ProBank. Todos los derechos reservados.</p>
                    <div className={styles.socials}>
                        <Link href="#">LinkedIn</Link>
                        <Link href="#">Twitter</Link>
                        <Link href="#">Instagram</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
