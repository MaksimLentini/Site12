// ═══════════════════════════════════════════════════════════
// ХРАНИЛИЩЕ ДАННЫХ — localStorage (имитация SQLite)
// ═══════════════════════════════════════════════════════════
import { User, Chat, Message, Post, Story, Video, MusicTrack, Notification, Report, AuditLog } from './types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = {
  users: 'megachat_users',
  chats: 'megachat_chats',
  messages: 'megachat_messages',
  posts: 'megachat_posts',
  stories: 'megachat_stories',
  videos: 'megachat_videos',
  music: 'megachat_music',
  notifications: 'megachat_notifications',
  reports: 'megachat_reports',
  auditLog: 'megachat_audit_log',
  currentUser: 'megachat_current_user',
  settings: 'megachat_settings',
};

function get<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function set<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ═══ ПОЛЬЗОВАТЕЛИ ═══
export const getUsers = (): User[] => get<User>(STORAGE_KEYS.users);
export const saveUsers = (users: User[]) => set(STORAGE_KEYS.users, users);
export const getUser = (id: string): User | undefined => getUsers().find(u => u.id === id);
export const getUserByUsername = (username: string): User | undefined => getUsers().find(u => u.username === username);

export const createUser = (data: Partial<User>): User => {
  const users = getUsers();
  const user: User = {
    id: uuidv4(),
    username: data.username || '',
    email: data.email || '',
    password: data.password || '',
    role: data.role || 'user',
    avatar: data.avatar || `https://api.dicebear.com/7.0/avataaars/svg?seed=${data.username}`,
    cover: '',
    bio: data.bio || '',
    status: '🟢 online',
    isOnline: false,
    lastSeen: Date.now(),
    isBanned: false,
    createdAt: Date.now(),
    followers: [],
    following: [],
    settings: { theme: 'dark', language: 'ru', notifications: true, soundEnabled: true, privacyProfile: 'public', privacyMessages: 'all' },
    ...data,
  };
  users.push(user);
  saveUsers(users);
  return user;
};

export const updateUser = (id: string, data: Partial<User>): User | undefined => {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return undefined;
  users[idx] = { ...users[idx], ...data };
  saveUsers(users);
  return users[idx];
};

// ═══ ЧАТЫ ═══
export const getChats = (): Chat[] => get<Chat>(STORAGE_KEYS.chats);
export const saveChats = (chats: Chat[]) => set(STORAGE_KEYS.chats, chats);
export const getChat = (id: string): Chat | undefined => getChats().find(c => c.id === id);

export const getUserChats = (userId: string): Chat[] => {
  return getChats().filter(c => c.members.includes(userId));
};

export const createChat = (data: Partial<Chat>): Chat => {
  const chats = getChats();
  const chat: Chat = {
    id: uuidv4(),
    type: data.type || 'private',
    title: data.title || '',
    avatar: data.avatar || '',
    members: data.members || [],
    createdBy: data.createdBy || '',
    createdAt: Date.now(),
    isPinned: false,
    isMuted: false,
    isArchived: false,
    isSecret: false,
    unreadCount: 0,
    ...data,
  };
  chats.push(chat);
  saveChats(chats);
  return chat;
};

// ═══ СООБЩЕНИЯ ═══
export const getMessages = (): Message[] => get<Message>(STORAGE_KEYS.messages);
export const saveMessages = (msgs: Message[]) => set(STORAGE_KEYS.messages, msgs);
export const getChatMessages = (chatId: string): Message[] => getMessages().filter(m => m.chatId === chatId && !m.isDeleted).sort((a, b) => a.createdAt - b.createdAt);

export const sendMessage = (data: Partial<Message>): Message => {
  const msgs = getMessages();
  const msg: Message = {
    id: uuidv4(),
    chatId: data.chatId || '',
    userId: data.userId || '',
    content: data.content || '',
    type: data.type || 'text',
    reactions: {},
    isEdited: false,
    isDeleted: false,
    createdAt: Date.now(),
    readBy: [],
    ...data,
  };
  msgs.push(msg);
  saveMessages(msgs);
  return msg;
};

// ═══ ПОСТЫ ═══
export const getPosts = (): Post[] => get<Post>(STORAGE_KEYS.posts);
export const savePosts = (posts: Post[]) => set(STORAGE_KEYS.posts, posts);

export const createPost = (data: Partial<Post>): Post => {
  const posts = getPosts();
  const post: Post = {
    id: uuidv4(),
    userId: data.userId || '',
    content: data.content || '',
    type: data.type || 'text',
    media: data.media || [],
    likes: [],
    commentsCount: 0,
    shares: 0,
    isHidden: false,
    hashtags: [],
    createdAt: Date.now(),
    ...data,
  };
  posts.unshift(post);
  savePosts(posts);
  return post;
};

// ═══ СТОРИС ═══
export const getStories = (): Story[] => get<Story>(STORAGE_KEYS.stories);
export const saveStories = (stories: Story[]) => set(STORAGE_KEYS.stories, stories);
export const getActiveStories = (): Story[] => getStories().filter(s => s.expiresAt > Date.now());

export const createStory = (data: Partial<Story>): Story => {
  const stories = getStories();
  const story: Story = {
    id: uuidv4(),
    userId: data.userId || '',
    media: data.media || '',
    text: data.text || '',
    viewedBy: [],
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    createdAt: Date.now(),
    ...data,
  };
  stories.push(story);
  saveStories(stories);
  return story;
};

// ═══ ВИДЕО ═══
export const getVideos = (): Video[] => get<Video>(STORAGE_KEYS.videos);
export const saveVideos = (videos: Video[]) => set(STORAGE_KEYS.videos, videos);

export const createVideo = (data: Partial<Video>): Video => {
  const videos = getVideos();
  const video: Video = {
    id: uuidv4(),
    userId: data.userId || '',
    title: data.title || '',
    description: data.description || '',
    thumbnail: data.thumbnail || '',
    duration: data.duration || 0,
    views: 0,
    likes: [],
    comments: [],
    tags: [],
    isShort: data.isShort || false,
    createdAt: Date.now(),
    ...data,
  };
  videos.push(video);
  saveVideos(videos);
  return video;
};

// ═══ МУЗЫКА ═══
export const getMusic = (): MusicTrack[] => get<MusicTrack>(STORAGE_KEYS.music);
export const saveMusic = (tracks: MusicTrack[]) => set(STORAGE_KEYS.music, tracks);

// ═══ УВЕДОМЛЕНИЯ ═══
export const getNotifications = (userId: string): Notification[] => {
  return get<Notification>(STORAGE_KEYS.notifications).filter(n => n.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
};

export const addNotification = (data: Partial<Notification>): Notification => {
  const notifs = get<Notification>(STORAGE_KEYS.notifications);
  const notif: Notification = {
    id: uuidv4(),
    userId: data.userId || '',
    type: data.type || 'system',
    title: data.title || '',
    body: data.body || '',
    isRead: false,
    createdAt: Date.now(),
    ...data,
  };
  notifs.push(notif);
  set(STORAGE_KEYS.notifications, notifs);
  return notif;
};

// ═══ ЖАЛОБЫ ═══
export const getReports = (): Report[] => get<Report>(STORAGE_KEYS.reports);
export const saveReports = (reports: Report[]) => set(STORAGE_KEYS.reports, reports);

export const createReport = (data: Partial<Report>): Report => {
  const reports = getReports();
  const report: Report = {
    id: uuidv4(),
    reporterId: data.reporterId || '',
    targetType: data.targetType || 'post',
    targetId: data.targetId || '',
    reason: data.reason || '',
    status: 'pending',
    createdAt: Date.now(),
    ...data,
  };
  reports.push(report);
  saveReports(reports);
  return report;
};

// ═══ AUDIT LOG ═══
export const getAuditLog = (): AuditLog[] => get<AuditLog>(STORAGE_KEYS.auditLog);

export const addAuditLog = (data: Partial<AuditLog>): AuditLog => {
  const logs = get<AuditLog>(STORAGE_KEYS.auditLog);
  const log: AuditLog = {
    id: uuidv4(),
    adminId: data.adminId || '',
    action: data.action || '',
    targetType: data.targetType || '',
    targetId: data.targetId || '',
    details: data.details || '',
    ip: '127.0.0.1',
    createdAt: Date.now(),
    ...data,
  };
  logs.unshift(log);
  set(STORAGE_KEYS.auditLog, logs);
  return log;
};

// ═══ ТЕКУЩИЙ ПОЛЬЗОВАТЕЛЬ ═══
export const getCurrentUser = (): User | null => {
  const id = localStorage.getItem(STORAGE_KEYS.currentUser);
  if (!id) return null;
  return getUser(id) || null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.currentUser, user.id);
  } else {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
  }
};

// ═══ НАСТРОЙКИ ═══
export const getSettings = (): Record<string, any> => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.settings);
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
};

export const saveSettings = (settings: Record<string, any>): void => {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
};

// ═══ СИД — ТЕСТОВЫЕ ДАННЫЕ ═══
export const seedDatabase = (): void => {
  if (getUsers().length > 0) return;

  // Создаём админа
  const admin = createUser({
    username: 'admin',
    email: 'admin@megachat.local',
    password: 'Admin123!',
    role: 'superadmin',
    bio: '👑 Главный администратор платформы',
    avatar: 'https://api.dicebear.com/7.0/avataaars/svg?seed=admin',
  });

  // Создаём тестовых пользователей
  const users = [
    { username: 'alice', email: 'alice@test.com', password: 'pass123', bio: '🎨 Дизайнер и фотограф', avatar: 'https://api.dicebear.com/7.0/avataaars/svg?seed=alice' },
    { username: 'bob', email: 'bob@test.com', password: 'pass123', bio: '💻 Full-stack разработчик', avatar: 'https://api.dicebear.com/7.0/avataaars/svg?seed=bob' },
    { username: 'carol', email: 'carol@test.com', password: 'pass123', bio: '🎵 Музыкант и продюсер', avatar: 'https://api.dicebear.com/7.0/avataaars/svg?seed=carol' },
    { username: 'dave', email: 'dave@test.com', password: 'pass123', bio: '🎬 Видеоблогер', avatar: 'https://api.dicebear.com/7.0/avataaars/svg?seed=dave' },
    { username: 'eve', email: 'eve@test.com', password: 'pass123', bio: '📱 SMM-менеджер', avatar: 'https://api.dicebear.com/7.0/avataaars/svg?seed=eve' },
  ].map(u => createUser(u));

  const allUsers = [admin, ...users];

  // Создаём чаты
  const privateChat = createChat({
    type: 'private',
    title: 'Alice & Bob',
    members: [users[0].id, users[1].id],
    createdBy: users[0].id,
    avatar: 'https://api.dicebear.com/7.0/avataaars/svg?seed=chat1',
  });

  const groupChat = createChat({
    type: 'group',
    title: '🚀 Команда MegaChat',
    members: allUsers.map(u => u.id),
    createdBy: admin.id,
    avatar: 'https://api.dicebear.com/7.0/avataaars/svg?seed=group1',
  });

  const channel = createChat({
    type: 'channel',
    title: '📢 Новости платформы',
    members: allUsers.map(u => u.id),
    createdBy: admin.id,
    avatar: 'https://api.dicebear.com/7.0/avataaars/svg?seed=channel1',
  });

  // Создаём сообщения
  const chatMessages = [
    { chatId: privateChat.id, userId: users[0].id, content: 'Привет! Как дела? 👋' },
    { chatId: privateChat.id, userId: users[1].id, content: 'Привет! Всё отлично, работаю над новым проектом 🚀' },
    { chatId: privateChat.id, userId: users[0].id, content: 'Круто! Расскажи подробнее' },
    { chatId: privateChat.id, userId: users[1].id, content: 'Делаем мессенджер нового поколения! Объединяем всё в одном месте 💪' },
    { chatId: groupChat.id, userId: admin.id, content: 'Всем привет! Добро пожаловать в рабочий чат 🎉' },
    { chatId: groupChat.id, userId: users[2].id, content: 'Спасибо! Рада быть частью команды 🎵' },
    { chatId: groupChat.id, userId: users[3].id, content: 'Готов снимать контент для платформы 🎬' },
    { chatId: channel.id, userId: admin.id, content: '📢 MegaChat v1.0 запущен! Новые функции каждый день.' },
    { chatId: channel.id, userId: admin.id, content: '🔥 Добавлена поддержка видеозвонков и стримов!' },
  ];
  chatMessages.forEach((m, i) => {
    sendMessage({ ...m, createdAt: Date.now() - (chatMessages.length - i) * 60000 });
  });

  // Создаём посты
  const posts = [
    { userId: users[0].id, content: '🌅 Новый день — новые возможности! Утро начинается с кофе ☕', type: 'photo' as const, media: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600'], hashtags: ['утро', 'кофе', 'мотивация'] },
    { userId: users[1].id, content: '💻 Только что закончил новый фреймворк. Open source скоро!', type: 'text' as const, hashtags: ['coding', 'opensource', 'dev'] },
    { userId: users[2].id, content: '🎵 Новый трек уже доступен! Слушайте и делитесь 🎧', type: 'photo' as const, media: ['https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600'], hashtags: ['music', 'newrelease'] },
    { userId: users[3].id, content: '🎬 Новое видео на канале! Обзор лучших гаджетов 2024 года', type: 'video' as const, media: ['https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600'], hashtags: ['video', 'tech', 'review'] },
    { userId: users[4].id, content: '📱 5 трендов SMM на 2024 год. Сохраняйте пост! 🔖', type: 'text' as const, hashtags: ['smm', 'trends', 'marketing'] },
    { userId: users[0].id, content: '🎨 Закончила новый дизайн-проект. Как вам? 👇', type: 'photo' as const, media: ['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600'], hashtags: ['design', 'art', 'creative'] },
    { userId: users[1].id, content: '🤖 AI меняет всё. Мой новый проект использует GPT для автоматизации.', type: 'text' as const, hashtags: ['ai', 'gpt', 'automation'] },
  ];
  posts.forEach(p => {
    const post = createPost(p);
    // Добавляем случайные лайки
    const likers = allUsers.filter(() => Math.random() > 0.4);
    post.likes = likers.map(u => u.id);
  });
  savePosts(getPosts());

  // Создаём сторис
  const storiesData = [
    { userId: users[0].id, media: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', text: 'Мой день 🌞' },
    { userId: users[2].id, media: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', text: 'Запись нового трека 🎵' },
    { userId: users[3].id, media: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400', text: 'За кулисами 🎬' },
  ];
  storiesData.forEach(s => createStory(s));

  // Создаём видео
  const videosData = [
    { userId: users[3].id, title: 'Обзор iPhone 16 Pro — стоит ли покупать?', description: 'Полный обзор нового флагмана Apple', thumbnail: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400', duration: 845, tags: ['tech', 'apple', 'review'] },
    { userId: users[3].id, title: 'Топ-10 мест для путешествий 2024', description: 'Самые красивые места планеты', thumbnail: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400', duration: 1200, tags: ['travel', 'top10'] },
    { userId: users[1].id, title: 'React за 30 минут — полный курс', description: 'Изучите React с нуля', thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400', duration: 1800, tags: ['coding', 'react', 'tutorial'] },
    { userId: users[0].id, title: 'Как создать дизайн за 5 минут ⚡', description: 'Быстрый туториал по дизайну', thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400', duration: 300, tags: ['design', 'tutorial'], isShort: true },
    { userId: users[4].id, title: 'SMM стратегии для бизнеса', description: 'Продвижение в соцсетях', thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400', duration: 960, tags: ['smm', 'business'] },
  ];
  videosData.forEach(v => {
    const video = createVideo(v);
    video.views = Math.floor(Math.random() * 100000);
    video.likes = allUsers.filter(() => Math.random() > 0.5).map(u => u.id);
  });
  saveVideos(getVideos());

  // Создаём музыку
  const musicData = [
    { userId: users[2].id, title: 'Летний вайб', artist: 'Carol Music', duration: 210, cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200', plays: 15420 },
    { userId: users[2].id, title: 'Ночной город', artist: 'Carol Music', duration: 195, cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200', plays: 8930 },
    { userId: users[2].id, title: 'Рассвет', artist: 'Carol Music', duration: 240, cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200', plays: 22100 },
    { userId: users[2].id, title: 'Энергия', artist: 'Carol Music', duration: 180, cover: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=200', plays: 5670 },
  ];
  musicData.forEach(m => {
    const tracks = getMusic();
    tracks.push({ ...m, id: uuidv4(), createdAt: Date.now() });
    saveMusic(tracks);
  });

  // Подписки
  users[0].following = [users[1].id, users[2].id];
  users[0].followers = [users[1].id, users[3].id, users[4].id];
  users[1].following = [users[0].id, users[2].id, users[3].id];
  users[1].followers = [users[0].id, users[2].id];
  saveUsers(getUsers());
};
