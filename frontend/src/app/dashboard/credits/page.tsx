'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import CreditsDisplay from '@/components/credits/CreditsDisplay';

export default function CreditsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Crédits</h1>
        <p className="text-white/50">
          Gérez votre quota de génération d&apos;applications
        </p>
      </div>
      <CreditsDisplay />

      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-cyan-500/5 border border-indigo-500/20">
        <h3 className="font-semibold text-sm mb-2">💡 Besoin de plus de crédits ?</h3>
        <p className="text-sm text-white/50">
          Passez au plan Pro pour obtenir 50 crédits par jour, des templates exclusifs,
          et le déploiement automatique sur domaine personnalisé.
        </p>
      </div>
    </div>
  );
}