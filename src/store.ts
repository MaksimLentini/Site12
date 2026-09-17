// ═══ API КЛИЕНТ ═══
import { User, Chat, Message, Post, Story, Video, MusicTrack, Notification } from './types';

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
  getLocalUser(): User | null {
    try { return JSON.parse(localStorage.getItem('megachat_user') || 'null'); } catch { return null; }
  }
};

// ═══ USERS ═══
export const users = {
  async get(id: string): Promise<User & { followers: number; following: number; postsCount: number }> {
    return api(`/users/${id}`);
  },
  async update(data: Partial<User>): Promise<void> {
    await api('/users/me', { method: 'PUT', body: JSON.stringify(data) });
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
  async messages(chatId: string): Promise<Message[]> {
    return api<Message[]>(`/chats/${chatId}/messages`);
  },
  async sendMessage(chatId: string, content: string): Promise<Message> {
    return api<Message>(`/chats/${chatId}/messages`, {
      method: 'POST', body: JSON.stringify({ content })
    });
  },
  async react(messageId: string, emoji: string): Promise<void> {
    await api(`/messages/${messageId}/react`, { method: 'POST', body: JSON.stringify({ emoji }) });
  }
};

// ═══ POSTS ═══
export const posts = {
  async list(): Promise<Post[]> {
    return api<Post[]>('/posts');
  },
  async create(data: { content: string; type?: string; media?: string[]; hashtags?: string[] }): Promise<Post> {
    return api<Post>('/posts', { method: 'POST', body: JSON.stringify(data) });
  },
  async like(postId: string): Promise<{ likes: number }> {
    return api<{ likes: number }>(`/posts/${postId}/like`, { method: 'POST' });
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
  async create(data: { title: string; description?: string; thumbnail?: string; duration?: number; tags?: string[] }): Promise<Video> {
    return api<Video>('/videos', { method: 'POST', body: JSON.stringify(data) });
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

// ═══ ADMIN ═══
export const admin = {
  async stats(): Promise<Record<string, number>> {
    return api('/admin/stats');
  },
  async getUsers(): Promise<User[]> {
    return api<User[]>('/admin/users');
  },
  async banUser(id: string, reason?: string): Promise<void> {
    await api(`/admin/users/${id}/ban`, { method: 'PUT', body: JSON.stringify({ reason }) });
  },
  async unbanUser(id: string): Promise<void> {
    await api(`/admin/users/${id}/unban`, { method: 'PUT' });
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
