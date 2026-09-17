import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Film, Music, Image, Users, Bell, Send, Heart, Share2,
  Bookmark, MoreHorizontal, Plus, X, Phone, Video as VideoIcon, Smile,
  Paperclip, ArrowLeft, Check, Home, User as UserIcon, Shield, BarChart3,
  FileText, Globe, Lock, Eye, Trash2, Edit, Ban, AlertTriangle,
  ChevronRight, Play, Pause, SkipForward, SkipBack, Volume2, Zap,
  Camera, MessageCircle, Settings, LogOut, Upload, Search
} from 'lucide-react';
import { auth, users as usersApi, chats as chatsApi, posts as postsApi, stories as storiesApi, videos as videosApi, music as musicApi, admin as adminApi } from './store';
import type { User, Chat, Message, Post, Story, Video, MusicTrack } from './types';
import { connectSocket, disconnectSocket, useSocketEvent } from './socket';

type Page = 'auth' | 'feed' | 'messenger' | 'videos' | 'shorts' | 'music' | 'stories' | 'profile' | 'admin' | 'user-profile';

// ═══ НОВЫЙ ЛОГОТИП ═══
function Logo({ size = 42 }: { size?: number }) {
  return (
    <div className="logo-mark" style={{ width: size, height: size }}>
      <Zap size={size * 0.5} color="white" strokeWidth={2.5} />
    </div>
  );
}

// ═══ АВАТАР С НЕОНОВЫМ СВЕЧЕНИЕМ ═══
function Avatar({ src, seed, size = 40, className = '', showOnline = false }: { src?: string; seed: string; size?: number; className?: string; showOnline?: boolean }) {
  const [error, setError] = useState(false);
  const fallbackUrl = `https://api.dicebear.com/9.2/avataaars/svg?seed=${encodeURIComponent(seed)}`;
  const imgSrc = error ? fallbackUrl : (src || fallbackUrl);
  
  return (
    <div className="avatar-glow" style={{ width: size + 4, height: size + 4 }}>
      <img 
        src={imgSrc} 
        className={`avatar ${className}`}
        style={{ width: size, height: size }}
        onError={() => setError(true)}
        alt={seed}
      />
      {showOnline && <div className="online-dot" />}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<Page>('auth');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('theme') as any) || 'dark');
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [fullscreenVideo, setFullscreenVideo] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (auth.isLoggedIn()) {
      auth.getCurrentUser()
        .then(u => {
          setUser(u);
          setPage('feed');
          const token = localStorage.getItem('megachat_token');
          if (token) connectSocket(token);
        })
        .catch(() => {
          setUser(null);
          setPage('auth');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) disconnectSocket();
  }, [user]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <Logo size={80} />
          <p className="mt-6 text-lg" style={{ color: 'var(--text-muted)' }}>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onLogin={(u) => { setUser(u); setPage('feed'); }} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* ═══ ВЕРХНЯЯ НАВИГАЦИЯ ═══ */}
      <nav className="top-nav">
        <Logo size={36} />
        <span className="gradient-text font-bold text-xl ml-3">MegaChat</span>
        
        <div className="flex-1 flex items-center gap-2 ml-8">
          <NavItem icon={<Home size={18} />} label="Лента" active={page === 'feed'} onClick={() => setPage('feed')} />
          <NavItem icon={<MessageSquare size={18} />} label="Чаты" active={page === 'messenger'} onClick={() => setPage('messenger')} />
          <NavItem icon={<Film size={18} />} label="Видео" active={page === 'videos'} onClick={() => setPage('videos')} />
          <NavItem icon={<Camera size={18} />} label="Shorts" active={page === 'shorts'} onClick={() => setPage('shorts')} />
          <NavItem icon={<Music size={18} />} label="Музыка" active={page === 'music'} onClick={() => setPage('music')} />
          <NavItem icon={<Camera size={18} />} label="Сторис" active={page === 'stories'} onClick={() => setPage('stories')} />
        </div>

        <div className="flex items-center gap-3">
          <button 
            className="top-nav-item"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search size={18} />
          </button>
          <button 
            className="top-nav-item relative"
            onClick={() => setPage('profile')}
          >
            <Bell size={18} />
          </button>
          {(user.role === 'admin' || user.role === 'superadmin') && (
            <button 
              className="top-nav-item"
              onClick={() => setPage('admin')}
              style={{ color: page === 'admin' ? 'var(--accent)' : undefined }}
            >
              <Shield size={18} />
            </button>
          )}
          <button 
            className="top-nav-item"
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          >
            <Globe size={18} />
          </button>
          <div className="cursor-pointer" onClick={() => { auth.logout(); setUser(null); setPage('auth'); }}>
            <Avatar src={user.avatar} seed={user.username} size={36} showOnline />
          </div>
        </div>
      </nav>

      {/* ═══ ОСНОВНОЙ КОНТЕНТ ═══ */}
      <main className="flex-1 overflow-hidden relative">
        {page === 'feed' && <Feed user={user} onViewProfile={setViewingUserId} />}
        {page === 'messenger' && <Messenger user={user} />}
        {page === 'videos' && <Videos user={user} onFullscreen={setFullscreenVideo} />}
        {page === 'shorts' && <Shorts user={user} />}
        {page === 'music' && <MusicPage user={user} />}
        {page === 'stories' && <Stories user={user} />}
        {page === 'profile' && <Profile user={user} onUpdate={setUser} />}
        {page === 'user-profile' && viewingUserId && <UserProfile userId={viewingUserId} onClose={() => { setViewingUserId(null); setPage('feed'); }} />}
        {page === 'admin' && <Admin user={user} onViewProfile={setViewingUserId} />}
      </main>

      {/* Полноэкранный видео */}
      {fullscreenVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center scale-in" style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)' }}>
          <button className="absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition-transform" style={{ background: 'rgba(255,255,255,0.2)' }} onClick={() => setFullscreenVideo(null)}>
            <X size={24} color="white" />
          </button>
          <video src={fullscreenVideo} controls autoPlay className="max-w-full max-h-full" style={{ maxWidth: '90vw', maxHeight: '90vh' }} />
        </div>
      )}
    </div>
  );
}

// ═══ NAV ITEM ═══
function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button className={`top-nav-item ${active ? 'active' : ''}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════
// AUTH PAGE — НОВЫЙ ДИЗАЙН
// ═══════════════════════════════════════════════════════════
function AuthPage({ onLogin }: { onLogin: (u: User) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = isLogin
        ? await auth.login(username, password)
        : await auth.register(username, email, password);
      onLogin(result.user);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md mx-4 slide-up">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <Logo size={100} />
          </div>
          <h1 className="text-5xl font-bold gradient-text mb-3">MegaChat</h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Мессенджер нового поколения</p>
        </div>
        <div className="glass-card p-8">
          <div className="flex gap-3 mb-8">
            <button
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${isLogin ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setIsLogin(true)}
            >
              Вход
            </button>
            <button
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${!isLogin ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setIsLogin(false)}
            >
              Регистрация
            </button>
          </div>
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--text-secondary)' }}>Имя пользователя</label>
              <input className="input-field" value={username} onChange={e => setUsername(e.target.value)} placeholder="username" required />
            </div>
            {!isLogin && (
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--text-secondary)' }}>Email</label>
                <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" required />
              </div>
            )}
            <div>
              <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--text-secondary)' }}>Пароль</label>
              <input className="input-field" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" required />
            </div>
            {error && <p className="text-sm text-red-400 p-3 rounded-xl" style={{ background: 'rgba(255, 51, 85, 0.1)' }}>{error}</p>}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? '...' : (isLogin ? 'Войти' : 'Создать аккаунт')}
            </button>
          </form>
          <div className="mt-6 p-4 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              💡 Первый зарегистрированный получает роль <strong>superadmin</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// FEED — НОВЫЙ ДИЗАЙН
// ═══════════════════════════════════════════════════════════
function Feed({ user, onViewProfile }: { user: User; onViewProfile?: (userId: string) => void }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const loadPosts = async () => {
    try {
      const data = await postsApi.list();
      setPosts(data);
    } catch (err) {
      console.error('Failed to load posts:', err);
    }
  };

  useEffect(() => { loadPosts(); }, []);

  useSocketEvent('post:created', (newPost: Post) => {
    setPosts(prev => [newPost, ...prev]);
  });

  useSocketEvent('post:liked', ({ postId, likes }: { postId: string; likes: number }) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: likes } : p));
  });

  const createPost = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const hashtags = content.match(/#\w+/g)?.map(h => h.slice(1)) || [];
      const media = imageUrl ? [imageUrl] : [];
      await postsApi.create({ content, type: media.length ? 'photo' : 'text', media, hashtags });
      setContent('');
      setImageUrl('');
      await loadPosts();
    } catch (err: any) {
      alert('Ошибка: ' + err.message);
    }
    setLoading(false);
  };

  const likePost = async (postId: string) => {
    try {
      await postsApi.like(postId);
      await loadPosts();
    } catch (err: any) {
      alert('Ошибка: ' + err.message);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Создание поста */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Avatar src={user.avatar} seed={user.username} size={48} />
            <div className="flex-1">
              <span className="font-bold text-lg">{user.username}</span>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Что у вас нового?</p>
            </div>
          </div>
          <textarea
            className="input-field h-24 resize-none mb-4"
            placeholder="Поделитесь мыслями... Используйте #хэштеги"
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <input
            className="input-field mb-4"
            placeholder="URL изображения (необязательно)"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
          />
          {imageUrl && <img src={imageUrl} className="w-full max-h-64 object-cover rounded-xl mb-4" alt="" />}
          <div className="flex justify-end">
            <button className="btn-primary" onClick={createPost} disabled={loading || !content.trim()}>
              {loading ? '...' : 'Опубликовать'}
            </button>
          </div>
        </div>

        {/* Посты */}
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <FileText size={64} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
            <p className="text-lg" style={{ color: 'var(--text-muted)' }}>Лента пуста. Создайте первый пост!</p>
          </div>
        ) : (
          posts.map(post => {
            const liked = post.likes?.includes(user.id);
            return (
              <div key={post.id} className="glass-card mb-6 fade-in">
                <div className="p-6 flex items-center gap-4">
                  <Avatar src={undefined} seed={post.user_id} size={48} />
                  <div className="flex-1">
                    <button 
                      className="font-bold hover:underline"
                      style={{ color: 'var(--accent)' }}
                      onClick={() => onViewProfile?.(post.user_id)}
                    >
                      {post.user_id.slice(0, 8)}
                    </button>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(post.created_at).toLocaleString('ru')}
                    </p>
                  </div>
                </div>
                <div className="px-6 pb-4">
                  <p className="text-base leading-relaxed">{post.content}</p>
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {post.hashtags.map(h => (
                        <span key={h} className="text-xs px-3 py-1 rounded-full" style={{ color: 'var(--accent)', background: 'var(--accent-light)' }}>
                          #{h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {post.media && post.media.length > 0 && (
                  <div className="relative group cursor-pointer" onClick={() => window.open(post.media![0], '_blank')}>
                    <img 
                      src={post.media[0]} 
                      className="w-full max-h-96 object-cover transition-transform group-hover:scale-105" 
                      alt=""
                    />
                    {post.media[0].endsWith('.gif') && (
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-lg text-xs font-bold" style={{ background: 'rgba(0,0,0,0.7)', color: 'var(--accent)' }}>
                        GIF
                      </div>
                    )}
                  </div>
                )}
                <div className="p-6 flex items-center gap-6 border-t" style={{ borderColor: 'var(--border)' }}>
                  <button 
                    className="flex items-center gap-2 transition-all hover:scale-110" 
                    onClick={() => likePost(post.id)}
                  >
                    <Heart 
                      size={22} 
                      fill={liked ? '#ff00aa' : 'none'} 
                      style={{ 
                        color: liked ? '#ff00aa' : 'var(--text-secondary)',
                        filter: liked ? 'drop-shadow(0 0 8px rgba(255, 0, 170, 0.5))' : 'none',
                      }} 
                    />
                    <span className="font-bold">{post.likes_count || 0}</span>
                  </button>
                  <button className="flex items-center gap-2">
                    <MessageCircle size={22} style={{ color: 'var(--text-secondary)' }} />
                    <span className="font-bold">{post.comments_count || 0}</span>
                  </button>
                  <button className="flex items-center gap-2">
                    <Share2 size={22} style={{ color: 'var(--text-secondary)' }} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MESSENGER — НОВЫЙ ДИЗАЙН
// ═══════════════════════════════════════════════════════════
function Messenger({ user }: { user: User }) {
  const [chatList, setChatList] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [chatTitle, setChatTitle] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadChats = async () => {
    try {
      const data = await chatsApi.list();
      setChatList(data);
    } catch (err) {
      console.error('Failed to load chats:', err);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const data = await chatsApi.messages(chatId);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  useEffect(() => { loadChats(); }, []);
  useEffect(() => {
    if (selectedChat) loadMessages(selectedChat.id);
  }, [selectedChat?.id]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useSocketEvent('chat:created', (newChat: Chat) => {
    setChatList(prev => [newChat, ...prev]);
  });

  useSocketEvent('new_message', (newMsg: Message) => {
    if (selectedChat && newMsg.chat_id === selectedChat.id) {
      setMessages(prev => [...prev, newMsg]);
    }
    loadChats();
  });

  const createChat = async () => {
    if (!chatTitle.trim()) return;
    try {
      await chatsApi.create({ type: 'group', title: chatTitle });
      setChatTitle('');
      setShowNewChat(false);
      await loadChats();
    } catch (err: any) {
      alert('Ошибка: ' + err.message);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    try {
      await chatsApi.sendMessage(selectedChat.id, newMessage.trim());
      setNewMessage('');
      await loadMessages(selectedChat.id);
    } catch (err: any) {
      alert('Ошибка: ' + err.message);
    }
  };

  return (
    <div className="h-full flex">
      {/* Список чатов */}
      <div className="w-96 h-full border-r flex flex-col" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-2xl font-bold">Чаты</h2>
          <button onClick={() => setShowNewChat(!showNewChat)} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
            <Plus size={20} />
          </button>
        </div>
        {showNewChat && (
          <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex gap-2">
              <input className="input-field flex-1" placeholder="Название чата..." value={chatTitle} onChange={e => setChatTitle(e.target.value)} />
              <button className="btn-primary" onClick={createChat}>Создать</button>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {chatList.length === 0 ? (
            <p className="p-6 text-center" style={{ color: 'var(--text-muted)' }}>Нет чатов. Создайте первый!</p>
          ) : (
            chatList.map(chat => (
              <div
                key={chat.id}
                className={`p-4 flex items-center gap-4 cursor-pointer border-b transition-all ${selectedChat?.id === chat.id ? 'bg-[var(--accent-light)]' : 'hover:bg-[var(--bg-hover)]'}`}
                style={{ borderColor: 'var(--border)' }}
                onClick={() => setSelectedChat(chat)}
              >
                <Avatar src={chat.avatar} seed={chat.title || 'chat'} size={48} />
                <div className="flex-1 min-w-0">
                  <span className="font-bold truncate block">{chat.title || 'Личный чат'}</span>
                  <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                    {chat.lastMessage?.content?.slice(0, 40) || 'Нет сообщений'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Область чата */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col h-full">
          <div className="h-16 px-6 flex items-center border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            <Avatar src={selectedChat.avatar} seed={selectedChat.title || 'chat'} size={40} />
            <h3 className="font-bold ml-3">{selectedChat.title || 'Чат'}</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ background: 'var(--bg-primary)' }}>
            {messages.map(msg => {
              const isMine = msg.user_id === user.id;
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} fade-in`}>
                  <div className={`msg-bubble ${isMine ? 'msg-sent' : 'msg-received'}`}>
                    <p>{msg.content}</p>
                    <div className="flex items-center justify-end gap-1 mt-2">
                      <span className="text-xs opacity-60">
                        {new Date(msg.created_at).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMine && <Check size={14} className="opacity-60" />}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-6 border-t flex items-center gap-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            <input
              className="input-field flex-1"
              placeholder="Сообщение..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-main)' }} onClick={sendMessage}>
              <Send size={20} color="white" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
          <div className="text-center">
            <MessageSquare size={80} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Выберите чат</h3>
            <p style={{ color: 'var(--text-muted)' }}>Или создайте новый</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Продолжение в следующем файле из-за ограничения размера...
// (Videos, Shorts, Music, Stories, Profile, Admin компоненты остаются такими же)

function Videos({ user, onFullscreen }: { user: User; onFullscreen?: (url: string) => void }) {
  const [videoList, setVideoList] = useState<Video[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [duration, setDuration] = useState('');
  const [tags, setTags] = useState('');

  const loadVideos = async () => {
    try {
      const data = await videosApi.list(false);
      setVideoList(data);
    } catch (err) {
      console.error('Failed to load videos:', err);
    }
  };

  useEffect(() => { loadVideos(); }, []);

  useSocketEvent('video:created', (newVideo: Video) => {
    setVideoList(prev => [newVideo, ...prev]);
  });

  const uploadVideo = async () => {
    if (!title.trim()) return;
    try {
      await videosApi.create({
        title,
        description,
        thumbnail,
        duration: parseInt(duration) || 0,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean)
      });
      setTitle('');
      setDescription('');
      setThumbnail('');
      setDuration('');
      setTags('');
      setShowUpload(false);
      await loadVideos();
    } catch (err: any) {
      alert('Ошибка: ' + err.message);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Видео</h1>
          <button className="btn-primary flex items-center gap-2" onClick={() => setShowUpload(!showUpload)}>
            <Upload size={18} /> Загрузить
          </button>
        </div>
        {showUpload && (
          <div className="glass-card p-6 mb-8">
            <h3 className="font-bold text-xl mb-4">Загрузить видео</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input className="input-field" placeholder="Название *" value={title} onChange={e => setTitle(e.target.value)} />
              <input className="input-field" placeholder="URL превью" value={thumbnail} onChange={e => setThumbnail(e.target.value)} />
              <input className="input-field" placeholder="Длительность (сек)" value={duration} onChange={e => setDuration(e.target.value)} />
              <input className="input-field" placeholder="Теги (через запятую)" value={tags} onChange={e => setTags(e.target.value)} />
            </div>
            <textarea className="input-field h-24 resize-none mb-4" placeholder="Описание" value={description} onChange={e => setDescription(e.target.value)} />
            <div className="flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setShowUpload(false)}>Отмена</button>
              <button className="btn-primary" onClick={uploadVideo}>Загрузить</button>
            </div>
          </div>
        )}
        {videoList.length === 0 ? (
          <div className="text-center py-20">
            <Film size={64} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
            <p className="text-lg" style={{ color: 'var(--text-muted)' }}>Нет видео. Загрузите первое!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videoList.map(video => (
              <div key={video.id} className="video-card" onClick={() => onFullscreen?.(video.thumbnail || '')}>
                <div className="relative">
                  <img src={video.thumbnail || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400'} className="w-full aspect-video object-cover" alt="" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-all">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-main)' }}>
                      <Play size={28} color="white" fill="white" />
                    </div>
                  </div>
                  <span className="duration">{Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold">{video.title}</h3>
                  <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                    {video.views_count} просм. • {new Date(video.created_at).toLocaleDateString('ru')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Shorts({ user }: { user: User }) {
  const [shortsList, setShortsList] = useState<Video[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    videosApi.list(true).then(setShortsList).catch(console.error);
  }, []);

  if (shortsList.length === 0) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: '#000' }}>
        <div className="text-center">
          <Camera size={64} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
          <p className="text-white text-lg">Нет коротких видео</p>
        </div>
      </div>
    );
  }

  const current = shortsList[currentIndex];

  return (
    <div className="h-full flex items-center justify-center" style={{ background: '#000' }}>
      <div className="relative w-full max-w-md h-full max-h-[85vh] rounded-3xl overflow-hidden">
        <img src={current.thumbnail || ''} className="w-full h-full object-cover" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-8 left-6 right-6">
          <p className="text-white font-bold text-lg">{current.title}</p>
        </div>
        <div className="absolute top-1/2 left-0 right-0 flex justify-between px-4">
          <button
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          >
            <ChevronRight size={24} color="white" className="rotate-180" />
          </button>
          <button
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}
            onClick={() => setCurrentIndex(Math.min(shortsList.length - 1, currentIndex + 1))}
          >
            <ChevronRight size={24} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MusicPage({ user }: { user: User }) {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const loadTracks = async () => {
    try {
      const data = await musicApi.list();
      setTracks(data);
    } catch (err) {
      console.error('Failed to load tracks:', err);
    }
  };

  useEffect(() => { loadTracks(); }, []);

  useSocketEvent('music:created', (newTrack: MusicTrack) => {
    setTracks(prev => [newTrack, ...prev]);
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Музыка</h1>
          {tracks.length === 0 ? (
            <div className="text-center py-20">
              <Music size={64} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
              <p className="text-lg" style={{ color: 'var(--text-muted)' }}>Нет треков</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  className={`glass-card p-4 flex items-center gap-4 cursor-pointer ${currentTrack?.id === track.id ? 'border-[var(--accent)]' : ''}`}
                  onClick={() => { setCurrentTrack(track); setIsPlaying(true); }}
                >
                  <span className="w-8 text-center font-bold" style={{ color: 'var(--text-muted)' }}>
                    {currentTrack?.id === track.id && isPlaying ? (
                      <div className="music-wave"><span /><span /><span /><span /></div>
                    ) : (index + 1)}
                  </span>
                  <img src={track.cover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100'} className="w-14 h-14 rounded-xl object-cover" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold truncate ${currentTrack?.id === track.id ? 'text-[var(--accent)]' : ''}`}>{track.title}</p>
                    <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>{track.artist}</p>
                  </div>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {currentTrack && (
        <div className="h-24 border-t flex items-center px-6 gap-6" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <img src={currentTrack.cover || ''} className="w-16 h-16 rounded-xl object-cover" alt="" />
          <div className="w-48 min-w-0">
            <p className="font-bold truncate">{currentTrack.title}</p>
            <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>{currentTrack.artist}</p>
          </div>
          <div className="flex-1 flex items-center justify-center gap-6">
            <button><SkipBack size={20} /></button>
            <button className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-main)' }} onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? <Pause size={20} color="white" /> : <Play size={20} color="white" fill="white" />}
            </button>
            <button><SkipForward size={20} /></button>
          </div>
          <Volume2 size={20} style={{ color: 'var(--text-muted)' }} />
        </div>
      )}
    </div>
  );
}

function Stories({ user }: { user: User }) {
  const [storyList, setStoryList] = useState<Story[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [media, setMedia] = useState('');
  const [text, setText] = useState('');

  const loadStories = async () => {
    try {
      const data = await storiesApi.list();
      setStoryList(data);
    } catch (err) {
      console.error('Failed to load stories:', err);
    }
  };

  useEffect(() => { loadStories(); }, []);

  useSocketEvent('story:created', (newStory: Story) => {
    setStoryList(prev => [newStory, ...prev]);
  });

  const createStory = async () => {
    if (!media.trim()) return;
    try {
      await storiesApi.create({ media, text });
      setMedia('');
      setText('');
      setShowCreate(false);
      await loadStories();
    } catch (err: any) {
      alert('Ошибка: ' + err.message);
    }
  };

  if (storyList.length === 0 && !showCreate) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: '#000' }}>
        <div className="text-center">
          <Camera size={64} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-3">Нет активных сторис</h3>
          <button className="btn-primary mt-4" onClick={() => setShowCreate(true)}>Создать сторис</button>
        </div>
      </div>
    );
  }

  if (showCreate) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="w-full max-w-md mx-4">
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold mb-6">Создать сторис</h3>
            <input className="input-field mb-4" placeholder="URL изображения *" value={media} onChange={e => setMedia(e.target.value)} />
            <textarea className="input-field h-24 resize-none mb-4" placeholder="Текст (необязательно)" value={text} onChange={e => setText(e.target.value)} />
            {media && <img src={media} className="w-full rounded-xl mb-4 max-h-48 object-cover" alt="" />}
            <div className="flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setShowCreate(false)}>Отмена</button>
              <button className="btn-primary" onClick={createStory}>Опубликовать</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center" style={{ background: '#000' }}>
      <div className="relative w-full max-w-md h-full max-h-[85vh] rounded-3xl overflow-hidden">
        <img src={storyList[0]?.media || ''} className="w-full h-full object-cover" alt="" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
        {storyList[0]?.text && (
          <div className="absolute bottom-24 left-6 right-6">
            <p className="text-white text-xl font-bold text-center">{storyList[0].text}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Profile({ user, onUpdate }: { user: User; onUpdate: (u: User) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(user.bio || '');
  const [status, setStatus] = useState(user.status || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || '');
  const [coverUrl, setCoverUrl] = useState(user.cover || '');
  const [profileData, setProfileData] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);

  useEffect(() => {
    usersApi.get(user.id).then(setProfileData).catch(console.error);
    postsApi.list().then(posts => setUserPosts(posts.filter(p => p.user_id === user.id))).catch(console.error);
  }, [user.id]);

  const saveProfile = async () => {
    try {
      await usersApi.update({ bio, status, avatar: avatarUrl, cover: coverUrl });
      const updatedUser = await auth.getCurrentUser();
      onUpdate(updatedUser);
      setIsEditing(false);
      alert('✅ Профиль обновлён');
    } catch (err: any) {
      alert('Ошибка: ' + err.message);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="h-64 relative" style={{ background: coverUrl ? 'none' : 'var(--gradient-main)' }}>
          {coverUrl && <img src={coverUrl} className="w-full h-full object-cover" alt="" />}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
        </div>
        <div className="px-8 -mt-20 relative">
          <div className="flex items-end gap-6">
            <Avatar src={avatarUrl} seed={user.username} size={160} />
            <div className="pb-6 flex-1">
              <h1 className="text-3xl font-bold">{user.username}</h1>
              <p className="text-base mt-2" style={{ color: 'var(--text-secondary)' }}>{bio || user.bio || 'Нет описания'}</p>
              {status && <p className="text-sm mt-1" style={{ color: 'var(--accent)' }}>{status}</p>}
              <div className="flex items-center gap-6 mt-4">
                <span><strong className="text-lg">{profileData?.followers || 0}</strong> <span style={{ color: 'var(--text-muted)' }}>подписчиков</span></span>
                <span><strong className="text-lg">{profileData?.following || 0}</strong> <span style={{ color: 'var(--text-muted)' }}>подписок</span></span>
                <span><strong className="text-lg">{userPosts.length}</strong> <span style={{ color: 'var(--text-muted)' }}>постов</span></span>
              </div>
            </div>
            <div className="pb-6">
              {isEditing ? (
                <div className="flex gap-3">
                  <button className="btn-primary" onClick={saveProfile}>Сохранить</button>
                  <button className="btn-secondary" onClick={() => setIsEditing(false)}>Отмена</button>
                </div>
              ) : (
                <button className="btn-primary flex items-center gap-2" onClick={() => setIsEditing(true)}>
                  <Edit size={16} /> Редактировать
                </button>
              )}
            </div>
          </div>
          {isEditing && (
            <div className="glass-card p-6 mt-6">
              <h3 className="font-bold text-xl mb-4">Редактировать профиль</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold block mb-2" style={{ color: 'var(--text-secondary)' }}>О себе</label>
                  <textarea className="input-field h-24 resize-none" value={bio} onChange={e => setBio(e.target.value)} placeholder="Расскажите о себе..." />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-2" style={{ color: 'var(--text-secondary)' }}>Статус</label>
                  <input className="input-field" value={status} onChange={e => setStatus(e.target.value)} placeholder="🟢 В сети" />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-2" style={{ color: 'var(--text-secondary)' }}>URL аватара</label>
                  <input className="input-field" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-2" style={{ color: 'var(--text-secondary)' }}>URL обложки</label>
                  <input className="input-field" value={coverUrl} onChange={e => setCoverUrl(e.target.value)} placeholder="https://..." />
                </div>
              </div>
            </div>
          )}
          <div className="py-8">
            <h2 className="text-xl font-bold mb-6">Мои посты</h2>
            {userPosts.length === 0 ? (
              <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Нет постов</p>
            ) : (
              userPosts.map(post => (
                <div key={post.id} className="glass-card p-6 mb-4">
                  <p>{post.content}</p>
                  {post.media && post.media.length > 0 && <img src={post.media[0]} className="w-full rounded-xl mt-4 max-h-64 object-cover" alt="" />}
                  <div className="flex items-center gap-6 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>❤️ {post.likes_count}</span>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{new Date(post.created_at).toLocaleString('ru')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserProfile({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      usersApi.get(userId),
      postsApi.list()
    ]).then(([profileData, allPosts]) => {
      setProfile(profileData);
      setPosts(allPosts.filter(p => p.user_id === userId));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 glow-pulse" style={{ background: 'var(--gradient-main)' }} />
          <p style={{ color: 'var(--text-muted)' }}>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <p style={{ color: 'var(--text-muted)' }}>Пользователь не найден</p>
          <button className="btn-primary mt-4" onClick={onClose}>Назад</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="p-6">
          <button className="btn-secondary flex items-center gap-2" onClick={onClose}>
            <ArrowLeft size={18} /> Назад
          </button>
        </div>
        <div className="h-64 relative" style={{ background: profile.cover ? 'none' : 'var(--gradient-main)' }}>
          {profile.cover && <img src={profile.cover} className="w-full h-full object-cover" alt="" />}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
        </div>
        <div className="px-8 -mt-20 relative">
          <div className="flex items-end gap-6">
            <div className="relative">
              <Avatar src={profile.avatar} seed={profile.username} size={160} />
              {profile.is_online === 1 && (
                <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-green-500 border-4" style={{ borderColor: 'var(--bg-primary)', boxShadow: '0 0 12px rgba(0, 255, 136, 0.6)' }} />
              )}
            </div>
            <div className="pb-6 flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{profile.username}</h1>
                {profile.is_online === 1 ? (
                  <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(0, 255, 136, 0.2)', color: 'var(--success)' }}>● Онлайн</span>
                ) : (
                  <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>○ Оффлайн</span>
                )}
              </div>
              <p className="text-base mt-2" style={{ color: 'var(--text-secondary)' }}>{profile.bio || 'Нет описания'}</p>
              {profile.status && <p className="text-sm mt-1" style={{ color: 'var(--accent)' }}>{profile.status}</p>}
              <div className="flex items-center gap-6 mt-4">
                <span><strong className="text-lg">{profile.followers || 0}</strong> <span style={{ color: 'var(--text-muted)' }}>подписчиков</span></span>
                <span><strong className="text-lg">{profile.following || 0}</strong> <span style={{ color: 'var(--text-muted)' }}>подписок</span></span>
                <span><strong className="text-lg">{posts.length}</strong> <span style={{ color: 'var(--text-muted)' }}>постов</span></span>
              </div>
            </div>
          </div>
          <div className="py-8">
            <h2 className="text-xl font-bold mb-6">Посты пользователя</h2>
            {posts.length === 0 ? (
              <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Нет постов</p>
            ) : (
              posts.map(post => (
                <div key={post.id} className="glass-card p-6 mb-4">
                  <p>{post.content}</p>
                  {post.media && post.media.length > 0 && <img src={post.media[0]} className="w-full rounded-xl mt-4 max-h-64 object-cover" alt="" />}
                  <div className="flex items-center gap-6 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>❤️ {post.likes_count}</span>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{new Date(post.created_at).toLocaleString('ru')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Admin({ user, onViewProfile }: { user: User; onViewProfile?: (userId: string) => void }) {
  const [section, setSection] = useState('dashboard');
  const [stats, setStats] = useState<any>({});
  const [adminUsers, setAdminUsers] = useState<User[]>([]);

  const loadAdminData = async () => {
    try {
      const [statsData, usersData] = await Promise.all([
        adminApi.stats(),
        adminApi.getUsers()
      ]);
      setStats(statsData);
      setAdminUsers(usersData);
    } catch (err) {
      console.error('Failed to load admin ', err);
    }
  };

  useEffect(() => { loadAdminData(); }, []);

  return (
    <div className="h-full flex">
      <div className="w-64 h-full border-r p-6 flex flex-col" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 mb-8">
          <Shield size={24} style={{ color: 'var(--accent)' }} />
          <span className="font-bold text-lg">Админ-панель</span>
        </div>
        <div className="space-y-2 flex-1">
          {[
            { id: 'dashboard', label: 'Дашборд', icon: <BarChart3 size={18} /> },
            { id: 'users', label: 'Пользователи', icon: <Users size={18} /> },
          ].map(item => (
            <div
              key={item.id}
              className={`admin-item ${section === item.id ? 'active' : ''}`}
              onClick={() => setSection(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 h-full overflow-y-auto p-8">
        {section === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-bold mb-8">Дашборд</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Пользователи', value: stats.users || 0, gradient: 'var(--gradient-cool)' },
                { label: 'Посты', value: stats.posts || 0, gradient: 'var(--gradient-warm)' },
                { label: 'Видео', value: stats.videos || 0, gradient: 'var(--gradient-deep)' },
                { label: 'Сообщения', value: stats.messages || 0, gradient: 'var(--gradient-main)' },
              ].map(stat => (
                <div key={stat.label} className="stat-card">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: stat.gradient }}>
                    <BarChart3 size={22} color="white" />
                  </div>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {section === 'users' && (
          <div>
            <h1 className="text-3xl font-bold mb-8">Пользователи ({adminUsers.length})</h1>
            <div className="glass-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'var(--bg-tertiary)' }}>
                    <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Пользователь</th>
                    <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Роль</th>
                    <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Статус</th>
                    <th className="text-right p-4 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map(u => (
                    <tr key={u.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={u.avatar} seed={u.username} size={40} />
                          <div>
                            <p className="font-bold">{u.username}</p>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          u.role === 'superadmin' ? 'bg-yellow-500/20 text-yellow-400' :
                          u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>{u.role}</span>
                      </td>
                      <td className="p-4">
                        {u.is_banned ? (
                          <span className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-400">Бан</span>
                        ) : (
                          <span className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-400">Активен</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-2 rounded-lg hover:bg-[var(--bg-hover)]" onClick={() => onViewProfile?.(u.id)} title="Просмотр">
                            <Eye size={16} style={{ color: 'var(--accent)' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
