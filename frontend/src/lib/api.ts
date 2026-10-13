function getApiBase(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    return `http://${host}:8000/api/v1`;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('it_token');
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${getApiBase()}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errorMsg = 'İşlem sırasında bir hata oluştu';
      try {
        const errorData = await res.json();
        errorMsg = errorData.detail || errorData.message || errorMsg;
      } catch {
        errorMsg = `Sunucu hatası (${res.status})`;
      }
      throw new ApiError(errorMsg, res.status);
    }

    // Handle empty responses
    const text = await res.text();
    return text ? JSON.parse(text) : ({} as T);
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message || 'Sunucuya bağlanılamadı. Backend servisinin çalıştığından emin olun.', 0);
  }
}

// API methods
export const api = {
  // Auth
  login: (credentials: { username_or_email: string; password: string }) =>
    apiFetch<any>('/auth/login-json', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  getMe: () => apiFetch<any>('/auth/me'),
  logout: () => apiFetch<any>('/auth/logout', { method: 'POST' }),

  // Dashboard
  getDashboardStats: () => apiFetch<any>('/dashboard/stats'),

  // Devices
  getDevices: (params?: { q?: string; category?: string; status?: string; skip?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.q) query.append('q', params.q);
    if (params?.category) query.append('category', params.category);
    if (params?.status) query.append('status', params.status);
    if (params?.skip !== undefined) query.append('skip', String(params.skip));
    if (params?.limit !== undefined) query.append('limit', String(params.limit));
    const qs = query.toString();
    return apiFetch<any[]>(`/devices${qs ? `?${qs}` : ''}`);
  },
  getDeviceById: (id: number) => apiFetch<any>(`/devices/${id}`),
  getDeviceByTag: (assetTag: string) => apiFetch<any>(`/devices/by-tag/${encodeURIComponent(assetTag)}`),
  createDevice: (data: any) =>
    apiFetch<any>('/devices', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateDevice: (id: number, data: any) =>
    apiFetch<any>(`/devices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  updateDeviceStatus: (id: number, status: string, notes?: string) =>
    apiFetch<any>(`/devices/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    }),
  deleteDevice: (id: number) =>
    apiFetch<any>(`/devices/${id}`, {
      method: 'DELETE',
    }),
  getDeviceQr: (id: number) => apiFetch<any>(`/devices/${id}/qr-code`),

  // Assignments
  getAssignments: (params?: { is_active?: boolean; user_id?: number; device_id?: number; skip?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.is_active !== undefined) query.append('is_active', String(params.is_active));
    if (params?.user_id) query.append('user_id', String(params.user_id));
    if (params?.device_id) query.append('device_id', String(params.device_id));
    if (params?.skip !== undefined) query.append('skip', String(params.skip));
    if (params?.limit !== undefined) query.append('limit', String(params.limit));
    const qs = query.toString();
    return apiFetch<any[]>(`/assignments${qs ? `?${qs}` : ''}`);
  },
  getMyAssignments: () => apiFetch<any[]>('/assignments/my'),
  createAssignment: (data: { device_id: number; user_id: number; expected_return_date?: string; condition_at_assignment?: string; notes?: string }) =>
    apiFetch<any>('/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  returnAssignment: (assignmentId: number, data: { condition_at_return?: string; notes?: string }) =>
    apiFetch<any>(`/assignments/${assignmentId}/return`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Users
  getUsers: (params?: { q?: string; role?: string; skip?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.q) query.append('q', params.q);
    if (params?.role) query.append('role', params.role);
    if (params?.skip !== undefined) query.append('skip', String(params.skip));
    if (params?.limit !== undefined) query.append('limit', String(params.limit));
    const qs = query.toString();
    return apiFetch<any[]>(`/users${qs ? `?${qs}` : ''}`);
  },
  getUserById: (id: number) => apiFetch<any>(`/users/${id}`),
  createUser: (data: any) =>
    apiFetch<any>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateUser: (id: number, data: any) =>
    apiFetch<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteUser: (id: number) =>
    apiFetch<any>(`/users/${id}`, {
      method: 'DELETE',
    }),

  // Audit Logs
  getAuditLogs: (params?: { action?: string; entity_type?: string; user_id?: number; skip?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.action) query.append('action', params.action);
    if (params?.entity_type) query.append('entity_type', params.entity_type);
    if (params?.user_id) query.append('user_id', String(params.user_id));
    if (params?.skip !== undefined) query.append('skip', String(params.skip));
    if (params?.limit !== undefined) query.append('limit', String(params.limit));
    const qs = query.toString();
    return apiFetch<any[]>(`/audit-logs${qs ? `?${qs}` : ''}`);
  },
};
