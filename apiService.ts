/**
 * API Service for ZEITGEIST Backend
 * Handles all communication with the backend API
 */

// Fix: Bypassing TypeScript error as import.meta.env is specific to Vite and may not be recognized by default TS config
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';

export interface User {
  id: string;
  email: string;
  userId: string;
  credits: number;
  isLoggedIn: boolean;
}

export interface PurchaseData {
  userId: string;
  stripeSessionId?: string;
  planType: 'starter' | 'pro';
  creditsAdded: number;
  amountPaidCents: number;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async login(email: string): Promise<User> {
    return this.request<User>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async getUser(email: string): Promise<User> {
    return this.request<User>(`/users/${encodeURIComponent(email)}`);
  }

  async updateCredits(
    userId: string,
    amount: number,
    transactionType: string = 'analysis',
    referenceId?: string
  ): Promise<{ credits: number }> {
    return this.request<{ credits: number }>(`/users/${userId}/credits`, {
      method: 'PATCH',
      body: JSON.stringify({ amount, transactionType, referenceId }),
    });
  }

  async recordPurchase(data: PurchaseData): Promise<{ success: boolean; credits: number; purchaseId: string }> {
    return this.request<{ success: boolean; credits: number; purchaseId: string }>('/purchases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPurchases(userId: string): Promise<any[]> {
    return this.request<any[]>(`/users/${userId}/purchases`);
  }
}

export const apiService = new ApiService();