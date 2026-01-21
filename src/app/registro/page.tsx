'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import styles from './registro.module.css';

export default function Registro() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        documentId: '',
        phoneNumber: '',
        comment: ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string | null }>({ type: null, message: null });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: null, message: null });

        try {
            const response = await fetch('https://azure-app-shopping-cart-reload-225fb76523b0.herokuapp.com/api/customer/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                // Segundo paso: Enviar datos al webhook de n8n
                try {
                    await fetch('https://whuera.app.n8n.cloud/webhook/02fa2490-a834-473c-b197-b8f478a8e004', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(formData),
                    });
                } catch (webhookError) {
                    console.error('Error enviando al webhook:', webhookError);
                }

                setStatus({ type: 'success', message: '¡Cuenta creada exitosamente!' });
                // Reset form
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    documentId: '',
                    phoneNumber: '',
                    comment: ''
                });
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Error:', errorData);
                setStatus({ type: 'error', message: 'Hubo un error al crear la cuenta. Por favor intenta nuevamente.' });
            }
        } catch (error) {
            console.error('Error de red:', error);
            setStatus({ type: 'error', message: 'Error de conexión. Verifica tu internet.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className={styles.main}>
            <Navbar />
            <div className={styles.container}>
                <div className={`${styles.formCard} card-acrylic animate-fade-in`}>
                    <h1 className={styles.title}>Únete a <span className={styles.gradientText}>ProBank</span></h1>
                    <p className={styles.subtitle}>Completa tus datos para abrir tu cuenta en minutos.</p>

                    {status.message && (
                        <div className={status.type === 'success' ? styles.successMessage : styles.errorMessage}>
                            {status.message}
                        </div>
                    )}

                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.row}>
                            <div className={styles.inputGroup}>
                                <label>Nombre</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="Ej. Juan"
                                    className={styles.input}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Apellido</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Ej. Pérez"
                                    className={styles.input}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Correo Electrónico</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="juan@ejemplo.com"
                                className={styles.input}
                                required
                            />
                        </div>

                        <div className={styles.row}>
                            <div className={styles.inputGroup}>
                                <label>DNI / Pasaporte</label>
                                <input
                                    type="text"
                                    name="documentId"
                                    value={formData.documentId}
                                    onChange={handleChange}
                                    placeholder="Número de identificación"
                                    className={styles.input}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Teléfono</label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="099123456"
                                    className={styles.input}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Comentario / Motivo</label>
                            <textarea
                                name="comment"
                                value={formData.comment}
                                onChange={handleChange}
                                placeholder="¿Por qué quieres unirte a ProBank?"
                                className={styles.textarea}
                                rows={3}
                            />
                        </div>

                        <div className={styles.checkboxGroup}>
                            <input type="checkbox" id="terms" required />
                            <label htmlFor="terms">Acepto los términos y condiciones</label>
                        </div>

                        <Button
                            variant="primary"
                            size="lg"
                            className={styles.submitBtn}
                            disabled={loading}
                        >
                            {loading ? 'Procesando...' : 'Crear Cuenta'}
                        </Button>
                    </form>
                </div>
            </div>
        </main>
    );
}
