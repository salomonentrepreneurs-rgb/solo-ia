// ============================================
// Solo IA — Client API pour le frontend
// Interface JavaScript pour communiquer avec le backend
// ============================================

const SOLO_IA_API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3001';

class SoloIAClient {
  constructor(baseUrl = SOLO_IA_API_URL) {
    this.baseUrl = baseUrl;
    this._token = localStorage?.getItem('solo_ia_token') || null;
  }

  // ============================================
  // AUTH
  // ============================================

  async register(email, password, name) {
    return this._fetch('/api/auth/register', 'POST', { email, password, name });
  }

  async login(email, password) {
    const data = await this._fetch('/api/auth/login', 'POST', { email, password });
    if (data.token) {
      this._token = data.token;
      localStorage?.setItem('solo_ia_token', data.token);
    }
    return data;
  }

  async getProfile() {
    return this._fetch('/api/auth/me', 'GET');
  }

  logout() {
    this._token = null;
    localStorage?.removeItem('solo_ia_token');
  }

  get isAuthenticated() {
    return !!this._token;
  }

  // ============================================
  // APPS
  // ============================================

  async listApps() {
    return this._fetch('/api/apps', 'GET');
  }

  async getApp(id) {
    return this._fetch(`/api/apps/${id}`, 'GET');
  }

  /**
   * Génère une application à partir d'un prompt
   * @param {string} prompt - Description de l'application
   * @param {string} [appName] - Nom optionnel
   * @param {Object} [options] - Options additionnelles
   * @returns {Promise<{appId: string, status: string}>}
   */
  async generateApp(prompt, appName, options = {}) {
    return this._fetch('/api/apps/generate', 'POST', { prompt, appName, options });
  }

  /**
   * Vérifie le statut d'une génération
   */
  async checkAppStatus(appId) {
    return this._fetch(`/api/apps/${appId}`, 'GET');
  }

  /**
   * Déploie une application sur Vercel
   */
  async deployApp(appId) {
    return this._fetch(`/api/apps/${appId}/deploy`, 'POST');
  }

  /**
   * Supprime une application
   */
  async deleteApp(appId) {
    return this._fetch(`/api/apps/${appId}`, 'DELETE');
  }

  // ============================================
  // DEPLOYMENTS
  // ============================================

  async listDeployments() {
    return this._fetch('/api/deployments', 'GET');
  }

  async getDeployment(id) {
    return this._fetch(`/api/deployments/${id}`, 'GET');
  }

  async getDeploymentLogs(id) {
    return this._fetch(`/api/deployments/${id}/logs`, 'GET');
  }

  // ============================================
  // CREDITS
  // ============================================

  async getCredits() {
    return this._fetch('/api/credits', 'GET');
  }

  async getCreditsHistory() {
    return this._fetch('/api/credits/history', 'GET');
  }

  // ============================================
  // HEALTH
  // ============================================

  async healthCheck() {
    return this._fetch('/api/health', 'GET');
  }

  // ============================================
  // INTERNE
  // ============================================

  async _fetch(path, method = 'GET', body = null) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this._token) {
      headers['Authorization'] = `Bearer ${this._token}`;
    }

    const options = { method, headers };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${this.baseUrl}${path}`, options);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.error || 'Erreur API',
          data.message || 'Une erreur est survenue',
          response.status
        );
      }

      return data;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(
        'Erreur réseau',
        'Impossible de contacter le serveur Solo IA. Vérifiez votre connexion.',
        0
      );
    }
  }
}

class ApiError extends Error {
  constructor(error, message, status) {
    super(message);
    this.name = 'ApiError';
    this.error = error;
    this.status = status;
  }
}

// Export
if (typeof window !== 'undefined') {
  window.SoloIAClient = SoloIAClient;
  window.soloIA = new SoloIAClient();
}

export { SoloIAClient, ApiError };
export default SoloIAClient;