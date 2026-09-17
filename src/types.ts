// ═══════════════════════════════════════════════════════════
// ТИПЫ ДАННЫХ
// ═══════════════════════════════════════════════════════════

export type UserRole = 'user' | 'moderator' | 'admin' | 'superadmin';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatar: string;
  cover: string;
  bio: string;
  status: string;
  is_online: number;
  is_banned: number;
  ban_reason?: string;
  last_seen?: number;
  created_at?: number;
  followers?: number;
  following?: number;
  postsCount?: number;
}

export interface Chat {
  id: string;
  type: 'private' | 'group' | 'channel';
  title: string;
  avatar: string;
  members: string[];
  created_by: string;
  created_at: number;
  lastMessage?: Message;
}

export interface Message {
  id: string;
  chat_id: string;
  user_id: string;
  content: string;
  type: string;
  reply_to?: string;
  reactions?: Record<string, string[]>;
  created_at: number;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  type: string;
  media?: string[];
  likes?: string[];
  likes_count: number;
  comments_count: number;
  hashtags?: string[];
  created_at: number;
}

export interface Story {
  id: string;
  user_id: string;
  media: string;
  text?: string;
  expires_at: number;
  created_at: number;
}

export interface Video {
  id: string;
  user_id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  views_count: number;
  tags?: string[];
  is_short?: number;
  created_at: number;
}

export interface MusicTrack {
  id: string;
  user_id: string;
  title: string;
  artist: string;
  duration: number;
  cover: string;
  plays_count?: number;
  created_at: number;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  is_read: number;
  created_at: number;
}
