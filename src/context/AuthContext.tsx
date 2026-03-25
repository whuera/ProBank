'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface User {
  email: string;
  name: string;
  documentId: string;
  accountNumber: string;
  checkingBalance: number;
  savingsBalance: number;
  investmentBalance: number;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'investment_gain';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending';
  counterparty?: string;
}

interface AuthContextType {
  user: User | null;
  transactions: Transaction[];
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  setupCredentials: (email: string, documentId: string, password: string) => Promise<{ success: boolean; message: string }>;
  addTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => void;
  isLoading: boolean;
}

// Registered demo users (simulates API-registered customers)
const REGISTERED_USERS: Omit<User, 'checkingBalance' | 'savingsBalance' | 'investmentBalance'>[] = [
  { email: 'demo@profinance.com', name: 'Carlos Mendoza', documentId: '12345678', accountNumber: 'PF-0001-2345-6789' },
  { email: 'maria@profinance.com', name: 'María González', documentId: '87654321', accountNumber: 'PF-0002-8765-4321' },
  { email: 'juan@profinance.com', name: 'Juan Pérez', documentId: '11223344', accountNumber: 'PF-0003-1122-3344' },
];

function generateMockTransactions(email: string): Transaction[] {
  const seed = email.charCodeAt(0) + email.length;
  const now = new Date();
  const txs: Transaction[] = [];

  const descriptions = [
    ['Depósito inicial', 'deposit', 5000],
    ['Pago nómina', 'deposit', 2800],
    ['Supermercado La Colonia', 'withdrawal', -145.50],
    ['Restaurante El Buen Sabor', 'withdrawal', -67.20],
    ['Transferencia recibida - Ana Ruiz', 'transfer_in', 500],
    ['Transferencia enviada - Servicios XYZ', 'transfer_out', -320],
    ['Ganancia inversión diaria', 'investment_gain', 8.40],
    ['Pago servicio eléctrico', 'withdrawal', -89.00],
    ['Depósito ahorro', 'deposit', 1000],
    ['Ganancia inversión diaria', 'investment_gain', 9.20],
    ['Farmacia Central', 'withdrawal', -42.30],
    ['Transferencia recibida - Pedro Soto', 'transfer_in', 250],
    ['Netflix suscripción', 'withdrawal', -15.99],
    ['Ganancia inversión diaria', 'investment_gain', 7.80],
    ['Combustible GasPro', 'withdrawal', -55.00],
  ] as const;

  descriptions.forEach(([desc, type, baseAmount], i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (i * 2 + (seed % 3)));
    const amount = typeof baseAmount === 'number' ? baseAmount : 0;
    txs.push({
      id: `TX-${seed}-${i}-${Date.now()}`,
      type: type as Transaction['type'],
      amount,
      description: desc,
      date: date.toISOString(),
      status: 'completed',
      counterparty: type === 'transfer_in' || type === 'transfer_out' ? desc.split('- ')[1] : undefined,
    });
  });

  return txs;
}

function getUserBalances(email: string): { checkingBalance: number; savingsBalance: number; investmentBalance: number } {
  const seed = email.charCodeAt(0);
  return {
    checkingBalance: 3500 + (seed % 1000) + 245.80,
    savingsBalance: 8200 + (seed % 2000) + 150.00,
    investmentBalance: 12500 + (seed % 3000) + 87.60,
  };
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('pf_session');
    if (stored) {
      const parsed = JSON.parse(stored) as User;
      setUser(parsed);
      const storedTxs = localStorage.getItem(`pf_txs_${parsed.email}`);
      if (storedTxs) {
        setTransactions(JSON.parse(storedTxs));
      } else {
        const generated = generateMockTransactions(parsed.email);
        setTransactions(generated);
        localStorage.setItem(`pf_txs_${parsed.email}`, JSON.stringify(generated));
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    const credentials = JSON.parse(localStorage.getItem('pf_credentials') || '{}') as Record<string, string>;
    if (!credentials[email]) {
      return { success: false, message: 'No encontramos credenciales para este correo. Por favor configura tu acceso primero.' };
    }
    if (credentials[email] !== password) {
      return { success: false, message: 'Contraseña incorrecta. Intenta nuevamente.' };
    }
    const registered = REGISTERED_USERS.find(u => u.email === email);
    if (!registered) {
      return { success: false, message: 'Usuario no encontrado en el sistema.' };
    }
    const balances = getUserBalances(email);
    const fullUser: User = { ...registered, ...balances };
    setUser(fullUser);
    localStorage.setItem('pf_session', JSON.stringify(fullUser));
    const storedTxs = localStorage.getItem(`pf_txs_${email}`);
    if (storedTxs) {
      setTransactions(JSON.parse(storedTxs));
    } else {
      const generated = generateMockTransactions(email);
      setTransactions(generated);
      localStorage.setItem(`pf_txs_${email}`, JSON.stringify(generated));
    }
    return { success: true, message: 'Bienvenido de vuelta.' };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setTransactions([]);
    localStorage.removeItem('pf_session');
  }, []);

  const setupCredentials = useCallback(async (email: string, documentId: string, password: string): Promise<{ success: boolean; message: string }> => {
    const registered = REGISTERED_USERS.find(u => u.email === email && u.documentId === documentId);
    if (!registered) {
      return { success: false, message: 'No encontramos un cliente registrado con ese correo y documento. Verifica tus datos.' };
    }
    const credentials = JSON.parse(localStorage.getItem('pf_credentials') || '{}') as Record<string, string>;
    credentials[email] = password;
    localStorage.setItem('pf_credentials', JSON.stringify(credentials));
    return { success: true, message: '¡Acceso configurado exitosamente! Ahora puedes ingresar.' };
  }, []);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'date'>) => {
    if (!user) return;
    const newTx: Transaction = {
      ...tx,
      id: `TX-${Date.now()}`,
      date: new Date().toISOString(),
    };
    setTransactions(prev => {
      const updated = [newTx, ...prev];
      localStorage.setItem(`pf_txs_${user.email}`, JSON.stringify(updated));
      return updated;
    });
    if (tx.type === 'transfer_out') {
      setUser(prev => {
        if (!prev) return prev;
        const updated = { ...prev, checkingBalance: prev.checkingBalance + tx.amount };
        localStorage.setItem('pf_session', JSON.stringify(updated));
        return updated;
      });
    }
    if (tx.type === 'deposit') {
      setUser(prev => {
        if (!prev) return prev;
        const updated = { ...prev, checkingBalance: prev.checkingBalance + tx.amount };
        localStorage.setItem('pf_session', JSON.stringify(updated));
        return updated;
      });
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, transactions, login, logout, setupCredentials, addTransaction, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
