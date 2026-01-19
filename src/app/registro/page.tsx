import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import styles from './registro.module.css';

export default function Registro() {
    return (
        <main className={styles.main}>
            <Navbar />
            <div className={styles.container}>
                <div className={`${styles.formCard} card-acrylic animate-fade-in`}>
                    <h1 className={styles.title}>Únete a <span className={styles.gradientText}>ProBank</span></h1>
                    <p className={styles.subtitle}>Completa tus datos para abrir tu cuenta en minutos.</p>

                    <form className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>Nombre Completo</label>
                            <input type="text" placeholder="Ej. Juan Pérez" className={styles.input} />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Correo Electrónico</label>
                            <input type="email" placeholder="juan@ejemplo.com" className={styles.input} />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>DNI / Pasaporte</label>
                            <input type="text" placeholder="Número de identificación" className={styles.input} />
                        </div>

                        <div className={styles.checkboxGroup}>
                            <input type="checkbox" id="terms" />
                            <label htmlFor="terms">Acepto los términos y condiciones</label>
                        </div>

                        <Button variant="primary" size="lg" className={styles.submitBtn}>
                            Crear Cuenta
                        </Button>
                    </form>
                </div>
            </div>
        </main>
    );
}
