import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageSquare, Video, Music, Image, Users, Bell, Search, Settings, 
  Send, Heart, Share2, Bookmark, MoreHorizontal, Plus, X, Phone, 
  VideoIcon, Smile, Paperclip, Mic, ArrowLeft, Check, CheckCheck,
  Home, Compass, TrendingUp, User, Shield, BarChart3, FileText,
  Globe, Lock, Database, Mail, Eye, Trash2, Edit, Ban, Star,
  ChevronRight, ChevronDown, Play, Pause, SkipForward, SkipBack,
  Volume2, Repeat, Shuffle, Clock, Hash, AtSign, Gift, Gamepad2,
  Radio, Film, Camera, CircleDot, Zap, Crown, AlertTriangle
} from 'lucide-react';
import { User as UserType, Chat, Message, Post, Video as VideoType, Story, MusicTrack, Notification, Report } from './types';
import * as store from './store';

// ═══════════════════════════════════════════════════════════
// ГЛАВНЫЙ КОМПОНЕНТ ПРИЛОЖЕНИЯ
// ═══════════════════════════════════════════════════════════

type Page = 'auth' | 'messenger' | 'feed' | 'videos' | 'shorts' | 'music' | 'profile' | 'admin' | 'stories' | 'calls';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(store.getCurrentUser());
  const [page, setPage] = useState<Page>(currentUser ? 'messenger' : 'auth');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    store.seedDatabase();
    const user = store.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setNotifications(store.getNotifications(user.id));
    }
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const handleLogin = (user: UserType) => {
    setCurrentUser(user);
    store.setCurrentUser(user);
    setPage('messenger');
    setNotifications(store.getNotifications(user.id));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    store.setCurrentUser(null);
    setPage('auth');
  };

  if (!currentUser || page === 'auth') {
    return <AuthPage onLogin={handleLogin} />;
  }

  const unreadNotifs = notifications.filter(n => !n.isRead).length;

  return (
    <div className="h-screen w-screen flex overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar Navigation */}
      <nav className="w-[72px] h-full flex flex-col items-center py-4 gap-2 border-r" 
           style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center mb-4 cursor-pointer"
             onClick={() => setPage('messenger')}>
          <Zap size={20} color="white" />
        </div>
        
        <NavButton icon={<MessageSquare size={22} />} label="Чаты" active={page === 'messenger'} onClick={() => setPage('messenger')} />
        <NavButton icon={<Home size={22} />} label="Лента" active={page === 'feed'} onClick={() => setPage('feed')} />
        <NavButton icon={<Film size={22} />} label="Видео" active={page === 'videos'} onClick={() => setPage('videos')} />
        <NavButton icon={<CircleDot size={22} />} label="Shorts" active={page === 'shorts'} onClick={() => setPage('shorts')} />
        <NavButton icon={<Music size={22} />} label="Музыка" active={page === 'music'} onClick={() => setPage('music')} />
        <NavButton icon={<Camera size={22} />} label="Сторис" active={page === 'stories'} onClick={() => setPage('stories')} />
        <NavButton icon={<User size={22} />} label="Профиль" active={page === 'profile'} onClick={() => setPage('profile')} />
        
        {(currentUser.role === 'admin' || currentUser.role === 'superadmin') && (
          <NavButton icon={<Shield size={22} />} label="Админ" active={page === 'admin'} onClick={() => setPage('admin')} badge={store.getReports().filter(r => r.status === 'pending').length || undefined} />
        )}

        <div className="flex-1" />
        
        <NavButton icon={<Bell size={22} />} label="Уведомления" active={false} onClick={() => setShowNotif(!showNotif)} badge={unreadNotifs || undefined} />
        <NavButton icon={theme === 'dark' ? <Globe size={22} /> : <Globe size={22} />} label="Тема" active={false} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
        <div className="relative cursor-pointer" onClick={handleLogout}>
          <img src={currentUser.avatar} className="w-9 h-9 rounded-full border-2" 
               style={{ borderColor: 'var(--accent)' }} alt="" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-hidden relative">
        {page === 'messenger' && <MessengerPage user={currentUser} />}
        {page === 'feed' && <FeedPage user={currentUser} />}
        {page === 'videos' && <VideosPage user={currentUser} />}
        {page === 'shorts' && <ShortsPage user={currentUser} />}
        {page === 'music' && <MusicPage user={currentUser} />}
        {page === 'profile' && <ProfilePage user={currentUser} />}
        {page === 'admin' && <AdminPanel user={currentUser} />}
        {page === 'stories' && <StoriesPage user={currentUser} />}
        {page === 'calls' && <CallsPage user={currentUser} />}
      </main>

      {/* Notifications Panel */}
      {showNotif && (
        <div className="absolute right-4 top-4 w-80 max-h-96 overflow-y-auto rounded-2xl shadow-2xl z-50 fade-in"
             style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-bold">Уведомления</h3>
            <button onClick={() => setShowNotif(false)}><X size={18} /></button>
          </div>
          {notifications.length === 0 ? (
            <p className="p-4 text-center" style={{ color: 'var(--text-muted)' }}>Нет уведомлений</p>
          ) : (
            notifications.slice(0, 20).map(n => (
              <div key={n.id} className="p-3 border-b flex gap-3 items-start hover:opacity-80 cursor-pointer" 
                   style={{ borderColor: 'var(--border)', opacity: n.isRead ? 0.6 : 1 }}>
                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
                  {n.type === 'like' ? <Heart size={14} color="white" /> : 
                   n.type === 'message' ? <MessageSquare size={14} color="white" /> :
                   <Bell size={14} color="white" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{n.body}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Search Overlay */}
      {showSearch && (
        <div className="absolute inset-0 z-50 flex items-start justify-center pt-20" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-lg mx-4 rounded-2xl shadow-2xl" style={{ background: 'var(--bg-secondary)' }}>
            <div className="p-4 flex items-center gap-3">
              <Search size={20} style={{ color: 'var(--text-muted)' }} />
              <input className="flex-1 bg-transparent outline-none text-lg" 
                     placeholder="Поиск людей, чатов, постов..."
                     value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus />
              <button onClick={() => { setShowSearch(false); setSearchQuery(''); }}>
                <X size={20} />
              </button>
            </div>
            {searchQuery && <SearchResults query={searchQuery} />}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// НАВИГАЦИОННАЯ КНОПКА
// ═══════════════════════════════════════════════════════════

function NavButton({ icon, label, active, onClick, badge }: { 
  icon: React.ReactNode; label: string; active: boolean; onClick: () => void; badge?: number 
}) {
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
// СТРАНИЦА АВТОРИЗАЦИИ
// ═══════════════════════════════════════════════════════════

function AuthPage({ onLogin }: { onLogin: (user: UserType) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const user = store.getUserByUsername(username);
      if (!user) { setError('Пользователь не найден'); return; }
      if (user.password !== password) { setError('Неверный пароль'); return; }
      if (user.isBanned) { setError(`Аккаунт заблокирован: ${user.banReason}`); return; }
      store.updateUser(user.id, { isOnline: true, lastSeen: Date.now() });
      onLogin(user);
    } else {
      if (!username || !email || !password) { setError('Заполните все поля'); return; }
      if (password.length < 6) { setError('Пароль минимум 6 символов'); return; }
      if (store.getUserByUsername(username)) { setError('Имя занято'); return; }
      const user = store.createUser({ username, email, password });
      store.updateUser(user.id, { isOnline: true });
      onLogin(user);
    }
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
            <button type="submit" className="btn-primary w-full text-center">{isLogin ? 'Войти' : 'Создать аккаунт'}</button>
          </form>

          <div className="mt-6 p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              <strong>Тестовые аккаунты:</strong><br/>
              admin / Admin123! (админ)<br/>
              alice / pass123 (пользователь)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// СТРАНИЦА МЕССЕНДЖЕРА (Telegram-стиль)
// ═══════════════════════════════════════════════════════════

function MessengerPage({ user }: { user: UserType }) {
  const [chats, setChats] = useState<Chat[]>(store.getUserChats(user.id));
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChatList, setShowChatList] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showEmoji, setShowEmoji] = useState(false);

  useEffect(() => {
    if (selectedChat) {
      setMessages(store.getChatMessages(selectedChat.id));
      const timer = setInterval(() => {
        setMessages(store.getChatMessages(selectedChat.id));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !selectedChat) return;
    store.sendMessage({
      chatId: selectedChat.id,
      userId: user.id,
      content: newMessage.trim(),
      type: 'text',
      replyTo: replyTo?.id,
    });
    setNewMessage('');
    setReplyTo(null);
    setMessages(store.getChatMessages(selectedChat.id));
    setChats(store.getUserChats(user.id));
  };

  const handleReaction = (msgId: string, emoji: string) => {
    const msgs = store.getMessages();
    const idx = msgs.findIndex(m => m.id === msgId);
    if (idx === -1) return;
    if (!msgs[idx].reactions[emoji]) msgs[idx].reactions[emoji] = [];
    const rIdx = msgs[idx].reactions[emoji].indexOf(user.id);
    if (rIdx > -1) msgs[idx].reactions[emoji].splice(rIdx, 1);
    else msgs[idx].reactions[emoji].push(user.id);
    if (msgs[idx].reactions[emoji].length === 0) delete msgs[idx].reactions[emoji];
    store.saveMessages(msgs);
    setMessages(store.getChatMessages(selectedChat!.id));
  };

  const getUserById = (id: string) => store.getUser(id);
  const emojis = ['❤️', '😂', '😮', '😢', '🔥', '👍', '👎', '🎉'];

  return (
    <div className="h-full flex">
      {/* Список чатов */}
      <div className={`${showChatList ? 'w-80' : 'w-0 overflow-hidden'} h-full border-r flex flex-col transition-all`}
           style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-xl font-bold">Чаты</h2>
          <div className="flex gap-2">
            <button onClick={() => setShowChatList(false)} className="md:hidden"><ArrowLeft size={20} /></button>
            <button onClick={() => setShowNewChat(true)} className="w-8 h-8 rounded-full flex items-center justify-center" 
                    style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
              <Edit size={16} />
            </button>
          </div>
        </div>
        
        {/* Поиск */}
        <div className="p-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input className="input-field pl-9 py-2 text-sm" placeholder="Поиск чатов..." />
          </div>
        </div>

        {/* Список */}
        <div className="flex-1 overflow-y-auto">
          {chats.map(chat => {
            const chatMsgs = store.getChatMessages(chat.id);
            const lastMsg = chatMsgs[chatMsgs.length - 1];
            const otherUser = chat.type === 'private' 
              ? getUserById(chat.members.find(m => m !== user.id) || '')
              : null;
            
            return (
              <div key={chat.id} 
                   className={`p-3 flex items-center gap-3 cursor-pointer transition-all border-b ${selectedChat?.id === chat.id ? 'bg-[var(--accent-light)]' : 'hover:bg-[var(--bg-hover)]'}`}
                   style={{ borderColor: 'var(--border)' }}
                   onClick={() => { setSelectedChat(chat); setShowChatList(false); }}>
                <div className="relative flex-shrink-0">
                  <img src={chat.avatar || otherUser?.avatar || ''} className="w-12 h-12 rounded-full avatar" alt="" />
                  {otherUser?.isOnline && <div className="online-dot" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm truncate">
                      {chat.type === 'private' ? (otherUser?.username || 'Удалён') : chat.title}
                    </span>
                    {lastMsg && (
                      <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                        {formatTime(lastMsg.createdAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                      {lastMsg ? (lastMsg.type === 'text' ? lastMsg.content : '📎 Медиа') : 'Нет сообщений'}
                    </p>
                    {chat.unreadCount > 0 && <span className="badge ml-2">{chat.unreadCount}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Область чата */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col h-full">
          {/* Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            <div className="flex items-center gap-3">
              <button className="md:hidden" onClick={() => setShowChatList(true)}><ArrowLeft size={20} /></button>
              <img src={selectedChat.avatar || ''} className="w-10 h-10 rounded-full avatar" alt="" />
              <div>
                <h3 className="font-semibold text-sm">{selectedChat.title || getUserById(selectedChat.members.find(m => m !== user.id) || '')?.username}</h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {selectedChat.type === 'private' ? 'в сети' : `${selectedChat.members.length} участников`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-full hover:bg-[var(--bg-hover)]"><Phone size={18} style={{ color: 'var(--text-secondary)' }} /></button>
              <button className="p-2 rounded-full hover:bg-[var(--bg-hover)]"><VideoIcon size={18} style={{ color: 'var(--text-secondary)' }} /></button>
              <button className="p-2 rounded-full hover:bg-[var(--bg-hover)]"><Search size={18} style={{ color: 'var(--text-secondary)' }} /></button>
              <button className="p-2 rounded-full hover:bg-[var(--bg-hover)]"><MoreHorizontal size={18} style={{ color: 'var(--text-secondary)' }} /></button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: 'var(--bg-primary)' }}>
            {messages.map(msg => {
              const isMine = msg.userId === user.id;
              const sender = getUserById(msg.userId);
              const replyMsg = msg.replyTo ? messages.find(m => m.id === msg.replyTo) : null;
              
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} fade-in`}>
                  <div className="group relative">
                    {!isMine && selectedChat.type !== 'private' && (
                      <p className="text-xs mb-1 ml-3 font-medium" style={{ color: 'var(--accent)' }}>{sender?.username}</p>
                    )}
                    {replyMsg && (
                      <div className="ml-3 mb-1 px-3 py-1 rounded-lg text-xs border-l-2" 
                           style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--accent)', color: 'var(--text-secondary)' }}>
                        {replyMsg.content.slice(0, 50)}
                      </div>
                    )}
                    <div className={`message-bubble ${isMine ? 'message-sent' : 'message-received'}`}>
                      <p className="text-sm">{msg.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[10px] opacity-60">{formatTime(msg.createdAt)}</span>
                        {isMine && (
                          msg.readBy.length > 0 
                            ? <CheckCheck size={12} className="opacity-60" /> 
                            : <Check size={12} className="opacity-60" />
                        )}
                      </div>
                    </div>
                    
                    {/* Reactions */}
                    {Object.keys(msg.reactions).length > 0 && (
                      <div className="flex gap-1 mt-1 ml-3">
                        {Object.entries(msg.reactions).map(([emoji, users]) => (
                          <span key={emoji} className="text-xs px-2 py-0.5 rounded-full cursor-pointer"
                                style={{ background: 'var(--bg-tertiary)' }}
                                onClick={() => handleReaction(msg.id, emoji)}>
                            {emoji} {users.length}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Reaction button */}
                    <button className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full"
                            style={{ background: 'var(--bg-tertiary)' }}
                            onClick={() => handleReaction(msg.id, '❤️')}>
                      <Smile size={14} style={{ color: 'var(--text-muted)' }} />
                    </button>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply indicator */}
          {replyTo && (
            <div className="px-4 py-2 flex items-center gap-2 border-t" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <ArrowLeft size={14} style={{ color: 'var(--accent)' }} />
              <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>
                Ответ: {replyTo.content.slice(0, 50)}
              </span>
              <button onClick={() => setReplyTo(null)}><X size={14} /></button>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t flex items-center gap-3" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            <button className="p-2 rounded-full hover:bg-[var(--bg-hover)]"><Paperclip size={20} style={{ color: 'var(--text-secondary)' }} /></button>
            <div className="flex-1 relative">
              <input className="input-field pr-10" placeholder="Сообщение..." value={newMessage} 
                     onChange={e => setNewMessage(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && handleSend()} />
              <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowEmoji(!showEmoji)}>
                <Smile size={18} style={{ color: 'var(--text-muted)' }} />
              </button>
              {showEmoji && (
                <div className="absolute bottom-12 right-0 reaction-popup z-10">
                  {['😀','😂','❤️','🔥','👍','🎉','😢','🤔'].map(e => (
                    <button key={e} onClick={() => { setNewMessage(prev => prev + e); setShowEmoji(false); }}>{e}</button>
                  ))}
                </div>
              )}
            </div>
            <button className="p-2 rounded-full hover:bg-[var(--bg-hover)]"><Mic size={20} style={{ color: 'var(--text-secondary)' }} /></button>
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
            <p style={{ color: 'var(--text-muted)' }}>Начните общение прямо сейчас</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ЛЕНТА (Instagram/TikTok-стиль)
// ═══════════════════════════════════════════════════════════

function FeedPage({ user }: { user: UserType }) {
  const [posts, setPosts] = useState<Post[]>(store.getPosts().filter(p => !p.isHidden));
  const [newPostContent, setNewPostContent] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    const hashtags = newPostContent.match(/#\w+/g) || [];
    store.createPost({
      userId: user.id,
      content: newPostContent,
      type: 'text',
      hashtags: hashtags.map(h => h.slice(1)),
    });
    setNewPostContent('');
    setShowCreatePost(false);
    setPosts(store.getPosts().filter(p => !p.isHidden));
  };

  const handleLike = (postId: string) => {
    const allPosts = store.getPosts();
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;
    const idx = post.likes.indexOf(user.id);
    if (idx > -1) post.likes.splice(idx, 1);
    else post.likes.push(user.id);
    store.savePosts(allPosts);
    setPosts(store.getPosts().filter(p => !p.isHidden));
  };

  const stories = store.getActiveStories();

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto py-6 px-4">
        {/* Stories bar */}
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          <div className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-tertiary)', border: '2px dashed var(--border)' }}>
              <Plus size={24} style={{ color: 'var(--text-muted)' }} />
            </div>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Ваша</span>
          </div>
          {stories.map(story => {
            const storyUser = store.getUser(story.userId);
            return (
              <div key={story.id} className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer">
                <div className="story-ring">
                  <img src={storyUser?.avatar || ''} className="w-14 h-14 rounded-full avatar border-2" 
                       style={{ borderColor: 'var(--bg-secondary)' }} alt="" />
                </div>
                <span className="text-xs truncate w-16 text-center" style={{ color: 'var(--text-secondary)' }}>
                  {storyUser?.username}
                </span>
              </div>
            );
          })}
        </div>

        {/* Create post */}
        <div className="feed-card p-4 mb-6">
          <div className="flex items-center gap-3">
            <img src={user.avatar} className="w-10 h-10 rounded-full avatar" alt="" />
            <input className="flex-1 input-field" placeholder="Что нового?" value={newPostContent}
                   onChange={e => setNewPostContent(e.target.value)}
                   onFocus={() => setShowCreatePost(true)} />
          </div>
          {showCreatePost && (
            <div className="mt-3 fade-in">
              <textarea className="input-field h-24 resize-none" placeholder="Расскажите что-нибудь..."
                        value={newPostContent} onChange={e => setNewPostContent(e.target.value)} />
              <div className="flex items-center justify-between mt-3">
                <div className="flex gap-3">
                  <button className="flex items-center gap-1 text-sm" style={{ color: 'var(--accent)' }}>
                    <Image size={16} /> Фото
                  </button>
                  <button className="flex items-center gap-1 text-sm" style={{ color: 'var(--accent)' }}>
                    <Video size={16} /> Видео
                  </button>
                  <button className="flex items-center gap-1 text-sm" style={{ color: 'var(--accent)' }}>
                    <Smile size={16} /> Настроение
                  </button>
                </div>
                <button className="btn-primary text-sm py-2 px-4" onClick={handleCreatePost}>Опубликовать</button>
              </div>
            </div>
          )}
        </div>

        {/* Posts */}
        {posts.map(post => {
          const postUser = store.getUser(post.userId);
          const isLiked = post.likes.includes(user.id);
          
          return (
            <div key={post.id} className="feed-card mb-6 fade-in">
              {/* Post header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={postUser?.avatar || ''} className="w-10 h-10 rounded-full avatar" alt="" />
                  <div>
                    <span className="font-semibold text-sm">{postUser?.username}</span>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatTimeAgo(post.createdAt)}</p>
                  </div>
                </div>
                <button className="p-2 rounded-full hover:bg-[var(--bg-hover)]">
                  <MoreHorizontal size={18} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>

              {/* Content */}
              <div className="px-4 pb-3">
                <p className="text-sm leading-relaxed">{post.content}</p>
                {post.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.hashtags.map(h => (
                      <span key={h} className="text-xs px-2 py-0.5 rounded-full" style={{ color: 'var(--accent)', background: 'var(--accent-light)' }}>
                        #{h}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Media */}
              {post.media.length > 0 && (
                <div className="relative">
                  <img src={post.media[0]} className="w-full max-h-96 object-cover" alt="" />
                </div>
              )}

              {/* Actions */}
              <div className="p-4 flex items-center justify-between border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1.5 transition-all" onClick={() => handleLike(post.id)}>
                    <Heart size={20} fill={isLiked ? '#ff3d71' : 'none'} style={{ color: isLiked ? '#ff3d71' : 'var(--text-secondary)' }} />
                    <span className="text-sm font-medium">{post.likes.length}</span>
                  </button>
                  <button className="flex items-center gap-1.5">
                    <MessageSquare size={20} style={{ color: 'var(--text-secondary)' }} />
                    <span className="text-sm font-medium">{post.commentsCount}</span>
                  </button>
                  <button className="flex items-center gap-1.5">
                    <Share2 size={20} style={{ color: 'var(--text-secondary)' }} />
                    <span className="text-sm font-medium">{post.shares}</span>
                  </button>
                </div>
                <button>
                  <Bookmark size={20} style={{ color: 'var(--text-secondary)' }} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ВИДЕОПЛАТФОРМА (YouTube-стиль)
// ═══════════════════════════════════════════════════════════

function VideosPage({ user }: { user: UserType }) {
  const [videos, setVideos] = useState<VideoType[]>(store.getVideos().filter(v => !v.isShort));
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (selectedVideo) {
    const videoUser = store.getUser(selectedVideo.userId);
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4">
          <button onClick={() => setSelectedVideo(null)} className="mb-4 flex items-center gap-2 text-sm" style={{ color: 'var(--accent)' }}>
            <ArrowLeft size={16} /> Назад
          </button>
          
          {/* Video player */}
          <div className="relative rounded-2xl overflow-hidden mb-4" style={{ background: '#000' }}>
            <img src={selectedVideo.thumbnail} className="w-full aspect-video object-cover" alt="" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center cursor-pointer">
                <Play size={28} color="white" fill="white" />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }}>
                <div className="h-full w-1/3 rounded-full gradient-bg" />
              </div>
            </div>
          </div>

          {/* Video info */}
          <h1 className="text-xl font-bold mb-2">{selectedVideo.title}</h1>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img src={videoUser?.avatar || ''} className="w-10 h-10 rounded-full avatar" alt="" />
              <div>
                <p className="font-semibold text-sm">{videoUser?.username}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {selectedVideo.views.toLocaleString()} просмотров • {formatTimeAgo(selectedVideo.createdAt)}
                </p>
              </div>
              <button className="btn-primary text-sm py-2 px-4 ml-4">Подписаться</button>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-secondary text-sm py-2 px-3 flex items-center gap-1"
                      onClick={() => {
                        const allVideos = store.getVideos();
                        const v = allVideos.find(vv => vv.id === selectedVideo.id);
                        if (v) {
                          const idx = v.likes.indexOf(user.id);
                          if (idx > -1) v.likes.splice(idx, 1);
                          else v.likes.push(user.id);
                          store.saveVideos(allVideos);
                          setVideos(store.getVideos().filter(v => !v.isShort));
                          setSelectedVideo({ ...selectedVideo, likes: v.likes });
                        }
                      }}>
                <Heart size={16} fill={selectedVideo.likes.includes(user.id) ? '#ff3d71' : 'none'} /> 
                {selectedVideo.likes.length}
              </button>
              <button className="btn-secondary text-sm py-2 px-3 flex items-center gap-1">
                <Share2 size={16} /> Поделиться
              </button>
              <button className="btn-secondary text-sm py-2 px-3">
                <Bookmark size={16} />
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-xl mb-6" style={{ background: 'var(--bg-tertiary)' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedVideo.description}</p>
            <div className="flex gap-2 mt-2">
              {selectedVideo.tags.map(t => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ color: 'var(--accent)', background: 'var(--accent-light)' }}>
                  #{t}
                </span>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div>
            <h3 className="font-bold mb-4">Комментарии ({selectedVideo.comments.length})</h3>
            <div className="flex gap-3 mb-6">
              <img src={user.avatar} className="w-8 h-8 rounded-full avatar" alt="" />
              <input className="input-field flex-1" placeholder="Добавить комментарий..." />
            </div>
            {selectedVideo.comments.map(c => {
              const cUser = store.getUser(c.userId);
              return (
                <div key={c.id} className="flex gap-3 mb-4">
                  <img src={cUser?.avatar || ''} className="w-8 h-8 rounded-full avatar" alt="" />
                  <div>
                    <p className="text-sm"><span className="font-semibold">{cUser?.username}</span> {c.content}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{formatTimeAgo(c.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Видео</h1>
          <div className="relative w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input className="input-field pl-9 py-2 text-sm" placeholder="Поиск видео..."
                   value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>

        {/* Trending tags */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['Все', 'Технологии', 'Музыка', 'Путешествия', 'Обучение', 'Дизайн', 'SMM'].map(tag => (
            <button key={tag} className="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all"
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              {tag}
            </button>
          ))}
        </div>

        {/* Video grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map(video => {
            const videoUser = store.getUser(video.userId);
            return (
              <div key={video.id} className="video-card cursor-pointer" onClick={() => setSelectedVideo(video)}>
                <div className="relative">
                  <img src={video.thumbnail} className="w-full aspect-video object-cover" alt="" />
                  <span className="duration">{formatDuration(video.duration)}</span>
                </div>
                <div className="p-3">
                  <div className="flex gap-3">
                    <img src={videoUser?.avatar || ''} className="w-8 h-8 rounded-full avatar flex-shrink-0" alt="" />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-2">{video.title}</h3>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {videoUser?.username} • {video.views.toLocaleString()} просм.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SHORTS (TikTok-стиль)
// ═══════════════════════════════════════════════════════════

function ShortsPage({ user }: { user: UserType }) {
  const videos = store.getVideos();
  const [currentIdx, setCurrentIdx] = useState(0);
  const shortVideos = videos.filter(v => v.isShort || true); // все видео как shorts

  return (
    <div className="h-full flex items-center justify-center" style={{ background: '#000' }}>
      <div className="relative w-full max-w-sm h-full max-h-[80vh] rounded-3xl overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
        {shortVideos[currentIdx] && (
          <>
            <img src={shortVideos[currentIdx].thumbnail} className="w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {/* Right actions */}
            <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6">
              <button className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <Heart size={24} color="white" />
                </div>
                <span className="text-white text-xs mt-1">{shortVideos[currentIdx].likes.length}</span>
              </button>
              <button className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <MessageSquare size={24} color="white" />
                </div>
                <span className="text-white text-xs mt-1">{shortVideos[currentIdx].comments.length}</span>
              </button>
              <button className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <Share2 size={24} color="white" />
                </div>
                <span className="text-white text-xs mt-1">Share</span>
              </button>
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-6 left-4 right-16">
              <div className="flex items-center gap-2 mb-2">
                <img src={store.getUser(shortVideos[currentIdx].userId)?.avatar || ''} className="w-8 h-8 rounded-full border-2 border-white" alt="" />
                <span className="text-white font-semibold text-sm">@{store.getUser(shortVideos[currentIdx].userId)?.username}</span>
                <button className="px-3 py-0.5 rounded-full text-xs font-semibold text-white border border-white">+</button>
              </div>
              <p className="text-white text-sm">{shortVideos[currentIdx].title}</p>
              <div className="flex gap-2 mt-2">
                {shortVideos[currentIdx].tags.map(t => (
                  <span key={t} className="text-xs text-white/80">#{t}</span>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="absolute top-1/2 left-0 right-0 flex justify-between px-2">
              <button className="w-10 h-10 rounded-full flex items-center justify-center" 
                      style={{ background: 'rgba(255,255,255,0.1)' }}
                      onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}>
                <ChevronRight size={20} color="white" className="rotate-180" />
              </button>
              <button className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.1)' }}
                      onClick={() => setCurrentIdx(Math.min(shortVideos.length - 1, currentIdx + 1))}>
                <ChevronRight size={20} color="white" />
              </button>
            </div>

            {/* Progress */}
            <div className="absolute top-4 left-4 right-4 flex gap-1">
              {shortVideos.slice(0, 5).map((_, i) => (
                <div key={i} className="flex-1 h-0.5 rounded-full" style={{ background: i <= currentIdx ? 'white' : 'rgba(255,255,255,0.3)' }} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// МУЗЫКА (VK-стиль)
// ═══════════════════════════════════════════════════════════

function MusicPage({ user }: { user: UserType }) {
  const tracks = store.getMusic();
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Музыка</h1>
            <button className="btn-primary text-sm flex items-center gap-2">
              <Plus size={16} /> Загрузить
            </button>
          </div>

          {/* Playlists */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { name: 'Мне нравится', count: 42, color: 'from-purple-500 to-pink-500' },
              { name: 'Для работы', count: 18, color: 'from-blue-500 to-cyan-500' },
              { name: 'Вечеринка', count: 35, color: 'from-orange-500 to-red-500' },
              { name: 'Релакс', count: 24, color: 'from-green-500 to-teal-500' },
            ].map(pl => (
              <div key={pl.name} className="rounded-xl p-4 cursor-pointer transition-all hover:scale-105"
                   style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <div className={`w-full aspect-square rounded-lg bg-gradient-to-br ${pl.color} mb-3 flex items-center justify-center`}>
                  <Music size={32} color="white" />
                </div>
                <h3 className="font-semibold text-sm">{pl.name}</h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{pl.count} треков</p>
              </div>
            ))}
          </div>

          {/* Track list */}
          <h2 className="font-bold text-lg mb-4">Все треки</h2>
          <div className="space-y-1">
            {tracks.map((track, idx) => {
              const isActive = currentTrack?.id === track.id;
              return (
                <div key={track.id} 
                     className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all ${isActive ? '' : 'hover:bg-[var(--bg-hover)]'}`}
                     style={isActive ? { background: 'var(--accent-light)' } : {}}
                     onClick={() => { setCurrentTrack(track); setIsPlaying(true); }}>
                  <span className="w-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    {isActive && isPlaying ? (
                      <div className="music-wave">
                        <span /><span /><span /><span /><span />
                      </div>
                    ) : idx + 1}
                  </span>
                  <img src={track.cover} className="w-12 h-12 rounded-lg object-cover" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${isActive ? 'text-[var(--accent)]' : ''}`}>{track.title}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{track.artist}</p>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDuration(track.duration)}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{track.plays.toLocaleString()} ▶</span>
                  <button className="p-2 rounded-full hover:bg-[var(--bg-tertiary)]">
                    <Heart size={16} style={{ color: 'var(--text-muted)' }} />
                  </button>
                  <button className="p-2 rounded-full hover:bg-[var(--bg-tertiary)]">
                    <MoreHorizontal size={16} style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Player */}
      {currentTrack && (
        <div className="h-20 border-t flex items-center px-4 gap-4" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <img src={currentTrack.cover} className="w-12 h-12 rounded-lg object-cover" alt="" />
          <div className="w-40 min-w-0">
            <p className="font-medium text-sm truncate">{currentTrack.title}</p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{currentTrack.artist}</p>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-center gap-4">
              <button><Shuffle size={16} style={{ color: 'var(--text-muted)' }} /></button>
              <button><SkipBack size={18} /></button>
              <button className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <Pause size={18} color="white" /> : <Play size={18} color="white" fill="white" />}
              </button>
              <button><SkipForward size={18} /></button>
              <button><Repeat size={16} style={{ color: 'var(--text-muted)' }} /></button>
            </div>
            <div className="w-full flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>1:23</span>
              <div className="flex-1 h-1 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
                <div className="h-full w-1/3 rounded-full gradient-bg" />
              </div>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDuration(currentTrack.duration)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Volume2 size={16} style={{ color: 'var(--text-muted)' }} />
            <div className="w-20 h-1 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
              <div className="h-full w-2/3 rounded-full" style={{ background: 'var(--text-secondary)' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ПРОФИЛЬ (VK-стиль)
// ═══════════════════════════════════════════════════════════

function ProfilePage({ user }: { user: UserType }) {
  const userPosts = store.getPosts().filter(p => p.userId === user.id);
  const [activeTab, setActiveTab] = useState<'posts' | 'photos' | 'videos' | 'music' | 'friends'>('posts');

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Cover */}
        <div className="h-48 relative" style={{ background: 'var(--gradient-1)' }}>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
        </div>

        {/* Profile info */}
        <div className="px-6 -mt-16 relative">
          <div className="flex items-end gap-4">
            <img src={user.avatar} className="w-32 h-32 rounded-full avatar border-4" 
                 style={{ borderColor: 'var(--bg-primary)' }} alt="" />
            <div className="pb-4 flex-1">
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user.bio}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm"><strong>{user.followers.length}</strong> <span style={{ color: 'var(--text-muted)' }}>подписчиков</span></span>
                <span className="text-sm"><strong>{user.following.length}</strong> <span style={{ color: 'var(--text-muted)' }}>подписок</span></span>
                <span className="text-sm"><strong>{userPosts.length}</strong> <span style={{ color: 'var(--text-muted)' }}>постов</span></span>
              </div>
            </div>
            <div className="pb-4 flex gap-2">
              <button className="btn-primary text-sm">Редактировать</button>
              <button className="btn-secondary text-sm"><Settings size={16} /></button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6 border-b pb-0" style={{ borderColor: 'var(--border)' }}>
            {[
              { id: 'posts', label: 'Посты', icon: <FileText size={16} /> },
              { id: 'photos', label: 'Фото', icon: <Image size={16} /> },
              { id: 'videos', label: 'Видео', icon: <Video size={16} /> },
              { id: 'music', label: 'Музыка', icon: <Music size={16} /> },
              { id: 'friends', label: 'Друзья', icon: <Users size={16} /> },
            ].map(tab => (
              <button key={tab.id} 
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === tab.id ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent'}`}
                      style={{ color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-muted)' }}
                      onClick={() => setActiveTab(tab.id as any)}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="py-6">
            {activeTab === 'posts' && (
              <div className="space-y-4">
                {userPosts.length === 0 ? (
                  <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Пока нет постов</p>
                ) : (
                  userPosts.map(post => (
                    <div key={post.id} className="feed-card p-4">
                      <p className="text-sm">{post.content}</p>
                      {post.media.length > 0 && (
                        <img src={post.media[0]} className="w-full rounded-xl mt-3 max-h-64 object-cover" alt="" />
                      )}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                        <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                          <Heart size={14} /> {post.likes.length}
                        </span>
                        <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                          <MessageSquare size={14} /> {post.commentsCount}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatTimeAgo(post.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            {activeTab === 'friends' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {user.following.map(fId => {
                  const f = store.getUser(fId);
                  if (!f) return null;
                  return (
                    <div key={f.id} className="feed-card p-4 flex items-center gap-3">
                      <img src={f.avatar} className="w-12 h-12 rounded-full avatar" alt="" />
                      <div>
                        <p className="font-semibold text-sm">{f.username}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.bio.slice(0, 30)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {activeTab === 'photos' && (
              <div className="grid grid-cols-3 gap-2">
                {store.getPosts().filter(p => p.userId === user.id && p.media.length > 0).map(p => (
                  <img key={p.id} src={p.media[0]} className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-80" alt="" />
                ))}
                {userPosts.filter(p => p.media.length === 0).length > 0 && (
                  <p className="col-span-3 text-center py-8" style={{ color: 'var(--text-muted)' }}>Нет фотографий</p>
                )}
              </div>
            )}
            {(activeTab === 'videos' || activeTab === 'music') && (
              <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                {activeTab === 'videos' ? 'Нет видео' : 'Нет музыки'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// СТРАНИЦА СТОРИС
// ═══════════════════════════════════════════════════════════

function StoriesPage({ user }: { user: UserType }) {
  const stories = store.getActiveStories();
  const [currentStory, setCurrentStory] = useState(0);

  return (
    <div className="h-full flex items-center justify-center" style={{ background: '#000' }}>
      {stories.length > 0 ? (
        <div className="relative w-full max-w-sm h-full max-h-[85vh] rounded-3xl overflow-hidden">
          <img src={stories[currentStory]?.media || ''} className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
          
          {/* Progress bars */}
          <div className="absolute top-4 left-4 right-4 flex gap-1">
            {stories.map((_, i) => (
              <div key={i} className="flex-1 h-0.5 rounded-full" style={{ background: i <= currentStory ? 'white' : 'rgba(255,255,255,0.3)' }} />
            ))}
          </div>

          {/* User info */}
          <div className="absolute top-8 left-4 flex items-center gap-2">
            <img src={store.getUser(stories[currentStory]?.userId)?.avatar || ''} className="w-8 h-8 rounded-full border-2 border-white" alt="" />
            <span className="text-white font-semibold text-sm">{store.getUser(stories[currentStory]?.userId)?.username}</span>
            <span className="text-white/60 text-xs">{formatTimeAgo(stories[currentStory]?.createdAt || 0)}</span>
          </div>

          {/* Story text */}
          {stories[currentStory]?.text && (
            <div className="absolute bottom-20 left-4 right-4">
              <p className="text-white text-lg font-medium text-center">{stories[currentStory].text}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="absolute inset-y-0 left-0 w-1/3 cursor-pointer" onClick={() => setCurrentStory(Math.max(0, currentStory - 1))} />
          <div className="absolute inset-y-0 right-0 w-1/3 cursor-pointer" onClick={() => setCurrentStory(Math.min(stories.length - 1, currentStory + 1))} />

          {/* Close */}
          <button className="absolute top-8 right-4 w-8 h-8 rounded-full flex items-center justify-center" 
                  style={{ background: 'rgba(255,255,255,0.2)' }}>
            <X size={16} color="white" />
          </button>
        </div>
      ) : (
        <div className="text-center">
          <Camera size={48} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Нет активных сторис</h3>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Создайте свою первую историю!</p>
          <button className="btn-primary mt-4">Создать сторис</button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ЗВОНКИ
// ═══════════════════════════════════════════════════════════

function CallsPage({ user }: { user: UserType }) {
  return (
    <div className="h-full flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-center">
        <div className="w-24 h-24 rounded-full gradient-bg flex items-center justify-center mx-auto mb-6">
          <Phone size={40} color="white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Видеозвонки</h2>
        <p className="mb-6" style={{ color: 'var(--text-muted)' }}>WebRTC для звонков 1-на-1 и групповых</p>
        <div className="flex gap-3 justify-center">
          <button className="btn-primary flex items-center gap-2"><Phone size={16} /> Аудиозвонок</button>
          <button className="btn-secondary flex items-center gap-2"><VideoIcon size={16} /> Видеозвонок</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// АДМИН-ПАНЕЛЬ
// ═══════════════════════════════════════════════════════════

function AdminPanel({ user }: { user: UserType }) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const users = store.getUsers();
  const posts = store.getPosts();
  const videos = store.getVideos();
  const reports = store.getReports();
  const auditLog = store.getAuditLog();

  const sections = [
    { id: 'dashboard', label: 'Дашборд', icon: <BarChart3 size={18} /> },
    { id: 'users', label: 'Пользователи', icon: <Users size={18} /> },
    { id: 'content', label: 'Контент', icon: <FileText size={18} /> },
    { id: 'reports', label: 'Жалобы', icon: <AlertTriangle size={18} /> },
    { id: 'security', label: 'Безопасность', icon: <Lock size={18} /> },
    { id: 'files', label: 'Файлы', icon: <Database size={18} /> },
    { id: 'settings', label: 'Настройки', icon: <Settings size={18} /> },
    { id: 'stats', label: 'Статистика', icon: <TrendingUp size={18} /> },
    { id: 'logs', label: 'Логи', icon: <Eye size={18} /> },
  ];

  return (
    <div className="h-full flex">
      {/* Admin sidebar */}
      <div className="w-56 h-full border-r p-4 flex flex-col" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 mb-6">
          <Shield size={20} style={{ color: 'var(--accent)' }} />
          <span className="font-bold">Админ-панель</span>
        </div>
        <div className="space-y-1 flex-1">
          {sections.map(s => (
            <div key={s.id} 
                 className={`admin-sidebar-item ${activeSection === s.id ? 'active' : ''}`}
                 onClick={() => setActiveSection(s.id)}>
              {s.icon}
              <span className="text-sm">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Admin content */}
      <div className="flex-1 h-full overflow-y-auto p-6">
        {activeSection === 'dashboard' && <AdminDashboard users={users} posts={posts} videos={videos} reports={reports} />}
        {activeSection === 'users' && <AdminUsers users={users} />}
        {activeSection === 'content' && <AdminContent posts={posts} videos={videos} />}
        {activeSection === 'reports' && <AdminReports reports={reports} />}
        {activeSection === 'security' && <AdminSecurity auditLog={auditLog} />}
        {activeSection === 'files' && <AdminFiles />}
        {activeSection === 'settings' && <AdminSettings />}
        {activeSection === 'stats' && <AdminStats users={users} posts={posts} />}
        {activeSection === 'logs' && <AdminLogs auditLog={auditLog} />}
      </div>
    </div>
  );
}

function AdminDashboard({ users, posts, videos, reports }: { users: UserType[]; posts: Post[]; videos: VideoType[]; reports: Report[] }) {
  const stats = [
    { label: 'Пользователи', value: users.length, icon: <Users size={20} />, color: 'from-blue-500 to-cyan-500', change: '+12%' },
    { label: 'Посты', value: posts.length, icon: <FileText size={20} />, color: 'from-purple-500 to-pink-500', change: '+8%' },
    { label: 'Видео', value: videos.length, icon: <Video size={20} />, color: 'from-orange-500 to-red-500', change: '+23%' },
    { label: 'Жалобы', value: reports.filter(r => r.status === 'pending').length, icon: <AlertTriangle size={20} />, color: 'from-yellow-500 to-orange-500', change: '-5%' },
  ];

  return (
    <div className="fade-in">
      <h1 className="text-2xl font-bold mb-6">Дашборд</h1>
      
      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                <span className="text-white">{s.icon}</span>
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: 'var(--success)', background: 'rgba(0,214,143,0.1)' }}>
                {s.change}
              </span>
            </div>
            <p className="text-2xl font-bold">{s.value.toLocaleString()}</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="stat-card">
          <h3 className="font-bold mb-4">Активность (7 дней)</h3>
          <div className="flex items-end gap-2 h-32">
            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-lg gradient-bg transition-all" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
              <span key={d} className="text-xs flex-1 text-center" style={{ color: 'var(--text-muted)' }}>{d}</span>
            ))}
          </div>
        </div>
        <div className="stat-card">
          <h3 className="font-bold mb-4">Регистрации</h3>
          <div className="flex items-end gap-2 h-32">
            {[20, 35, 50, 40, 60, 75, 55].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-lg transition-all" style={{ height: `${h}%`, background: 'var(--gradient-2)' }} />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
              <span key={d} className="text-xs flex-1 text-center" style={{ color: 'var(--text-muted)' }}>{d}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Server info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>CPU</h4>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
              <div className="h-full w-1/4 rounded-full" style={{ background: 'var(--success)' }} />
            </div>
            <span className="text-sm font-bold">24%</span>
          </div>
        </div>
        <div className="stat-card">
          <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>RAM</h4>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
              <div className="h-full w-3/5 rounded-full" style={{ background: 'var(--warning)' }} />
            </div>
            <span className="text-sm font-bold">58%</span>
          </div>
        </div>
        <div className="stat-card">
          <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Диск</h4>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
              <div className="h-full w-2/5 rounded-full" style={{ background: 'var(--accent)' }} />
            </div>
            <span className="text-sm font-bold">42%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminUsers({ users }: { users: UserType[] }) {
  const [search, setSearch] = useState('');
  const filtered = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Пользователи ({users.length})</h1>
        <div className="flex gap-2">
          <input className="input-field w-64 py-2 text-sm" placeholder="Поиск..." value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn-secondary text-sm">Экспорт CSV</button>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: 'var(--bg-tertiary)' }}>
              <th className="text-left p-3 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Пользователь</th>
              <th className="text-left p-3 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Роль</th>
              <th className="text-left p-3 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Статус</th>
              <th className="text-left p-3 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Регистрация</th>
              <th className="text-right p-3 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} className="w-8 h-8 rounded-full avatar" alt="" />
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
                    u.role === 'moderator' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>{u.role}</span>
                </td>
                <td className="p-3">
                  {u.isBanned ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">Заблокирован</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Активен</span>
                  )}
                </td>
                <td className="p-3 text-sm" style={{ color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)]" title="Редактировать"><Edit size={14} style={{ color: 'var(--text-muted)' }} /></button>
                    <button className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)]" title="Заблокировать"><Ban size={14} style={{ color: 'var(--text-muted)' }} /></button>
                    <button className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)]" title="Удалить"><Trash2 size={14} style={{ color: 'var(--danger)' }} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminContent({ posts, videos }: { posts: Post[]; videos: VideoType[] }) {
  return (
    <div className="fade-in">
      <h1 className="text-2xl font-bold mb-6">Управление контентом</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="stat-card">
          <h3 className="font-bold mb-4">Посты ({posts.length})</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {posts.slice(0, 10).map(p => {
              const u = store.getUser(p.userId);
              return (
                <div key={p.id} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{p.content.slice(0, 50)}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u?.username} • {formatTimeAgo(p.createdAt)}</p>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1 rounded hover:bg-[var(--bg-hover)]"><Eye size={14} style={{ color: 'var(--text-muted)' }} /></button>
                    <button className="p-1 rounded hover:bg-[var(--bg-hover)]"><Trash2 size={14} style={{ color: 'var(--danger)' }} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="stat-card">
          <h3 className="font-bold mb-4">Видео ({videos.length})</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {videos.map(v => {
              const u = store.getUser(v.userId);
              return (
                <div key={v.id} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                  <img src={v.thumbnail} className="w-16 h-10 rounded object-cover" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{v.title}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u?.username} • {v.views} просм.</p>
                  </div>
                  <button className="p-1 rounded hover:bg-[var(--bg-hover)]"><Trash2 size={14} style={{ color: 'var(--danger)' }} /></button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminReports({ reports }: { reports: Report[] }) {
  return (
    <div className="fade-in">
      <h1 className="text-2xl font-bold mb-6">Жалобы и модерация</h1>
      {reports.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle size={48} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
          <p className="text-lg font-medium" style={{ color: 'var(--text-muted)' }}>Нет жалоб</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Все чисто! 🎉</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(r => (
            <div key={r.id} className="stat-card flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{r.reason}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Тип: {r.targetType} • Статус: {r.status}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary text-xs py-1 px-3">Отклонить</button>
                <button className="btn-primary text-xs py-1 px-3">Решить</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminSecurity({ auditLog }: { auditLog: any[] }) {
  return (
    <div className="fade-in">
      <h1 className="text-2xl font-bold mb-6">Безопасность</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Попытки входа (24ч)</h4>
          <p className="text-2xl font-bold">1,247</p>
          <p className="text-xs text-green-400">-3% от вчера</p>
        </div>
        <div className="stat-card">
          <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Заблокированные IP</h4>
          <p className="text-2xl font-bold">12</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>3 новых за неделю</p>
        </div>
        <div className="stat-card">
          <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Активные сессии</h4>
          <p className="text-2xl font-bold">89</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>JWT токенов</p>
        </div>
      </div>
      <div className="stat-card">
        <h3 className="font-bold mb-4">Последние события безопасности</h3>
        <div className="space-y-2">
          {[
            { action: 'Вход в систему', user: 'admin', ip: '192.168.1.1', time: '2 мин назад', status: 'success' },
            { action: 'Неудачная попытка', user: 'unknown', ip: '45.33.32.156', time: '15 мин назад', status: 'failed' },
            { action: 'Смена пароля', user: 'alice', ip: '192.168.1.5', time: '1 час назад', status: 'success' },
            { action: '2FA активирован', user: 'bob', ip: '10.0.0.1', time: '3 часа назад', status: 'success' },
          ].map((e, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${e.status === 'success' ? 'bg-green-400' : 'bg-red-400'}`} />
                <div>
                  <p className="text-sm">{e.action}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{e.user} • {e.ip}</p>
                </div>
              </div>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{e.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminFiles() {
  return (
    <div className="fade-in">
      <h1 className="text-2xl font-bold mb-6">Файлы и хранилище</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { name: 'Аватары', size: '245 MB', files: 156, icon: <User size={20} /> },
          { name: 'Посты', size: '1.2 GB', files: 890, icon: <Image size={20} /> },
          { name: 'Видео', size: '15.8 GB', files: 234, icon: <Video size={20} /> },
          { name: 'Музыка', size: '3.4 GB', files: 567, icon: <Music size={20} /> },
        ].map(f => (
          <div key={f.name} className="stat-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                {f.icon}
              </div>
              <div>
                <p className="font-semibold text-sm">{f.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.files} файлов</p>
              </div>
            </div>
            <p className="text-lg font-bold">{f.size}</p>
          </div>
        ))}
      </div>
      <div className="stat-card">
        <h3 className="font-bold mb-4">Общее использование</h3>
        <div className="h-4 rounded-full mb-2" style={{ background: 'var(--bg-tertiary)' }}>
          <div className="h-full w-2/5 rounded-full gradient-bg" />
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: 'var(--text-muted)' }}>20.6 GB из 50 GB</span>
          <span className="font-medium">41.2%</span>
        </div>
      </div>
    </div>
  );
}

function AdminSettings() {
  return (
    <div className="fade-in">
      <h1 className="text-2xl font-bold mb-6">Системные настройки</h1>
      <div className="space-y-6 max-w-2xl">
        <div className="stat-card">
          <h3 className="font-bold mb-4">Основные</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>Название сайта</label>
              <input className="input-field" defaultValue="MegaChat" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>Регистрация</label>
              <select className="input-field">
                <option>Открыта</option>
                <option>По инвайтам</option>
                <option>Закрыта</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Подтверждение email</span>
              <div className="w-10 h-5 rounded-full relative cursor-pointer" style={{ background: 'var(--accent)' }}>
                <div className="w-4 h-4 rounded-full bg-white absolute right-0.5 top-0.5" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Технические работы</span>
              <div className="w-10 h-5 rounded-full relative cursor-pointer" style={{ background: 'var(--bg-tertiary)' }}>
                <div className="w-4 h-4 rounded-full bg-white absolute left-0.5 top-0.5" />
              </div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <h3 className="font-bold mb-4">Загрузки</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>Макс. размер файла</label>
              <input className="input-field" defaultValue="2048" type="number" />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>MB</span>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>Разрешённые форматы</label>
              <input className="input-field" defaultValue="jpg, png, gif, mp4, webm, mp3, pdf" />
            </div>
          </div>
        </div>
        <button className="btn-primary">Сохранить настройки</button>
      </div>
    </div>
  );
}

function AdminStats({ users, posts }: { users: UserType[]; posts: Post[] }) {
  return (
    <div className="fade-in">
      <h1 className="text-2xl font-bold mb-6">Статистика</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="stat-card">
          <h3 className="font-bold mb-4">Топ пользователи</h3>
          <div className="space-y-3">
            {users.slice(0, 5).map((u, i) => (
              <div key={u.id} className="flex items-center gap-3">
                <span className="text-sm font-bold w-6" style={{ color: i < 3 ? 'var(--accent)' : 'var(--text-muted)' }}>#{i + 1}</span>
                <img src={u.avatar} className="w-8 h-8 rounded-full avatar" alt="" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{u.username}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.followers.length} подписчиков</p>
                </div>
                {i === 0 && <Crown size={16} style={{ color: '#ffd700' }} />}
              </div>
            ))}
          </div>
        </div>
        <div className="stat-card">
          <h3 className="font-bold mb-4">Retention</h3>
          <div className="space-y-2">
            {[
              { day: '1 день', value: 85 },
              { day: '7 дней', value: 62 },
              { day: '14 дней', value: 48 },
              { day: '30 дней', value: 35 },
            ].map(r => (
              <div key={r.day} className="flex items-center gap-3">
                <span className="text-sm w-20" style={{ color: 'var(--text-muted)' }}>{r.day}</span>
                <div className="flex-1 h-3 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
                  <div className="h-full rounded-full gradient-bg" style={{ width: `${r.value}%` }} />
                </div>
                <span className="text-sm font-bold w-10">{r.value}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="stat-card">
          <h3 className="font-bold mb-4">Устройства</h3>
          <div className="flex items-center justify-around">
            {[
              { label: 'Mobile', value: 58, icon: '📱' },
              { label: 'Desktop', value: 32, icon: '💻' },
              { label: 'Tablet', value: 10, icon: '📟' },
            ].map(d => (
              <div key={d.label} className="text-center">
                <span className="text-2xl">{d.icon}</span>
                <p className="text-lg font-bold mt-1">{d.value}%</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="stat-card">
          <h3 className="font-bold mb-4">Топ хэштеги</h3>
          <div className="flex flex-wrap gap-2">
            {['#coding', '#music', '#design', '#travel', '#tech', '#art', '#photo', '#video'].map((h, i) => (
              <span key={h} className="px-3 py-1 rounded-full text-sm" style={{ 
                background: 'var(--accent-light)', color: 'var(--accent)',
                fontSize: `${14 - i}px` 
              }}>{h}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminLogs({ auditLog }: { auditLog: any[] }) {
  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Логи системы</h1>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm">Очистить</button>
          <button className="btn-secondary text-sm">Экспорт</button>
        </div>
      </div>
      <div className="stat-card">
        <div className="font-mono text-xs space-y-1 max-h-96 overflow-y-auto">
          {[
            { time: '2024-01-15 14:32:01', level: 'INFO', msg: 'Server started on port 3000' },
            { time: '2024-01-15 14:32:02', level: 'INFO', msg: 'Database connected (WAL mode)' },
            { time: '2024-01-15 14:32:03', level: 'INFO', msg: 'Socket.IO initialized' },
            { time: '2024-01-15 14:33:15', level: 'INFO', msg: 'User admin logged in from 192.168.1.1' },
            { time: '2024-01-15 14:35:22', level: 'WARN', msg: 'Rate limit exceeded for IP 45.33.32.156' },
            { time: '2024-01-15 14:36:01', level: 'INFO', msg: 'Backup created: messenger-2024-01-15-14.db' },
            { time: '2024-01-15 14:40:33', level: 'ERROR', msg: 'Failed to process video: format not supported' },
            { time: '2024-01-15 14:42:10', level: 'INFO', msg: 'New user registered: eve' },
            { time: '2024-01-15 14:45:00', level: 'INFO', msg: 'Hot-reload triggered: style.css changed' },
            { time: '2024-01-15 14:50:22', level: 'INFO', msg: 'WebSocket connections: 23 active' },
          ].map((log, i) => (
            <div key={i} className="flex gap-3 p-1 rounded hover:bg-[var(--bg-tertiary)]">
              <span style={{ color: 'var(--text-muted)' }}>{log.time}</span>
              <span className={`font-bold ${
                log.level === 'ERROR' ? 'text-red-400' : 
                log.level === 'WARN' ? 'text-yellow-400' : 'text-green-400'
              }`}>[{log.level}]</span>
              <span style={{ color: 'var(--text-secondary)' }}>{log.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ПОИСК
// ═══════════════════════════════════════════════════════════

function SearchResults({ query }: { query: string }) {
  const users = store.getUsers().filter(u => u.username.toLowerCase().includes(query.toLowerCase()));
  const posts = store.getPosts().filter(p => p.content.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="border-t p-4 max-h-80 overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
      {users.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-bold mb-2" style={{ color: 'var(--text-muted)' }}>ЛЮДИ</h4>
          {users.slice(0, 5).map(u => (
            <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-hover)] cursor-pointer">
              <img src={u.avatar} className="w-8 h-8 rounded-full avatar" alt="" />
              <div>
                <p className="text-sm font-medium">{u.username}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.bio.slice(0, 40)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {posts.length > 0 && (
        <div>
          <h4 className="text-xs font-bold mb-2" style={{ color: 'var(--text-muted)' }}>ПОСТЫ</h4>
          {posts.slice(0, 5).map(p => (
            <div key={p.id} className="p-2 rounded-lg hover:bg-[var(--bg-hover)] cursor-pointer">
              <p className="text-sm truncate">{p.content}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatTimeAgo(p.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
      {users.length === 0 && posts.length === 0 && (
        <p className="text-center py-4" style={{ color: 'var(--text-muted)' }}>Ничего не найдено</p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// УТИЛИТЫ
// ═══════════════════════════════════════════════════════════

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} д`;
  return new Date(timestamp).toLocaleDateString('ru-RU');
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
