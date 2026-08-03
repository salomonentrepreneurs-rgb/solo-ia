'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { App, Deployment } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import AppCard from '@/components/apps/AppCard';
import soloIA from '@/lib/api-client';
import { formatRelativeTime } from '@/lib/utils';
import { Sparkles, Layout, Globe, Coins, Activity, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [apps, setApps] = useState<App[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      Promise.all([
        soloIA.listApps(),
        soloIA.listDeployments(),
      ]).then(([appsData, depData]) => {
        setApps(appsData.apps.slice(0, 4));
        setDeployments(depData.deployments.slice(0, 3));
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const stats = [
    { label: 'Applications', value: apps.length.toString(), icon: <Layout size={18} />, color: 'text-indigo-400', href: '/dashboard/apps' },
    { label: 'Déployées', value: apps.filter(a => a.status === 'deployed').length.toString(), icon: <Globe size={18} />, color: 'text-emerald-400', href: '/dashboard/apps' },
    { label: 'Crédits', value: `${10 - (user.creditsUsedToday || 0)}/10`, icon: <Coins size={18} />, color: 'text-yellow-400', href: '/dashboard/credits' },
    { label: 'Déploiements', value: deployments.length.toString(), icon: <Activity size={18} />, color: 'text-cyan-400', href: '/dashboard/deployments' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bonjour, {user.name} 👋</h1>
          <p className="text-white/50">Voici le résumé de votre activité Solo IA</p>
        </div>
        <Link href="/dashboard/apps/generate">
          <Button>
            <Sparkles size={16} />
            Nouvelle application
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card hover className="group">
              <div className="flex items-center justify-between mb-3">
                <span className={`${stat.color}`}>{stat.icon}</span>
                <ArrowRight size={14} className="text-white/20 group-hover:text-white/60 transition-colors" />
              </div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-white/40">{stat.label}</div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent apps */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Applications récentes</h2>
          <Link href="/dashboard/apps" className="text-sm text-indigo-400 hover:text-indigo-300">
            Voir tout →
          </Link>
        </div>
        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : apps.length === 0 ? (
          <Card hover={false} className="text-center py-12">
            <div className="text-4xl mb-4">✦</div>
            <h3 className="text-lg font-semibold mb-2">Aucune application</h3>
            <p className="text-white/50 text-sm mb-4">
              Commencez par décrire votre première application à l&apos;IA
            </p>
            <Link href="/dashboard/apps/generate">
              <Button>
                <Sparkles size={16} />
                Créer ma première app
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>

      {/* Recent deployments */}
      {deployments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Déploiements récents</h2>
            <Link href="/dashboard/deployments" className="text-sm text-indigo-400 hover:text-indigo-300">
              Voir tout →
            </Link>
          </div>
          <div className="space-y-2">
            {deployments.map((dep) => (
              <Card key={dep.id} hover={false} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Badge status={dep.status} />
                  <span className="text-sm text-white/50">{dep.appName || 'App'}</span>
                </div>
                <span className="text-xs text-white/30">{formatRelativeTime(dep.startedAt)}</span>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}