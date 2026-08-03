'use client';

import { useEffect, useState } from 'react';
import { Credits, CreditLog } from '@/types';
import Card from '@/components/ui/Card';
import soloIA from '@/lib/api-client';
import { formatRelativeTime } from '@/lib/utils';
import { Coins, History, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function CreditsDisplay() {
  const [credits, setCredits] = useState<Credits | null>(null);
  const [history, setHistory] = useState<CreditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [c, h] = await Promise.all([
        soloIA.getCredits(),
        soloIA.getCreditsHistory(),
      ]);
      setCredits(c.credits);
      setHistory(h.history);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const percent = credits ? (credits.used / credits.max) * 100 : 0;

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 bg-white/5 rounded-xl" />
        <div className="h-48 bg-white/5 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Credit ring */}
      <Card gradient hover={false}>
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="url(#grad)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - percent / 100)}`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="text-2xl font-bold text-white">{credits?.remaining || 0}</span>
                <span className="text-xs text-white/40 block -mt-1">restants</span>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">Crédits quotidiens</h3>
            <p className="text-sm text-white/50">
              Utilisé {credits?.used || 0} sur {credits?.max || 10} aujourd&apos;hui
            </p>
            <p className="text-xs text-white/30 mt-1">
              Réinitialisation le {credits?.resetDate}
            </p>
            <Button variant="ghost" size="sm" onClick={load} className="mt-2">
              <RefreshCw size={14} /> Actualiser
            </Button>
          </div>
        </div>
      </Card>

      {/* History */}
      <div>
        <h3 className="text-sm font-medium text-white/60 mb-3 flex items-center gap-2">
          <History size={14} /> Historique des crédits
        </h3>
        {history.length === 0 ? (
          <p className="text-sm text-white/30 text-center py-4">
            Aucune activité récente
          </p>
        ) : (
          <div className="space-y-2">
            {history.map((log, i) => (
              <Card key={i} hover={false} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className={log.amount < 0 ? 'text-red-400' : 'text-green-400'}>
                    <Coins size={16} />
                  </span>
                  <div>
                    <p className="text-sm text-white/80">{log.description}</p>
                    <p className="text-xs text-white/30">{formatRelativeTime(log.createdAt)}</p>
                  </div>
                </div>
                <span className={`text-sm font-mono ${log.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {log.amount > 0 ? '+' : ''}{log.amount}
                </span>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}