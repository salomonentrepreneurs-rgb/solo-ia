'use client';

import { useEffect, useState, use } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { App as AppType, Deployment } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import DeployStatus from '@/components/deploy/DeployStatus';
import soloIA from '@/lib/api-client';
import { formatDate, statusLabel, cn } from '@/lib/utils';
import {
  ArrowLeft, Rocket, ExternalLink, Trash2, Code2, Database, FileText,
  Globe, Clock, HardDrive, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AppDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [app, setApp] = useState<AppType | null>(null);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const loadApp = async () => {
    setLoading(true);
    try {
      const data = await soloIA.getApp(resolvedParams.id);
      setApp(data.app);
      setDeployments(data.deployments);
    } catch {
      toast.error('Application non trouvée');
      router.push('/dashboard/apps');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    else if (user) loadApp();
  }, [user, authLoading, router]);

  // Auto-refresh pendant la génération
  useEffect(() => {
    if (!app || (app.status !== 'generating' && app.status !== 'deploying')) return;
    const interval = setInterval(loadApp, 3000);
    return () => clearInterval(interval);
  }, [app?.status]);

  const handleDeploy = async () => {
    if (!app) return;
    setDeploying(true);
    try {
      await soloIA.deployApp(app.id);
      toast.success('Déploiement lancé !');
      setTimeout(loadApp, 2000);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setDeploying(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!app) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Back */}
      <Link
        href="/dashboard/apps"
        className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition"
      >
        <ArrowLeft size={16} />
        Retour aux applications
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{app.title}</h1>
            <Badge status={app.status} />
          </div>
          <p className="text-white/50 text-sm max-w-xl">{app.prompt}</p>
        </div>

        <div className="flex items-center gap-2">
          {app.status === 'completed' && (
            <Button onClick={handleDeploy} loading={deploying} variant="secondary">
              <Rocket size={16} />
              Déployer
            </Button>
          )}
          {app.deployedUrl && (
            <a href={app.deployedUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                <ExternalLink size={16} />
                Voir en ligne
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Progress pendant la génération */}
      {app.status === 'generating' && (
        <Card gradient hover={false}>
          <div className="flex items-center gap-4">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
            <div>
              <h3 className="font-semibold">Génération en cours...</h3>
              <p className="text-sm text-white/50">L&apos;IA construit votre application</p>
            </div>
          </div>
          <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full w-3/4 animate-pulse" />
          </div>
        </Card>
      )}

      {/* Info grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <Code2 size={16} />, label: 'Framework', value: app.framework },
          { icon: <FileText size={16} />, label: 'Fichiers', value: `${app.filesCount}` },
          { icon: <HardDrive size={16} />, label: 'Lignes de code', value: `${app.linesCount}` },
          { icon: <Clock size={16} />, label: 'Créé le', value: formatDate(app.createdAt) },
        ].map((info) => (
          <Card key={info.label} hover={false} className="text-center">
            <div className="text-indigo-400 mb-2 flex justify-center">{info.icon}</div>
            <div className="text-sm text-white/50">{info.label}</div>
            <div className="font-semibold text-sm">{info.value}</div>
          </Card>
        ))}
      </div>

      {/* Deployments */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Rocket size={18} className="text-cyan-400" />
          Déploiements
        </h2>
        <DeployStatus deployments={deployments} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-white/10">
        <Button
          variant="danger"
          size="sm"
          onClick={async () => {
            if (!confirm('Supprimer cette application ?')) return;
            try {
              await soloIA.deleteApp(app.id);
              toast.success('Application supprimée');
              router.push('/dashboard/apps');
            } catch (err: unknown) {
              toast.error(err instanceof Error ? err.message : 'Erreur');
            }
          }}
        >
          <Trash2 size={14} />
          Supprimer
        </Button>
      </div>
    </div>
  );
}