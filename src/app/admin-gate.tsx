'use client';

import type { ReactNode } from 'react';
import { useAuth } from '@/contexts/auth';
import { useIsAdmin } from '@/hooks/useUserRole';
import NotFound from '@/screens/NotFound';

export function AdminGate({ children, fallback = <NotFound /> }: { children: ReactNode; fallback?: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useIsAdmin();
  if (isLoading || (isAuthenticated && roleLoading)) return <div className="min-h-screen" />;
  return isAuthenticated && isAdmin ? children : fallback;
}
