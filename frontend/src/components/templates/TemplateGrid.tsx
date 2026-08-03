'use client';

import { TEMPLATES } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

export default function TemplateGrid() {
  const router = useRouter();

  const categories = [...new Set(TEMPLATES.map((t) => t.category))];

  return (
    <div className="space-y-8">
      {categories.map((cat) => (
        <div key={cat}>
          <h3 className="text-lg font-semibold text-white mb-4 capitalize">
            {cat === 'ai-app' ? '🤖 Applications IA' :
             cat === 'ecommerce' ? '🛍️ E-commerce' :
             cat === 'saas' ? '📊 SaaS' :
             cat === 'landing' ? '🚀 Landing Pages' :
             cat === 'portfolio' ? '🎨 Portfolio' :
             cat === 'blog' ? '✍️ Blog' :
             cat === 'dashboard' ? '📈 Dashboard' : cat}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEMPLATES.filter((t) => t.category === cat).map((tpl) => (
              <Card
                key={tpl.id}
                className="group relative overflow-hidden"
                onClick={() => {
                  router.push(`/dashboard/apps/generate?prompt=${encodeURIComponent(tpl.prompt)}`);
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: tpl.color }}
                />
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{tpl.icon}</span>
                  <div>
                    <h4 className="font-semibold text-white text-sm">{tpl.name}</h4>
                    <div className="flex items-center gap-1 text-xs text-yellow-400">
                      {'★'.repeat(Math.round(tpl.popularity / 20))}
                      <span className="text-white/30 ml-1">{tpl.popularity}%</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-white/50 line-clamp-2 mb-3">
                  {tpl.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {tpl.features.slice(0, 3).map((f) => (
                    <span
                      key={f}
                      className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-white/40 border border-white/5"
                    >
                      {f}
                    </span>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full group-hover:border-indigo-500/50 transition-colors"
                >
                  <Sparkles size={12} />
                  Utiliser ce template
                </Button>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}