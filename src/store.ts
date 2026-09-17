// ═══ API КЛИЕНТ ═══
import type { User, Chat, Message, Post, Story, Video, MusicTrack } from './types';

// Функция для получения токена — всегда читаем из localStorage
function getToken(): string | null {
  return localStorage.getItem('megachat_token');
}

function saveToken(token: string) {
  localStorage.setItem('megachat_token', token);
}

function clearToken() {
  localStorage.removeItem('megachat_token');
  localStorage.removeItem('megachat_user');
}

// Базовая функция API
async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }
  // Добавляем кастомные заголовки
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  const url = '/api' + path;
  console.log('[API]', options.method || 'GET', url, token ? '(с токеном)' : '(без токена)');

  const res = await fetch(url, { ...options, headers });
  
  let data: any = null;
  try {
    data = await res.json();
  } catch {}

  console.log('[API] Response:', res.status, data);

  if (!res.ok) {
    // Если 401 на auth endpoint — просто возвращаем ошибку
    if (path.startsWith('/auth/')) {
      throw new Error(data?.error || 'Ошибка авторизации');
    }
    // Если 401 на другом endpoint — сессия истекла
    if (res.status === 401) {
      clearToken();
      throw new Error('Сессия истекла. Войдите снова.');
    }
    throw new Error(data?.error || 'Ошибка ' + res.status);
  }

  return data as T;
}

// ═══ AUTH ═══
export const auth = {
  async register(username: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const data = await api<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    });
    saveToken(data.token);
    localStorage.setItem('megachat_user', JSON.stringify(data.user));
    console.log('[AUTH] Регистрация успешна, токен сохранён');
    return data;
  },

  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    const data = await api<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    saveToken(data.token);
    localStorage.setItem('megachat_user', JSON.stringify(data.user));
    console.log('[AUTH] Вход успешен, токен сохранён:', data.token.substring(0, 20) + '...');
    return data;
  },

  async logout(): Promise<void> {
    const token = getToken();
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
        });
      } catch {}
    }
    clearToken();
  },

  getLocalUser(): User | null {
    try {
      const data = localStorage.getItem('megachat_user');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  isLoggedIn(): boolean {
    return !!getToken() && !!localStorage.getItem('megachat_user');
  }
};

// ═══ USERS ═══
export const users = {
  async get(id: string): Promise<User & { followers: number; following: number; postsCount: number }> {
    return api<User & { followers: number; following: number; postsCount: number }>(`/users/${id}`);
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
