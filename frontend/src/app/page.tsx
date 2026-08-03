import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08),transparent_70%)]" />

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-300 mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Plateforme IA #1 — Construisez vos apps en français
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] mb-6">
            Créez des applications
            <br />
            <span className="gradient-text">complètes en minutes</span>
            <br />
            avec l&apos;intelligence artificielle
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Décrivez votre idée en français. Solo IA construit, déploie et héberge
            votre application full-stack — base de données, authentification,
            paiements — sans écrire une ligne de code.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/register">
              <Button size="lg" className="text-base animate-glow">
                ✦ Commencer gratuitement
              </Button>
            </Link>
            <Link href="/templates">
              <Button variant="outline" size="lg">
                ▶ Voir les templates
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 md:gap-16">
            {[
              { number: '12 458+', label: 'Apps créées' },
              { number: '< 5 min', label: 'Temps de création' },
              { number: '100%', label: 'Sans code' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.number}</div>
                <div className="text-sm text-white/40 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tout ce dont vous avez besoin,{' '}
              <span className="gradient-text">en un seul endroit</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Solo IA intègre l&apos;équivalent d&apos;une équipe d&apos;ingénieurs dans une seule interface
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: '🤖', title: '300+ Modèles IA', desc: 'Claude, GPT-5, Gemini, Mistral, DeepSeek — sélection automatique du meilleur modèle.' },
              { icon: '⚡', title: 'Génération Full-Stack', desc: 'React 19, Next.js, PostgreSQL, Auth, API REST — prêt en 5 minutes.' },
              { icon: '🗄️', title: 'Base de Données', desc: 'PostgreSQL avec schéma automatique, 38+ providers OAuth, stockage fichiers.' },
              { icon: '🌐', title: 'Hébergement CDN', desc: 'CDN mondial, SSL, domaine personnalisé, scaling automatique inclus.' },
              { icon: '💳', title: 'Stripe Intégré', desc: 'Checkout, abonnements, factures — pré-intégré et prêt à l\'emploi.' },
              { icon: '🎨', title: '200+ Templates', desc: 'SaaS, e-commerce, CRM, blog, portfolio — personnalisez en un clic.' },
            ].map((f) => (
              <div
                key={f.title}
                className="group p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-indigo-500/30 transition-all duration-300"
              >
                <span className="text-3xl mb-3 block">{f.icon}</span>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à créer votre{' '}
            <span className="gradient-text">prochaine application</span> ?
          </h2>
          <p className="text-white/50 mb-8">
            Rejoignez plus de 12 000 créateurs. Gratuit pour commencer, sans carte de crédit.
          </p>
          <Link href="/register">
            <Button size="lg">✨ Créer mon application</Button>
          </Link>
          <p className="text-xs text-white/20 mt-4">
            10 crédits gratuits par jour • Annulation à tout moment
          </p>
        </div>
      </section>
    </div>
  );
}