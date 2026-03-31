'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  'https://azure-app-shopping-cart-reload-225fb76523b0.herokuapp.com';

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
  verifyIdentity: (email: string, documentId: string) => Promise<{ success: boolean; message: string }>;
  setupCredentials: (email: string, documentId: string, password: string) => Promise<{ success: boolean; message: string }>;
  addTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => void;
  isLoading: boolean;
}

// ─── Mock financial data (banking layer over shopping-cart backend) ───────────

function getUserBalances(seed: number) {
  return {
    checkingBalance: 3500 + (seed % 1000) + 245.80,
    savingsBalance:  8200 + (seed % 2000) + 150.00,
    investmentBalance: 12500 + (seed % 3000) + 87.60,
  };
}

function generateMockTransactions(email: string): Transaction[] {
  const seed = email.charCodeAt(0) + email.length;
  const now = new Date();

  const rows: [string, Transaction['type'], number][] = [
    ['Depósito inicial',                      'deposit',        5000],
    ['Pago nómina',                            'deposit',        2800],
    ['Supermercado La Colonia',                'withdrawal',    -145.50],
    ['Restaurante El Buen Sabor',              'withdrawal',     -67.20],
    ['Transferencia recibida - Ana Ruiz',      'transfer_in',    500],
    ['Transferencia enviada - Servicios XYZ',  'transfer_out',  -320],
    ['Ganancia inversión diaria',              'investment_gain',  8.40],
    ['Pago servicio eléctrico',                'withdrawal',     -89.00],
    ['Depósito ahorro',                        'deposit',        1000],
    ['Ganancia inversión diaria',              'investment_gain',  9.20],
    ['Farmacia Central',                       'withdrawal',     -42.30],
    ['Transferencia recibida - Pedro Soto',    'transfer_in',    250],
    ['Netflix suscripción',                    'withdrawal',     -15.99],
    ['Ganancia inversión diaria',              'investment_gain',  7.80],
    ['Combustible GasPro',                     'withdrawal',     -55.00],
  ];

  return rows.map(([desc, type, amount], i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (i * 2 + (seed % 3)));
    return {
      id: `TX-${seed}-${i}`,
      type,
      amount,
      description: desc,
      date: date.toISOString(),
      status: 'completed',
      counterparty: (type === 'transfer_in' || type === 'transfer_out')
        ? desc.split('- ')[1]
        : undefined,
    };
  });
}

// ─── API helpers ──────────────────────────────────────────────────────────────

interface ApiLoginResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  documentId: string;
  accountNumber: string;
  status: string;
  message?: string;
}

async function apiLogin(email: string, password: string): Promise<ApiLoginResponse> {
  const res = await fetch(`${API_BASE}/api/customer/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json() as Promise<ApiLoginResponse>;
}

async function apiVerifyIdentity(email: string, documentId: string) {
  const params = new URLSearchParams({ email, documentId });
  const res = await fetch(`${API_BASE}/api/customer/verify-identity?${params}`);
  const data = (await res.json()) as { message: string; found?: boolean };
  return { ok: res.ok, message: data.message };
}

async function apiSetupCredentials(email: string, documentId: string, password: string) {
  const res = await fetch(`${API_BASE}/api/customer/setup-credentials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, documentId, password }),
  });
  const data = (await res.json()) as { message: string };
  return { ok: res.ok, message: data.message };
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const stored = localStorage.getItem('pf_session');
    if (stored) {
      const parsed = JSON.parse(stored) as User;
      setUser(parsed);
      const storedTxs = localStorage.getItem(`pf_txs_${parsed.email}`);
      setTransactions(storedTxs ? JSON.parse(storedTxs) : generateMockTransactions(parsed.email));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const data = await apiLogin(email, password);

      // HTTP 401 / error body contains "message" but no id
      if (!data.id) {
        return {
          success: false,
          message: data.message ?? 'Correo o contraseña incorrectos.',
        };
      }

      const seed = email.charCodeAt(0) + email.length;
      const balances = getUserBalances(seed);
      const fullUser: User = {
        email: data.email,
        name: `${data.firstName} ${data.lastName}`,
        documentId: data.documentId,
        accountNumber: data.accountNumber,
        ...balances,
      };

      setUser(fullUser);
      localStorage.setItem('pf_session', JSON.stringify(fullUser));

      const storedTxs = localStorage.getItem(`pf_txs_${email}`);
      const txs = storedTxs ? (JSON.parse(storedTxs) as Transaction[]) : generateMockTransactions(email);
      if (!storedTxs) localStorage.setItem(`pf_txs_${email}`, JSON.stringify(txs));
      setTransactions(txs);

      return { success: true, message: 'Bienvenido de vuelta.' };
    } catch {
      return { success: false, message: 'Error de conexión. Intenta nuevamente.' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setTransactions([]);
    localStorage.removeItem('pf_session');
  }, []);

  const verifyIdentity = useCallback(async (
    email: string,
    documentId: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const { ok, message } = await apiVerifyIdentity(email, documentId);
      return { success: ok, message };
    } catch {
      return { success: false, message: 'Error de conexión. Intenta nuevamente.' };
    }
  }, []);

  const setupCredentials = useCallback(async (
    email: string,
    documentId: string,
    password: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const { ok, message } = await apiSetupCredentials(email, documentId, password);
      return { success: ok, message };
    } catch {
      return { success: false, message: 'Error de conexión. Intenta nuevamente.' };
    }
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
    const delta = tx.amount; // amount is already signed (negative for out)
    if (tx.type === 'transfer_out' || tx.type === 'deposit') {
      setUser(prev => {
        if (!prev) return prev;
        const updated = { ...prev, checkingBalance: prev.checkingBalance + delta };
        localStorage.setItem('pf_session', JSON.stringify(updated));
        return updated;
      });
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, transactions, login, logout, verifyIdentity, setupCredentials, addTransaction, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
