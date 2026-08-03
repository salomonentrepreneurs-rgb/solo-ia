'use client';

import Link from 'next/link';
import { App } from '@/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatRelativeTime } from '@/lib/utils';
import { ExternalLink, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import soloIA from '@/lib/api-client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function AppCard({ app, onDelete }: { app: App; onDelete?: () => void }) {
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Supprimer cette application ?')) return;
    try {
      await soloIA.deleteApp(app.id);
      toast.success('Application supprimée');
      if (onDelete) onDelete();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  return (
    <Card
      className="group relative overflow-hidden"
      onClick={() => router.push(`/dashboard/apps/${app.id}`)}
    >
      {/* Gradient top line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center text-lg">
            {app.appType === 'ecommerce' ? '🛍️' :
             app.appType === 'saas' ? '📊' :
             app.appType === 'ai-app' ? '🤖' :
             app.appType === 'landing' ? '🚀' : '📱'}
          </div>
          <div>
            <h3 className="font-semibold text-white">{app.title}</h3>
            <p className="text-xs text-white/40">{formatRelativeTime(app.createdAt)}</p>
          </div>
        </div>
        <Badge status={app.status} />
      </div>

      <p className="text-sm text-white/50 line-clamp-2 mb-4">
        {app.description || app.prompt}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-white/30">
          <span>{app.filesCount} fichiers</span>
          <span>·</span>
          <span>{app.linesCount} lignes</span>
          {app.language && (
            <>
              <span>·</span>
              <span>{app.language}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {app.deployedUrl && (
            <a
              href={app.deployedUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <ExternalLink size={12} />
              Voir
            </a>
          )}
          <Button variant="ghost" size="sm" onClick={handleDelete} className="!p-1">
            <Trash2 size={14} className="text-red-400/60" />
          </Button>
        </div>
      </div>
    </Card>
  );
}