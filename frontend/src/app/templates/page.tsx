'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import TemplateGrid from '@/components/templates/TemplateGrid';
import { Sparkles } from 'lucide-react';

export default function TemplatesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="text-yellow-400" size={24} />
          Templates prédéfinis
        </h1>
        <p className="text-white/50">
          Choisissez un template et personnalisez-le avec l&apos;IA
        </p>
      </div>

      <TemplateGrid />
    </div>
  );
}