'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Footer } from './Footer';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';

export function PublicLayout() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  if (isDashboard) return null;
  return (
    <>
      <AnimatedBackground />
      <Footer />
    </>
  );
}
