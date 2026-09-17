import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Film, Music, Image, Users, Bell, Send, Heart, Share2,
  Bookmark, MoreHorizontal, Plus, X, Phone, Video as VideoIcon, Smile,
  Paperclip, Mic, ArrowLeft, Check, Home, User as UserIcon, Shield, BarChart3,
  FileText, Globe, Lock, Eye, Trash2, Edit, Ban, AlertTriangle,
  ChevronRight, Play, Pause, SkipForward, SkipBack, Volume2, Zap,
  Camera, MessageCircle, Settings, LogOut, Upload
} from 'lucide-react';
import { auth, users as usersApi, chats as chatsApi, posts as postsApi, stories as storiesApi, videos as videosApi, music as musicApi, admin as adminApi } from './store';
import type { User, Chat, Message, Post, Story, Video, MusicTrack } from './types';

type Page = 'auth' | 'feed' | 'messenger' | 'videos' | 'shorts' | 'music' | 'stories' | 'profile' | 'admin' | 'user-profile';

// Компонент аватара с fallback
function Avatar({ src, seed, size = 40, className = '' }: { src?: string; seed: string; size?: number; className?: string }) {
  const [error, setError] = useState(false);
  const fallbackUrl = `https://api.dicebear.com/9.2/avataaars/svg?seed=${encodeURIComponent(seed)}`;
  const imgSrc = error ? fallbackUrl : (src || fallbackUrl);
  
  return (
    <img 
      src={imgSrc} 
      className={className}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', background: 'var(--bg-tertiary)' }}
      onError={() => setError(true)}
      alt={seed}
    />
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

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  // При загрузке проверяем авторизацию через API
  useEffect(() => {
    if (auth.isLoggedIn()) {
      auth.getCurrentUser()
        .then(u => {
          setUser(u);
          setPage('feed');
        })
        .catch(() => {
          // Токен невалиден
          setUser(null);
          setPage('auth');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Обработчик входящих видеозвонков от админа
  useEffect(() => {
    if (!user) return;
    
    // Имитация WebSocket для видеозвонков (в реальности нужен Socket.IO client)
    const checkCalls = setInterval(async () => {
      try {
        // Проверить входящие звонки через API
        const response = await fetch('/api/notifications/calls', {
          headers: { 'Authorization': 'Bearer ' + (auth as any).authToken }
        });
        if (response.ok) {
          const calls = await response.json();
          if (calls.length > 0) {
            setIncomingCall(calls[0]);
          }
        }
      } catch {}
    }, 5000);
    
    return () => clearInterval(checkCalls);
  }, [user]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Zap size={32} color="white" />
          </div>
          <p style={{ color: 'var(--text-muted)' }}>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onLogin={(u) => { setUser(u); setPage('feed'); }} />;
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <nav className="w-[72px] h-full flex flex-col items-center py-4 gap-1 border-r shrink-0" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center mb-3 cursor-pointer" onClick={() => setPage('feed')}>
          <Zap size={20} color="white" />
        </div>
        {[
          { id: 'feed', icon: <Home size={22} />, label: 'Лента' },
          { id: 'messenger', icon: <MessageSquare size={22} />, label: 'Чаты' },
          { id: 'videos', icon: <Film size={22} />, label: 'Видео' },
          { id: 'shorts', icon: <Camera size={22} />, label: 'Shorts' },
          { id: 'music', icon: <Music size={22} />, label: 'Музыка' },
          { id: 'stories', icon: <Camera size={22} />, label: 'Сторис' },
          { id: 'profile', icon: <UserIcon size={22} />, label: 'Профиль' },
        ].map(item => (
          <button
            key={item.id}
            className={`nav-item w-12 h-12 flex items-center justify-center ${page === item.id ? 'active' : ''}`}
            style={{ color: page === item.id ? 'var(--accent)' : 'var(--text-muted)' }}
            onClick={() => setPage(item.id as Page)}
            title={item.label}
          >
            {item.icon}
          </button>
        ))}
        {(user.role === 'admin' || user.role === 'superadmin') && (
          <button
            className={`nav-item w-12 h-12 flex items-center justify-center ${page === 'admin' ? 'active' : ''}`}
            style={{ color: page === 'admin' ? 'var(--accent)' : 'var(--text-muted)' }}
            onClick={() => setPage('admin')}
            title="Админ"
          >
            <Shield size={22} />
          </button>
        )}
        <div className="flex-1" />
        <button
          className="nav-item w-12 h-12 flex items-center justify-center"
          style={{ color: 'var(--text-muted)' }}
          onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          title="Тема"
        >
          <Globe size={22} />
        </button>
        <div className="cursor-pointer" onClick={() => { auth.logout(); setUser(null); setPage('auth'); }}>
          <Avatar src={user.avatar} seed={user.username} size={36} className="border-2" />
        </div>
      </nav>

      <main className="flex-1 h-full overflow-hidden">
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

      {/* Полноэкранный видеоплеер */}
      {fullscreenVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.95)' }}>
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }} onClick={() => setFullscreenVideo(null)}>
            <X size={24} color="white" />
          </button>
          <video src={fullscreenVideo} controls autoPlay className="max-w-full max-h-full" style={{ maxWidth: '90vw', maxHeight: '90vh' }} />
        </div>
      )}

      {/* Модальное окно входящего видеозвонка */}
      {incomingCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="card p-6 max-w-md w-full mx-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4 animate-pulse">
                <VideoIcon size={32} color="white" />
              </div>
              <h2 className="text-xl font-bold mb-2">Входящий видеозвонок</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                От: <strong>{incomingCall.from}</strong>
              </p>
            </div>
            {incomingCall.videoUrl && (
              <div className="mb-4">
                <video src={incomingCall.videoUrl} controls autoPlay className="w-full rounded-lg" />
              </div>
            )}
            <div className="flex gap-2">
              <button className="btn-primary flex-1" onClick={() => setIncomingCall(null)}>
                Принять
              </button>
              <button className="btn-secondary flex-1" onClick={() => setIncomingCall(null)}>
                Отклонить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// AUTH
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
      <div className="w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4">
            <Zap size={36} color="white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">MegaChat</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Мессенджер нового поколения</p>
        </div>
        <div className="rounded-2xl p-8" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <div className="flex gap-2 mb-6">
            <button
              className={`flex-1 py-3 rounded-xl font-semibold ${isLogin ? 'gradient-bg text-white' : ''}`}
              style={!isLogin ? { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' } : {}}
              onClick={() => setIsLogin(true)}
            >
              Вход
            </button>
            <button
              className={`flex-1 py-3 rounded-xl font-semibold ${!isLogin ? 'gradient-bg text-white' : ''}`}
              style={isLogin ? { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' } : {}}
              onClick={() => setIsLogin(false)}
            >
              Регистрация
            </button>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Имя пользователя</label>
              <input className="input-field" value={username} onChange={e => setUsername(e.target.value)} placeholder="username" required />
            </div>
            {!isLogin && (
              <div>
                <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Email</label>
                <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" required />
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Пароль</label>
              <input className="input-field" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" required />
            </div>
            {error && <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg">{error}</p>}
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
// FEED
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
      <div className="max-w-2xl mx-auto py-6 px-4">
        <div className="card p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Avatar src={user.avatar} seed={user.username} size={40} className="avatar" />
            <span className="font-semibold">{user.username}</span>
          </div>
          <textarea
            className="input-field h-24 resize-none mb-3"
            placeholder="Что у вас нового? Используйте #хэштеги"
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <input
            className="input-field mb-3"
            placeholder="URL изображения (необязательно)"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
          />
          {imageUrl && <img src={imageUrl} className="w-full max-h-48 object-cover rounded-xl mb-3" alt="" />}
          <div className="flex justify-end">
            <button className="btn-primary" onClick={createPost} disabled={loading || !content.trim()}>
              {loading ? '...' : 'Опубликовать'}
            </button>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16">
            <FileText size={48} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
            <p style={{ color: 'var(--text-muted)' }}>Лента пуста. Создайте первый пост!</p>
          </div>
        ) : (
          posts.map(post => {
            const liked = post.likes?.includes(user.id);
            return (
              <div key={post.id} className="card mb-4">
                <div className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
                    <UserIcon size={18} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div className="flex-1">
                    <button 
                      className="font-semibold text-sm hover:underline"
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
                <div className="px-4 pb-3">
                  <p className="text-sm">{post.content}</p>
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {post.hashtags.map(h => (
                        <span key={h} className="text-xs px-2 py-0.5 rounded-full" style={{ color: 'var(--accent)', background: 'var(--accent-light)' }}>
                          #{h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {post.media && post.media.length > 0 && (
                  <img src={post.media[0]} className="w-full max-h-96 object-cover" alt="" />
                )}
                <div className="p-4 flex items-center gap-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  <button className="flex items-center gap-1.5" onClick={() => likePost(post.id)}>
                    <Heart size={20} fill={liked ? '#ef4444' : 'none'} style={{ color: liked ? '#ef4444' : 'var(--text-secondary)' }} />
                    <span className="text-sm">{post.likes_count || 0}</span>
                  </button>
                  <button className="flex items-center gap-1.5">
                    <MessageCircle size={20} style={{ color: 'var(--text-secondary)' }} />
                    <span className="text-sm">{post.comments_count || 0}</span>
                  </button>
                  <button className="flex items-center gap-1.5">
                    <Share2 size={20} style={{ color: 'var(--text-secondary)' }} />
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
// MESSENGER
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

  const reactToMessage = async (messageId: string, emoji: string) => {
    try {
      await chatsApi.react(messageId, emoji);
      if (selectedChat) await loadMessages(selectedChat.id);
    } catch (err: any) {
      alert('Ошибка: ' + err.message);
    }
  };

  return (
    <div className="h-full flex">
      <div className="w-80 h-full border-r flex flex-col" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-xl font-bold">Чаты</h2>
          <button onClick={() => setShowNewChat(!showNewChat)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
            <Plus size={16} />
          </button>
        </div>
        {showNewChat && (
          <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex gap-2">
              <input className="input-field flex-1 py-2 text-sm" placeholder="Название чата..." value={chatTitle} onChange={e => setChatTitle(e.target.value)} />
              <button className="btn-primary py-2 px-3 text-sm" onClick={createChat}>Создать</button>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {chatList.length === 0 ? (
            <p className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Нет чатов. Создайте первый!</p>
          ) : (
            chatList.map(chat => (
              <div
                key={chat.id}
                className={`p-3 flex items-center gap-3 cursor-pointer border-b ${selectedChat?.id === chat.id ? 'bg-[var(--accent-light)]' : 'hover:bg-[var(--bg-hover)]'}`}
                style={{ borderColor: 'var(--border)' }}
                onClick={() => setSelectedChat(chat)}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
                  {chat.type === 'group' ? <Users size={20} style={{ color: 'var(--text-muted)' }} /> : <UserIcon size={20} style={{ color: 'var(--text-muted)' }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm truncate block">{chat.title || 'Личный чат'}</span>
                  <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                    {chat.lastMessage?.content?.slice(0, 40) || 'Нет сообщений'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedChat ? (
        <div className="flex-1 flex flex-col h-full">
          <div className="h-16 px-4 flex items-center border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            <h3 className="font-semibold">{selectedChat.title || 'Чат'}</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: 'var(--bg-primary)' }}>
            {messages.map(msg => {
              const isMine = msg.user_id === user.id;
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className="group relative">
                    <div className={`message-bubble ${isMine ? 'message-sent' : 'message-received'}`}>
                      <p className="text-sm">{msg.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[10px] opacity-60">
                          {new Date(msg.created_at).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMine && <Check size={12} className="opacity-60" />}
                      </div>
                    </div>
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className="flex gap-1 mt-1 ml-3">
                        {Object.entries(msg.reactions).map(([emoji, users]) => (
                          <span
                            key={emoji}
                            className="text-xs px-2 py-0.5 rounded-full cursor-pointer"
                            style={{ background: 'var(--bg-tertiary)' }}
                            onClick={() => reactToMessage(msg.id, emoji)}
                          >
                            {emoji} {users.length}
                          </span>
                        ))}
                      </div>
                    )}
                    <button
                      className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded-full"
                      style={{ background: 'var(--bg-tertiary)' }}
                      onClick={() => reactToMessage(msg.id, '❤️')}
                    >
                      <Heart size={14} style={{ color: 'var(--text-muted)' }} />
                    </button>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t flex items-center gap-3" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            <input
              className="input-field flex-1"
              placeholder="Сообщение..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center" onClick={sendMessage}>
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
// VIDEOS
// ═══════════════════════════════════════════════════════════
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
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Видео</h1>
          <button className="btn-primary flex items-center gap-2" onClick={() => setShowUpload(!showUpload)}>
            <Upload size={16} /> Загрузить
          </button>
        </div>
        {showUpload && (
          <div className="card p-4 mb-6">
            <h3 className="font-bold mb-3">Загрузить видео</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <input className="input-field" placeholder="Название *" value={title} onChange={e => setTitle(e.target.value)} />
              <input className="input-field" placeholder="URL превью" value={thumbnail} onChange={e => setThumbnail(e.target.value)} />
              <input className="input-field" placeholder="Длительность (сек)" value={duration} onChange={e => setDuration(e.target.value)} />
              <input className="input-field" placeholder="Теги (через запятую)" value={tags} onChange={e => setTags(e.target.value)} />
            </div>
            <textarea className="input-field h-20 resize-none mb-3" placeholder="Описание" value={description} onChange={e => setDescription(e.target.value)} />
            <div className="flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setShowUpload(false)}>Отмена</button>
              <button className="btn-primary" onClick={uploadVideo}>Загрузить</button>
            </div>
          </div>
        )}
        {videoList.length === 0 ? (
          <div className="text-center py-16">
            <Film size={48} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
            <p style={{ color: 'var(--text-muted)' }}>Нет видео. Загрузите первое!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videoList.map(video => (
              <div key={video.id} className="video-card">
                <div className="relative cursor-pointer" onClick={() => onFullscreen?.(video.thumbnail || '')}>
                  <img src={video.thumbnail || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400'} className="w-full aspect-video object-cover" alt="" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-all">
                    <div className="w-14 h-14 rounded-full gradient-bg flex items-center justify-center">
                      <Play size={24} color="white" fill="white" />
                    </div>
                  </div>
                  <span className="duration">{Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</span>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm">{video.title}</h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
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

// ═══════════════════════════════════════════════════════════
// SHORTS
// ═══════════════════════════════════════════════════════════
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
          <Camera size={48} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
          <p className="text-white">Нет коротких видео</p>
        </div>
      </div>
    );
  }

  const current = shortsList[currentIndex];

  return (
    <div className="h-full flex items-center justify-center" style={{ background: '#000' }}>
      <div className="relative w-full max-w-sm h-full max-h-[80vh] rounded-3xl overflow-hidden">
        <img src={current.thumbnail || ''} className="w-full h-full object-cover" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-4 right-4">
          <p className="text-white font-semibold">{current.title}</p>
        </div>
        <div className="absolute top-1/2 left-0 right-0 flex justify-between px-2">
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.1)' }}
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          >
            <ChevronRight size={20} color="white" className="rotate-180" />
          </button>
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.1)' }}
            onClick={() => setCurrentIndex(Math.min(shortsList.length - 1, currentIndex + 1))}
          >
            <ChevronRight size={20} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MUSIC
// ═══════════════════════════════════════════════════════════
function MusicPage({ user }: { user: User }) {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [cover, setCover] = useState('');
  const [duration, setDuration] = useState('');

  const loadTracks = async () => {
    try {
      const data = await musicApi.list();
      setTracks(data);
    } catch (err) {
      console.error('Failed to load tracks:', err);
    }
  };

  useEffect(() => { loadTracks(); }, []);

  const uploadTrack = async () => {
    if (!title.trim()) return;
    try {
      await musicApi.create({ title, artist, duration: parseInt(duration) || 0, cover });
      setTitle('');
      setArtist('');
      setCover('');
      setDuration('');
      setShowUpload(false);
      await loadTracks();
    } catch (err: any) {
      alert('Ошибка: ' + err.message);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Музыка</h1>
            <button className="btn-primary flex items-center gap-2" onClick={() => setShowUpload(!showUpload)}>
              <Upload size={16} /> Загрузить
            </button>
          </div>
          {showUpload && (
            <div className="card p-4 mb-6">
              <h3 className="font-bold mb-3">Загрузить трек</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <input className="input-field" placeholder="Название *" value={title} onChange={e => setTitle(e.target.value)} />
                <input className="input-field" placeholder="Исполнитель" value={artist} onChange={e => setArtist(e.target.value)} />
                <input className="input-field" placeholder="Длительность (сек)" value={duration} onChange={e => setDuration(e.target.value)} />
                <input className="input-field" placeholder="URL обложки" value={cover} onChange={e => setCover(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2">
                <button className="btn-secondary" onClick={() => setShowUpload(false)}>Отмена</button>
                <button className="btn-primary" onClick={uploadTrack}>Загрузить</button>
              </div>
            </div>
          )}
          {tracks.length === 0 ? (
            <div className="text-center py-16">
              <Music size={48} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
              <p style={{ color: 'var(--text-muted)' }}>Нет треков</p>
            </div>
          ) : (
            <div className="space-y-1">
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer ${currentTrack?.id === track.id ? '' : 'hover:bg-[var(--bg-hover)]'}`}
                  style={currentTrack?.id === track.id ? { background: 'var(--accent-light)' } : {}}
                  onClick={() => { setCurrentTrack(track); setIsPlaying(true); }}
                >
                  <span className="w-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    {currentTrack?.id === track.id && isPlaying ? (
                      <div className="music-wave"><span /><span /><span /><span /></div>
                    ) : (index + 1)}
                  </span>
                  <img src={track.cover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100'} className="w-12 h-12 rounded-lg object-cover" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${currentTrack?.id === track.id ? 'text-[var(--accent)]' : ''}`}>{track.title}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{track.artist}</p>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {currentTrack && (
        <div className="h-20 border-t flex items-center px-4 gap-4" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <img src={currentTrack.cover || ''} className="w-12 h-12 rounded-lg object-cover" alt="" />
          <div className="w-40 min-w-0">
            <p className="font-medium text-sm truncate">{currentTrack.title}</p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{currentTrack.artist}</p>
          </div>
          <div className="flex-1 flex items-center justify-center gap-4">
            <button><SkipBack size={18} /></button>
            <button className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center" onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? <Pause size={18} color="white" /> : <Play size={18} color="white" fill="white" />}
            </button>
            <button><SkipForward size={18} /></button>
          </div>
          <Volume2 size={16} style={{ color: 'var(--text-muted)' }} />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ПРОСМОТР ПРОФИЛЯ ДРУГОГО ПОЛЬЗОВАТЕЛЯ
// ═══════════════════════════════════════════════════════════
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
          <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4 animate-pulse" />
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
        <div className="p-4">
          <button className="btn-secondary flex items-center gap-2" onClick={onClose}>
            <ArrowLeft size={16} /> Назад
          </button>
        </div>
        
        {/* Cover */}
        <div className="h-52 relative" style={{ background: profile.cover ? 'none' : 'var(--gradient-1)' }}>
          {profile.cover && <img src={profile.cover} className="w-full h-full object-cover" alt="" />}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
        </div>

        <div className="px-6 -mt-16 relative">
          <div className="flex items-end gap-4">
            <div className="relative">
              <Avatar src={profile.avatar} seed={profile.username} size={128} className="avatar border-4" />
              {profile.is_online === 1 && (
                <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-green-500 border-4" style={{ borderColor: 'var(--bg-primary)' }} title="Онлайн" />
              )}
            </div>
            <div className="pb-4 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{profile.username}</h1>
                {profile.is_online === 1 ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">● Онлайн</span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400">○ Оффлайн</span>
                )}
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{profile.bio || 'Нет описания'}</p>
              {profile.status && <p className="text-xs mt-1" style={{ color: 'var(--accent)' }}>{profile.status}</p>}
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm"><strong>{profile.followers || 0}</strong> <span style={{ color: 'var(--text-muted)' }}>подписчиков</span></span>
                <span className="text-sm"><strong>{profile.following || 0}</strong> <span style={{ color: 'var(--text-muted)' }}>подписок</span></span>
                <span className="text-sm"><strong>{posts.length}</strong> <span style={{ color: 'var(--text-muted)' }}>постов</span></span>
              </div>
            </div>
          </div>

          {/* Posts */}
          <div className="py-6">
            <h2 className="text-lg font-bold mb-4">Посты пользователя</h2>
            {posts.length === 0 ? (
              <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Нет постов</p>
            ) : (
              posts.map(post => (
                <div key={post.id} className="card p-4 mb-4">
                  <p className="text-sm">{post.content}</p>
                  {post.media && post.media.length > 0 && (
                    <img src={post.media[0]} className="w-full rounded-xl mt-3 max-h-48 object-cover" alt="" />
                  )}
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>❤️ {post.likes_count}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(post.created_at).toLocaleString('ru')}</span>
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

// ═══════════════════════════════════════════════════════════
// STORIES
// ═══════════════════════════════════════════════════════════
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
          <Camera size={48} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Нет активных сторис</h3>
          <button className="btn-primary mt-4" onClick={() => setShowCreate(true)}>Создать сторис</button>
        </div>
      </div>
    );
  }

  if (showCreate) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="w-full max-w-md mx-4">
          <div className="rounded-2xl p-6" style={{ background: 'var(--bg-secondary)' }}>
            <h3 className="text-lg font-bold mb-4">Создать сторис</h3>
            <input className="input-field mb-3" placeholder="URL изображения *" value={media} onChange={e => setMedia(e.target.value)} />
            <textarea className="input-field h-20 resize-none mb-3" placeholder="Текст (необязательно)" value={text} onChange={e => setText(e.target.value)} />
            {media && <img src={media} className="w-full rounded-xl mb-3 max-h-48 object-cover" alt="" />}
            <div className="flex justify-end gap-2">
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
      <div className="relative w-full max-w-sm h-full max-h-[85vh] rounded-3xl overflow-hidden">
        <img src={storyList[0]?.media || ''} className="w-full h-full object-cover" alt="" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
        {storyList[0]?.text && (
          <div className="absolute bottom-20 left-4 right-4">
            <p className="text-white text-lg font-medium text-center">{storyList[0].text}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PROFILE
// ═══════════════════════════════════════════════════════════
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
      // Загрузить обновленные данные из БД
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
        <div className="h-52 relative" style={{ background: coverUrl ? 'none' : 'var(--gradient-1)' }}>
          {coverUrl && <img src={coverUrl} className="w-full h-full object-cover" alt="" />}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
        </div>
        <div className="px-6 -mt-16 relative">
          <div className="flex items-end gap-4">
            <Avatar src={avatarUrl} seed={user.username} size={128} className="avatar border-4" />
            <div className="pb-4 flex-1">
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{bio || user.bio || 'Нет описания'}</p>
              {status && <p className="text-xs mt-1" style={{ color: 'var(--accent)' }}>{status}</p>}
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm"><strong>{profileData?.followers || 0}</strong> <span style={{ color: 'var(--text-muted)' }}>подписчиков</span></span>
                <span className="text-sm"><strong>{profileData?.following || 0}</strong> <span style={{ color: 'var(--text-muted)' }}>подписок</span></span>
                <span className="text-sm"><strong>{userPosts.length}</strong> <span style={{ color: 'var(--text-muted)' }}>постов</span></span>
              </div>
            </div>
            <div className="pb-4">
              {isEditing ? (
                <div className="flex gap-2">
                  <button className="btn-primary text-sm" onClick={saveProfile}>Сохранить</button>
                  <button className="btn-secondary text-sm" onClick={() => setIsEditing(false)}>Отмена</button>
                </div>
              ) : (
                <button className="btn-primary text-sm flex items-center gap-2" onClick={() => setIsEditing(true)}>
                  <Edit size={14} /> Редактировать
                </button>
              )}
            </div>
          </div>
          {isEditing && (
            <div className="card p-4 mt-4">
              <h3 className="font-bold mb-3">Редактировать профиль</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>О себе</label>
                  <textarea className="input-field h-20 resize-none" value={bio} onChange={e => setBio(e.target.value)} placeholder="Расскажите о себе..." />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>Статус</label>
                  <input className="input-field" value={status} onChange={e => setStatus(e.target.value)} placeholder="🟢 В сети" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>URL аватара</label>
                  <input className="input-field" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>URL обложки</label>
                  <input className="input-field" value={coverUrl} onChange={e => setCoverUrl(e.target.value)} placeholder="https://..." />
                </div>
              </div>
            </div>
          )}
          <div className="py-6">
            <h2 className="text-lg font-bold mb-4">Мои посты</h2>
            {userPosts.length === 0 ? (
              <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Нет постов</p>
            ) : (
              userPosts.map(post => (
                <div key={post.id} className="card p-4 mb-4">
                  <p className="text-sm">{post.content}</p>
                  {post.media && post.media.length > 0 && <img src={post.media[0]} className="w-full rounded-xl mt-3 max-h-48 object-cover" alt="" />}
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>❤️ {post.likes_count}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(post.created_at).toLocaleDateString('ru')}</span>
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

// ═══════════════════════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════════════════════
function Admin({ user, onViewProfile }: { user: User; onViewProfile?: (userId: string) => void }) {
  const [section, setSection] = useState('dashboard');
  const [stats, setStats] = useState<any>({});
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [ipBans, setIpBans] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [callUserId, setCallUserId] = useState('');
  const [callVideoUrl, setCallVideoUrl] = useState('');
  const [newIpBan, setNewIpBan] = useState({ ip: '', reason: '', hours: 24 });

  const loadAdminData = async () => {
    try {
      const [statsData, usersData, reportsData, auditData, ipBansData, sessionsData] = await Promise.all([
        adminApi.stats(),
        adminApi.getUsers(),
        adminApi.getReports(),
        adminApi.getAuditLog(),
        adminApi.getIpBans(),
        adminApi.getActiveSessions()
      ]);
      setStats(statsData);
      setAdminUsers(usersData);
      setReports(reportsData);
      setAuditLog(auditData);
      setIpBans(ipBansData);
      setSessions(sessionsData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  useEffect(() => { loadAdminData(); }, []);

  const handleCallUser = async () => {
    if (!callUserId) return;
    try {
      const result: any = await adminApi.callUser(callUserId, callVideoUrl || undefined);
      alert(result.isOnline ? '✅ Видеозвонок отправлен (пользователь онлайн)' : '⏰ Звонок поставлен в очередь (пользователь получит при входе)');
      setCallUserId('');
      setCallVideoUrl('');
    } catch (err: any) {
      alert('Ошибка: ' + err.message);
    }
  };

  const handleBanIp = async () => {
    if (!newIpBan.ip) return;
    try {
      await adminApi.banIp(newIpBan.ip, newIpBan.reason);
      alert('✅ IP заблокирован');
      setNewIpBan({ ip: '', reason: '', hours: 24 });
      loadAdminData();
    } catch (err: any) {
      alert('Ошибка: ' + err.message);
    }
  };

  const banUser = async (userId: string, reason: string) => {
    try {
      await adminApi.banUser(userId, reason);
      await loadAdminData();
    } catch (err: any) {
      alert('Ошибка: ' + err.message);
    }
  };

  const unbanUser = async (userId: string) => {
    try {
      await adminApi.unbanUser(userId);
      await loadAdminData();
    } catch (err: any) {
      alert('Ошибка: ' + err.message);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Удалить пользователя?')) return;
    try {
      await adminApi.deleteUser(userId);
      await loadAdminData();
    } catch (err: any) {
      alert('Ошибка: ' + err.message);
    }
  };

  const resolveReport = async (reportId: string, status: string) => {
    try {
      await adminApi.resolveReport(reportId, status);
      await loadAdminData();
    } catch (err: any) {
      alert('Ошибка: ' + err.message);
    }
  };

  return (
    <div className="h-full flex">
      <div className="w-56 h-full border-r p-4 flex flex-col shrink-0" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 mb-6">
          <Shield size={20} style={{ color: 'var(--accent)' }} />
          <span className="font-bold">Админ</span>
        </div>
        <div className="space-y-1 flex-1">
          {[
            { id: 'dashboard', label: 'Дашборд', icon: <BarChart3 size={18} /> },
            { id: 'users', label: 'Пользователи', icon: <Users size={18} /> },
            { id: 'reports', label: 'Жалобы', icon: <AlertTriangle size={18} /> },
            { id: 'ipbans', label: 'IP баны', icon: <Lock size={18} /> },
            { id: 'sessions', label: 'Сессии', icon: <Eye size={18} /> },
            { id: 'calls', label: 'Видеозвонки', icon: <VideoIcon size={18} /> },
            { id: 'logs', label: 'Логи', icon: <Eye size={18} /> },
          ].map(item => (
            <div
              key={item.id}
              className={`admin-sidebar-item ${section === item.id ? 'active' : ''}`}
              onClick={() => setSection(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 h-full overflow-y-auto p-6">
        {section === 'dashboard' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Дашборд</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Пользователи', value: stats.users || 0, color: 'from-blue-500 to-cyan-500' },
                { label: 'Посты', value: stats.posts || 0, color: 'from-purple-500 to-pink-500' },
                { label: 'Видео', value: stats.videos || 0, color: 'from-orange-500 to-red-500' },
                { label: 'Сообщения', value: stats.messages || 0, color: 'from-green-500 to-teal-500' },
              ].map(stat => (
                <div key={stat.label} className="stat-card">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                    <BarChart3 size={18} color="white" />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {section === 'users' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Пользователи ({adminUsers.length})</h1>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'var(--bg-tertiary)' }}>
                    <th className="text-left p-3 text-xs" style={{ color: 'var(--text-muted)' }}>Пользователь</th>
                    <th className="text-left p-3 text-xs" style={{ color: 'var(--text-muted)' }}>Роль</th>
                    <th className="text-left p-3 text-xs" style={{ color: 'var(--text-muted)' }}>Статус</th>
                    <th className="text-left p-3 text-xs" style={{ color: 'var(--text-muted)' }}>Онлайн</th>
                    <th className="text-right p-3 text-xs" style={{ color: 'var(--text-muted)' }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map(u => (
                    <tr key={u.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={u.avatar} seed={u.username} size={32} className="avatar" />
                          <div>
                            <p className="font-medium text-sm">{u.username}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'superadmin' ? 'bg-yellow-500/20 text-yellow-400' : u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3">
                        {u.is_banned ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">Бан</span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Активен</span>
                        )}
                      </td>
                      <td className="p-3">
                        {u.is_online === 1 ? (
                          <span className="flex items-center gap-1 text-xs text-green-400">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            Онлайн
                          </span>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {u.last_seen ? `Был(а) ${new Date(u.last_seen).toLocaleString('ru')}` : 'Оффлайн'}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)]" onClick={() => onViewProfile?.(u.id)} title="Просмотр профиля">
                            <Eye size={14} style={{ color: 'var(--accent)' }} />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)]" onClick={async () => {
                            const videoUrl = prompt('URL видео (оставьте пустым для аудиозвонка):');
                            if (videoUrl !== null) {
                              await adminApi.callUser(u.id, videoUrl || undefined);
                              alert(u.is_online === 1 ? '✅ Звонок отправлен' : '⏰ Звонок будет доставлен при входе');
                            }
                          }} title="Видеозвонок">
                            <VideoIcon size={14} style={{ color: 'var(--accent)' }} />
                          </button>
                          {u.is_banned ? (
                            <button className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)]" onClick={() => unbanUser(u.id)} title="Разбан">
                              <Ban size={14} style={{ color: 'var(--success)' }} />
                            </button>
                          ) : (
                            <button className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)]" onClick={() => banUser(u.id, 'Нарушение правил')} title="Забанить">
                              <Ban size={14} style={{ color: 'var(--danger)' }} />
                            </button>
                          )}
                          {user.role === 'superadmin' && u.id !== user.id && (
                            <>
                              <button className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)]" onClick={async () => {
                                const newRole = prompt('Новая роль (user/moderator/admin/superadmin):');
                                if (newRole && ['user', 'moderator', 'admin', 'superadmin'].includes(newRole)) {
                                  await adminApi.changeRole(u.id, newRole);
                                  loadAdminData();
                                }
                              }} title="Сменить роль">
                                <Shield size={14} style={{ color: 'var(--warning)' }} />
                              </button>
                              <button className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)]" onClick={() => deleteUser(u.id)} title="Удалить">
                                <Trash2 size={14} style={{ color: 'var(--danger)' }} />
                              </button>
                            </>
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
          <div>
            <h1 className="text-2xl font-bold mb-6">Жалобы</h1>
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle size={48} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
                <p style={{ color: 'var(--text-muted)' }}>Нет жалоб</p>
              </div>
            ) : (
              reports.map(report => (
                <div key={report.id} className="stat-card mb-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{report.reason}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {report.target_type} • {report.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-secondary text-xs py-1 px-3" onClick={() => resolveReport(report.id, 'dismissed')}>
                      Отклонить
                    </button>
                    <button className="btn-primary text-xs py-1 px-3" onClick={() => resolveReport(report.id, 'resolved')}>
                      Решить
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {section === 'ipbans' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">IP баны ({ipBans.length})</h1>
            <div className="card p-4 mb-6">
              <h3 className="font-bold mb-3">Заблокировать IP</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <input className="input-field" placeholder="IP адрес *" value={newIpBan.ip} onChange={e => setNewIpBan({ ...newIpBan, ip: e.target.value })} />
                <input className="input-field" placeholder="Причина" value={newIpBan.reason} onChange={e => setNewIpBan({ ...newIpBan, reason: e.target.value })} />
                <input className="input-field" type="number" placeholder="Часы (0 = навсегда)" value={newIpBan.hours} onChange={e => setNewIpBan({ ...newIpBan, hours: parseInt(e.target.value) || 0 })} />
              </div>
              <button className="btn-primary" onClick={handleBanIp}>Заблокировать</button>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'var(--bg-tertiary)' }}>
                    <th className="text-left p-3 text-xs" style={{ color: 'var(--text-muted)' }}>IP</th>
                    <th className="text-left p-3 text-xs" style={{ color: 'var(--text-muted)' }}>Причина</th>
                    <th className="text-left p-3 text-xs" style={{ color: 'var(--text-muted)' }}>До</th>
                    <th className="text-right p-3 text-xs" style={{ color: 'var(--text-muted)' }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {ipBans.map(ban => (
                    <tr key={ban.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                      <td className="p-3 font-mono text-sm">{ban.ip_cidr}</td>
                      <td className="p-3 text-sm">{ban.reason || '-'}</td>
                      <td className="p-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {ban.until ? new Date(ban.until).toLocaleString() : 'Навсегда'}
                      </td>
                      <td className="p-3 text-right">
                        <button className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)]" onClick={async () => { await adminApi.unbanIp(ban.id); loadAdminData(); }} title="Разбанить">
                          <Ban size={14} style={{ color: 'var(--success)' }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {section === 'sessions' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Активные сессии ({sessions.length})</h1>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'var(--bg-tertiary)' }}>
                    <th className="text-left p-3 text-xs" style={{ color: 'var(--text-muted)' }}>Пользователь</th>
                    <th className="text-left p-3 text-xs" style={{ color: 'var(--text-muted)' }}>IP</th>
                    <th className="text-left p-3 text-xs" style={{ color: 'var(--text-muted)' }}>Устройство</th>
                    <th className="text-left p-3 text-xs" style={{ color: 'var(--text-muted)' }}>Последняя активность</th>
                    <th className="text-right p-3 text-xs" style={{ color: 'var(--text-muted)' }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(session => (
                    <tr key={session.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                      <td className="p-3">
                        <p className="font-medium text-sm">{session.username}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{session.email}</p>
                      </td>
                      <td className="p-3 font-mono text-xs">{session.ip}</td>
                      <td className="p-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {session.user_agent?.substring(0, 50) || '-'}...
                      </td>
                      <td className="p-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(session.last_active).toLocaleString()}
                      </td>
                      <td className="p-3 text-right">
                        <button className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)]" onClick={async () => { await adminApi.revokeSession(session.id); loadAdminData(); }} title="Завершить сессию">
                          <X size={14} style={{ color: 'var(--danger)' }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {section === 'calls' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Видеозвонки пользователям</h1>
            <div className="card p-4 mb-6">
              <h3 className="font-bold mb-3">Отправить видеозвонок</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>ID пользователя</label>
                  <input className="input-field" placeholder="UUID пользователя" value={callUserId} onChange={e => setCallUserId(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>URL видео (необязательно)</label>
                  <input className="input-field" placeholder="https://example.com/video.mp4" value={callVideoUrl} onChange={e => setCallVideoUrl(e.target.value)} />
                </div>
                <button className="btn-primary" onClick={handleCallUser}>
                  <VideoIcon size={16} className="inline mr-2" />
                  Отправить видеозвонок
                </button>
              </div>
            </div>
            <div className="card p-4">
              <h3 className="font-bold mb-3">Как это работает</h3>
              <ul className="text-sm space-y-2" style={{ color: 'var(--text-secondary)' }}>
                <li>✅ Если пользователь <strong>онлайн</strong> — видеозвонок появится сразу</li>
                <li>⏰ Если пользователь <strong>оффлайн</strong> — звонок будет доставлен при следующем входе</li>
                <li>🎥 Можно указать URL видео или отправить только аудиозвонок</li>
                <li>📝 Все действия записываются в Audit Log</li>
              </ul>
            </div>
          </div>
        )}
        {section === 'logs' && (
          <div>
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
