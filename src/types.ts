// ═══════════════════════════════════════════════════════════
// ТИПЫ ДАННЫХ — МЕССЕНДЖЕР
// ═══════════════════════════════════════════════════════════

export type UserRole = 'user' | 'moderator' | 'admin' | 'superadmin';
export type ChatType = 'private' | 'group' | 'channel';
export type MessageType = 'text' | 'image' | 'video' | 'voice' | 'sticker' | 'file' | 'poll' | 'video_note';
export type PostType = 'photo' | 'video' | 'text' | 'carousel' | 'reel';
export type StoryStatus = 'active' | 'expired' | 'viewed';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  avatar: string;
  cover: string;
  bio: string;
  status: string;
  isOnline: boolean;
  lastSeen: number;
  isBanned: boolean;
  banReason?: string;
  createdAt: number;
  followers: string[];
  following: string[];
  settings: UserSettings;
}

export interface UserSettings {
  theme: 'dark' | 'light' | 'auto';
  language: 'ru' | 'en';
  notifications: boolean;
  soundEnabled: boolean;
  privacyProfile: 'public' | 'friends' | 'private';
  privacyMessages: 'all' | 'friends';
}

export interface Chat {
  id: string;
  type: ChatType;
  title: string;
  avatar: string;
  members: string[];
  createdBy: string;
  createdAt: number;
  lastMessage?: Message;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  isSecret: boolean;
  unreadCount: number;
}

export interface Message {
  id: string;
  chatId: string;
  userId: string;
  content: string;
  type: MessageType;
  replyTo?: string;
  forwardedFrom?: string;
  reactions: Record<string, string[]>;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: number;
  readBy: string[];
  meta?: Record<string, any>;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  type: PostType;
  media: string[];
  likes: string[];
  commentsCount: number;
  shares: number;
  isHidden: boolean;
  location?: string;
  hashtags: string[];
  createdAt: number;
}

export interface Story {
  id: string;
  userId: string;
  media: string;
  text?: string;
  viewedBy: string[];
  expiresAt: number;
  createdAt: number;
}

export interface Video {
  id: string;
  userId: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  views: number;
  likes: string[];
  comments: VideoComment[];
  tags: string[];
  isShort: boolean;
  createdAt: number;
}

export interface VideoComment {
  id: string;
  userId: string;
  content: string;
  likes: string[];
  replyTo?: string;
  createdAt: number;
}

export interface MusicTrack {
  id: string;
  userId: string;
  title: string;
  artist: string;
  duration: number;
  cover: string;
  plays: number;
  createdAt: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'like' | 'comment' | 'follow' | 'mention' | 'system';
  title: string;
  body: string;
  isRead: boolean;
  createdAt: number;
  link?: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: 'user' | 'post' | 'message' | 'comment' | 'video';
  targetId: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  moderatorId?: string;
  createdAt: number;
}

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  ip: string;
  createdAt: number;
}
