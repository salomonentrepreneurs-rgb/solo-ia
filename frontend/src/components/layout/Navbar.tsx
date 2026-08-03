'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import Button from '@/components/ui/Button';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            ✦
          </span>
          <span className="font-bold text-lg">
            Solo<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">IA</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm text-white/60 hover:text-white transition">
                Dashboard
              </Link>
              <Link href="/dashboard/apps" className="text-sm text-white/60 hover:text-white transition">
                Mes Apps
              </Link>
              <Link href="/templates" className="text-sm text-white/60 hover:text-white transition">
                Templates
              </Link>
              <Link href="/dashboard/credits" className="text-sm text-white/60 hover:text-white transition">
                Crédits
              </Link>
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <span className="text-sm text-white/50">{user.name}</span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  Déconnexion
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-white/60 hover:text-white transition">
                Connexion
              </Link>
              <Link href="/register">
                <Button size="sm">S&apos;inscrire</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile */}
        <button
          className="md:hidden text-white/60"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="text-2xl">{menuOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0a0a0f]/95 backdrop-blur-xl p-4 space-y-3">
          {user ? (
            <>
              <Link href="/dashboard" className="block text-sm text-white/80 py-2" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              <Link href="/dashboard/apps" className="block text-sm text-white/80 py-2" onClick={() => setMenuOpen(false)}>
                Mes Apps
              </Link>
              <Link href="/dashboard/apps/generate" className="block text-sm text-white/80 py-2" onClick={() => setMenuOpen(false)}>
                Créer une app
              </Link>
              <Link href="/templates" className="block text-sm text-white/80 py-2" onClick={() => setMenuOpen(false)}>
                Templates
              </Link>
              <hr className="border-white/10" />
              <button onClick={() => { logout(); setMenuOpen(false); }} className="text-sm text-red-400 py-2">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-sm text-white/80 py-2" onClick={() => setMenuOpen(false)}>
                Connexion
              </Link>
              <Link href="/register" className="block text-sm text-white/80 py-2" onClick={() => setMenuOpen(false)}>
                S&apos;inscrire
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}