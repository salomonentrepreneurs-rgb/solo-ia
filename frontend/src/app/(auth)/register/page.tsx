'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    if (password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    setLoading(true);
    try {
      await register(email, password, name);
      toast.success('Compte créé ! Bienvenue sur Solo IA 🎉');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur d\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">✨</div>
          <h1 className="text-3xl font-bold mb-2">
            Créer un compte
          </h1>
          <p className="text-white/50">
            Commencez à créer des applications avec l&apos;IA
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jean Dupont"
            icon="👤"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            icon="📧"
          />
          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 caractères"
            icon="🔒"
          />
          <Button type="submit" loading={loading} className="w-full">
            ✦ Créer mon compte
          </Button>
        </form>

        <div className="mt-6 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
          <p className="text-xs text-indigo-300/80 text-center">
            🎉 En créant un compte, vous recevez <strong>10 crédits gratuits</strong>{' '}
            par jour pour générer vos applications.
          </p>
        </div>

        <p className="text-center text-sm text-white/40 mt-6">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}