// ═══════════════════════════════════════════════════════════
// API КЛИЕНТ — подключение к реальному серверу
// ═══════════════════════════════════════════════════════════
import { User, Chat, Message, Post, Story, Video, MusicTrack, Notification } from './types';

const API_URL = 'http://localhost:3001/api';

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
  
  if (res.status === 401) {
    setToken(null);
    localStorage.removeItem('megachat_user');
    window.location.reload();
    throw new Error('Требуется авторизация');
  }
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Ошибка сервера' }));
    throw new Error(err.error || 'Ошибка запроса');
  }
  
  return res.json();
}

// ═══ AUTH ═══
export const auth = {
  async register(username: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const data = await api<{ token: string; user: User }>('/auth/register', {
      method: 'POST', body: JSON.stringify({ username, email, password })
    });
    setToken(data.token);
    localStorage.setItem('megachat_user', JSON.stringify(data.user));
    return data;
  },
  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    const data = await api<{ token: string; user: User }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ username, password })
    });
    setToken(data.token);
    localStorage.setItem('megachat_user', JSON.stringify(data.user));
    return data;
  },
  async logout(): Promise<void> {
    await api('/auth/logout', { method: 'POST' }).catch(() => {});
    setToken(null);
    localStorage.removeItem('megachat_user');
  },
  async me(): Promise<User> {
    return api<User>('/auth/me');
  },
  getToken() { return authToken; },
  getLocalUser(): User | null {
    try { return JSON.parse(localStorage.getItem('megachat_user') || 'null'); } catch { return null; }
  }
};

// ═══ USERS ═══
export const users = {
  async list(search?: string): Promise<User[]> {
    const data = await api<{ users: User[] }>(`/users${search ? `?search=${encodeURIComponent(search)}` : ''}`);
    return data.users;
  },
  async get(id: string): Promise<User & { followers: number; following: number; postsCount: number }> {
    return api(`/users/${id}`);
  },
  async update(data: Partial<User>): Promise<void> {
    await api('/users/me', { method: 'PUT', body: JSON.stringify(data) });
  },
  async follow(id: string): Promise<void> {
    await api(`/users/${id}/follow`, { method: 'POST' });
  },
  async unfollow(id: string): Promise<void> {
    await api(`/users/${id}/follow`, { method: 'DELETE' });
  }
};

// ═══ CHATS ═══
export const chats = {
  async list(): Promise<Chat[]> {
    return api<Chat[]>('/chats');
  },
  async create(data: { type: string; title?: string; members?: string[] }): Promise<Chat> {
    return api<Chat>('/chats', { method: 'POST', body: JSON.stringify(data) });
  },
  async messages(chatId: string, limit = 100): Promise<Message[]> {
    return api<Message[]>(`/chats/${chatId}/messages?limit=${limit}`);
  },
  async sendMessage(chatId: string, content: string, type = 'text', replyTo?: string): Promise<Message> {
    return api<Message>(`/chats/${chatId}/messages`, {
      method: 'POST', body: JSON.stringify({ content, type, reply_to: replyTo })
    });
  },
  async react(messageId: string, emoji: string): Promise<void> {
    await api(`/messages/${messageId}/react`, { method: 'POST', body: JSON.stringify({ emoji }) });
  }
};

// ═══ POSTS ═══
export const posts = {
  async list(limit = 50): Promise<Post[]> {
    return api<Post[]>(`/posts?limit=${limit}`);
  },
  async create(data: { content: string; type?: string; media?: string[]; hashtags?: string[] }): Promise<Post> {
    return api<Post>('/posts', { method: 'POST', body: JSON.stringify(data) });
  },
  async like(postId: string): Promise<{ likes: number }> {
    return api<{ likes: number }>(`/posts/${postId}/like`, { method: 'POST' });
  },
  async delete(postId: string): Promise<void> {
    await api(`/posts/${postId}`, { method: 'DELETE' });
  }
};

// ═══ STORIES ═══
export const stories = {
  async list(): Promise<Story[]> {
    return api<Story[]>('/stories');
  },
  async create(data: { media: string; text?: string }): Promise<Story> {
    return api<Story>('/stories', { method: 'POST', body: JSON.stringify(data) });
  }
};

// ═══ VIDEOS ═══
export const videos = {
  async list(short?: boolean): Promise<Video[]> {
    const q = short !== undefined ? `?short=${short}` : '';
    return api<Video[]>(`/videos${q}`);
  },
  async create(data: { title: string; description?: string; thumbnail?: string; duration?: number; tags?: string[]; is_short?: boolean }): Promise<Video> {
    return api<Video>('/videos', { method: 'POST', body: JSON.stringify(data) });
  },
  async view(videoId: string): Promise<void> {
    await api(`/videos/${videoId}/view`, { method: 'POST' });
  }
};

// ═══ MUSIC ═══
export const music = {
  async list(): Promise<MusicTrack[]> {
    return api<MusicTrack[]>('/music');
  },
  async create(data: { title: string; artist?: string; duration?: number; cover?: string }): Promise<MusicTrack> {
    return api<MusicTrack>('/music', { method: 'POST', body: JSON.stringify(data) });
  }
};

// ═══ NOTIFICATIONS ═══
export const notifications = {
  async list(): Promise<Notification[]> {
    return api<Notification[]>('/notifications');
  },
  async markRead(): Promise<void> {
    await api('/notifications/read', { method: 'PUT' });
  }
};

// ═══ ADMIN ═══
export const admin = {
  async stats(): Promise<Record<string, number>> {
    return api('/admin/stats');
  },
  async getUsers(search?: string): Promise<User[]> {
    return api<User[]>(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`);
  },
  async banUser(id: string, reason?: string): Promise<void> {
    await api(`/admin/users/${id}/ban`, { method: 'PUT', body: JSON.stringify({ reason }) });
  },
  async unbanUser(id: string): Promise<void> {
    await api(`/admin/users/${id}/unban`, { method: 'PUT' });
  },
  async changeRole(id: string, role: string): Promise<void> {
    await api(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) });
  },
  async deleteUser(id: string): Promise<void> {
    await api(`/admin/users/${id}`, { method: 'DELETE' });
  },
  async getReports(): Promise<any[]> {
    return api('/admin/reports');
  },
  async resolveReport(id: string, status: string): Promise<void> {
    await api(`/admin/reports/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
  },
  async getAuditLog(): Promise<any[]> {
    return api('/admin/audit-log');
  }
};
