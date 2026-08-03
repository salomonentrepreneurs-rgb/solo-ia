'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import Button from '@/components/ui/Button';
import soloIA from '@/lib/api-client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { TEMPLATES } from '@/lib/utils';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';

export default function AppGenerator() {
  const [prompt, setPrompt] = useState('');
  const [appName, setAppName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  const router = useRouter();

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.trim().length < 10) {
      toast.error('Veuillez décrire votre application (min. 10 caractères)');
      return;
    }
    if (!user) {
      toast.error('Connectez-vous pour générer une application');
      router.push('/login');
      return;
    }

    setGenerating(true);
    setProgress('Analyse de votre requête...');

    try {
      const result = await soloIA.generateApp(prompt, appName || undefined);
      setProgress('Génération en cours...');

      toast.success('Application en cours de génération !');

      // Poll pour le statut
      const poll = setInterval(async () => {
        try {
          const { app } = await soloIA.getApp(result.appId);
          if (app.status === 'completed') {
            clearInterval(poll);
            setGenerating(false);
            toast.success('Application prête ! 🎉');
            router.push(`/dashboard/apps/${app.id}`);
          } else if (app.status === 'failed') {
            clearInterval(poll);
            setGenerating(false);
            toast.error('Échec de la génération');
          } else {
            setProgress(
              app.status === 'generating' ? 'Construction de votre application...' : 'Finalisation...'
            );
          }
        } catch {
          clearInterval(poll);
          setGenerating(false);
        }
      }, 2000);

      // Timeout après 2 minutes
      setTimeout(() => {
        clearInterval(poll);
        if (generating) {
          setGenerating(false);
          toast.success('Génération lancée ! Vérifiez le statut dans votre dashboard.');
          router.push('/dashboard/apps');
        }
      }, 120000);
    } catch (err: unknown) {
      setGenerating(false);
      toast.error(err instanceof Error ? err.message : 'Erreur de génération');
    }
  };

  const applyTemplate = (templatePrompt: string) => {
    setPrompt(templatePrompt);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="space-y-6">
      {/* Prompt presets */}
      <div>
        <h3 className="text-sm font-medium text-white/60 mb-3">
          Suggestions de templates
        </h3>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.slice(0, 6).map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => applyTemplate(tpl.prompt)}
              className="px-3 py-1.5 rounded-full text-xs bg-white/5 border border-white/10 text-white/60 hover:border-indigo-500/30 hover:text-white transition-all"
            >
              {tpl.icon} {tpl.name}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">
          Décrivez votre application en français
        </label>
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ex: Crée un dashboard analytics pour SaaS avec graphiques temps réel, gestion des utilisateurs, dark mode et Stripe..."
          rows={5}
          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none"
          disabled={generating}
        />
        <p className="text-xs text-white/30 mt-1.5">
          Soyez précis : type d&apos;app, fonctionnalités, style, intégrations souhaitées.
        </p>
      </div>

      {/* App name (optional) */}
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">
          Nom de l&apos;application <span className="text-white/30">(optionnel)</span>
        </label>
        <input
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
          placeholder="MonApp"
          className="w-full max-w-xs bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          disabled={generating}
        />
      </div>

      {/* Generate button */}
      <Button
        size="lg"
        onClick={handleGenerate}
        loading={generating}
        disabled={generating}
        className="w-full sm:w-auto"
      >
        {generating ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            {progress}
          </>
        ) : (
          <>
            <Sparkles size={18} />
            Générer l&apos;application
            <ArrowRight size={16} />
          </>
        )}
      </Button>

      {/* Credit info */}
      <div className="text-xs text-white/30 bg-white/5 rounded-xl px-4 py-3 border border-white/5">
        Cette action utilise 1 crédit. Il vous reste{' '}
        <span className="text-indigo-400 font-medium">
          {user ? `${10 - (user.creditsUsedToday || 0)} crédits` : '10 crédits'}
        </span>{' '}
        aujourd&apos;hui.
      </div>
    </div>
  );
}