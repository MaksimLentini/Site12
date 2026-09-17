import { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Video, Music, Image, Users, Bell, Search, Settings, 
  Send, Heart, Share2, Bookmark, MoreHorizontal, Plus, X, Phone, 
  VideoIcon, Smile, Paperclip, Mic, ArrowLeft, Check, CheckCheck,
  Home, User, Shield, BarChart3, FileText, Globe, Lock, Database,
  Eye, Trash2, Edit, Ban, Crown, AlertTriangle, ChevronRight,
  Play, Pause, SkipForward, SkipBack, Volume2, Repeat, Shuffle,
  Zap, Film, Camera, MessageCircle
} from 'lucide-react';
import { User as UserType, Chat, Message, Post, Video as VideoType, Story, MusicTrack, Notification } from './types';
import { auth, users as usersApi, chats as chatsApi, posts as postsApi, stories as storiesApi, videos as videosApi, music as musicApi, notifications as notifApi, admin as adminApi } from './store';

type Page = 'auth' | 'messenger' | 'feed' | 'videos' | 'shorts' | 'music' | 'profile' | 'admin' | 'stories';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(auth.getLocalUser());
  const [page, setPage] = useState<Page>(currentUser ? 'messenger' : 'auth');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('megachat_theme') as any) || 'dark');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [serverOnline, setServerOnline] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('megachat_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (currentUser) {
      loadNotifications();
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const loadNotifications = async () => {
    try {
      const data = await notifApi.list();
      setNotifications(data);
    } catch {}
  };

  const handleLogin = async (user: UserType) => {
    setCurrentUser(user);
    setPage('messenger');
    await loadNotifications();
  };

  const handleLogout = async () => {
    await auth.logout();
    setCurrentUser(null);
    setPage('auth');
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 pulse">
            <Zap size={32} color="white" />
          </div>
          <p style={{ color: 'var(--text-muted)' }}>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || page === 'auth') {
    return <AuthPage onLogin={handleLogin} serverOnline={serverOnline} setServerOnline={setServerOnline} />;
  }

  const unreadNotifs = notifications.filter(n => !n.is_read).length;

  return (
    <div className="h-screen w-screen flex overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <nav className="w-[72px] h-full flex flex-col items-center py-4 gap-2 border-r" 
           style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center mb-4 cursor-pointer"
             onClick={() => setPage('messenger')}>
          <Zap size={20} color="white" />
        </div>
        <NavBtn icon={<MessageSquare size={22} />} label="Чаты" active={page === 'messenger'} onClick={() => setPage('messenger')} />
        <NavBtn icon={<Home size={22} />} label="Лента" active={page === 'feed'} onClick={() => setPage('feed')} />
        <NavBtn icon={<Film size={22} />} label="Видео" active={page === 'videos'} onClick={() => setPage('videos')} />
        <NavBtn icon={<Camera size={22} />} label="Shorts" active={page === 'shorts'} onClick={() => setPage('shorts')} />
        <NavBtn icon={<Music size={22} />} label="Музыка" active={page === 'music'} onClick={() => setPage('music')} />
        <NavBtn icon={<Camera size={22} />} label="Сторис" active={page === 'stories'} onClick={() => setPage('stories')} />
        <NavBtn icon={<User size={22} />} label="Профиль" active={page === 'profile'} onClick={() => setPage('profile')} />
        {(currentUser.role === 'admin' || currentUser.role === 'superadmin') && (
          <NavBtn icon={<Shield size={22} />} label="Админ" active={page === 'admin'} onClick={() => setPage('admin')} />
        )}
        <div className="flex-1" />
        <NavBtn icon={<Bell size={22} />} label="Уведомления" active={false} onClick={() => setShowNotif(!showNotif)} badge={unreadNotifs || undefined} />
        <NavBtn icon={<Globe size={22} />} label="Тема" active={false} onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />
        <div className="relative cursor-pointer" onClick={handleLogout}>
          <img src={currentUser.avatar || `https://api.dicebear.com/7.0/avataaars/svg?seed=${currentUser.username}`} 
               className="w-9 h-9 rounded-full border-2" style={{ borderColor: 'var(--accent)' }} alt="" />
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 h-full overflow-hidden relative">
        {page === 'messenger' && <MessengerPage user={currentUser} />}
        {page === 'feed' && <FeedPage user={currentUser} />}
        {page === 'videos' && <VideosPage user={currentUser} />}
        {page === 'shorts' && <ShortsPage user={currentUser} />}
        {page === 'music' && <MusicPage user={currentUser} />}
        {page === 'profile' && <ProfilePage user={currentUser} />}
        {page === 'admin' && <AdminPanel user={currentUser} />}
        {page === 'stories' && <StoriesPage user={currentUser} />}
      </main>

      {/* Notifications */}
      {showNotif && (
        <div className="absolute right-4 top-4 w-80 max-h-96 overflow-y-auto rounded-2xl shadow-2xl z-50 fade-in"
             style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-bold">Уведомления</h3>
            <button onClick={() => setShowNotif(false)}><X size={18} /></button>
          </div>
          {notifications.length === 0 ? (
            <p className="p-4 text-center" style={{ color: 'var(--text-muted)' }}>Нет уведомлений</p>
          ) : notifications.slice(0, 20).map(n => (
            <div key={n.id} className="p-3 border-b flex gap-3 items-start" style={{ borderColor: 'var(--border)', opacity: n.is_read ? 0.6 : 1 }}>
              <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
                <Bell size={14} color="white" />
              </div>
              <div>
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{n.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NavBtn({ icon, label, active, onClick, badge }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void; badge?: number }) {
  return (
    <button className={`nav-item w-12 h-12 rounded-xl flex items-center justify-center relative transition-all ${active ? 'active' : ''}`}
            style={{ color: active ? 'var(--accent)' : 'var(--text-muted)', background: active ? 'var(--accent-light)' : 'transparent' }}
            onClick={onClick} title={label}>
      {icon}
      {badge && badge > 0 && <span className="badge absolute -top-1 -right-1">{badge}</span>}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════
// АВТОРИЗАЦИЯ
// ═══════════════════════════════════════════════════════════

function AuthPage({ onLogin, serverOnline, setServerOnline }: { onLogin: (u: UserType) => void; serverOnline: boolean; setServerOnline: (v: boolean) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = isLogin 
        ? await auth.login(username, password)
        : await auth.register(username, email, password);
      onLogin(result.user);
    } catch (err: any) {
      setError(err.message || 'Ошибка подключения к серверу');
      setServerOnline(false);
    }
    setLoading(false);
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4">
            <Zap size={32} color="white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">MegaChat</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Мессенджер нового поколения</p>
        </div>

        <div className="rounded-2xl p-8" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <div className="flex gap-2 mb-6">
            <button className={`flex-1 py-3 rounded-xl font-semibold transition-all ${isLogin ? 'gradient-bg text-white' : ''}`}
                    style={!isLogin ? { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' } : {}}
                    onClick={() => setIsLogin(true)}>Вход</button>
            <button className={`flex-1 py-3 rounded-xl font-semibold transition-all ${!isLogin ? 'gradient-bg text-white' : ''}`}
                    style={isLogin ? { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' } : {}}
                    onClick={() => setIsLogin(false)}>Регистрация</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Имя пользователя</label>
              <input className="input-field" placeholder="username" value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            {!isLogin && (
              <div>
                <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Email</label>
                <input className="input-field" type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Пароль</label>
              <input className="input-field" type="password" placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            {!serverOnline && (
              <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(255,61,113,0.1)', color: 'var(--danger)' }}>
                ⚠️ Сервер недоступен. Запустите: <code>cd server && npm install && npm start</code>
              </div>
            )}
            <button type="submit" className="btn-primary w-full text-center" disabled={loading}>
              {loading ? '...' : (isLogin ? 'Войти' : 'Создать аккаунт')}
            </button>
          </form>

          {isLogin && (
            <div className="mt-6 p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                <strong>Первый зарегистрированный пользователь получает роль superadmin.</strong><br/>
                Запустите сервер и создайте аккаунт.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// МЕССЕНДЖЕР
// ═══════════════════════════════════════════════════════════

function MessengerPage({ user }: { user: UserType }) {
  const [chatList, setChatList] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [showList, setShowList] = useState(true);
  const [userCache, setUserCache] = useState<Record<string, UserType>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadChats(); }, []);
  useEffect(() => { if (selectedChat) loadMessages(selectedChat.id); }, [selectedChat?.id]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadChats = async () => {
    try { const data = await chatsApi.list(); setChatList(data); } catch {}
  };

  const loadMessages = async (chatId: string) => {
    try { const data = await chatsApi.messages(chatId); setMessages(data); } catch {}
  };

  const getUser = async (id: string): Promise<UserType | undefined> => {
    if (userCache[id]) return userCache[id];
    try {
      const u = await usersApi.get(id);
      setUserCache(prev => ({ ...prev, [id]: u as any }));
      return u as any;
    } catch { return undefined; }
  };

  const handleSend = async () => {
    if (!newMsg.trim() || !selectedChat) return;
    try {
      const msg = await chatsApi.sendMessage(selectedChat.id, newMsg.trim());
      setMessages(prev => [...prev, msg]);
      setNewMsg('');
    } catch {}
  };

  const handleReaction = async (msgId: string, emoji: string) => {
    try {
      await chatsApi.react(msgId, emoji);
      if (selectedChat) loadMessages(selectedChat.id);
    } catch {}
  };

  return (
    <div className="h-full flex">
      {/* Chat list */}
      <div className={`${showList ? 'w-80' : 'w-0 overflow-hidden'} h-full border-r flex flex-col transition-all`}
           style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-xl font-bold">Чаты</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chatList.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Нет чатов</p>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Создайте новый чат чтобы начать общение</p>
            </div>
          ) : chatList.map(chat => (
            <div key={chat.id} className={`p-3 flex items-center gap-3 cursor-pointer transition-all border-b ${selectedChat?.id === chat.id ? 'bg-[var(--accent-light)]' : 'hover:bg-[var(--bg-hover)]'}`}
                 style={{ borderColor: 'var(--border)' }}
                 onClick={() => { setSelectedChat(chat); setShowList(false); }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
                {chat.type === 'group' ? <Users size={20} style={{ color: 'var(--text-muted)' }} /> : <User size={20} style={{ color: 'var(--text-muted)' }} />}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-sm truncate block">{chat.title || 'Личный чат'}</span>
                <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                  {chat.lastMessage?.content?.slice(0, 40) || 'Нет сообщений'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col h-full">
          <div className="h-16 px-4 flex items-center border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            <button className="md:hidden mr-3" onClick={() => setShowList(true)}><ArrowLeft size={20} /></button>
            <h3 className="font-semibold">{selectedChat.title || 'Чат'}</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: 'var(--bg-primary)' }}>
            {messages.map(msg => {
              const isMine = msg.user_id === user.id;
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} fade-in`}>
                  <div className="group relative">
                    <div className={`message-bubble ${isMine ? 'message-sent' : 'message-received'}`}>
                      <p className="text-sm">{msg.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[10px] opacity-60">{formatTime(msg.created_at)}</span>
                        {isMine && <Check size={12} className="opacity-60" />}
                      </div>
                    </div>
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className="flex gap-1 mt-1 ml-3">
                        {Object.entries(msg.reactions as Record<string, string[]>).map(([emoji, userIds]) => (
                          <span key={emoji} className="text-xs px-2 py-0.5 rounded-full cursor-pointer"
                                style={{ background: 'var(--bg-tertiary)' }}
                                onClick={() => handleReaction(msg.id, emoji)}>
                            {emoji} {userIds.length}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t flex items-center gap-3" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            <button className="p-2 rounded-full hover:bg-[var(--bg-hover)]"><Paperclip size={20} style={{ color: 'var(--text-secondary)' }} /></button>
            <input className="input-field flex-1" placeholder="Сообщение..." value={newMsg} 
                   onChange={e => setNewMsg(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && handleSend()} />
            <button className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center" onClick={handleSend}>
              <Send size={18} color="white" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
          <div className="text-center">
            <MessageSquare size={64} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Выберите чат</h3>
            <p style={{ color: 'var(--text-muted)' }}>Или создайте новый</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ЛЕНТА
// ═══════════════════════════════════════════════════════════

function FeedPage({ user }: { user: UserType }) {
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');

  useEffect(() => { loadPosts(); }, []);
  const loadPosts = async () => { try { setFeedPosts(await postsApi.list()); } catch {} };

  const handleCreate = async () => {
    if (!content.trim()) return;
    const hashtags = content.match(/#\w+/g)?.map(h => h.slice(1)) || [];
    await postsApi.create({ content, type: 'text', hashtags });
    setContent('');
    loadPosts();
  };

  const handleLike = async (postId: string) => {
    await postsApi.like(postId);
    loadPosts();
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto py-6 px-4">
        {/* Create */}
        <div className="feed-card p-4 mb-6">
          <div className="flex items-center gap-3">
            <img src={user.avatar || `https://api.dicebear.com/7.0/avataaars/svg?seed=${user.username}`} className="w-10 h-10 rounded-full avatar" alt="" />
            <input className="flex-1 input-field" placeholder="Что нового?" value={content} onChange={e => setContent(e.target.value)} />
          </div>
          {content && (
            <div className="mt-3 fade-in">
              <textarea className="input-field h-20 resize-none" placeholder="Текст поста..." value={content} onChange={e => setContent(e.target.value)} />
              <div className="flex justify-end mt-2">
                <button className="btn-primary text-sm py-2 px-4" onClick={handleCreate}>Опубликовать</button>
              </div>
            </div>
          )}
        </div>

        {/* Posts */}
        {feedPosts.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
            <p style={{ color: 'var(--text-muted)' }}>Лента пуста. Создайте первый пост!</p>
          </div>
        ) : feedPosts.map(post => (
          <div key={post.id} className="feed-card mb-4 fade-in">
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
                <User size={18} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div>
                <span className="font-semibold text-sm">{post.user_id.slice(0, 8)}</span>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatTimeAgo(post.created_at)}</p>
              </div>
            </div>
            <div className="px-4 pb-3">
              <p className="text-sm">{post.content}</p>
              {(post.hashtags?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {(post.hashtags || []).map((h: string) => (
                    <span key={h} className="text-xs px-2 py-0.5 rounded-full" style={{ color: 'var(--accent)', background: 'var(--accent-light)' }}>#{h}</span>
                  ))}
                </div>
              )}
            </div>
            {(post.media?.length ?? 0) > 0 && <img src={post.media![0]} className="w-full max-h-96 object-cover" alt="" />}
            <div className="p-4 flex items-center gap-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <button className="flex items-center gap-1.5" onClick={() => handleLike(post.id)}>
                <Heart size={18} fill={post.likes?.includes(user.id) ? '#ff3d71' : 'none'} style={{ color: post.likes?.includes(user.id) ? '#ff3d71' : 'var(--text-secondary)' }} />
                <span className="text-sm">{post.likes_count || 0}</span>
              </button>
              <button className="flex items-center gap-1.5"><MessageCircle size={18} style={{ color: 'var(--text-secondary)' }} /><span className="text-sm">{post.comments_count || 0}</span></button>
              <button className="flex items-center gap-1.5"><Share2 size={18} style={{ color: 'var(--text-secondary)' }} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ВИДЕО
// ═══════════════════════════════════════════════════════════

function VideosPage({ user }: { user: UserType }) {
  const [videoList, setVideoList] = useState<VideoType[]>([]);
  useEffect(() => { loadVideos(); }, []);
  const loadVideos = async () => { try { setVideoList(await videosApi.list(false)); } catch {} };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Видео</h1>
        {videoList.length === 0 ? (
          <div className="text-center py-12">
            <Film size={48} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
            <p style={{ color: 'var(--text-muted)' }}>Нет видео. Загрузите первое!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videoList.map(v => (
              <div key={v.id} className="video-card">
                <div className="relative">
                  <img src={v.thumbnail || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400'} className="w-full aspect-video object-cover" alt="" />
                  <span className="duration">{formatDuration(v.duration)}</span>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm">{v.title}</h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{v.views_count} просм.</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SHORTS
// ═══════════════════════════════════════════════════════════

function ShortsPage({ user }: { user: UserType }) {
  const [shorts, setShorts] = useState<VideoType[]>([]);
  const [idx, setIdx] = useState(0);
  useEffect(() => { loadShorts(); }, []);
  const loadShorts = async () => { try { setShorts(await videosApi.list(true)); } catch {} };

  return (
    <div className="h-full flex items-center justify-center" style={{ background: '#000' }}>
      {shorts.length === 0 ? (
        <div className="text-center">
          <Camera size={48} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
          <p className="text-white">Нет коротких видео</p>
        </div>
      ) : shorts[idx] && (
        <div className="relative w-full max-w-sm h-full max-h-[80vh] rounded-3xl overflow-hidden">
          <img src={shorts[idx].thumbnail || ''} className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-4 right-16">
            <p className="text-white font-semibold">{shorts[idx].title}</p>
          </div>
          <div className="absolute top-1/2 left-0 right-0 flex justify-between px-2">
            <button className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}
                    onClick={() => setIdx(Math.max(0, idx - 1))}><ChevronRight size={20} color="white" className="rotate-180" /></button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}
                    onClick={() => setIdx(Math.min(shorts.length - 1, idx + 1))}><ChevronRight size={20} color="white" /></button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// МУЗЫКА
// ═══════════════════════════════════════════════════════════

function MusicPage({ user }: { user: UserType }) {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [current, setCurrent] = useState<MusicTrack | null>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => { loadTracks(); }, []);
  const loadTracks = async () => { try { setTracks(await musicApi.list()); } catch {} };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Музыка</h1>
          {tracks.length === 0 ? (
            <div className="text-center py-12">
              <Music size={48} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
              <p style={{ color: 'var(--text-muted)' }}>Нет треков. Загрузите музыку!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {tracks.map((track, i) => (
                <div key={track.id} className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all ${current?.id === track.id ? '' : 'hover:bg-[var(--bg-hover)]'}`}
                     style={current?.id === track.id ? { background: 'var(--accent-light)' } : {}}
                     onClick={() => { setCurrent(track); setPlaying(true); }}>
                  <span className="w-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
                  <img src={track.cover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100'} className="w-12 h-12 rounded-lg object-cover" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${current?.id === track.id ? 'text-[var(--accent)]' : ''}`}>{track.title}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{track.artist}</p>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDuration(track.duration)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {current && (
        <div className="h-20 border-t flex items-center px-4 gap-4" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <img src={current.cover || ''} className="w-12 h-12 rounded-lg object-cover" alt="" />
          <div className="w-40 min-w-0">
            <p className="font-medium text-sm truncate">{current.title}</p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{current.artist}</p>
          </div>
          <div className="flex-1 flex items-center justify-center gap-4">
            <button><Shuffle size={16} style={{ color: 'var(--text-muted)' }} /></button>
            <button><SkipBack size={18} /></button>
            <button className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center" onClick={() => setPlaying(!playing)}>
              {playing ? <Pause size={18} color="white" /> : <Play size={18} color="white" fill="white" />}
            </button>
            <button><SkipForward size={18} /></button>
            <button><Repeat size={16} style={{ color: 'var(--text-muted)' }} /></button>
          </div>
          <Volume2 size={16} style={{ color: 'var(--text-muted)' }} />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ПРОФИЛЬ
// ═══════════════════════════════════════════════════════════

function ProfilePage({ user }: { user: UserType }) {
  const [profile, setProfile] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  useEffect(() => { loadProfile(); }, []);
  const loadProfile = async () => {
    try {
      const p = await usersApi.get(user.id);
      setProfile(p);
      const allPosts = await postsApi.list();
      setUserPosts(allPosts.filter((p: Post) => p.user_id === user.id));
    } catch {}
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="h-48 relative" style={{ background: 'var(--gradient-1)' }}>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
        </div>
        <div className="px-6 -mt-16 relative">
          <div className="flex items-end gap-4">
            <img src={user.avatar || `https://api.dicebear.com/7.0/avataaars/svg?seed=${user.username}`} 
                 className="w-32 h-32 rounded-full avatar border-4" style={{ borderColor: 'var(--bg-primary)' }} alt="" />
            <div className="pb-4 flex-1">
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user.bio || 'Нет описания'}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm"><strong>{profile?.followers || 0}</strong> <span style={{ color: 'var(--text-muted)' }}>подписчиков</span></span>
                <span className="text-sm"><strong>{profile?.following || 0}</strong> <span style={{ color: 'var(--text-muted)' }}>подписок</span></span>
                <span className="text-sm"><strong>{profile?.postsCount || userPosts.length}</strong> <span style={{ color: 'var(--text-muted)' }}>постов</span></span>
              </div>
            </div>
            <div className="pb-4">
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                user.role === 'superadmin' ? 'bg-yellow-500/20 text-yellow-400' :
                user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'
              }`}>{user.role}</span>
            </div>
          </div>
          <div className="py-6">
            {userPosts.length === 0 ? (
              <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Нет постов</p>
            ) : userPosts.map(post => (
              <div key={post.id} className="feed-card p-4 mb-4">
                <p className="text-sm">{post.content}</p>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>❤️ {post.likes_count}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatTimeAgo(post.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// СТОРИС
// ═══════════════════════════════════════════════════════════

function StoriesPage({ user }: { user: UserType }) {
  const [storyList, setStoryList] = useState<Story[]>([]);
  useEffect(() => { loadStories(); }, []);
  const loadStories = async () => { try { setStoryList(await storiesApi.list()); } catch {} };

  return (
    <div className="h-full flex items-center justify-center" style={{ background: '#000' }}>
      {storyList.length === 0 ? (
        <div className="text-center">
          <Camera size={48} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Нет активных сторис</h3>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Создайте свою первую историю!</p>
        </div>
      ) : (
        <div className="relative w-full max-w-sm h-full max-h-[85vh] rounded-3xl overflow-hidden">
          <img src={storyList[0]?.media || ''} className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
          {storyList[0]?.text && (
            <div className="absolute bottom-20 left-4 right-4">
              <p className="text-white text-lg font-medium text-center">{storyList[0].text}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// АДМИН-ПАНЕЛЬ
// ═══════════════════════════════════════════════════════════

function AdminPanel({ user }: { user: UserType }) {
  const [section, setSection] = useState('dashboard');
  const [stats, setStats] = useState<Record<string, number>>({});
  const [adminUsers, setAdminUsers] = useState<UserType[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);

  useEffect(() => { loadAdminData(); }, []);
  
  const loadAdminData = async () => {
    try {
      setStats(await adminApi.stats());
      setAdminUsers(await adminApi.getUsers());
      setReports(await adminApi.getReports());
      setAuditLog(await adminApi.getAuditLog());
    } catch {}
  };

  const sections = [
    { id: 'dashboard', label: 'Дашборд', icon: <BarChart3 size={18} /> },
    { id: 'users', label: 'Пользователи', icon: <Users size={18} /> },
    { id: 'reports', label: 'Жалобы', icon: <AlertTriangle size={18} /> },
    { id: 'security', label: 'Безопасность', icon: <Lock size={18} /> },
    { id: 'logs', label: 'Логи', icon: <Eye size={18} /> },
  ];

  return (
    <div className="h-full flex">
      <div className="w-56 h-full border-r p-4 flex flex-col" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 mb-6">
          <Shield size={20} style={{ color: 'var(--accent)' }} />
          <span className="font-bold">Админ</span>
        </div>
        <div className="space-y-1 flex-1">
          {sections.map(s => (
            <div key={s.id} className={`admin-sidebar-item ${section === s.id ? 'active' : ''}`} onClick={() => setSection(s.id)}>
              {s.icon}<span className="text-sm">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 h-full overflow-y-auto p-6">
        {section === 'dashboard' && (
          <div className="fade-in">
            <h1 className="text-2xl font-bold mb-6">Дашборд</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Пользователи', value: stats.users || 0, color: 'from-blue-500 to-cyan-500' },
                { label: 'Посты', value: stats.posts || 0, color: 'from-purple-500 to-pink-500' },
                { label: 'Видео', value: stats.videos || 0, color: 'from-orange-500 to-red-500' },
                { label: 'Сообщения', value: stats.messages || 0, color: 'from-green-500 to-teal-500' },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                    <BarChart3 size={18} color="white" />
                  </div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="stat-card">
                <h3 className="font-bold mb-3">Онлайн: {stats.online || 0}</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Жалоб в очереди: {stats.reports || 0}</p>
              </div>
              <div className="stat-card">
                <h3 className="font-bold mb-3">База данных</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>SQLite • WAL mode • ./data/messenger.db</p>
              </div>
            </div>
          </div>
        )}

        {section === 'users' && (
          <div className="fade-in">
            <h1 className="text-2xl font-bold mb-6">Пользователи ({adminUsers.length})</h1>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'var(--bg-tertiary)' }}>
                    <th className="text-left p-3 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Пользователь</th>
                    <th className="text-left p-3 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Роль</th>
                    <th className="text-left p-3 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Статус</th>
                    <th className="text-right p-3 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map(u => (
                    <tr key={u.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img src={u.avatar || `https://api.dicebear.com/7.0/avataaars/svg?seed=${u.username}`} className="w-8 h-8 rounded-full avatar" alt="" />
                          <div>
                            <p className="font-medium text-sm">{u.username}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          u.role === 'superadmin' ? 'bg-yellow-500/20 text-yellow-400' :
                          u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                          u.role === 'moderator' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>{u.role}</span>
                      </td>
                      <td className="p-3">
                        {u.is_banned ? <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">Бан</span>
                          : <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Активен</span>}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {u.is_banned 
                            ? <button className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)]" onClick={async () => { await adminApi.unbanUser(u.id); loadAdminData(); }} title="Разбан"><Ban size={14} style={{ color: 'var(--success)' }} /></button>
                            : <button className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)]" onClick={async () => { await adminApi.banUser(u.id, 'Нарушение правил'); loadAdminData(); }} title="Забанить"><Ban size={14} style={{ color: 'var(--danger)' }} /></button>
                          }
                          {user.role === 'superadmin' && u.id !== user.id && (
                            <button className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)]" onClick={async () => { if (confirm('Удалить пользователя?')) { await adminApi.deleteUser(u.id); loadAdminData(); } }} title="Удалить"><Trash2 size={14} style={{ color: 'var(--danger)' }} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {section === 'reports' && (
          <div className="fade-in">
            <h1 className="text-2xl font-bold mb-6">Жалобы</h1>
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle size={48} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
                <p style={{ color: 'var(--text-muted)' }}>Нет жалоб</p>
              </div>
            ) : reports.map(r => (
              <div key={r.id} className="stat-card mb-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{r.reason}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Тип: {r.target_type} • Статус: {r.status}</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn-secondary text-xs py-1 px-3" onClick={async () => { await adminApi.resolveReport(r.id, 'dismissed'); loadAdminData(); }}>Отклонить</button>
                  <button className="btn-primary text-xs py-1 px-3" onClick={async () => { await adminApi.resolveReport(r.id, 'resolved'); loadAdminData(); }}>Решить</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {section === 'security' && (
          <div className="fade-in">
            <h1 className="text-2xl font-bold mb-6">Безопасность</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="stat-card">
                <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>JWT секрет</h4>
                <p className="text-sm font-mono truncate">Настроен ✓</p>
              </div>
              <div className="stat-card">
                <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>bcrypt rounds</h4>
                <p className="text-2xl font-bold">12</p>
              </div>
              <div className="stat-card">
                <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Helmet</h4>
                <p className="text-sm text-green-400">Активен ✓</p>
              </div>
            </div>
          </div>
        )}

        {section === 'logs' && (
          <div className="fade-in">
            <h1 className="text-2xl font-bold mb-6">Audit Log</h1>
            <div className="stat-card">
              {auditLog.length === 0 ? (
                <p className="text-center py-4" style={{ color: 'var(--text-muted)' }}>Нет записей</p>
              ) : (
                <div className="font-mono text-xs space-y-1 max-h-96 overflow-y-auto">
                  {auditLog.map(log => (
                    <div key={log.id} className="flex gap-3 p-1 rounded hover:bg-[var(--bg-tertiary)]">
                      <span style={{ color: 'var(--text-muted)' }}>{new Date(log.created_at).toLocaleString()}</span>
                      <span style={{ color: 'var(--accent)' }}>[{log.action}]</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{log.details}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// УТИЛИТЫ
// ═══════════════════════════════════════════════════════════

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч`;
  const days = Math.floor(hours / 24);
  return `${days} д`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
