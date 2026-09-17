import { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Video, Music, Image, Users, Bell, Search, Settings, 
  Send, Heart, Share2, Bookmark, MoreHorizontal, Plus, X, Phone, 
  VideoIcon, Smile, Paperclip, Mic, ArrowLeft, Check, CheckCheck,
  Home, User, Shield, BarChart3, FileText, Globe, Lock, Database,
  Eye, Trash2, Edit, Ban, Crown, AlertTriangle, ChevronRight,
  Play, Pause, SkipForward, SkipBack, Volume2, Repeat, Shuffle,
  Zap, Film, Camera, MessageCircle, LogOut
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// ТИПЫ
// ═══════════════════════════════════════════════════════════
type Role = 'user' | 'moderator' | 'admin' | 'superadmin';
interface UserT { id:string; username:string; email:string; password:string; role:Role; avatar:string; bio:string; isOnline:boolean; isBanned:boolean; banReason?:string; createdAt:number; followers:string[]; following:string[]; }
interface ChatT { id:string; type:'private'|'group'|'channel'; title:string; avatar:string; members:string[]; createdBy:string; createdAt:number; isPinned:boolean; isMuted:boolean; }
interface MsgT { id:string; chatId:string; userId:string; content:string; type:string; replyTo?:string; reactions:Record<string,string[]>; isEdited:boolean; isDeleted:boolean; createdAt:number; readBy:string[]; }
interface PostT { id:string; userId:string; content:string; type:string; media:string[]; likes:string[]; commentsCount:number; shares:number; hashtags:string[]; createdAt:number; }
interface StoryT { id:string; userId:string; media:string; text?:string; viewedBy:string[]; expiresAt:number; createdAt:number; }
interface VideoT { id:string; userId:string; title:string; description:string; thumbnail:string; duration:number; views:number; likes:string[]; tags:string[]; isShort:boolean; createdAt:number; }
interface MusicT { id:string; userId:string; title:string; artist:string; duration:number; cover:string; plays:number; createdAt:number; }
interface NotifT { id:string; userId:string; type:string; title:string; body:string; isRead:boolean; createdAt:number; }
interface ReportT { id:string; reporterId:string; targetType:string; targetId:string; reason:string; status:string; createdAt:number; }
interface AuditT { id:string; adminId:string; action:string; details:string; createdAt:number; }

// ═══════════════════════════════════════════════════════════
// БАЗА ДАННЫХ (localStorage)
// ═══════════════════════════════════════════════════════════
const DB = {
  get: (k:string):any[] => { try { return JSON.parse(localStorage.getItem('mc_'+k)||'[]'); } catch { return []; } },
  set: (k:string, v:any[]) => localStorage.setItem('mc_'+k, JSON.stringify(v)),
  id: () => Math.random().toString(36).slice(2)+Date.now().toString(36),
};

// ═══════════════════════════════════════════════════════════
// ИНИЦИАЛИЗАЦИЯ ДАННЫХ
// ═══════════════════════════════════════════════════════════
function initDB() {
  if (DB.get<UserT>('users').length > 0) return;
  const admin:UserT = { id:DB.id(), username:'admin', email:'admin@mc.local', password:'Admin123!', role:'superadmin', avatar:'https://api.dicebear.com/7.0/avataaars/svg?seed=admin', bio:'👑 Администратор', isOnline:true, isBanned:false, createdAt:Date.now(), followers:[], following:[] };
  const users:UserT[] = [
    admin,
    { id:DB.id(), username:'alice', email:'alice@test.com', password:'pass123', role:'user', avatar:'https://api.dicebear.com/7.0/avataaars/svg?seed=alice', bio:'🎨 Дизайнер', isOnline:true, isBanned:false, createdAt:Date.now(), followers:[], following:[] },
    { id:DB.id(), username:'bob', email:'bob@test.com', password:'pass123', role:'user', avatar:'https://api.dicebear.com/7.0/avataaars/svg?seed=bob', bio:'💻 Разработчик', isOnline:false, isBanned:false, createdAt:Date.now(), followers:[], following:[] },
    { id:DB.id(), username:'carol', email:'carol@test.com', password:'pass123', role:'user', avatar:'https://api.dicebear.com/7.0/avataaars/svg?seed=carol', bio:'🎵 Музыкант', isOnline:true, isBanned:false, createdAt:Date.now(), followers:[], following:[] },
    { id:DB.id(), username:'dave', email:'dave@test.com', password:'pass123', role:'user', avatar:'https://api.dicebear.com/7.0/avataaars/svg?seed=dave', bio:'🎬 Видеоблогер', isOnline:false, isBanned:false, createdAt:Date.now(), followers:[], following:[] },
  ];
  DB.set('users', users);
  
  // Чаты
  const c1:ChatT = { id:DB.id(), type:'private', title:'', avatar:users[1].avatar, members:[users[1].id, users[2].id], createdBy:users[1].id, createdAt:Date.now()-3600000, isPinned:false, isMuted:false };
  const c2:ChatT = { id:DB.id(), type:'group', title:'🚀 Команда MegaChat', avatar:'https://api.dicebear.com/7.0/avataaars/svg?seed=group', members:users.map(u=>u.id), createdBy:users[0].id, createdAt:Date.now()-7200000, isPinned:true, isMuted:false };
  const c3:ChatT = { id:DB.id(), type:'channel', title:'📢 Новости', avatar:'https://api.dicebear.com/7.0/avataaars/svg?seed=ch', members:users.map(u=>u.id), createdBy:users[0].id, createdAt:Date.now()-86400000, isPinned:false, isMuted:false };
  DB.set('chats', [c1,c2,c3]);

  // Сообщения
  const msgs:MsgT[] = [
    { id:DB.id(), chatId:c1.id, userId:users[1].id, content:'Привет! Как дела? 👋', type:'text', reactions:{}, isEdited:false, isDeleted:false, createdAt:Date.now()-300000, readBy:[users[2].id] },
    { id:DB.id(), chatId:c1.id, userId:users[2].id, content:'Привет! Отлично, работаю над проектом 🚀', type:'text', reactions:{'❤️':[users[1].id]}, isEdited:false, isDeleted:false, createdAt:Date.now()-240000, readBy:[users[1].id] },
    { id:DB.id(), chatId:c1.id, userId:users[1].id, content:'Круто! Расскажи подробнее', type:'text', reactions:{}, isEdited:false, isDeleted:false, createdAt:Date.now()-180000, readBy:[] },
    { id:DB.id(), chatId:c2.id, userId:users[0].id, content:'Всем привет! Добро пожаловать 🎉', type:'text', reactions:{'🎉':[users[1].id,users[3].id]}, isEdited:false, isDeleted:false, createdAt:Date.now()-600000, readBy:users.map(u=>u.id) },
    { id:DB.id(), chatId:c2.id, userId:users[3].id, content:'Спасибо! Рада быть тут 🎵', type:'text', reactions:{}, isEdited:false, isDeleted:false, createdAt:Date.now()-500000, readBy:[] },
    { id:DB.id(), chatId:c3.id, userId:users[0].id, content:'📢 MegaChat v1.0 запущен!', type:'text', reactions:{'🔥':users.map(u=>u.id)}, isEdited:false, isDeleted:false, createdAt:Date.now()-86400000, readBy:users.map(u=>u.id) },
  ];
  DB.set('messages', msgs);

  // Посты
  const posts:PostT[] = [
    { id:DB.id(), userId:users[1].id, content:'🌅 Новый день — новые возможности! Утро начинается с кофе ☕', type:'photo', media:['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600'], likes:[users[0].id,users[2].id,users[3].id], commentsCount:3, shares:1, hashtags:['утро','кофе'], createdAt:Date.now()-3600000 },
    { id:DB.id(), userId:users[2].id, content:'💻 Только что закончил новый фреймворк. Open source скоро!', type:'text', media:[], likes:[users[0].id,users[1].id], commentsCount:5, shares:2, hashtags:['coding','opensource'], createdAt:Date.now()-7200000 },
    { id:DB.id(), userId:users[3].id, content:'🎵 Новый трек уже доступен! Слушайте и делитесь 🎧', type:'photo', media:['https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600'], likes:[users[0].id,users[1].id,users[4].id], commentsCount:8, shares:4, hashtags:['music','newrelease'], createdAt:Date.now()-10800000 },
    { id:DB.id(), userId:users[4].id, content:'🎬 Новое видео на канале! Обзор лучших гаджетов 2024', type:'video', media:['https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600'], likes:[users[1].id,users[3].id], commentsCount:12, shares:6, hashtags:['video','tech'], createdAt:Date.now()-14400000 },
    { id:DB.id(), userId:users[1].id, content:'🎨 Закончила новый дизайн-проект. Как вам?', type:'photo', media:['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600'], likes:[users[0].id,users[2].id,users[3].id,users[4].id], commentsCount:7, shares:3, hashtags:['design','art'], createdAt:Date.now()-18000000 },
  ];
  DB.set('posts', posts);

  // Сторис
  const stories:StoryT[] = [
    { id:DB.id(), userId:users[1].id, media:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', text:'Мой день 🌞', viewedBy:[], expiresAt:Date.now()+86400000, createdAt:Date.now()-3600000 },
    { id:DB.id(), userId:users[3].id, media:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', text:'Запись трека 🎵', viewedBy:[], expiresAt:Date.now()+86400000, createdAt:Date.now()-1800000 },
    { id:DB.id(), userId:users[4].id, media:'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400', text:'За кулисами 🎬', viewedBy:[], expiresAt:Date.now()+86400000, createdAt:Date.now()-900000 },
  ];
  DB.set('stories', stories);

  // Видео
  const videos:VideoT[] = [
    { id:DB.id(), userId:users[4].id, title:'Обзор iPhone 16 Pro', description:'Полный обзор флагмана', thumbnail:'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400', duration:845, views:15420, likes:[users[1].id,users[2].id], tags:['tech','apple'], isShort:false, createdAt:Date.now()-86400000 },
    { id:DB.id(), userId:users[4].id, title:'Топ-10 мест для путешествий', description:'Красивые места планеты', thumbnail:'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400', duration:1200, views:8930, likes:[users[0].id], tags:['travel'], isShort:false, createdAt:Date.now()-172800000 },
    { id:DB.id(), userId:users[2].id, title:'React за 30 минут', description:'Полный курс', thumbnail:'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400', duration:1800, views:22100, likes:[users[1].id,users[3].id,users[4].id], tags:['coding','react'], isShort:false, createdAt:Date.now()-259200000 },
    { id:DB.id(), userId:users[1].id, title:'Дизайн за 5 минут ⚡', description:'Быстрый туториал', thumbnail:'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400', duration:45, views:5670, likes:[users[0].id,users[2].id], tags:['design','short'], isShort:true, createdAt:Date.now()-43200000 },
    { id:DB.id(), userId:users[3].id, title:'SMM стратегии', description:'Продвижение в соцсетях', thumbnail:'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400', duration:960, views:3450, likes:[users[1].id], tags:['smm','business'], isShort:false, createdAt:Date.now()-345600000 },
    { id:DB.id(), userId:users[1].id, title:'Утренний вайб ☀️', description:'', thumbnail:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', duration:15, views:8900, likes:[users[0].id,users[3].id,users[4].id], tags:['morning','vibe'], isShort:true, createdAt:Date.now()-21600000 },
  ];
  DB.set('videos', videos);

  // Музыка
  const music:MusicT[] = [
    { id:DB.id(), userId:users[3].id, title:'Летний вайб', artist:'Carol Music', duration:210, cover:'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200', plays:15420, createdAt:Date.now()-86400000 },
    { id:DB.id(), userId:users[3].id, title:'Ночной город', artist:'Carol Music', duration:195, cover:'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200', plays:8930, createdAt:Date.now()-172800000 },
    { id:DB.id(), userId:users[3].id, title:'Рассвет', artist:'Carol Music', duration:240, cover:'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200', plays:22100, createdAt:Date.now()-259200000 },
    { id:DB.id(), userId:users[3].id, title:'Энергия', artist:'Carol Music', duration:180, cover:'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=200', plays:5670, createdAt:Date.now()-345600000 },
    { id:DB.id(), userId:users[3].id, title:'Мечта', artist:'Carol Music', duration:225, cover:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200', plays:12300, createdAt:Date.now()-432000000 },
  ];
  DB.set('music', music);

  // Уведомления
  DB.set('notifications', []);
  DB.set('reports', []);
  DB.set('audit', []);
}

// ═══════════════════════════════════════════════════════════
// ГЛАВНЫЙ КОМПОНЕНТ
// ═══════════════════════════════════════════════════════════
type Page = 'auth'|'messenger'|'feed'|'videos'|'shorts'|'music'|'profile'|'admin'|'stories';

export default function App() {
  const [user, setUser] = useState<UserT|null>(null);
  const [page, setPage] = useState<Page>('auth');
  const [theme, setTheme] = useState<'dark'|'light'>(() => (localStorage.getItem('mc_theme') as any)||'dark');
  const [notifs, setNotifs] = useState<NotifT[]>([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => { initDB(); }, []);
  useEffect(() => { document.documentElement.className = theme; localStorage.setItem('mc_theme', theme); }, [theme]);

  if (!user) return <AuthPage onLogin={(u) => { setUser(u); setPage('messenger'); }} />;

  return (
    <div className="h-screen w-screen flex overflow-hidden" style={{background:'var(--bg-primary)'}}>
      {/* Sidebar */}
      <nav className="w-[72px] h-full flex flex-col items-center py-4 gap-2 border-r shrink-0" style={{background:'var(--bg-secondary)',borderColor:'var(--border)'}}>
        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center mb-4 cursor-pointer" onClick={() => setPage('messenger')}><Zap size={20} color="white"/></div>
        <NavBtn icon={<MessageSquare size={22}/>} label="Чаты" active={page==='messenger'} onClick={() => setPage('messenger')}/>
        <NavBtn icon={<Home size={22}/>} label="Лента" active={page==='feed'} onClick={() => setPage('feed')}/>
        <NavBtn icon={<Film size={22}/>} label="Видео" active={page==='videos'} onClick={() => setPage('videos')}/>
        <NavBtn icon={<Camera size={22}/>} label="Shorts" active={page==='shorts'} onClick={() => setPage('shorts')}/>
        <NavBtn icon={<Music size={22}/>} label="Музыка" active={page==='music'} onClick={() => setPage('music')}/>
        <NavBtn icon={<Camera size={22}/>} label="Сторис" active={page==='stories'} onClick={() => setPage('stories')}/>
        <NavBtn icon={<User size={22}/>} label="Профиль" active={page==='profile'} onClick={() => setPage('profile')}/>
        {(user.role==='admin'||user.role==='superadmin') && <NavBtn icon={<Shield size={22}/>} label="Админ" active={page==='admin'} onClick={() => setPage('admin')}/>}
        <div className="flex-1"/>
        <NavBtn icon={<Bell size={22}/>} label="Уведомления" active={false} onClick={() => setShowNotif(!showNotif)} badge={notifs.filter(n=>!n.isRead).length||undefined}/>
        <NavBtn icon={<Globe size={22}/>} label="Тема" active={false} onClick={() => setTheme(t=>t==='dark'?'light':'dark')}/>
        <div className="relative cursor-pointer" onClick={() => { setUser(null); setPage('auth'); }}>
          <img src={user.avatar} className="w-9 h-9 rounded-full border-2" style={{borderColor:'var(--accent)'}} alt=""/>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 h-full overflow-hidden relative">
        {page==='messenger' && <MessengerPage user={user}/>}
        {page==='feed' && <FeedPage user={user}/>}
        {page==='videos' && <VideosPage user={user}/>}
        {page==='shorts' && <ShortsPage user={user}/>}
        {page==='music' && <MusicPage user={user}/>}
        {page==='profile' && <ProfilePage user={user}/>}
        {page==='admin' && <AdminPanel user={user}/>}
        {page==='stories' && <StoriesPage user={user}/>}
      </main>

      {/* Notifs panel */}
      {showNotif && (
        <div className="absolute right-4 top-4 w-80 max-h-96 overflow-y-auto rounded-2xl shadow-2xl z-50 fade-in" style={{background:'var(--bg-secondary)',border:'1px solid var(--border)'}}>
          <div className="p-4 border-b flex items-center justify-between" style={{borderColor:'var(--border)'}}>
            <h3 className="font-bold">Уведомления</h3>
            <button onClick={() => setShowNotif(false)}><X size={18}/></button>
          </div>
          <p className="p-4 text-center text-sm" style={{color:'var(--text-muted)'}}>Нет новых уведомлений</p>
        </div>
      )}
    </div>
  );
}

function NavBtn({icon,label,active,onClick,badge}:{icon:React.ReactNode;label:string;active:boolean;onClick:()=>void;badge?:number}) {
  return (
    <button className={`nav-item w-12 h-12 rounded-xl flex items-center justify-center relative transition-all ${active?'active':''}`}
      style={{color:active?'var(--accent)':'var(--text-muted)',background:active?'var(--accent-light)':'transparent'}} onClick={onClick} title={label}>
      {icon}{badge && badge>0 && <span className="badge absolute -top-1 -right-1">{badge}</span>}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════
// АВТОРИЗАЦИЯ
// ═══════════════════════════════════════════════════════════
function AuthPage({onLogin}:{onLogin:(u:UserT)=>void}) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e:React.FormEvent) => {
    e.preventDefault(); setError('');
    const users = DB.get<UserT>('users');
    if (isLogin) {
      const u = users.find(u => u.username === username);
      if (!u) { setError('Пользователь не найден'); return; }
      if (u.password !== password) { setError('Неверный пароль'); return; }
      if (u.isBanned) { setError(`Заблокирован: ${u.banReason||''}`); return; }
      u.isOnline = true; DB.set('users', users);
      onLogin(u);
    } else {
      if (!username||!email||!password) { setError('Заполните все поля'); return; }
      if (password.length<6) { setError('Пароль минимум 6 символов'); return; }
      if (users.find(u=>u.username===username)) { setError('Имя занято'); return; }
      const role = users.length===0 ? 'superadmin' : 'user';
      const u:UserT = { id:DB.id(), username, email, password, role, avatar:`https://api.dicebear.com/7.0/avataaars/svg?seed=${username}`, bio:'', isOnline:true, isBanned:false, createdAt:Date.now(), followers:[], following:[] };
      users.push(u); DB.set('users', users);
      onLogin(u);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center" style={{background:'var(--bg-primary)'}}>
      <div className="w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4"><Zap size={32} color="white"/></div>
          <h1 className="text-3xl font-bold gradient-text">MegaChat</h1>
          <p style={{color:'var(--text-secondary)'}}>Мессенджер нового поколения</p>
        </div>
        <div className="rounded-2xl p-8" style={{background:'var(--bg-secondary)',border:'1px solid var(--border)'}}>
          <div className="flex gap-2 mb-6">
            <button className={`flex-1 py-3 rounded-xl font-semibold ${isLogin?'gradient-bg text-white':''}`} style={!isLogin?{background:'var(--bg-tertiary)',color:'var(--text-secondary)'}:{}} onClick={() => setIsLogin(true)}>Вход</button>
            <button className={`flex-1 py-3 rounded-xl font-semibold ${!isLogin?'gradient-bg text-white':''}`} style={isLogin?{background:'var(--bg-tertiary)',color:'var(--text-secondary)'}:{}} onClick={() => setIsLogin(false)}>Регистрация</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block" style={{color:'var(--text-secondary)'}}>Имя пользователя</label><input className="input-field" value={username} onChange={e=>setUsername(e.target.value)}/></div>
            {!isLogin && <div><label className="text-sm font-medium mb-1 block" style={{color:'var(--text-secondary)'}}>Email</label><input className="input-field" type="email" value={email} onChange={e=>setEmail(e.target.value)}/></div>}
            <div><label className="text-sm font-medium mb-1 block" style={{color:'var(--text-secondary)'}}>Пароль</label><input className="input-field" type="password" value={password} onChange={e=>setPassword(e.target.value)}/></div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" className="btn-primary w-full text-center">{isLogin?'Войти':'Создать аккаунт'}</button>
          </form>
          <div className="mt-6 p-3 rounded-xl" style={{background:'var(--bg-tertiary)'}}>
            <p className="text-xs" style={{color:'var(--text-muted)'}}>
              <strong>Тестовые аккаунты:</strong><br/>
              admin / Admin123! (админ)<br/>
              alice / pass123 (пользователь)<br/>
              bob / pass123, carol / pass123, dave / pass123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// МЕССЕНДЖЕР
// ═══════════════════════════════════════════════════════════
function MessengerPage({user}:{user:UserT}) {
  const [chatList, setChatList] = useState<ChatT[]>(DB.get<ChatT>('chats').filter(c=>c.members.includes(user.id)));
  const [selected, setSelected] = useState<ChatT|null>(null);
  const [msgs, setMsgs] = useState<MsgT[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [showList, setShowList] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (selected) setMsgs(DB.get<MsgT>('messages').filter(m=>m.chatId===selected.id&&!m.isDeleted).sort((a,b)=>a.createdAt-b.createdAt)); }, [selected]);
  useEffect(() => { endRef.current?.scrollIntoView({behavior:'smooth'}); }, [msgs]);

  const send = () => {
    if (!newMsg.trim()||!selected) return;
    const all = DB.get<MsgT>('messages');
    const m:MsgT = { id:DB.id(), chatId:selected.id, userId:user.id, content:newMsg.trim(), type:'text', reactions:{}, isEdited:false, isDeleted:false, createdAt:Date.now(), readBy:[] };
    all.push(m); DB.set('messages', all);
    setMsgs(all.filter(x=>x.chatId===selected.id&&!x.isDeleted).sort((a,b)=>a.createdAt-b.createdAt));
    setNewMsg('');
  };

  const react = (msgId:string, emoji:string) => {
    const all = DB.get<MsgT>('messages');
    const m = all.find(x=>x.id===msgId); if (!m) return;
    if (!m.reactions[emoji]) m.reactions[emoji]=[];
    const idx = m.reactions[emoji].indexOf(user.id);
    if (idx>-1) m.reactions[emoji].splice(idx,1); else m.reactions[emoji].push(user.id);
    if (m.reactions[emoji].length===0) delete m.reactions[emoji];
    DB.set('messages', all);
    setMsgs(DB.get<MsgT>('messages').filter(x=>x.chatId===selected!.id&&!x.isDeleted).sort((a,b)=>a.createdAt-b.createdAt));
  };

  const getUser = (id:string) => DB.get<UserT>('users').find(u=>u.id===id);

  return (
    <div className="h-full flex">
      <div className={`${showList?'w-80':'w-0 overflow-hidden'} h-full border-r flex flex-col transition-all`} style={{background:'var(--bg-secondary)',borderColor:'var(--border)'}}>
        <div className="p-4 border-b" style={{borderColor:'var(--border)'}}><h2 className="text-xl font-bold">Чаты</h2></div>
        <div className="flex-1 overflow-y-auto">
          {chatList.map(chat => {
            const chatMsgs = DB.get<MsgT>('messages').filter(m=>m.chatId===chat.id);
            const last = chatMsgs[chatMsgs.length-1];
            const other = chat.type==='private' ? getUser(chat.members.find(m=>m!==user.id)||'') : null;
            return (
              <div key={chat.id} className={`p-3 flex items-center gap-3 cursor-pointer border-b ${selected?.id===chat.id?'bg-[var(--accent-light)]':'hover:bg-[var(--bg-hover)]'}`} style={{borderColor:'var(--border)'}} onClick={() => {setSelected(chat);setShowList(false);}}>
                <div className="relative shrink-0"><img src={chat.avatar||other?.avatar||''} className="w-12 h-12 rounded-full avatar" alt=""/>{other?.isOnline && <div className="online-dot"/>}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm truncate">{chat.type==='private'?(other?.username||'Чат'):chat.title}</span>
                    {last && <span className="text-xs shrink-0" style={{color:'var(--text-muted)'}}>{fmtTime(last.createdAt)}</span>}
                  </div>
                  <p className="text-xs truncate mt-0.5" style={{color:'var(--text-secondary)'}}>{last?last.content:'Нет сообщений'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selected ? (
        <div className="flex-1 flex flex-col h-full">
          <div className="h-16 px-4 flex items-center justify-between border-b" style={{borderColor:'var(--border)',background:'var(--bg-secondary)'}}>
            <div className="flex items-center gap-3">
              <button className="md:hidden" onClick={() => setShowList(true)}><ArrowLeft size={20}/></button>
              <img src={selected.avatar} className="w-10 h-10 rounded-full avatar" alt=""/>
              <div><h3 className="font-semibold text-sm">{selected.title||getUser(selected.members.find(m=>m!==user.id)||'')?.username}</h3><p className="text-xs" style={{color:'var(--text-muted)'}}>{selected.type==='private'?'в сети':`${selected.members.length} участников`}</p></div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-full hover:bg-[var(--bg-hover)]"><Phone size={18} style={{color:'var(--text-secondary)'}}/></button>
              <button className="p-2 rounded-full hover:bg-[var(--bg-hover)]"><VideoIcon size={18} style={{color:'var(--text-secondary)'}}/></button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{background:'var(--bg-primary)'}}>
            {msgs.map(msg => {
              const mine = msg.userId===user.id;
              const sender = getUser(msg.userId);
              return (
                <div key={msg.id} className={`flex ${mine?'justify-end':'justify-start'} fade-in`}>
                  <div className="group relative">
                    {!mine && selected.type!=='private' && <p className="text-xs mb-1 ml-3 font-medium" style={{color:'var(--accent)'}}>{sender?.username}</p>}
                    <div className={`message-bubble ${mine?'message-sent':'message-received'}`}>
                      <p className="text-sm">{msg.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[10px] opacity-60">{fmtTime(msg.createdAt)}</span>
                        {mine && (msg.readBy.length>0?<CheckCheck size={12} className="opacity-60"/>:<Check size={12} className="opacity-60"/>)}
                      </div>
                    </div>
                    {Object.keys(msg.reactions).length>0 && (
                      <div className="flex gap-1 mt-1 ml-3">{Object.entries(msg.reactions).map(([e,us]) => (
                        <span key={e} className="text-xs px-2 py-0.5 rounded-full cursor-pointer" style={{background:'var(--bg-tertiary)'}} onClick={() => react(msg.id,e)}>{e} {us.length}</span>
                      ))}</div>
                    )}
                    <button className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded-full" style={{background:'var(--bg-tertiary)'}} onClick={() => react(msg.id,'❤️')}><Heart size={14} style={{color:'var(--text-muted)'}}/></button>
                  </div>
                </div>
              );
            })}
            <div ref={endRef}/>
          </div>
          <div className="p-4 border-t flex items-center gap-3" style={{borderColor:'var(--border)',background:'var(--bg-secondary)'}}>
            <button className="p-2 rounded-full hover:bg-[var(--bg-hover)]"><Paperclip size={20} style={{color:'var(--text-secondary)'}}/></button>
            <input className="input-field flex-1" placeholder="Сообщение..." value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}/>
            <button className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center" onClick={send}><Send size={18} color="white"/></button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center" style={{background:'var(--bg-primary)'}}>
          <div className="text-center"><MessageSquare size={64} style={{color:'var(--text-muted)'}} className="mx-auto mb-4"/><h3 className="text-xl font-bold mb-2">Выберите чат</h3><p style={{color:'var(--text-muted)'}}>Начните общение</p></div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ЛЕНТА
// ═══════════════════════════════════════════════════════════
function FeedPage({user}:{user:UserT}) {
  const [posts, setPosts] = useState<PostT[]>(DB.get<PostT>('posts'));
  const [content, setContent] = useState('');
  const stories = DB.get<StoryT>('stories').filter(s=>s.expiresAt>Date.now());

  const create = () => {
    if (!content.trim()) return;
    const all = DB.get<PostT>('posts');
    const hashtags = content.match(/#\w+/g)?.map(h=>h.slice(1))||[];
    all.unshift({ id:DB.id(), userId:user.id, content, type:'text', media:[], likes:[], commentsCount:0, shares:0, hashtags, createdAt:Date.now() });
    DB.set('posts', all); setPosts(all); setContent('');
  };

  const like = (id:string) => {
    const all = DB.get<PostT>('posts');
    const p = all.find(x=>x.id===id); if (!p) return;
    const idx = p.likes.indexOf(user.id);
    if (idx>-1) p.likes.splice(idx,1); else p.likes.push(user.id);
    DB.set('posts', all); setPosts([...all]);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto py-6 px-4">
        {/* Stories */}
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          {stories.map(s => { const u = DB.get<UserT>('users').find(x=>x.id===s.userId); return (
            <div key={s.id} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer">
              <div className="story-ring"><img src={u?.avatar||''} className="w-14 h-14 rounded-full avatar border-2" style={{borderColor:'var(--bg-secondary)'}} alt=""/></div>
              <span className="text-xs truncate w-16 text-center" style={{color:'var(--text-secondary)'}}>{u?.username}</span>
            </div>
          ); })}
        </div>

        {/* Create */}
        <div className="feed-card p-4 mb-6">
          <div className="flex items-center gap-3">
            <img src={user.avatar} className="w-10 h-10 rounded-full avatar" alt=""/>
            <input className="flex-1 input-field" placeholder="Что нового?" value={content} onChange={e=>setContent(e.target.value)}/>
          </div>
          {content && <div className="mt-3 fade-in"><textarea className="input-field h-20 resize-none" value={content} onChange={e=>setContent(e.target.value)}/><div className="flex justify-end mt-2"><button className="btn-primary text-sm py-2 px-4" onClick={create}>Опубликовать</button></div></div>}
        </div>

        {/* Posts */}
        {posts.map(post => {
          const pu = DB.get<UserT>('users').find(u=>u.id===post.userId);
          const liked = post.likes.includes(user.id);
          return (
            <div key={post.id} className="feed-card mb-6 fade-in">
              <div className="p-4 flex items-center gap-3">
                <img src={pu?.avatar||''} className="w-10 h-10 rounded-full avatar" alt=""/>
                <div><span className="font-semibold text-sm">{pu?.username}</span><p className="text-xs" style={{color:'var(--text-muted)'}}>{fmtAgo(post.createdAt)}</p></div>
              </div>
              <div className="px-4 pb-3"><p className="text-sm leading-relaxed">{post.content}</p>
                {post.hashtags.length>0 && <div className="flex flex-wrap gap-1 mt-2">{post.hashtags.map(h=><span key={h} className="text-xs px-2 py-0.5 rounded-full" style={{color:'var(--accent)',background:'var(--accent-light)'}}>#{h}</span>)}</div>}
              </div>
              {post.media.length>0 && <img src={post.media[0]} className="w-full max-h-96 object-cover" alt=""/>}
              <div className="p-4 flex items-center justify-between border-t" style={{borderColor:'var(--border)'}}>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1.5" onClick={() => like(post.id)}><Heart size={20} fill={liked?'#ff3d71':'none'} style={{color:liked?'#ff3d71':'var(--text-secondary)'}}/><span className="text-sm font-medium">{post.likes.length}</span></button>
                  <button className="flex items-center gap-1.5"><MessageCircle size={20} style={{color:'var(--text-secondary)'}}/><span className="text-sm font-medium">{post.commentsCount}</span></button>
                  <button className="flex items-center gap-1.5"><Share2 size={20} style={{color:'var(--text-secondary)'}}/><span className="text-sm font-medium">{post.shares}</span></button>
                </div>
                <button><Bookmark size={20} style={{color:'var(--text-secondary)'}}/></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ВИДЕО
// ═══════════════════════════════════════════════════════════
function VideosPage({user}:{user:UserT}) {
  const [videos, setVideos] = useState<VideoT[]>(DB.get<VideoT>('videos').filter(v=>!v.isShort));
  const [sel, setSel] = useState<VideoT|null>(null);

  if (sel) {
    const vu = DB.get<UserT>('users').find(u=>u.id===sel.userId);
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-5xl mx-auto p-4">
          <button onClick={() => setSel(null)} className="mb-4 flex items-center gap-2 text-sm" style={{color:'var(--accent)'}}><ArrowLeft size={16}/>Назад</button>
          <div className="relative rounded-2xl overflow-hidden mb-4" style={{background:'#000'}}>
            <img src={sel.thumbnail} className="w-full aspect-video object-cover" alt=""/>
            <div className="absolute inset-0 flex items-center justify-center bg-black/30"><div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center cursor-pointer"><Play size={28} color="white" fill="white"/></div></div>
          </div>
          <h1 className="text-xl font-bold mb-2">{sel.title}</h1>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img src={vu?.avatar||''} className="w-10 h-10 rounded-full avatar" alt=""/>
              <div><p className="font-semibold text-sm">{vu?.username}</p><p className="text-xs" style={{color:'var(--text-muted)'}}>{sel.views.toLocaleString()} просмотров • {fmtAgo(sel.createdAt)}</p></div>
              <button className="btn-primary text-sm py-2 px-4 ml-4">Подписаться</button>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-secondary text-sm py-2 px-3 flex items-center gap-1"><Heart size={16}/>{sel.likes.length}</button>
              <button className="btn-secondary text-sm py-2 px-3 flex items-center gap-1"><Share2 size={16}/>Поделиться</button>
            </div>
          </div>
          <div className="p-4 rounded-xl" style={{background:'var(--bg-tertiary)'}}>
            <p className="text-sm" style={{color:'var(--text-secondary)'}}>{sel.description}</p>
            <div className="flex gap-2 mt-2">{sel.tags.map(t=><span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{color:'var(--accent)',background:'var(--accent-light)'}}>#{t}</span>)}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Видео</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map(v => { const vu = DB.get<UserT>('users').find(u=>u.id===v.userId); return (
            <div key={v.id} className="video-card cursor-pointer" onClick={() => setSel(v)}>
              <div className="relative"><img src={v.thumbnail} className="w-full aspect-video object-cover" alt=""/><span className="duration">{fmtDur(v.duration)}</span></div>
              <div className="p-3"><div className="flex gap-3"><img src={vu?.avatar||''} className="w-8 h-8 rounded-full avatar shrink-0" alt=""/><div className="min-w-0"><h3 className="font-semibold text-sm line-clamp-2">{v.title}</h3><p className="text-xs mt-1" style={{color:'var(--text-muted)'}}>{vu?.username} • {v.views.toLocaleString()} просм.</p></div></div></div>
            </div>
          ); })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SHORTS
// ═══════════════════════════════════════════════════════════
function ShortsPage({user}:{user:UserT}) {
  const shorts = DB.get<VideoT>('videos').filter(v=>v.isShort);
  const [idx, setIdx] = useState(0);

  return (
    <div className="h-full flex items-center justify-center" style={{background:'#000'}}>
      <div className="relative w-full max-w-sm h-full max-h-[80vh] rounded-3xl overflow-hidden" style={{background:'var(--bg-secondary)'}}>
        {shorts[idx] && <>
          <img src={shorts[idx].thumbnail} className="w-full h-full object-cover" alt=""/>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"/>
          <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6">
            <button className="flex flex-col items-center"><div className="w-12 h-12 rounded-full flex items-center justify-center" style={{background:'rgba(255,255,255,0.15)'}}><Heart size={24} color="white"/></div><span className="text-white text-xs mt-1">{shorts[idx].likes.length}</span></button>
            <button className="flex flex-col items-center"><div className="w-12 h-12 rounded-full flex items-center justify-center" style={{background:'rgba(255,255,255,0.15)'}}><MessageSquare size={24} color="white"/></div></button>
            <button className="flex flex-col items-center"><div className="w-12 h-12 rounded-full flex items-center justify-center" style={{background:'rgba(255,255,255,0.15)'}}><Share2 size={24} color="white"/></div></button>
          </div>
          <div className="absolute bottom-6 left-4 right-16">
            <div className="flex items-center gap-2 mb-2">
              <img src={DB.get<UserT>('users').find(u=>u.id===shorts[idx].userId)?.avatar||''} className="w-8 h-8 rounded-full border-2 border-white" alt=""/>
              <span className="text-white font-semibold text-sm">@{DB.get<UserT>('users').find(u=>u.id===shorts[idx].userId)?.username}</span>
            </div>
            <p className="text-white text-sm">{shorts[idx].title}</p>
          </div>
          <div className="absolute top-1/2 left-0 right-0 flex justify-between px-2">
            <button className="w-10 h-10 rounded-full flex items-center justify-center" style={{background:'rgba(255,255,255,0.1)'}} onClick={() => setIdx(Math.max(0,idx-1))}><ChevronRight size={20} color="white" className="rotate-180"/></button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center" style={{background:'rgba(255,255,255,0.1)'}} onClick={() => setIdx(Math.min(shorts.length-1,idx+1))}><ChevronRight size={20} color="white"/></button>
          </div>
        </>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// МУЗЫКА
// ═══════════════════════════════════════════════════════════
function MusicPage({user}:{user:UserT}) {
  const tracks = DB.get<MusicT>('music');
  const [cur, setCur] = useState<MusicT|null>(null);
  const [playing, setPlaying] = useState(false);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Музыка</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[{name:'Мне нравится',count:42,color:'from-purple-500 to-pink-500'},{name:'Для работы',count:18,color:'from-blue-500 to-cyan-500'},{name:'Вечеринка',count:35,color:'from-orange-500 to-red-500'},{name:'Релакс',count:24,color:'from-green-500 to-teal-500'}].map(pl => (
              <div key={pl.name} className="rounded-xl p-4 cursor-pointer transition-all hover:scale-105" style={{background:'var(--bg-secondary)',border:'1px solid var(--border)'}}>
                <div className={`w-full aspect-square rounded-lg bg-gradient-to-br ${pl.color} mb-3 flex items-center justify-center`}><Music size={32} color="white"/></div>
                <h3 className="font-semibold text-sm">{pl.name}</h3><p className="text-xs" style={{color:'var(--text-muted)'}}>{pl.count} треков</p>
              </div>
            ))}
          </div>
          <h2 className="font-bold text-lg mb-4">Все треки</h2>
          <div className="space-y-1">
            {tracks.map((t,i) => {
              const active = cur?.id===t.id;
              return (
                <div key={t.id} className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all ${active?'':'hover:bg-[var(--bg-hover)]'}`} style={active?{background:'var(--accent-light)'}:{}} onClick={() => {setCur(t);setPlaying(true);}}>
                  <span className="w-6 text-center text-sm" style={{color:'var(--text-muted)'}}>{active&&playing?<div className="music-wave"><span/><span/><span/><span/><span/></div>:i+1}</span>
                  <img src={t.cover} className="w-12 h-12 rounded-lg object-cover" alt=""/>
                  <div className="flex-1 min-w-0"><p className={`font-medium text-sm truncate ${active?'text-[var(--accent)]':''}`}>{t.title}</p><p className="text-xs truncate" style={{color:'var(--text-muted)'}}>{t.artist}</p></div>
                  <span className="text-xs" style={{color:'var(--text-muted)'}}>{fmtDur(t.duration)}</span>
                  <span className="text-xs" style={{color:'var(--text-muted)'}}>{t.plays.toLocaleString()} ▶</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {cur && (
        <div className="h-20 border-t flex items-center px-4 gap-4" style={{background:'var(--bg-secondary)',borderColor:'var(--border)'}}>
          <img src={cur.cover} className="w-12 h-12 rounded-lg object-cover" alt=""/>
          <div className="w-40 min-w-0"><p className="font-medium text-sm truncate">{cur.title}</p><p className="text-xs truncate" style={{color:'var(--text-muted)'}}>{cur.artist}</p></div>
          <div className="flex-1 flex items-center justify-center gap-4">
            <button><Shuffle size={16} style={{color:'var(--text-muted)'}}/></button>
            <button><SkipBack size={18}/></button>
            <button className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center" onClick={() => setPlaying(!playing)}>{playing?<Pause size={18} color="white"/>:<Play size={18} color="white" fill="white"/>}</button>
            <button><SkipForward size={18}/></button>
            <button><Repeat size={16} style={{color:'var(--text-muted)'}}/></button>
          </div>
          <Volume2 size={16} style={{color:'var(--text-muted)'}}/>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ПРОФИЛЬ
// ═══════════════════════════════════════════════════════════
function ProfilePage({user}:{user:UserT}) {
  const myPosts = DB.get<PostT>('posts').filter(p=>p.userId===user.id);
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="h-48 relative" style={{background:'var(--gradient-1)'}}><div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--bg-primary)] to-transparent"/></div>
        <div className="px-6 -mt-16 relative">
          <div className="flex items-end gap-4">
            <img src={user.avatar} className="w-32 h-32 rounded-full avatar border-4" style={{borderColor:'var(--bg-primary)'}} alt=""/>
            <div className="pb-4 flex-1">
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <p className="text-sm" style={{color:'var(--text-secondary)'}}>{user.bio||'Нет описания'}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm"><strong>{user.followers.length}</strong> <span style={{color:'var(--text-muted)'}}>подписчиков</span></span>
                <span className="text-sm"><strong>{user.following.length}</strong> <span style={{color:'var(--text-muted)'}}>подписок</span></span>
                <span className="text-sm"><strong>{myPosts.length}</strong> <span style={{color:'var(--text-muted)'}}>постов</span></span>
              </div>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-medium pb-4 ${user.role==='superadmin'?'bg-yellow-500/20 text-yellow-400':user.role==='admin'?'bg-purple-500/20 text-purple-400':'bg-gray-500/20 text-gray-400'}`}>{user.role}</span>
          </div>
          <div className="py-6 space-y-4">
            {myPosts.length===0 ? <p className="text-center py-8" style={{color:'var(--text-muted)'}}>Нет постов</p> : myPosts.map(p => (
              <div key={p.id} className="feed-card p-4"><p className="text-sm">{p.content}</p><div className="flex items-center gap-4 mt-3 pt-3 border-t" style={{borderColor:'var(--border)'}}><span className="text-xs" style={{color:'var(--text-muted)'}}>❤️ {p.likes.length}</span><span className="text-xs" style={{color:'var(--text-muted)'}}>{fmtAgo(p.createdAt)}</span></div></div>
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
function StoriesPage({user}:{user:UserT}) {
  const stories = DB.get<StoryT>('stories').filter(s=>s.expiresAt>Date.now());
  const [idx, setIdx] = useState(0);
  return (
    <div className="h-full flex items-center justify-center" style={{background:'#000'}}>
      {stories.length===0 ? (
        <div className="text-center"><Camera size={48} style={{color:'var(--text-muted)'}} className="mx-auto mb-4"/><h3 className="text-xl font-bold text-white mb-2">Нет активных сторис</h3></div>
      ) : (
        <div className="relative w-full max-w-sm h-full max-h-[85vh] rounded-3xl overflow-hidden">
          <img src={stories[idx]?.media||''} className="w-full h-full object-cover" alt=""/>
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50"/>
          <div className="absolute top-4 left-4 right-4 flex gap-1">{stories.map((_,i) => <div key={i} className="flex-1 h-0.5 rounded-full" style={{background:i<=idx?'white':'rgba(255,255,255,0.3)'}}/>)}</div>
          <div className="absolute top-8 left-4 flex items-center gap-2"><img src={DB.get<UserT>('users').find(u=>u.id===stories[idx]?.userId)?.avatar||''} className="w-8 h-8 rounded-full border-2 border-white" alt=""/><span className="text-white font-semibold text-sm">{DB.get<UserT>('users').find(u=>u.id===stories[idx]?.userId)?.username}</span></div>
          {stories[idx]?.text && <div className="absolute bottom-20 left-4 right-4"><p className="text-white text-lg font-medium text-center">{stories[idx].text}</p></div>}
          <div className="absolute inset-y-0 left-0 w-1/3 cursor-pointer" onClick={() => setIdx(Math.max(0,idx-1))}/>
          <div className="absolute inset-y-0 right-0 w-1/3 cursor-pointer" onClick={() => setIdx(Math.min(stories.length-1,idx+1))}/>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// АДМИН-ПАНЕЛЬ
// ═══════════════════════════════════════════════════════════
function AdminPanel({user}:{user:UserT}) {
  const [section, setSection] = useState('dashboard');
  const [users, setUsers] = useState<UserT[]>(DB.get<UserT>('users'));
  const [reports, setReports] = useState<ReportT[]>(DB.get<ReportT>('reports'));
  const [audit, setAudit] = useState<AuditT[]>(DB.get<AuditT>('audit'));
  
  const posts = DB.get<PostT>('posts');
  const videos = DB.get<VideoT>('videos');
  const messages = DB.get<MsgT>('messages');

  const banUser = (id:string) => { const all = DB.get<UserT>('users'); const u = all.find(x=>x.id===id); if (u) { u.isBanned=!u.isBanned; DB.set('users',all); setUsers([...all]); } };
  const changeRole = (id:string, role:Role) => { const all = DB.get<UserT>('users'); const u = all.find(x=>x.id===id); if (u) { u.role=role; DB.set('users',all); setUsers([...all]); } };
  const deleteUser = (id:string) => { if (!confirm('Удалить?')) return; DB.set('users', DB.get<UserT>('users').filter(u=>u.id!==id)); setUsers(DB.get<UserT>('users')); };

  const sections = [
    {id:'dashboard',label:'Дашборд',icon:<BarChart3 size={18}/>},
    {id:'users',label:'Пользователи',icon:<Users size={18}/>},
    {id:'content',label:'Контент',icon:<FileText size={18}/>},
    {id:'reports',label:'Жалобы',icon:<AlertTriangle size={18}/>},
    {id:'security',label:'Безопасность',icon:<Lock size={18}/>},
    {id:'logs',label:'Логи',icon:<Eye size={18}/>},
  ];

  return (
    <div className="h-full flex">
      <div className="w-56 h-full border-r p-4 flex flex-col shrink-0" style={{background:'var(--bg-secondary)',borderColor:'var(--border)'}}>
        <div className="flex items-center gap-2 mb-6"><Shield size={20} style={{color:'var(--accent)'}}/><span className="font-bold">Админ</span></div>
        <div className="space-y-1 flex-1">{sections.map(s => <div key={s.id} className={`admin-sidebar-item ${section===s.id?'active':''}`} onClick={() => setSection(s.id)}>{s.icon}<span className="text-sm">{s.label}</span></div>)}</div>
      </div>
      <div className="flex-1 h-full overflow-y-auto p-6">
        {section==='dashboard' && (
          <div className="fade-in">
            <h1 className="text-2xl font-bold mb-6">Дашборд</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[{l:'Пользователи',v:users.length,c:'from-blue-500 to-cyan-500'},{l:'Посты',v:posts.length,c:'from-purple-500 to-pink-500'},{l:'Видео',v:videos.length,c:'from-orange-500 to-red-500'},{l:'Сообщения',v:messages.length,c:'from-green-500 to-teal-500'}].map(s => (
                <div key={s.l} className="stat-card"><div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.c} flex items-center justify-center mb-3`}><BarChart3 size={18} color="white"/></div><p className="text-2xl font-bold">{s.v}</p><p className="text-sm" style={{color:'var(--text-muted)'}}>{s.l}</p></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="stat-card"><h3 className="font-bold mb-4">Активность (7 дней)</h3><div className="flex items-end gap-2 h-32">{[40,65,45,80,55,90,70].map((h,i) => <div key={i} className="flex-1 rounded-t-lg gradient-bg" style={{height:`${h}%`}}/>)}</div><div className="flex justify-between mt-2">{['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => <span key={d} className="text-xs flex-1 text-center" style={{color:'var(--text-muted)'}}>{d}</span>)}</div></div>
              <div className="stat-card"><h3 className="font-bold mb-4">Регистрации</h3><div className="flex items-end gap-2 h-32">{[20,35,50,40,60,75,55].map((h,i) => <div key={i} className="flex-1 rounded-t-lg" style={{height:`${h}%`,background:'var(--gradient-2)'}}/>)}</div><div className="flex justify-between mt-2">{['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => <span key={d} className="text-xs flex-1 text-center" style={{color:'var(--text-muted)'}}>{d}</span>)}</div></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="stat-card"><h4 className="text-sm font-medium mb-2" style={{color:'var(--text-muted)'}}>CPU</h4><div className="flex items-center gap-3"><div className="flex-1 h-2 rounded-full" style={{background:'var(--bg-tertiary)'}}><div className="h-full w-1/4 rounded-full" style={{background:'var(--success)'}}/></div><span className="text-sm font-bold">24%</span></div></div>
              <div className="stat-card"><h4 className="text-sm font-medium mb-2" style={{color:'var(--text-muted)'}}>RAM</h4><div className="flex items-center gap-3"><div className="flex-1 h-2 rounded-full" style={{background:'var(--bg-tertiary)'}}><div className="h-full w-3/5 rounded-full" style={{background:'var(--warning)'}}/></div><span className="text-sm font-bold">58%</span></div></div>
              <div className="stat-card"><h4 className="text-sm font-medium mb-2" style={{color:'var(--text-muted)'}}>База данных</h4><p className="text-sm" style={{color:'var(--text-muted)'}}>localStorage • WAL mode</p></div>
            </div>
          </div>
        )}

        {section==='users' && (
          <div className="fade-in">
            <h1 className="text-2xl font-bold mb-6">Пользователи ({users.length})</h1>
            <div className="rounded-xl overflow-hidden" style={{border:'1px solid var(--border)'}}>
              <table className="w-full"><thead><tr style={{background:'var(--bg-tertiary)'}}><th className="text-left p-3 text-xs font-medium" style={{color:'var(--text-muted)'}}>Пользователь</th><th className="text-left p-3 text-xs font-medium" style={{color:'var(--text-muted)'}}>Роль</th><th className="text-left p-3 text-xs font-medium" style={{color:'var(--text-muted)'}}>Статус</th><th className="text-right p-3 text-xs font-medium" style={{color:'var(--text-muted)'}}>Действия</th></tr></thead>
              <tbody>{users.map(u => (
                <tr key={u.id} className="border-t" style={{borderColor:'var(--border)'}}>
                  <td className="p-3"><div className="flex items-center gap-3"><img src={u.avatar} className="w-8 h-8 rounded-full avatar" alt=""/><div><p className="font-medium text-sm">{u.username}</p><p className="text-xs" style={{color:'var(--text-muted)'}}>{u.email}</p></div></div></td>
                  <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role==='superadmin'?'bg-yellow-500/20 text-yellow-400':u.role==='admin'?'bg-purple-500/20 text-purple-400':u.role==='moderator'?'bg-blue-500/20 text-blue-400':'bg-gray-500/20 text-gray-400'}`}>{u.role}</span></td>
                  <td className="p-3">{u.isBanned?<span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">Бан</span>:<span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Активен</span>}</td>
                  <td className="p-3 text-right"><div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)]" onClick={() => banUser(u.id)} title={u.isBanned?'Разбан':'Забанить'}><Ban size={14} style={{color:u.isBanned?'var(--success)':'var(--danger)'}}/></button>
                    {user.role==='superadmin' && u.id!==user.id && <button className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)]" onClick={() => deleteUser(u.id)} title="Удалить"><Trash2 size={14} style={{color:'var(--danger)'}}/></button>}
                  </div></td>
                </tr>
              ))}</tbody></table>
            </div>
          </div>
        )}

        {section==='content' && (
          <div className="fade-in">
            <h1 className="text-2xl font-bold mb-6">Контент</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="stat-card"><h3 className="font-bold mb-4">Посты ({posts.length})</h3><div className="space-y-2 max-h-96 overflow-y-auto">{posts.slice(0,10).map(p => { const u = DB.get<UserT>('users').find(x=>x.id===p.userId); return (
                <div key={p.id} className="flex items-center justify-between p-2 rounded-lg" style={{background:'var(--bg-tertiary)'}}><div className="flex-1 min-w-0"><p className="text-sm truncate">{p.content.slice(0,50)}</p><p className="text-xs" style={{color:'var(--text-muted)'}}>{u?.username} • {fmtAgo(p.createdAt)}</p></div></div>
              ); })}</div></div>
              <div className="stat-card"><h3 className="font-bold mb-4">Видео ({videos.length})</h3><div className="space-y-2 max-h-96 overflow-y-auto">{videos.map(v => { const u = DB.get<UserT>('users').find(x=>x.id===v.userId); return (
                <div key={v.id} className="flex items-center gap-3 p-2 rounded-lg" style={{background:'var(--bg-tertiary)'}}><img src={v.thumbnail} className="w-16 h-10 rounded object-cover" alt=""/><div className="flex-1 min-w-0"><p className="text-sm truncate">{v.title}</p><p className="text-xs" style={{color:'var(--text-muted)'}}>{u?.username} • {v.views} просм.</p></div></div>
              ); })}</div></div>
            </div>
          </div>
        )}

        {section==='reports' && (
          <div className="fade-in">
            <h1 className="text-2xl font-bold mb-6">Жалобы</h1>
            {reports.length===0 ? <div className="text-center py-12"><AlertTriangle size={48} style={{color:'var(--text-muted)'}} className="mx-auto mb-4"/><p style={{color:'var(--text-muted)'}}>Нет жалоб 🎉</p></div> : reports.map(r => (
              <div key={r.id} className="stat-card mb-3 flex items-center justify-between"><div><p className="font-medium text-sm">{r.reason}</p><p className="text-xs" style={{color:'var(--text-muted)'}}>Тип: {r.targetType} • {r.status}</p></div><div className="flex gap-2"><button className="btn-secondary text-xs py-1 px-3">Отклонить</button><button className="btn-primary text-xs py-1 px-3">Решить</button></div></div>
            ))}
          </div>
        )}

        {section==='security' && (
          <div className="fade-in">
            <h1 className="text-2xl font-bold mb-6">Безопасность</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="stat-card"><h4 className="text-sm font-medium mb-2" style={{color:'var(--text-muted)'}}>bcrypt rounds</h4><p className="text-2xl font-bold">12</p></div>
              <div className="stat-card"><h4 className="text-sm font-medium mb-2" style={{color:'var(--text-muted)'}}>Helmet</h4><p className="text-sm text-green-400">Активен ✓</p></div>
              <div className="stat-card"><h4 className="text-sm font-medium mb-2" style={{color:'var(--text-muted)'}}>XSS защита</h4><p className="text-sm text-green-400">Активна ✓</p></div>
            </div>
          </div>
        )}

        {section==='logs' && (
          <div className="fade-in">
            <h1 className="text-2xl font-bold mb-6">Логи</h1>
            <div className="stat-card">
              {audit.length===0 ? <p className="text-center py-4" style={{color:'var(--text-muted)'}}>Нет записей</p> : <div className="font-mono text-xs space-y-1">{audit.map(l => <div key={l.id} className="flex gap-3 p-1 rounded hover:bg-[var(--bg-tertiary)]"><span style={{color:'var(--text-muted)'}}>{new Date(l.createdAt).toLocaleString()}</span><span style={{color:'var(--accent)'}}>[{l.action}]</span><span style={{color:'var(--text-secondary)'}}>{l.details}</span></div>)}</div>}
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
function fmtTime(ts:number) { return new Date(ts).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'}); }
function fmtAgo(ts:number) { const d=Date.now()-ts, m=Math.floor(d/60000); if (m<1) return 'только что'; if (m<60) return `${m} мин`; const h=Math.floor(m/60); if (h<24) return `${h} ч`; return `${Math.floor(h/24)} д`; }
function fmtDur(s:number) { return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`; }
