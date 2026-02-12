import { supabase } from './supabaseClient';

const API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://clarity-6sew.onrender.com/api'
  : 'http://localhost:5000/api';

// Type definitions
export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category_name: string;
  description?: string;
  date?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_recurring?: boolean;
  recurring_frequency?: 'weekly' | 'monthly' | 'yearly';
  recurring_end_date?: string;
}

export interface Goal {
  title: string;
  id: string;
  name: string;
  target_amount: number;
  current_amount?: number;
  target_date: string;
  color?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  status?: 'active' | 'completed';
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

class ApiClient {
  private async getAuthToken(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();

      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async getMe() {
    return this.request('/auth/me');
  }

  async updateProfile(profileData: { name?: string; email?: string; avatar_url?: string }) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Transaction endpoints
  async getTransactions(params: {
    type?: 'income' | 'expense';
    category?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/transactions${queryString ? `?${queryString}` : ''}`);
  }

  async createTransaction(transactionData: {
    amount: number;
    type: 'income' | 'expense';
    category_name: string;
    description?: string;
    date?: string;
    is_recurring?: boolean;
    recurring_frequency?: 'weekly' | 'monthly' | 'yearly';
    recurring_end_date?: string;
  }) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async updateTransaction(id: string, transactionData: Partial<{
    amount: number;
    type: 'income' | 'expense';
    category_name: string;
    description: string;
    date: string;
  }>) {
    return this.request(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transactionData),
    });
  }

  async deleteTransaction(id: string) {
    return this.request(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  async getTransactionSummary(params: {
    startDate?: string;
    endDate?: string;
    groupBy?: string;
  } = {}) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/transactions/summary${queryString ? `?${queryString}` : ''}`);
  }

  // Category endpoints
  async getCategories(type?: 'income' | 'expense') {
    return this.request(`/categories${type ? `?type=${type}` : ''}`);
  }

  async createCategory(categoryData: {
    name: string;
    type: 'income' | 'expense';
    icon?: string;
    color?: string;
  }) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id: string, categoryData: Partial<{
    name: string;
    icon: string;
    color: string;
  }>) {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Goal endpoints
  async getGoals(status?: 'completed' | 'active') {
    return this.request(`/goals${status ? `?status=${status}` : ''}`);
  }

  async createGoal(goalData: {
    title: string;
    target_amount: number;
    target_date?: string;
    color?: string;
    current_amount?: number;
  }) {
    return this.request('/goals', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
  }

  async updateGoal(id: string, goalData: Partial<{
    title: string;
    target_amount: number;
    target_date: string;
    color: string;
  }>) {
    return this.request(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(goalData),
    });
  }

  async deleteGoal(id: string) {
    return this.request(`/goals/${id}`, {
      method: 'DELETE',
    });
  }

  async addMoneyToGoal(id: string, amount: number, description?: string) {
    return this.request(`/goals/${id}/add-money`, {
      method: 'POST',
      body: JSON.stringify({ amount, description }),
    });
  }

  async getGoalHistory(id: string) {
    return this.request(`/goals/${id}/history`);
  }

  async getGoalsSummary() {
    return this.request('/goals/summary');
  }

  // Analytics endpoints
  async getOverview(params: { month?: number; year?: number } = {}) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/analytics/overview${queryString ? `?${queryString}` : ''}`);
  }

  async getSpendingTrends(params: {
    period?: 'month' | 'year' | 'last30days';
    year?: number;
    month?: number;
  } = {}) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/analytics/spending-trends${queryString ? `?${queryString}` : ''}`);
  }

  async getCategoryBreakdown(params: {
    type?: 'income' | 'expense';
    startDate?: string;
    endDate?: string;
    limit?: number;
  } = {}) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/analytics/category-breakdown${queryString ? `?${queryString}` : ''}`);
  }

  async getMonthlySummary(months?: number) {
    return this.request(`/analytics/monthly-summary${months ? `?months=${months}` : ''}`);
  }

  async getFinancialInsights() {
    return this.request('/analytics/insights');
  }
}

export const apiClient = new ApiClient();