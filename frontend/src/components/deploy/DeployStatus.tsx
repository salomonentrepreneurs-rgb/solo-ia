'use client';

import { useEffect, useState } from 'react';
import { Deployment } from '@/types';
import Badge from '@/components/ui/Badge';
import { formatRelativeTime } from '@/lib/utils';
import Card from '@/components/ui/Card';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import soloIA from '@/lib/api-client';

export default function DeployStatus({ deployments: initial }: { deployments?: Deployment[] }) {
  const [deployments, setDeployments] = useState<Deployment[]>(initial || []);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [logs, setLogs] = useState<string>('');

  useEffect(() => {
    if (initial) setDeployments(initial);
  }, [initial]);

  const toggleExpand = async (depId: string) => {
    if (expanded === depId) {
      setExpanded(null);
      return;
    }
    setExpanded(depId);
    try {
      const data = await soloIA.getDeploymentLogs(depId);
      setLogs(data.logs);
    } catch {
      setLogs('Logs non disponibles');
    }
  };

  if (deployments.length === 0) {
    return (
      <div className="text-center py-8 text-white/30">
        <p>Aucun déploiement pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {deployments.map((dep) => (
        <Card key={dep.id} hover={false}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge status={dep.status} />
              <div className="text-sm text-white/50">
                {formatRelativeTime(dep.startedAt)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {dep.url && (
                <a
                  href={dep.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  <ExternalLink size={14} />
                </a>
              )}
              <button
                onClick={() => toggleExpand(dep.id)}
                className="text-white/30 hover:text-white/60"
              >
                {expanded === dep.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>

          {expanded === dep.id && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div>
                  <span className="text-white/30">Plateforme</span>
                  <p className="text-white/80">{dep.platform}</p>
                </div>
                <div>
                  <span className="text-white/30">ID</span>
                  <p className="text-white/60 font-mono text-xs">{dep.id.slice(0, 12)}...</p>
                </div>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <h4 className="text-xs font-mono text-white/40 mb-2">Build logs</h4>
                <pre className="text-xs font-mono text-green-400/80 whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {logs || 'Chargement...'}
                </pre>
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}