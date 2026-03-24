import { Navbar } from '@/components/layout/Navbar';
import styles from './page.module.css';

async function fetchRecentCustomers() {
    // Datos mock listos como fallback
    const mockData = [
        { id: 1, name: "María Alejandra Gómez", email: "maria.g@email.com", date: "Hoy, 16:45", status: "Activo", avatar: "https://api.dicebear.com/7.x/micah/svg?backgroundColor=transparent&seed=maria" },
        { id: 2, name: "Carlos David Ruiz", email: "carlos.r@email.com", date: "Hoy, 14:20", status: "En revisión", avatar: "https://api.dicebear.com/7.x/micah/svg?backgroundColor=transparent&seed=carlos" },
        { id: 3, name: "Ana Patricia Silva", email: "ana.s@email.com", date: "Hoy, 11:10", status: "Activo", avatar: "https://api.dicebear.com/7.x/micah/svg?backgroundColor=transparent&seed=ana" },
        { id: 4, name: "Luis Fernando Torres", email: "luis.t@email.com", date: "Ayer, 09:30", status: "Activo", avatar: "https://api.dicebear.com/7.x/micah/svg?backgroundColor=transparent&seed=luis" },
        { id: 5, name: "Sofia Elena Castro", email: "sofia.c@email.com", date: "Ayer, 18:15", status: "Activo", avatar: "https://api.dicebear.com/7.x/micah/svg?backgroundColor=transparent&seed=sofia" },
    ];

    try {
        const res = await fetch('https://azure-app-shopping-cart-reload-225fb76523b0.herokuapp.com/api/customer/customers', { cache: 'no-store' });
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                const apiCustomers = data.slice(-5).reverse().map((u: any, i: number) => {
                    const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Cliente Registrado';
                    const email = u.email || `cliente${i}@oculta.com`; // base random generator token
                    return {
                        id: u.id || `api-${i}`,
                        name,
                        email,
                        date: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Reciente',
                        status: (u.status && u.status !== 'CREATE_CUSTOMER') ? u.status : 'Activo',
                        avatar: `https://api.dicebear.com/7.x/micah/svg?backgroundColor=transparent&seed=${encodeURIComponent(email)}`
                    };
                });

                if (apiCustomers.length < 5) {
                    return [...apiCustomers, ...mockData.slice(apiCustomers.length)];
                }
                
                return apiCustomers;
            }
        }
    } catch (e) {
        // Fallback
    }

    return mockData;
}

export default async function BancaPersonas() {
    const recentCustomers = await fetchRecentCustomers();

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

            {/* Layout principal dividido en dos columnas */}
            <div className={styles.contentLayout}>
                {/* Contenido Principal (Izquierda) */}
                <div className={styles.mainContent}>
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
                </div>

                {/* Widget Lateral / Clientes (Derecha) */}
                <aside className={styles.sidebarRight}>
                    <div className={styles.glassWidget}>
                        <div className={styles.widgetHeader}>
                            <h2>Clientes Registrados</h2>
                        </div>
                        <div className={styles.widgetList}>
                            {recentCustomers.map((customer) => (
                                <div key={customer.id} className={styles.widgetItem}>
                                    <div className={styles.avatarWrapper}>
                                        <img src={customer.avatar} alt={customer.name} className={styles.avatarImg} />
                                        <div className={`${styles.statusDot} ${customer.status === 'Activo' ? styles.statusGreen : styles.statusYellow}`}></div>
                                    </div>
                                    <div className={styles.itemInfo}>
                                        <h4>{customer.name}</h4>
                                        <p>{customer.email}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className={styles.widgetFooter}>
                            <div className={styles.footerGlass}>
                                <span>Monitoreo Global En Vivo</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
}
