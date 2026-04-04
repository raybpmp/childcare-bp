import { auth } from './firebase-client';

const API_BASE_URL = import.meta.env.PUBLIC_PORTAL_API_URL || 'https://portal.childcarebusinessplan.com/api';

class PortalAPI {
    private async getHeaders() {
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

    async get(endpoint: string) {
        const headers = await this.getHeaders();
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers
        });
        if (!response.ok) {
            throw new Error(`API GET Error: ${response.statusText}`);
        }
        return response.json();
    }

    async post(endpoint: string, data: any) {
        const headers = await this.getHeaders();
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`API POST Error: ${response.statusText}`);
        }
        return response.json();
    }

    async put(endpoint: string, data: any) {
        const headers = await this.getHeaders();
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`API PUT Error: ${response.statusText}`);
        }
        return response.json();
    }
}

export const portalApi = new PortalAPI();
