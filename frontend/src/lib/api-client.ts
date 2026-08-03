// ============================================
// Solo IA — API Client
// Consomme l'API backend Solo IA
// ============================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class SoloIAError extends Error {
  constructor(
    public error: string,
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'SoloIAError';
  }
}

class SoloIAClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('solo_ia_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('solo_ia_token', token);
      else localStorage.removeItem('solo_ia_token');
    }
  }

  get isAuthenticated() {
    return !!this.token;
  }

  private async fetch<T>(
    path: string,
    method: string = 'GET',
    body?: unknown
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new SoloIAError(
        data.error || 'API_ERROR',
        data.message || 'Erreur serveur',
        res.status
      );
    }

    return data as T;
  }

  // ===== Auth =====
  async register(email: string, password: string, name: string) {
    return this.fetch<{ token: string; user: import('@/types').User }>(
      '/api/auth/register',
      'POST',
      { email, password, name }
    );
  }

  async login(email: string, password: string) {
    const data = await this.fetch<{ token: string; user: import('@/types').User }>(
      '/api/auth/login',
      'POST',
      { email, password }
    );
    this.setToken(data.token);
    return data;
  }

  async getProfile() {
    return this.fetch<import('@/types').User>('/api/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // ===== Apps =====
  async listApps() {
    return this.fetch<{ apps: import('@/types').App[] }>('/api/apps');
  }

  async getApp(id: string) {
    return this.fetch<{ app: import('@/types').App; deployments: import('@/types').Deployment[] }>(
      `/api/apps/${id}`
    );
  }

  async generateApp(prompt: string, appName?: string, options?: Record<string, unknown>) {
    return this.fetch<import('@/types').GenerateResponse>(
      '/api/apps/generate',
      'POST',
      { prompt, appName, options }
    );
  }

  async deployApp(appId: string) {
    return this.fetch<{ deploymentId: string; status: string; message: string }>(
      `/api/apps/${appId}/deploy`,
      'POST'
    );
  }

  async deleteApp(appId: string) {
    return this.fetch<{ message: string }>(`/api/apps/${appId}`, 'DELETE');
  }

  // ===== Deployments =====
  async listDeployments() {
    return this.fetch<{ deployments: import('@/types').Deployment[] }>('/api/deployments');
  }

  async getDeployment(id: string) {
    return this.fetch<{ deployment: import('@/types').Deployment }>(`/api/deployments/${id}`);
  }

  async getDeploymentLogs(id: string) {
    return this.fetch<{ logs: string }>(`/api/deployments/${id}/logs`);
  }

  // ===== Credits =====
  async getCredits() {
    return this.fetch<{ credits: import('@/types').Credits }>('/api/credits');
  }

  async getCreditsHistory() {
    return this.fetch<{ history: import('@/types').CreditLog[] }>('/api/credits/history');
  }

  // ===== Health =====
  async healthCheck() {
    return this.fetch<{ status: string; version: string }>('/api/health');
  }
}

export const soloIA = new SoloIAClient();
export default soloIA;