import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Film, Music, Image, Users, Bell, Send, Heart, Share2,
  Bookmark, MoreHorizontal, Plus, X, Phone, Video as VideoIcon, Smile,
  Paperclip, Mic, ArrowLeft, Check, Home, User, Shield, BarChart3,
  FileText, Globe, Lock, Eye, Trash2, Edit, Ban, AlertTriangle,
  ChevronRight, Play, Pause, SkipForward, SkipBack, Volume2, Zap,
  Camera, MessageCircle, Settings, LogOut, Upload, Palette, Search
} from 'lucide-react';

// ═══ ТИПЫ ═══
type Role = 'user' | 'moderator' | 'admin' | 'superadmin';
type Page = 'auth' | 'messenger' | 'feed' | 'videos' | 'shorts' | 'music' | 'profile' | 'admin' | 'stories';

interface UserData {
  id: string; username: string; email: string; role: Role;
  avatar: string; cover: string; bio: string; status: string;
  is_online: number; is_banned: number; ban_reason?: string;
  created_at?: number; followers?: number; following?: number; postsCount?: number;
}
interface ChatData { id: string; type: string; title: string; avatar: string; members: string[]; created_by: string; created_at: number; lastMessage?: any; }
interface MsgData { id: string; chat_id: string; user_id: string; content: string; type: string; reactions?: Record<string, string[]>; created_at: number; }
interface PostData { id: string; user_id: string; content: string; type: string; media?: string[]; likes?: string[]; likes_count: number; comments_count: number; hashtags?: string[]; created_at: number; }
interface StoryData { id: string; user_id: string; media: string; text?: string; expires_at: number; created_at: number; }
interface VideoData { id: string; user_id: string; title: string; description: string; thumbnail: string; duration: number; views_count: number; tags?: string[]; is_short?: number; created_at: number; }
interface MusicData { id: string; user_id: string; title: string; artist: string; duration: number; cover: string; plays_count?: number; created_at: number; }
interface NotifData { id: string; type: string; title: string; body: string; is_read: number; created_at: number; }

// ═══ API КЛИЕНТ ═══
const API = '/api';
let token: string | null = localStorage.getItem('mc_token');

async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const h: any = { 'Content-Type': 'application/json', ...(opts.headers as any || {}) };
  if (token) h['Authorization'] = `Bearer ${token}`;
  const r = await fetch(`${API}${path}`, { ...opts, headers: h });
  if (r.status === 401) { token = null; localStorage.removeItem('mc_token'); localStorage.removeItem('mc_user'); window.location.reload(); throw new Error('Авторизуйтесь'); }
  if (!r.ok) { const e = await r.json().catch(() => ({ error: 'Ошибка' })); throw new Error(e.error || 'Ошибка'); }
  return r.json();
}

const Auth = {
  register: (u: string, e: string, p: string) => api<{ token: string; user: UserData }>('/auth/register', { method: 'POST', body: JSON.stringify({ username: u, email: e, password: p }) }).then(d => { token = d.token; localStorage.setItem('mc_token', d.token); localStorage.setItem('mc_user', JSON.stringify(d.user)); return d; }),
  login: (u: string, p: string) => api<{ token: string; user: UserData }>('/auth/login', { method: 'POST', body: JSON.stringify({ username: u, password: p }) }).then(d => { token = d.token; localStorage.setItem('mc_token', d.token); localStorage.setItem('mc_user', JSON.stringify(d.user)); return d; }),
  logout: () => api('/auth/logout', { method: 'POST' }).catch(() => {}),
  localUser: (): UserData | null => { try { return JSON.parse(localStorage.getItem('mc_user') || 'null'); } catch { return null; } }
};

// ═══ УТИЛИТЫ ═══
const fmtTime = (ts: number) => new Date(ts).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
const fmtAgo = (ts: number) => { const d = Date.now() - ts, m = Math.floor(d / 60000); if (m < 1) return 'сейчас'; if (m < 60) return `${m}м`; const h = Math.floor(m / 60); if (h < 24) return `${h}ч`; return `${Math.floor(h / 24)}д`; };
const fmtDur = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
const avatar = (seed: string) => `https://api.dicebear.com/7.0/avataaars/svg?seed=${seed}`;

// ═══════════════════════════════════════════════════════════
// ГЛАВНЫЙ КОМПОНЕНТ
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState<UserData | null>(Auth.localUser());
  const [page, setPage] = useState<Page>(user ? 'feed' : 'auth');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('mc_theme') as any) || 'dark');

  useEffect(() => { document.documentElement.className = theme; localStorage.setItem('mc_theme', theme); }, [theme]);

  if (!user) return <AuthPage onLogin={u => { setUser(u); setPage('feed'); }} />;

  return (
    <div className="h-screen w-screen flex overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <nav className="w-[72px] h-full flex flex-col items-center py-4 gap-1 border-r shrink-0" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center mb-3 cursor-pointer" onClick={() => setPage('feed')}><Zap size={20} color="white" /></div>
        {[
          { p: 'feed' as Page, i: <Home size={22} />, l: 'Лента' },
          { p: 'messenger' as Page, i: <MessageSquare size={22} />, l: 'Чаты' },
          { p: 'videos' as Page, i: <Film size={22} />, l: 'Видео' },
          { p: 'shorts' as Page, i: <Camera size={22} />, l: 'Shorts' },
          { p: 'music' as Page, i: <Music size={22} />, l: 'Музыка' },
          { p: 'stories' as Page, i: <Camera size={22} />, l: 'Сторис' },
          { p: 'profile' as Page, i: <User size={22} />, l: 'Профиль' },
        ].map(n => (
          <button key={n.p} className={`nav-item w-12 h-12 flex items-center justify-center ${page === n.p ? 'active' : ''}`}
            style={{ color: page === n.p ? 'var(--accent)' : 'var(--text-muted)' }} onClick={() => setPage(n.p)} title={n.l}>{n.i}</button>
        ))}
        {(user.role === 'admin' || user.role === 'superadmin') && (
          <button className={`nav-item w-12 h-12 flex items-center justify-center ${page === 'admin' ? 'active' : ''}`}
            style={{ color: page === 'admin' ? 'var(--accent)' : 'var(--text-muted)' }} onClick={() => setPage('admin')} title="Админ"><Shield size={22} /></button>
        )}
        <div className="flex-1" />
        <button className="nav-item w-12 h-12 flex items-center justify-center" style={{ color: 'var(--text-muted)' }} onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} title="Тема"><Globe size={22} /></button>
        <div className="cursor-pointer relative" onClick={() => { Auth.logout(); setUser(null); setPage('auth'); }}>
          <img src={user.avatar || avatar(user.username)} className="w-9 h-9 rounded-full border-2" style={{ borderColor: 'var(--accent)' }} alt="" />
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 h-full overflow-hidden">
        {page === 'messenger' && <Messenger user={user} />}
        {page === 'feed' && <Feed user={user} />}
        {page === 'videos' && <Videos user={user} />}
        {page === 'shorts' && <Shorts user={user} />}
        {page === 'music' && <MusicPage user={user} />}
        {page === 'profile' && <Profile user={user} onUpdate={setUser} />}
        {page === 'admin' && <Admin user={user} />}
        {page === 'stories' && <Stories user={user} />}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// АВТОРИЗАЦИЯ
// ═══════════════════════════════════════════════════════════
function AuthPage({ onLogin }: { onLogin: (u: UserData) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const r = isLogin ? await Auth.login(username, password) : await Auth.register(username, email, password);
      onLogin(r.user);
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 shadow-lg"><Zap size={36} color="white" /></div>
          <h1 className="text-4xl font-bold gradient-text mb-2">MegaChat</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Мессенджер нового поколения</p>
        </div>
        <div className="rounded-2xl p-8" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <div className="flex gap-2 mb-6">
            <button className={`flex-1 py-3 rounded-xl font-semibold transition-all ${isLogin ? 'gradient-bg text-white' : ''}`}
              style={!isLogin ? { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' } : {}} onClick={() => setIsLogin(true)}>Вход</button>
            <button className={`flex-1 py-3 rounded-xl font-semibold transition-all ${!isLogin ? 'gradient-bg text-white' : ''}`}
              style={isLogin ? { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' } : {}} onClick={() => setIsLogin(false)}>Регистрация</button>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Имя пользователя</label><input className="input-field" value={username} onChange={e => setUsername(e.target.value)} placeholder="username" /></div>
            {!isLogin && <div><label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Email</label><input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" /></div>}
            <div><label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Пароль</label><input className="input-field" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" /></div>
            {error && <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg">{error}</p>}
            <button type="submit" className="btn-primary w-full text-center" disabled={loading}>{loading ? '...' : (isLogin ? 'Войти' : 'Создать аккаунт')}</button>
          </form>
          <div className="mt-6 p-4 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              💡 <strong>Первый зарегистрированный</strong> получает роль <strong>superadmin</strong><br />
              Запустите сервер: <code>cd server && npm start</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ЛЕНТА (Instagram-стиль)
// ═══════════════════════════════════════════════════════════
function Feed({ user }: { user: UserData }) {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => { try { setPosts(await api<PostData[]>('/posts')); } catch {} };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!content.trim()) return;
    const hashtags = content.match(/#\w+/g)?.map(h => h.slice(1)) || [];
    const media = imageUrl ? [imageUrl] : [];
    await api('/posts', { method: 'POST', body: JSON.stringify({ content, type: media.length ? 'photo' : 'text', media, hashtags }) });
    setContent(''); setImageUrl(''); setShowCreate(false);
    load();
  };

  const like = async (id: string) => { await api(`/posts/${id}/like`, { method: 'POST' }); load(); };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto py-6 px-4">
        {/* Stories bar */}
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          <div className="flex flex-col items-center gap-1 shrink-0 cursor-pointer" onClick={() => setShowCreate(true)}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-tertiary)', border: '2px dashed var(--border)' }}><Plus size={24} style={{ color: 'var(--text-muted)' }} /></div>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Создать</span>
          </div>
        </div>

        {/* Create post */}
        {showCreate && (
          <div className="card p-4 mb-6 fade-in">
            <div className="flex items-center gap-3 mb-3">
              <img src={user.avatar || avatar(user.username)} className="w-10 h-10 rounded-full avatar" alt="" />
              <span className="font-semibold">{user.username}</span>
            </div>
            <textarea className="input-field h-24 resize-none mb-3" placeholder="Что у вас нового? Используйте #хэштеги" value={content} onChange={e => setContent(e.target.value)} />
            <input className="input-field mb-3" placeholder="URL изображения (необязательно)" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
            {imageUrl && <img src={imageUrl} className="w-full max-h-48 object-cover rounded-xl mb-3" alt="" />}
            <div className="flex justify-between items-center">
              <div className="flex gap-3">
                <button className="text-sm flex items-center gap-1" style={{ color: 'var(--accent)' }}><Image size={16} /> Фото</button>
                <button className="text-sm flex items-center gap-1" style={{ color: 'var(--accent)' }}><Smile size={16} /> Настроение</button>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary text-sm py-2" onClick={() => setShowCreate(false)}>Отмена</button>
                <button className="btn-primary text-sm py-2" onClick={create}>Опубликовать</button>
              </div>
            </div>
          </div>
        )}

        {/* Posts */}
        {posts.length === 0 && !showCreate && (
          <div className="text-center py-16">
            <FileText size={48} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
            <p className="text-lg font-medium" style={{ color: 'var(--text-muted)' }}>Лента пуста</p>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Создайте первый пост!</p>
            <button className="btn-primary mt-4" onClick={() => setShowCreate(true)}>Создать пост</button>
          </div>
        )}

        {posts.map(post => {
          const liked = post.likes?.includes(user.id);
          return (
            <div key={post.id} className="card mb-4 fade-in">
              <div className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}><User size={18} style={{ color: 'var(--text-muted)' }} /></div>
                <div className="flex-1"><span className="font-semibold text-sm">{post.user_id.slice(0, 8)}</span><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{fmtAgo(post.created_at)}</p></div>
                <button className="p-2 rounded-full hover:bg-[var(--bg-hover)]"><MoreHorizontal size={18} style={{ color: 'var(--text-muted)' }} /></button>
              </div>
              <div className="px-4 pb-3"><p className="text-sm leading-relaxed">{post.content}</p>
                {post.hashtags && post.hashtags.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{post.hashtags.map(h => <span key={h} className="text-xs px-2 py-0.5 rounded-full" style={{ color: 'var(--accent)', background: 'var(--accent-light)' }}>#{h}</span>)}</div>}
              </div>
              {post.media && post.media.length > 0 && <img src={post.media[0]} className="w-full max-h-96 object-cover" alt="" />}
              <div className="p-4 flex items-center justify-between border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-5">
                  <button className="flex items-center gap-1.5 transition-all" onClick={() => like(post.id)}>
                    <Heart size={20} fill={liked ? '#ef4444' : 'none'} style={{ color: liked ? '#ef4444' : 'var(--text-secondary)' }} />
                    <span className="text-sm font-medium">{post.likes_count || 0}</span>
                  </button>
                  <button className="flex items-center gap-1.5"><MessageCircle size={20} style={{ color: 'var(--text-secondary)' }} /><span className="text-sm">{post.comments_count || 0}</span></button>
                  <button className="flex items-center gap-1.5"><Share2 size={20} style={{ color: 'var(--text-secondary)' }} /></button>
                </div>
                <button><Bookmark size={20} style={{ color: 'var(--text-secondary)' }} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// МЕССЕНДЖЕР
// ═══════════════════════════════════════════════════════════
function Messenger({ user }: { user: UserData }) {
  const [chatList, setChatList] = useState<ChatData[]>([]);
  const [selected, setSelected] = useState<ChatData | null>(null);
  const [msgs, setMsgs] = useState<MsgData[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [showList, setShowList] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [chatTitle, setChatTitle] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const loadChats = async () => { try { setChatList(await api<ChatData[]>('/chats')); } catch {} };
  useEffect(() => { loadChats(); }, []);
  useEffect(() => { if (selected) loadMsgs(selected.id); }, [selected?.id]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const loadMsgs = async (id: string) => { try { setMsgs(await api<MsgData[]>(`/chats/${id}/messages`)); } catch {} };

  const send = async () => {
    if (!newMsg.trim() || !selected) return;
    const m = await api<MsgData>(`/chats/${selected.id}/messages`, { method: 'POST', body: JSON.stringify({ content: newMsg.trim() }) });
    setMsgs(p => [...p, m]); setNewMsg('');
  };

  const createChat = async () => {
    if (!chatTitle.trim()) return;
    const c = await api<ChatData>('/chats', { method: 'POST', body: JSON.stringify({ type: 'group', title: chatTitle }) });
    setChatTitle(''); setShowNewChat(false); loadChats();
  };

  const react = async (msgId: string, emoji: string) => { await api(`/messages/${msgId}/react`, { method: 'POST', body: JSON.stringify({ emoji }) }); if (selected) loadMsgs(selected.id); };

  return (
    <div className="h-full flex">
      <div className={`${showList ? 'w-80' : 'w-0 overflow-hidden'} h-full border-r flex flex-col transition-all`} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-xl font-bold">Чаты</h2>
          <button onClick={() => setShowNewChat(!showNewChat)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}><Plus size={16} /></button>
        </div>
        {showNewChat && (
          <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex gap-2"><input className="input-field flex-1 py-2 text-sm" placeholder="Название чата..." value={chatTitle} onChange={e => setChatTitle(e.target.value)} /><button className="btn-primary py-2 px-3 text-sm" onClick={createChat}>Создать</button></div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {chatList.length === 0 ? <p className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Нет чатов. Создайте первый!</p> :
            chatList.map(c => (
              <div key={c.id} className={`p-3 flex items-center gap-3 cursor-pointer border-b ${selected?.id === c.id ? 'bg-[var(--accent-light)]' : 'hover:bg-[var(--bg-hover)]'}`} style={{ borderColor: 'var(--border)' }} onClick={() => { setSelected(c); setShowList(false); }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>{c.type === 'group' ? <Users size={20} style={{ color: 'var(--text-muted)' }} /> : <User size={20} style={{ color: 'var(--text-muted)' }} />}</div>
                <div className="flex-1 min-w-0"><span className="font-semibold text-sm truncate block">{c.title || 'Личный чат'}</span><p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{c.lastMessage?.content?.slice(0, 40) || 'Нет сообщений'}</p></div>
              </div>
            ))}
        </div>
      </div>

      {selected ? (
        <div className="flex-1 flex flex-col h-full">
          <div className="h-16 px-4 flex items-center border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            <button className="md:hidden mr-3" onClick={() => setShowList(true)}><ArrowLeft size={20} /></button>
            <h3 className="font-semibold">{selected.title || 'Чат'}</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: 'var(--bg-primary)' }}>
            {msgs.map(m => {
              const mine = m.user_id === user.id;
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'} fade-in`}>
                  <div className="group relative">
                    <div className={`message-bubble ${mine ? 'message-sent' : 'message-received'}`}>
                      <p className="text-sm">{m.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1"><span className="text-[10px] opacity-60">{fmtTime(m.created_at)}</span>{mine && <Check size={12} className="opacity-60" />}</div>
                    </div>
                    {m.reactions && Object.keys(m.reactions).length > 0 && <div className="flex gap-1 mt-1 ml-3">{Object.entries(m.reactions).map(([e, u]) => <span key={e} className="text-xs px-2 py-0.5 rounded-full cursor-pointer" style={{ background: 'var(--bg-tertiary)' }} onClick={() => react(m.id, e)}>{e} {u.length}</span>)}</div>}
                    <button className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded-full" style={{ background: 'var(--bg-tertiary)' }} onClick={() => react(m.id, '❤️')}><Heart size={14} style={{ color: 'var(--text-muted)' }} /></button>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
          <div className="p-4 border-t flex items-center gap-3" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            <button className="p-2 rounded-full hover:bg-[var(--bg-hover)]"><Paperclip size={20} style={{ color: 'var(--text-secondary)' }} /></button>
            <input className="input-field flex-1" placeholder="Сообщение..." value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
            <button className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center" onClick={send}><Send size={18} color="white" /></button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
          <div className="text-center"><MessageSquare size={64} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" /><h3 className="text-xl font-bold mb-2">Выберите чат</h3><p style={{ color: 'var(--text-muted)' }}>Или создайте новый</p></div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ВИДЕО (YouTube-стиль)
// ═══════════════════════════════════════════════════════════
function Videos({ user }: { user: UserData }) {
  const [list, setList] = useState<VideoData[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [thumb, setThumb] = useState('');
  const [dur, setDur] = useState('');
  const [tags, setTags] = useState('');

  const load = async () => { try { setList(await api<VideoData[]>('/videos?short=false')); } catch {} };
  useEffect(() => { load(); }, []);

  const upload = async () => {
    if (!title.trim()) return;
    await api('/videos', { method: 'POST', body: JSON.stringify({ title, description: desc, thumbnail: thumb, duration: parseInt(dur) || 0, tags: tags.split(',').map(t => t.trim()).filter(Boolean) }) });
    setTitle(''); setDesc(''); setThumb(''); setDur(''); setTags(''); setShowUpload(false);
    load();
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Видео</h1>
          <button className="btn-primary flex items-center gap-2" onClick={() => setShowUpload(!showUpload)}><Upload size={16} /> Загрузить</button>
        </div>
        {showUpload && (
          <div className="card p-4 mb-6 fade-in">
            <h3 className="font-bold mb-3">Загрузить видео</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className="input-field" placeholder="Название *" value={title} onChange={e => setTitle(e.target.value)} />
              <input className="input-field" placeholder="URL превью" value={thumb} onChange={e => setThumb(e.target.value)} />
              <input className="input-field" placeholder="Длительность (сек)" value={dur} onChange={e => setDur(e.target.value)} />
              <input className="input-field" placeholder="Теги (через запятую)" value={tags} onChange={e => setTags(e.target.value)} />
            </div>
            <textarea className="input-field mt-3 h-20 resize-none" placeholder="Описание" value={desc} onChange={e => setDesc(e.target.value)} />
            <div className="flex justify-end gap-2 mt-3"><button className="btn-secondary" onClick={() => setShowUpload(false)}>Отмена</button><button className="btn-primary" onClick={upload}>Загрузить</button></div>
          </div>
        )}
        {list.length === 0 ? (
          <div className="text-center py-16"><Film size={48} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" /><p style={{ color: 'var(--text-muted)' }}>Нет видео. Загрузите первое!</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map(v => (
              <div key={v.id} className="video-card">
                <div className="relative"><img src={v.thumbnail || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400'} className="w-full aspect-video object-cover" alt="" /><span className="duration">{fmtDur(v.duration)}</span></div>
                <div className="p-3"><h3 className="font-semibold text-sm">{v.title}</h3><p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{v.views_count} просм. • {fmtAgo(v.created_at)}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SHORTS (TikTok-стиль)
// ═══════════════════════════════════════════════════════════
function Shorts({ user }: { user: UserData }) {
  const [list, setList] = useState<VideoData[]>([]);
  const [idx, setIdx] = useState(0);
  useEffect(() => { api<VideoData[]>('/videos?short=true').then(setList).catch(() => {}); }, []);

  return (
    <div className="h-full flex items-center justify-center" style={{ background: '#000' }}>
      {list.length === 0 ? (
        <div className="text-center"><Camera size={48} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" /><p className="text-white">Нет коротких видео</p></div>
      ) : list[idx] && (
        <div className="relative w-full max-w-sm h-full max-h-[80vh] rounded-3xl overflow-hidden">
          <img src={list[idx].thumbnail || ''} className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6">
            <button className="flex flex-col items-center"><div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}><Heart size={24} color="white" /></div></button>
            <button className="flex flex-col items-center"><div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}><MessageSquare size={24} color="white" /></div></button>
            <button className="flex flex-col items-center"><div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}><Share2 size={24} color="white" /></div></button>
          </div>
          <div className="absolute bottom-6 left-4 right-16"><p className="text-white font-semibold">{list[idx].title}</p></div>
          <div className="absolute top-1/2 left-0 right-0 flex justify-between px-2">
            <button className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }} onClick={() => setIdx(Math.max(0, idx - 1))}><ChevronRight size={20} color="white" className="rotate-180" /></button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }} onClick={() => setIdx(Math.min(list.length - 1, idx + 1))}><ChevronRight size={20} color="white" /></button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// МУЗЫКА
// ═══════════════════════════════════════════════════════════
function MusicPage({ user }: { user: UserData }) {
  const [tracks, setTracks] = useState<MusicData[]>([]);
  const [cur, setCur] = useState<MusicData | null>(null);
  const [playing, setPlaying] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [cover, setCover] = useState('');
  const [dur, setDur] = useState('');

  const load = async () => { try { setTracks(await api<MusicData[]>('/music')); } catch {} };
  useEffect(() => { load(); }, []);

  const upload = async () => {
    if (!title.trim()) return;
    await api('/music', { method: 'POST', body: JSON.stringify({ title, artist, duration: parseInt(dur) || 0, cover }) });
    setTitle(''); setArtist(''); setCover(''); setDur(''); setShowUpload(false);
    load();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Музыка</h1>
            <button className="btn-primary flex items-center gap-2" onClick={() => setShowUpload(!showUpload)}><Upload size={16} /> Загрузить</button>
          </div>
          {showUpload && (
            <div className="card p-4 mb-6 fade-in">
              <h3 className="font-bold mb-3">Загрузить трек</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input className="input-field" placeholder="Название *" value={title} onChange={e => setTitle(e.target.value)} />
                <input className="input-field" placeholder="Исполнитель" value={artist} onChange={e => setArtist(e.target.value)} />
                <input className="input-field" placeholder="Длительность (сек)" value={dur} onChange={e => setDur(e.target.value)} />
                <input className="input-field" placeholder="URL обложки" value={cover} onChange={e => setCover(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2 mt-3"><button className="btn-secondary" onClick={() => setShowUpload(false)}>Отмена</button><button className="btn-primary" onClick={upload}>Загрузить</button></div>
            </div>
          )}
          {tracks.length === 0 ? (
            <div className="text-center py-16"><Music size={48} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" /><p style={{ color: 'var(--text-muted)' }}>Нет треков</p></div>
          ) : (
            <div className="space-y-1">
              {tracks.map((t, i) => (
                <div key={t.id} className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all ${cur?.id === t.id ? '' : 'hover:bg-[var(--bg-hover)]'}`}
                  style={cur?.id === t.id ? { background: 'var(--accent-light)' } : {}} onClick={() => { setCur(t); setPlaying(true); }}>
                  <span className="w-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>{cur?.id === t.id && playing ? <div className="music-wave"><span /><span /><span /><span /></div> : i + 1}</span>
                  <img src={t.cover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100'} className="w-12 h-12 rounded-lg object-cover" alt="" />
                  <div className="flex-1 min-w-0"><p className={`font-medium text-sm truncate ${cur?.id === t.id ? 'text-[var(--accent)]' : ''}`}>{t.title}</p><p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{t.artist}</p></div>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{fmtDur(t.duration)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {cur && (
        <div className="h-20 border-t flex items-center px-4 gap-4" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <img src={cur.cover || ''} className="w-12 h-12 rounded-lg object-cover" alt="" />
          <div className="w-40 min-w-0"><p className="font-medium text-sm truncate">{cur.title}</p><p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{cur.artist}</p></div>
          <div className="flex-1 flex items-center justify-center gap-4">
            <button><SkipBack size={18} /></button>
            <button className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center" onClick={() => setPlaying(!playing)}>{playing ? <Pause size={18} color="white" /> : <Play size={18} color="white" fill="white" />}</button>
            <button><SkipForward size={18} /></button>
          </div>
          <Volume2 size={16} style={{ color: 'var(--text-muted)' }} />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ПРОФИЛЬ (с кастомизацией)
// ═══════════════════════════════════════════════════════════
function Profile({ user, onUpdate }: { user: UserData; onUpdate: (u: UserData) => void }) {
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(user.bio || '');
  const [status, setStatus] = useState(user.status || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || '');
  const [coverUrl, setCoverUrl] = useState(user.cover || '');
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<PostData[]>([]);

  useEffect(() => {
    api<any>(`/users/${user.id}`).then(setProfile).catch(() => {});
    api<PostData[]>('/posts').then(p => setPosts(p.filter(x => x.user_id === user.id))).catch(() => {});
  }, [user.id]);

  const save = async () => {
    await api('/users/me', { method: 'PUT', body: JSON.stringify({ bio, status, avatar: avatarUrl, cover: coverUrl }) });
    const updated = { ...user, bio, status, avatar: avatarUrl, cover: coverUrl };
    localStorage.setItem('mc_user', JSON.stringify(updated));
    onUpdate(updated);
    setEditing(false);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Cover */}
        <div className="h-52 relative" style={{ background: coverUrl ? 'none' : 'var(--gradient-1)' }}>
          {coverUrl && <img src={coverUrl} className="w-full h-full object-cover" alt="" />}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
          {editing && <button className="absolute top-4 right-4 btn-secondary text-xs" onClick={() => { const u = prompt('URL обложки:'); if (u) setCoverUrl(u); }}><Camera size={14} className="inline mr-1" />Обложка</button>}
        </div>

        <div className="px-6 -mt-16 relative">
          <div className="flex items-end gap-4">
            <div className="relative">
              <img src={avatarUrl || avatar(user.username)} className="w-32 h-32 rounded-full avatar border-4" style={{ borderColor: 'var(--bg-primary)' }} alt="" />
              {editing && <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full gradient-bg flex items-center justify-center" onClick={() => { const u = prompt('URL аватара:'); if (u) setAvatarUrl(u); }}><Camera size={14} color="white" /></button>}
            </div>
            <div className="pb-4 flex-1">
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{bio || user.bio || 'Нет описания'}</p>
              {status && <p className="text-xs mt-1" style={{ color: 'var(--accent)' }}>{status}</p>}
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm"><strong>{profile?.followers || 0}</strong> <span style={{ color: 'var(--text-muted)' }}>подписчиков</span></span>
                <span className="text-sm"><strong>{profile?.following || 0}</strong> <span style={{ color: 'var(--text-muted)' }}>подписок</span></span>
                <span className="text-sm"><strong>{posts.length}</strong> <span style={{ color: 'var(--text-muted)' }}>постов</span></span>
              </div>
            </div>
            <div className="pb-4 flex gap-2">
              {editing ? (
                <><button className="btn-primary text-sm" onClick={save}>Сохранить</button><button className="btn-secondary text-sm" onClick={() => setEditing(false)}>Отмена</button></>
              ) : (
                <button className="btn-primary text-sm flex items-center gap-2" onClick={() => setEditing(true)}><Edit size={14} /> Редактировать</button>
              )}
            </div>
          </div>

          {/* Edit form */}
          {editing && (
            <div className="card p-4 mt-4 fade-in">
              <h3 className="font-bold mb-3 flex items-center gap-2"><Palette size={18} /> Кастомизация профиля</h3>
              <div className="space-y-3">
                <div><label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>О себе</label><textarea className="input-field h-20 resize-none" value={bio} onChange={e => setBio(e.target.value)} placeholder="Расскажите о себе..." /></div>
                <div><label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>Статус</label><input className="input-field" value={status} onChange={e => setStatus(e.target.value)} placeholder="🟢 В сети" /></div>
                <div><label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>URL аватара</label><input className="input-field" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://..." /></div>
                <div><label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>URL обложки</label><input className="input-field" value={coverUrl} onChange={e => setCoverUrl(e.target.value)} placeholder="https://..." /></div>
              </div>
            </div>
          )}

          {/* Posts */}
          <div className="py-6">
            <h2 className="text-lg font-bold mb-4">Мои посты</h2>
            {posts.length === 0 ? <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Нет постов</p> :
              posts.map(p => (
                <div key={p.id} className="card p-4 mb-4">
                  <p className="text-sm">{p.content}</p>
                  {p.media && p.media.length > 0 && <img src={p.media[0]} className="w-full rounded-xl mt-3 max-h-48 object-cover" alt="" />}
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>❤️ {p.likes_count}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{fmtAgo(p.created_at)}</span>
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
function Stories({ user }: { user: UserData }) {
  const [list, setList] = useState<StoryData[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [media, setMedia] = useState('');
  const [text, setText] = useState('');

  const load = async () => { try { setList(await api<StoryData[]>('/stories')); } catch {} };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!media.trim()) return;
    await api('/stories', { method: 'POST', body: JSON.stringify({ media, text }) });
    setMedia(''); setText(''); setShowCreate(false);
    load();
  };

  return (
    <div className="h-full flex items-center justify-center" style={{ background: '#000' }}>
      {list.length === 0 && !showCreate ? (
        <div className="text-center">
          <Camera size={48} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Нет активных сторис</h3>
          <button className="btn-primary mt-4" onClick={() => setShowCreate(true)}>Создать сторис</button>
        </div>
      ) : showCreate ? (
        <div className="w-full max-w-md mx-4">
          <div className="rounded-2xl p-6" style={{ background: 'var(--bg-secondary)' }}>
            <h3 className="text-lg font-bold text-white mb-4">Создать сторис</h3>
            <input className="input-field mb-3" placeholder="URL изображения *" value={media} onChange={e => setMedia(e.target.value)} />
            <textarea className="input-field h-20 resize-none mb-3" placeholder="Текст (необязательно)" value={text} onChange={e => setText(e.target.value)} />
            {media && <img src={media} className="w-full rounded-xl mb-3 max-h-48 object-cover" alt="" />}
            <div className="flex justify-end gap-2"><button className="btn-secondary" onClick={() => setShowCreate(false)}>Отмена</button><button className="btn-primary" onClick={create}>Опубликовать</button></div>
          </div>
        </div>
      ) : (
        <div className="relative w-full max-w-sm h-full max-h-[85vh] rounded-3xl overflow-hidden">
          <img src={list[0]?.media || ''} className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
          {list[0]?.text && <div className="absolute bottom-20 left-4 right-4"><p className="text-white text-lg font-medium text-center">{list[0].text}</p></div>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// АДМИН-ПАНЕЛЬ
// ═══════════════════════════════════════════════════════════
function Admin({ user }: { user: UserData }) {
  const [section, setSection] = useState('dashboard');
  const [stats, setStats] = useState<any>({});
  const [adminUsers, setAdminUsers] = useState<UserData[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [audit, setAudit] = useState<any[]>([]);

  const load = async () => {
    try { setStats(await api('/admin/stats')); setAdminUsers(await api('/admin/users')); setReports(await api('/admin/reports')); setAudit(await api('/admin/audit-log')); } catch {}
  };
  useEffect(() => { load(); }, []);

  const sections = [
    { id: 'dashboard', label: 'Дашборд', icon: <BarChart3 size={18} /> },
    { id: 'users', label: 'Пользователи', icon: <Users size={18} /> },
    { id: 'reports', label: 'Жалобы', icon: <AlertTriangle size={18} /> },
    { id: 'security', label: 'Безопасность', icon: <Lock size={18} /> },
    { id: 'logs', label: 'Логи', icon: <Eye size={18} /> },
  ];

  return (
    <div className="h-full flex">
      <div className="w-56 h-full border-r p-4 flex flex-col shrink-0" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 mb-6"><Shield size={20} style={{ color: 'var(--accent)' }} /><span className="font-bold">Админ</span></div>
        <div className="space-y-1 flex-1">{sections.map(s => <div key={s.id} className={`admin-sidebar-item ${section === s.id ? 'active' : ''}`} onClick={() => setSection(s.id)}>{s.icon}<span>{s.label}</span></div>)}</div>
      </div>
      <div className="flex-1 h-full overflow-y-auto p-6">
        {section === 'dashboard' && (
          <div className="fade-in">
            <h1 className="text-2xl font-bold mb-6">Дашборд</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[{ l: 'Пользователи', v: stats.users || 0, c: 'from-blue-500 to-cyan-500' }, { l: 'Посты', v: stats.posts || 0, c: 'from-purple-500 to-pink-500' }, { l: 'Видео', v: stats.videos || 0, c: 'from-orange-500 to-red-500' }, { l: 'Сообщения', v: stats.messages || 0, c: 'from-green-500 to-teal-500' }].map(s => (
                <div key={s.l} className="stat-card"><div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.c} flex items-center justify-center mb-3`}><BarChart3 size={18} color="white" /></div><p className="text-2xl font-bold">{s.v}</p><p className="text-sm" style={{ color: 'var(--text-muted)' }}>{s.l}</p></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="stat-card"><h3 className="font-bold mb-2">Онлайн: {stats.online || 0}</h3><p className="text-sm" style={{ color: 'var(--text-muted)' }}>Жалоб: {stats.reports || 0}</p></div>
              <div className="stat-card"><h3 className="font-bold mb-2">База данных</h3><p className="text-sm" style={{ color: 'var(--text-muted)' }}>SQLite • WAL • messenger.db</p></div>
            </div>
          </div>
        )}
        {section === 'users' && (
          <div className="fade-in">
            <h1 className="text-2xl font-bold mb-6">Пользователи ({adminUsers.length})</h1>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <table className="w-full"><thead><tr style={{ background: 'var(--bg-tertiary)' }}><th className="text-left p-3 text-xs" style={{ color: 'var(--text-muted)' }}>Пользователь</th><th className="text-left p-3 text-xs" style={{ color: 'var(--text-muted)' }}>Роль</th><th className="text-left p-3 text-xs" style={{ color: 'var(--text-muted)' }}>Статус</th><th className="text-right p-3 text-xs" style={{ color: 'var(--text-muted)' }}>Действия</th></tr></thead>
                <tbody>{adminUsers.map(u => (
                  <tr key={u.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                    <td className="p-3"><div className="flex items-center gap-3"><img src={u.avatar || avatar(u.username)} className="w-8 h-8 rounded-full avatar" alt="" /><div><p className="font-medium text-sm">{u.username}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</p></div></div></td>
                    <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'superadmin' ? 'bg-yellow-500/20 text-yellow-400' : u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'}`}>{u.role}</span></td>
                    <td className="p-3">{u.is_banned ? <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">Бан</span> : <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Активен</span>}</td>
                    <td className="p-3 text-right"><div className="flex justify-end gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)]" onClick={async () => { await api(`/admin/users/${u.id}/${u.is_banned ? 'unban' : 'ban'}`, { method: 'PUT', body: JSON.stringify({ reason: 'Нарушение' }) }); load(); }}><Ban size={14} style={{ color: u.is_banned ? 'var(--success)' : 'var(--danger)' }} /></button>
                      {user.role === 'superadmin' && u.id !== user.id && <button className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)]" onClick={async () => { if (confirm('Удалить?')) { await api(`/admin/users/${u.id}`, { method: 'DELETE' }); load(); } }}><Trash2 size={14} style={{ color: 'var(--danger)' }} /></button>}
                    </div></td>
                  </tr>
                ))}</tbody></table>
            </div>
          </div>
        )}
        {section === 'reports' && (<div className="fade-in"><h1 className="text-2xl font-bold mb-6">Жалобы</h1>{reports.length === 0 ? <div className="text-center py-12"><AlertTriangle size={48} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" /><p style={{ color: 'var(--text-muted)' }}>Нет жалоб 🎉</p></div> : reports.map(r => (<div key={r.id} className="stat-card mb-3 flex items-center justify-between"><div><p className="font-medium text-sm">{r.reason}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.target_type} • {r.status}</p></div><div className="flex gap-2"><button className="btn-secondary text-xs py-1 px-3" onClick={async () => { await api(`/admin/reports/${r.id}`, { method: 'PUT', body: JSON.stringify({ status: 'dismissed' }) }); load(); }}>Отклонить</button><button className="btn-primary text-xs py-1 px-3" onClick={async () => { await api(`/admin/reports/${r.id}`, { method: 'PUT', body: JSON.stringify({ status: 'resolved' }) }); load(); }}>Решить</button></div></div>))}</div>)}
        {section === 'security' && (<div className="fade-in"><h1 className="text-2xl font-bold mb-6">Безопасность</h1><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="stat-card"><h4 className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>bcrypt</h4><p className="text-2xl font-bold">12 rounds</p></div><div className="stat-card"><h4 className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>JWT</h4><p className="text-sm text-green-400">Активен ✓</p></div><div className="stat-card"><h4 className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Helmet</h4><p className="text-sm text-green-400">Активен ✓</p></div></div></div>)}
        {section === 'logs' && (<div className="fade-in"><h1 className="text-2xl font-bold mb-6">Audit Log</h1><div className="stat-card">{audit.length === 0 ? <p className="text-center py-4" style={{ color: 'var(--text-muted)' }}>Нет записей</p> : <div className="font-mono text-xs space-y-1 max-h-96 overflow-y-auto">{audit.map(l => (<div key={l.id} className="flex gap-3 p-1 rounded hover:bg-[var(--bg-tertiary)]"><span style={{ color: 'var(--text-muted)' }}>{new Date(l.created_at).toLocaleString()}</span><span style={{ color: 'var(--accent)' }}>[{l.action}]</span><span style={{ color: 'var(--text-secondary)' }}>{l.details}</span></div>))}</div>}</div></div>)}
      </div>
    </div>
  );
}
