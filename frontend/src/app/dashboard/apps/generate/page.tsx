'use client';

import { Suspense } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import AppGenerator from '@/components/apps/AppGenerator';
import Card from '@/components/ui/Card';

function GenerateContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Créer une application</h1>
        <p className="text-white/50">
          Décrivez votre idée en français et laissez l&apos;IA la construire
        </p>
      </div>

      <Card gradient hover={false}>
        <AppGenerator />
      </Card>

      {searchParams.get('prompt') && (
        <div className="text-xs text-white/30 text-center">
          Template pré-sélectionné. Modifiez le prompt si nécessaire.
        </div>
      )}
    </div>
  );
}

export default function GenerateAppPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    }>
      <GenerateContent />
    </Suspense>
  );
}