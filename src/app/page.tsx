import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <Navbar />

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={`${styles.title} animate-fade-in`}>
            El Futuro de la <span className={styles.gradientText}>Banca</span> ya está aquí
          </h1>
          <p className={`${styles.description} animate-fade-in`}>
            Experimenta una forma fluida, segura y elegante de gestionar tus finanzas.
            Únete a miles de usuarios que confían en ProBank para sus transacciones diarias.
          </p>
          <div className={`${styles.cta} animate-fade-in`}>
            <Button size="lg">Abrir Cuenta</Button>
            <Button variant="secondary" size="lg">Saber Más</Button>
          </div>
        </div>

        <div className={`${styles.heroImage} animate-float`}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardLogo}>ProBank</div>
              <div className={styles.cardChip}></div>
            </div>
            <div className={styles.cardNumber}>**** **** **** 4242</div>
            <div className={styles.cardFooter}>
              <div>
                <div className={styles.cardLabel}>Titular</div>
                <div className={styles.cardValue}>ALEX RIVERA</div>
              </div>
              <div>
                <div className={styles.cardLabel}>Vence</div>
                <div className={styles.cardValue}>12/28</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className={styles.features}>
        <h2 className={styles.sectionTitle}>¿Por qué elegir ProBank?</h2>
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
