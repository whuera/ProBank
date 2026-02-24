import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { TradingWidget } from '@/components/ui/TradingWidget';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <Navbar />

      <section className={styles.hero}>
        <div className={`${styles.heroGlassPanel} animate-fade-in`}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>
              El Futuro de la <span className={styles.gradientText}>Banca</span> ya está aquí
            </h1>
            <p className={styles.description}>
              Experimenta una forma fluida, segura y elegante de gestionar tus finanzas.
              Únete a miles de usuarios que confían en ProFinance para sus transacciones diarias.
            </p>
            <div className={styles.cta}>
              <Button size="lg">Abrir Cuenta</Button>
              <Button variant="secondary" size="lg">Saber Más</Button>
            </div>
          </div>
        </div>
        <div className={`${styles.heroWidgetPanel} animate-fade-in`}>
          {/* Widget dinámico de Mercados (TradingView) con estética Premium */}
          <TradingWidget />
        </div>
      </section>

      <section id="features" className={styles.features}>
        <h2 className={styles.sectionTitle}>¿Por qué elegir ProFinance?</h2>
        <div className={styles.grid}>
          <div className={`${styles.featureCard} glass`}>
            <div className={styles.icon}>🔒</div>
            <h3>Seguro por Diseño</h3>
            <p>Encriptación de grado militar para todos tus datos financieros y transacciones.</p>
          </div>
          <div className={`${styles.featureCard} glass`}>
            <div className={styles.icon}>⚡</div>
            <h3>Transferencias Instantáneas</h3>
            <p>Envía y recibe dinero globalmente en segundos sin comisiones ocultas.</p>
          </div>
          <div className={`${styles.featureCard} glass`}>
            <div className={styles.icon}>📊</div>
            <h3>Analítica Inteligente</h3>
            <p>Obtén información profunda sobre tus hábitos de gasto con informes impulsados por IA.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
