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
            The Future of <span className={styles.gradientText}>Banking</span> is Here
          </h1>
          <p className={`${styles.description} animate-fade-in`}>
            Experience a seamless, secure, and elegant way to manage your finances.
            Join thousands of users who trust ProBank for their daily transactions.
          </p>
          <div className={`${styles.cta} animate-fade-in`}>
            <Button size="lg">Open Account</Button>
            <Button variant="secondary" size="lg">Learn More</Button>
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
                <div className={styles.cardLabel}>Card Holder</div>
                <div className={styles.cardValue}>ALEX RIVERA</div>
              </div>
              <div>
                <div className={styles.cardLabel}>Expires</div>
                <div className={styles.cardValue}>12/28</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className={styles.features}>
        <h2 className={styles.sectionTitle}>Why Choose ProBank?</h2>
        <div className={styles.grid}>
          <div className={`${styles.featureCard} glass`}>
            <div className={styles.icon}>🔒</div>
            <h3>Secure by Design</h3>
            <p>Military-grade encryption for all your financial data and transactions.</p>
          </div>
          <div className={`${styles.featureCard} glass`}>
            <div className={styles.icon}>⚡</div>
            <h3>Instant Transfers</h3>
            <p>Send and receive money globally in seconds with zero hidden fees.</p>
          </div>
          <div className={`${styles.featureCard} glass`}>
            <div className={styles.icon}>📊</div>
            <h3>Smart Analytics</h3>
            <p>Get deep insights into your spending habits with AI-powered reports.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
