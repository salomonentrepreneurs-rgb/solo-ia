// ============================================
// Solo IA — Utilitaires
// ============================================

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'À l\'instant';
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Il y a ${days}j`;
  return formatDate(date);
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    generating: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    deploying: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    deployed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
    pending: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    building: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    ready: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };
  return colors[status] || colors.pending;
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    generating: 'Génération...',
    completed: 'Prête',
    deploying: 'Déploiement...',
    deployed: 'En ligne',
    failed: 'Échec',
    pending: 'En attente',
    building: 'Build...',
    ready: 'Prêt',
  };
  return labels[status] || status;
}

export function truncate(str: string, len: number = 80) {
  return str.length > len ? str.slice(0, len) + '...' : str;
}

export const TEMPLATES = [
  {
    id: 'saas-dashboard',
    name: 'SaaS Dashboard',
    description: 'Plateforme SaaS avec analytics, gestion d\'utilisateurs et abonnements Stripe',
    category: 'saas' as const,
    icon: '📊',
    color: '#6366f1',
    features: ['Auth complète', 'Stripe', 'Graphiques', 'Team management'],
    popularity: 98,
    prompt: 'Crée un SaaS dashboard complet avec gestion des utilisateurs, tableaux de bord analytics, abonnements Stripe, mode sombre et interface responsive.',
  },
  {
    id: 'ecommerce-store',
    name: 'Boutique E-commerce',
    description: 'Boutique en ligne complète avec catalogue, panier, paiements et dashboard admin',
    category: 'ecommerce' as const,
    icon: '🛍️',
    color: '#06b6d4',
    features: ['Catalogue', 'Panier', 'Stripe', 'Admin dashboard'],
    popularity: 95,
    prompt: 'Crée une boutique e-commerce complète avec catalogue produits, panier d\'achat, paiements Stripe, dashboard administrateur et recherche filtrée.',
  },
  {
    id: 'ai-chat-app',
    name: 'App AI Chat',
    description: 'Application de chat avec IA, multiples modèles, historique et partage',
    category: 'ai-app' as const,
    icon: '🤖',
    color: '#8b5cf6',
    features: ['Multi-modèles', 'Streaming', 'Historique', 'RAG'],
    popularity: 92,
    prompt: 'Construis une application de chat IA avec support de multiples modèles (GPT-4, Claude), streaming en temps réel, historique des conversations et RAG.',
  },
  {
    id: 'portfolio-creative',
    name: 'Portfolio Créatif',
    description: 'Portfolio moderne pour créatifs avec galerie, animations et formulaire de contact',
    category: 'portfolio' as const,
    icon: '🎨',
    color: '#ec4899',
    features: ['Galerie', 'Animations', 'Contact', 'Dark mode'],
    popularity: 88,
    prompt: 'Crée un portfolio moderne pour un photographe avec galerie d\'images, animations fluides, formulaire de contact, dark mode et design responsive.',
  },
  {
    id: 'blog-platform',
    name: 'Plateforme Blog',
    description: 'Blog multi-auteurs avec éditeur riche, catégories et newsletter',
    category: 'blog' as const,
    icon: '✍️',
    color: '#f59e0b',
    features: ['Éditeur riche', 'Catégories', 'Newsletter', 'SEO'],
    popularity: 85,
    prompt: 'Construis une plateforme de blog multi-auteurs avec éditeur de contenu riche, catégories, tags, newsletter et optimisation SEO.',
  },
  {
    id: 'booking-system',
    name: 'Système de Réservation',
    description: 'Plateforme de réservation avec calendrier, disponibilités et paiements',
    category: 'landing' as const,
    icon: '📅',
    color: '#10b981',
    features: ['Calendrier', 'Paiements', 'Notifications', 'Admin'],
    popularity: 82,
    prompt: 'Crée un système de réservation avec calendrier interactif, gestion des disponibilités, paiements Stripe et notifications par email.',
  },
  {
    id: 'crm-tool',
    name: 'CRM Intelligent',
    description: 'CRM avec pipeline deals, scoring IA, rapports et suivi clients',
    category: 'dashboard' as const,
    icon: '📈',
    color: '#ef4444',
    features: ['Pipeline deals', 'Scoring IA', 'Rapports', 'Import CSV'],
    popularity: 80,
    prompt: 'Construis un CRM avec pipeline de deals visuel, scoring IA des leads, rapports analytics, import CSV et gestion des contacts.',
  },
  {
    id: 'landing-page',
    name: 'Landing Page Marketing',
    description: 'Page d\'atterrissage haute conversion avec sections premium',
    category: 'landing' as const,
    icon: '🚀',
    color: '#3b82f6',
    features: ['Hero animé', 'FAQ', 'Témoignages', 'Newsletter'],
    popularity: 78,
    prompt: 'Crée une landing page marketing haute conversion avec hero animé, grille de fonctionnalités, témoignages, FAQ, compteur de stats et formulaire newsletter.',
  },
];