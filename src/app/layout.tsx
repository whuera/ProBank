import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ProFinance | Soluciones Bancarias Modernas",
  description: "Experimenta el futuro de la banca con ProFinance. Seguro, rápido y elegante.",
  keywords: ["banca", "finanzas", "nextjs", "interfaz moderna", "profinance"],
  authors: [{ name: "Equipo ProFinance" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
      </head>
      <body className={inter.variable}>
        <AnimatedBackground />
        {children}
        <Footer />
      </body>
    </html>
  );
}
