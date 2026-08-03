'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { App } from '@/types';
import AppCard from '@/components/apps/AppCard';
import Button from '@/components/ui/Button';
import soloIA from '@/lib/api-client';
import Link from 'next/link';
import { Sparkles, RefreshCw, Search } from 'lucide-react';

export default function AppsListPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadApps = async () => {
    setLoading(true);
    try {
      const data = await soloIA.listApps();
      setApps(data.apps);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    else if (user) loadApps();
  }, [user, authLoading, router]);

  const filtered = apps.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.prompt.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || !user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mes applications</h1>
          <p className="text-white/50 text-sm">{apps.length} application{apps.length > 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={loadApps} loading={loading}>
            <RefreshCw size={16} />
          </Button>
          <Link href="/dashboard/apps/generate">
            <Button>
              <Sparkles size={16} />
              Nouvelle app
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une application..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📱</div>
          <h3 className="text-xl font-semibold mb-2">
            {search ? 'Aucun résultat' : 'Aucune application'}
          </h3>
          <p className="text-white/50 mb-6">
            {search
              ? `Aucune application ne correspond à "${search}"`
              : 'Commencez par créer votre première application avec l\'IA'}
          </p>
          {!search && (
            <Link href="/dashboard/apps/generate">
              <Button>
                <Sparkles size={16} />
                Créer ma première app
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((app) => (
            <AppCard key={app.id} app={app} onDelete={loadApps} />
          ))}
        </div>
      )}
    </div>
  );
}