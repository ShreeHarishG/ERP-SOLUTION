import api from '@/lib/api';

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  companyName?: string;
  phone?: string;
  country?: string;
  language?: string;
  companySize?: string;
  primaryInterest?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export const authApi = {
  register: async (payload: RegisterPayload) => {
    const res = await api.post<{ data: { user: User; accessToken: string } }>('/auth/register', payload);
    return res.data.data;
  },

  login: async (payload: LoginPayload) => {
    const res = await api.post<{ data: { user: User; accessToken: string } }>('/auth/login', payload);
    return res.data.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
  },

  getMe: async (): Promise<User> => {
    const res = await api.get<{ data: User }>('/auth/me');
    return res.data.data;
  },

  refresh: async () => {
    await api.post('/auth/refresh');
  },
};
