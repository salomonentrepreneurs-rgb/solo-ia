'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Deployment } from '@/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import DeployStatus from '@/components/deploy/DeployStatus';
import soloIA from '@/lib/api-client';
import { formatRelativeTime } from '@/lib/utils';
import { RefreshCw, Rocket } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function DeploymentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await soloIA.listDeployments();
      setDeployments(data.deployments);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    else if (user) load();
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Déploiements</h1>
          <p className="text-white/50 text-sm">
            {deployments.length} déploiement{deployments.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="ghost" onClick={load} loading={loading}>
          <RefreshCw size={16} />
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : deployments.length === 0 ? (
        <Card hover={false} className="text-center py-16">
          <Rocket size={40} className="mx-auto text-white/20 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun déploiement</h3>
          <p className="text-white/50 text-sm">Déployez votre première application pour la voir en ligne</p>
        </Card>
      ) : (
        <DeployStatus deployments={deployments} />
      )}
    </div>
  );
}