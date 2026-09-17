// ═══ API КЛИЕНТ ═══
import type { User, Chat, Message, Post, Story, Video, MusicTrack } from './types';

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

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  if (options.headers) Object.assign(headers, options.headers);

  const url = '/api' + path;
  console.log('[API]', options.method || 'GET', url, token ? '✅' : '❌');

  const res = await fetch(url, { ...options, headers });
  let data: any = null;
  try { data = await res.json(); } catch {}
  console.log('[API]', res.status, data);

  if (!res.ok) {
    if (path.startsWith('/auth/')) throw new Error(data?.error || 'Ошибка');
    if (res.status === 401) { clearToken(); throw new Error('Сессия истекла'); }
    throw new Error(data?.error || 'Ошибка ' + res.status);
  }
  return data as T;
}

export const auth = {
  register(username: string, email: string, password: string) {
    console.log('[AUTH] Регистрация:', username);
    return api<{ token: string; user: User }>('/auth/register', {
      method: 'POST', body: JSON.stringify({ username, email, password })
    }).then(data => {
      saveToken(data.token);
      localStorage.setItem('megachat_user', JSON.stringify(data.user));
      console.log('[AUTH] ✅ Успешно');
      return data;
    });
  },
  login(username: string, password: string) {
    console.log('[AUTH] Вход:', username);
    return api<{ token: string; user: User }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ username, password })
    }).then(data => {
      saveToken(data.token);
      localStorage.setItem('megachat_user', JSON.stringify(data.user));
      console.log('[AUTH] ✅ Успешно, токен:', data.token.substring(0, 30) + '...');
      return data;
    });
  },
  logout() {
    const token = getToken();
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
      }).catch(() => {});
    }
    clearToken();
  },
  getLocalUser(): User | null {
    try {
      const data = localStorage.getItem('megachat_user');
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  },
  isLoggedIn(): boolean {
    return !!getToken() && !!localStorage.getItem('megachat_user');
  }
};

export const users = {
  get(id: string) {
    return api<User & { followers: number; following: number; postsCount: number }>(`/users/${id}`);
  },
  update(data: any) {
    return api('/users/me', { method: 'PUT', body: JSON.stringify(data) });
  }
};

export const chats = {
  list() { return api<Chat[]>('/chats'); },
  create(data: any) {
    return api<Chat>('/chats', { method: 'POST', body: JSON.stringify(data) });
  },
  messages(chatId: string) { return api<Message[]>(`/chats/${chatId}/messages`); },
  sendMessage(chatId: string, content: string) {
    return api<Message>(`/chats/${chatId}/messages`, { method: 'POST', body: JSON.stringify({ content }) });
  },
  react(messageId: string, emoji: string) {
    return api(`/messages/${messageId}/react`, { method: 'POST', body: JSON.stringify({ emoji }) });
  }
};

export const posts = {
  list() { return api<Post[]>('/posts'); },
  create(data: any) {
    return api<Post>('/posts', { method: 'POST', body: JSON.stringify(data) });
  },
  like(postId: string) {
    return api<{ likes: number }>(`/posts/${postId}/like`, { method: 'POST' });
  }
};

export const stories = {
  list() { return api<Story[]>('/stories'); },
  create(data: any) {
    return api<Story>('/stories', { method: 'POST', body: JSON.stringify(data) });
  }
};

export const videos = {
  list(short?: boolean) {
    const q = short !== undefined ? `?short=${short}` : '';
    return api<Video[]>(`/videos${q}`);
  },
  create(data: any) {
    return api<Video>('/videos', { method: 'POST', body: JSON.stringify(data) });
  }
};

export const music = {
  list() { return api<MusicTrack[]>('/music'); },
  create(data: any) {
    return api<MusicTrack>('/music', { method: 'POST', body: JSON.stringify(data) });
  }
};

export const admin = {
  stats() { return api<Record<string, number>>('/admin/stats'); },
  getUsers() { return api<User[]>('/admin/users'); },
  banUser(id: string, reason?: string) {
    return api(`/admin/users/${id}/ban`, { method: 'PUT', body: JSON.stringify({ reason }) });
  },
  unbanUser(id: string) {
    return api(`/admin/users/${id}/unban`, { method: 'PUT' });
  },
  deleteUser(id: string) {
    return api(`/admin/users/${id}`, { method: 'DELETE' });
  },
  getReports() { return api<any[]>('/admin/reports'); },
  resolveReport(id: string, status: string) {
    return api(`/admin/reports/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
  },
  getAuditLog() { return api<any[]>('/admin/audit-log'); }
};
