import { Navbar } from '@/components/layout/Navbar';
import styles from './page.module.css';

export default function BancaPersonas() {
    return (
        <main className={styles.main}>
            <Navbar />
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={`${styles.title} animate-fade-in`}>
                        Banca <span className={styles.gradientText}>Personas</span>
                    </h1>
                    <p className={`${styles.description} animate-fade-in`}>
                        Soluciones financieras diseñadas para tu estilo de vida.
                        Desde cuentas de ahorro hasta préstamos personales con las mejores tasas.
                    </p>
                </div>
            </section>

            <section className={styles.features}>
                <div className={styles.grid}>
                    <div className="card-acrylic" style={{ padding: '2rem' }}>
                        <h3>Cuentas</h3>
                        <p>Cuentas corrientes y de ahorro sin comisiones de mantenimiento.</p>
                    </div>
                    <div className="card-acrylic" style={{ padding: '2rem' }}>
                        <h3>Tarjetas</h3>
                        <p>Crédito y débito con beneficios exclusivos y cashback.</p>
                    </div>
                    <div className="card-acrylic" style={{ padding: '2rem' }}>
                        <h3>Préstamos</h3>
                        <p>Financiación inmediata para tus proyectos personales.</p>
                    </div>
                </div>
            </section>
        </main>
    );
}
