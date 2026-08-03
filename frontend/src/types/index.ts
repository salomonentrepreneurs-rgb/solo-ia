// ============================================
// Solo IA — Types TypeScript
// ============================================

// Utilisateur
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  creditsUsedToday: number;
  appsCount?: number;
  createdAt?: string;
}

// Application générée
export interface App {
  id: string;
  userId: string;
  title: string;
  description?: string;
  prompt: string;
  status: AppStatus;
  framework: string;
  language: string;
  appType: string;
  filesCount: number;
  linesCount: number;
  version: number;
  sourcePath?: string;
  deployedUrl?: string;
  errorLog?: string;
  createdAt: string;
  updatedAt: string;
}

export type AppStatus =
  | 'pending'
  | 'generating'
  | 'completed'
  | 'failed'
  | 'deploying'
  | 'deployed';

// Déploiement
export interface Deployment {
  id: string;
  appId: string;
  userId: string;
  platform: string;
  status: DeploymentStatus;
  url?: string;
  vercelDeploymentId?: string;
  buildLogs?: string;
  startedAt: string;
  completedAt?: string;
  appName?: string;
  appType?: string;
}

export type DeploymentStatus =
  | 'pending'
  | 'building'
  | 'deploying'
  | 'ready'
  | 'failed';

// Crédits
export interface Credits {
  used: number;
  max: number;
  remaining: number;
  resetDate: string;
}

export interface CreditLog {
  amount: number;
  action: string;
  description: string;
  createdAt: string;
}

// Template prédéfini
export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  icon: string;
  color: string;
  features: string[];
  popularity: number;
  prompt: string;
}

export type TemplateCategory =
  | 'ecommerce'
  | 'saas'
  | 'landing'
  | 'portfolio'
  | 'blog'
  | 'ai-app'
  | 'dashboard'
  | 'api';

// Stats du dashboard
export interface DashboardStats {
  totalApps: number;
  deployedApps: number;
  creditsUsed: number;
  creditsMax: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  type: 'generated' | 'deployed' | 'failed' | 'credit';
  message: string;
  timestamp: string;
  appId?: string;
}

// Réponses API
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface GenerateResponse {
  appId: string;
  status: string;
  message: string;
}

export interface AppFile {
  path: string;
  content: string;
  size?: number;
  lines?: number;
}