import { auth } from './firebase-client';

/**
 * Portal API Client — transparent bridge to the MariaDB database.
 *
 * URL chain:
 *   Client → https://portal.childcarebusinessplan.com/portal-api/api/v1/...
 *   Caddy strips `/portal-api` → Express sees `/api/v1/...`
 *
 * Auth: Firebase ID token is attached as Bearer token.
 * The server-side API verifies the token and proxies queries to the DB.
 */
const API_BASE_URL = import.meta.env.PUBLIC_PORTAL_API_URL || 'https://portal.childcarebusinessplan.com/portal-api/api';

class PortalAPI {
    private async getHeaders(): Promise<HeadersInit> {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Not authenticated');
        }
        const token = await user.getIdToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    /**
     * GET /v1/:table — fetch rows from a table.
     * Supports optional query params for filtering.
     * @example portalApi.get('/v1/users', { uid: 'abc123' })
     */
    async get(endpoint: string, params?: Record<string, string>): Promise<any> {
        const headers = await this.getHeaders();
        let url = `${API_BASE_URL}${endpoint}`;

        if (params && Object.keys(params).length > 0) {
            const qs = new URLSearchParams(params).toString();
            url += `?${qs}`;
        }

        const response = await fetch(url, { method: 'GET', headers });
        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body.error || `API GET ${response.status}: ${response.statusText}`);
        }
        return response.json();
    }

    /**
     * POST /v1/:table — insert a row into a table.
     * @example portalApi.post('/v1/activities', { uid: 'abc', type: 'login', description: 'User logged in' })
     */
    async post(endpoint: string, data: Record<string, any>): Promise<any> {
        const headers = await this.getHeaders();
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body.error || `API POST ${response.status}: ${response.statusText}`);
        }
        return response.json();
    }

    /**
     * PUT /v1/:table/:id — update a row by ID.
     * @example portalApi.put('/v1/users/abc123', { role: 'admin' }, 'uid')
     */
    async put(endpoint: string, data: Record<string, any>, keyColumn?: string): Promise<any> {
        const headers = await this.getHeaders();
        let url = `${API_BASE_URL}${endpoint}`;
        if (keyColumn) {
            url += `?key=${keyColumn}`;
        }

        const response = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body.error || `API PUT ${response.status}: ${response.statusText}`);
        }
        return response.json();
    }

    /**
     * DELETE /v1/:table/:id — delete a row by ID.
     * @example portalApi.delete('/v1/activities/5')
     */
    async del(endpoint: string, keyColumn?: string): Promise<any> {
        const headers = await this.getHeaders();
        let url = `${API_BASE_URL}${endpoint}`;
        if (keyColumn) {
            url += `?key=${keyColumn}`;
        }

        const response = await fetch(url, { method: 'DELETE', headers });
        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body.error || `API DELETE ${response.status}: ${response.statusText}`);
        }
        return response.json();
    }

    /**
     * Execute a raw SELECT query.
     * @example portalApi.query('SELECT COUNT(*) as total FROM activities WHERE uid = ?', ['abc123'])
     */
    async query(sql: string, params?: any[]): Promise<any> {
        const headers = await this.getHeaders();
        const response = await fetch(`${API_BASE_URL}/v1/_query`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ sql, params })
        });
        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body.error || `API query ${response.status}: ${response.statusText}`);
        }
        return response.json();
    }

    /**
     * Get table schema (column definitions).
     * @example portalApi.schema('users')
     */
    async schema(table: string): Promise<any> {
        const headers = await this.getHeaders();
        const response = await fetch(`${API_BASE_URL}/v1/_schema/${table}`, {
            method: 'GET',
            headers
        });
        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body.error || `API schema ${response.status}: ${response.statusText}`);
        }
        return response.json();
    }

    /**
     * List all tables in the database.
     */
    async tables(): Promise<any> {
        const headers = await this.getHeaders();
        const response = await fetch(`${API_BASE_URL}/v1/_tables`, {
            method: 'GET',
            headers
        });
        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body.error || `API tables ${response.status}: ${response.statusText}`);
        }
        return response.json();
    }
}

export const portalApi = new PortalAPI();
