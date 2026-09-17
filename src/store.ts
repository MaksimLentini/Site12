// ═══ API КЛИЕНТ ═══
import type { User, Chat, Message, Post, Story, Video, MusicTrack, Notification } from './types';

const API_URL = '/api';
let authToken: string | null = localStorage.getItem('megachat_token');

function setToken(token: string | null) {
  authToken = token;
  if (token) localStorage.setItem('megachat_token', token);
  else localStorage.removeItem('megachat_token');
}

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => null);

  if (res.status === 401 && !path.includes('/auth/')) {
    setToken(null);
    localStorage.removeItem('megachat_user');
    throw new Error('Сессия истекла. Войдите снова.');
  }

  if (!res.ok) {
    throw new Error(data?.error || `Ошибка ${res.status}`);
  }

  return data;
}

// ═══ AUTH ═══
export const auth = {
  async register(username: string, email: string, password: string) {
    const data = await api<{ token: string; user: User }>('/auth/register', {
      method: 'POST', body: JSON.stringify({ username, email, password })
    });
    setToken(data.token);
    localStorage.setItem('megachat_user', JSON.stringify(data.user));
    return data;
  },
  async login(username: string, password: string) {
    const data = await api<{ token: string; user: User }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ username, password })
    });
    setToken(data.token);
    localStorage.setItem('megachat_user', JSON.stringify(data.user));
    return data;
  },
  async logout() {
    await api('/auth/logout', { method: 'POST' }).catch(() => {});
    setToken(null);
    localStorage.removeItem('megachat_user');
  },
  getLocalUser(): User | null {
    try { return JSON.parse(localStorage.getItem('megachat_user') || 'null'); } catch { return null; }
  }
};

// ═══ USERS ═══
export const users = {
  async get(id: string) {
    return api<User & { followers: number; following: number; postsCount: number }>(`/users/${id}`);
  },
  async update(data: Partial<User>) {
    await api('/users/me', { method: 'PUT', body: JSON.stringify(data) });
  }
};

// ═══ CHATS ═══
export const chats = {
  async list() {
    return api<Chat[]>('/chats');
  },
  async create(data: { type: string; title?: string; members?: string[] }) {
    return api<Chat>('/chats', { method: 'POST', body: JSON.stringify(data) });
  },
  async messages(chatId: string) {
    return api<Message[]>(`/chats/${chatId}/messages`);
  },
  async sendMessage(chatId: string, content: string) {
    return api<Message>(`/chats/${chatId}/messages`, {
      method: 'POST', body: JSON.stringify({ content })
    });
  },
  async react(messageId: string, emoji: string) {
    await api(`/messages/${messageId}/react`, { method: 'POST', body: JSON.stringify({ emoji }) });
  }
};

// ═══ POSTS ═══
export const posts = {
  async list() {
    return api<Post[]>('/posts');
  },
  async create(data: { content: string; type?: string; media?: string[]; hashtags?: string[] }) {
    return api<Post>('/posts', { method: 'POST', body: JSON.stringify(data) });
  },
  async like(postId: string) {
    return api<{ likes: number }>(`/posts/${postId}/like`, { method: 'POST' });
  }
};

// ═══ STORIES ═══
export const stories = {
  async list() {
    return api<Story[]>('/stories');
  },
  async create(data: { media: string; text?: string }) {
    return api<Story>('/stories', { method: 'POST', body: JSON.stringify(data) });
  }
};

// ═══ VIDEOS ═══
export const videos = {
  async list(short?: boolean) {
    const q = short !== undefined ? `?short=${short}` : '';
    return api<Video[]>(`/videos${q}`);
  },
  async create(data: { title: string; description?: string; thumbnail?: string; duration?: number; tags?: string[] }) {
    return api<Video>('/videos', { method: 'POST', body: JSON.stringify(data) });
  }
};

// ═══ MUSIC ═══
export const music = {
  async list() {
    return api<MusicTrack[]>('/music');
  },
  async create(data: { title: string; artist?: string; duration?: number; cover?: string }) {
    return api<MusicTrack>('/music', { method: 'POST', body: JSON.stringify(data) });
  }
};

// ═══ ADMIN ═══
export const admin = {
  async stats() {
    return api<Record<string, number>>('/admin/stats');
  },
  async getUsers() {
    return api<User[]>('/admin/users');
  },
  async banUser(id: string, reason?: string) {
    await api(`/admin/users/${id}/ban`, { method: 'PUT', body: JSON.stringify({ reason }) });
  },
  async unbanUser(id: string) {
    await api(`/admin/users/${id}/unban`, { method: 'PUT' });
  },
  async deleteUser(id: string) {
    await api(`/admin/users/${id}`, { method: 'DELETE' });
  },
  async getReports() {
    return api<any[]>('/admin/reports');
  },
  async resolveReport(id: string, status: string) {
    await api(`/admin/reports/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
  },
  async getAuditLog() {
    return api<any[]>('/admin/audit-log');
  }
};
