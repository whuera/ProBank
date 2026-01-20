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
  title: "ProBank | Soluciones Bancarias Modernas",
  description: "Experimenta el futuro de la banca con ProBank. Seguro, rápido y elegante.",
  keywords: ["banca", "finanzas", "nextjs", "interfaz moderna", "probank"],
  authors: [{ name: "Equipo ProBank" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.variable}>
        <AnimatedBackground />
        {children}
        <Footer />
      </body>
    </html>
  );
}
