import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Shield, Zap, TrendingUp, Search, MessageSquare, 
  Trash2, Filter, AlertCircle, RefreshCcw, Lock, User, 
  LayoutDashboard, Server, BarChart3, Database, ChevronRight,
  Globe, Radio, Terminal, LogOut, Settings, Info, Hash, ExternalLink,
  Copy, Check, X, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  LineChart, Line
} from 'recharts';

// 🏛️ v3.2 DESIGN CONSTANTS (Sentinel Shield)
const SENTIMENT_COLORS = { positive: '#10b981', negative: '#ef4444', neutral: '#64748b' };

export default function App() {
  // Authentication & Session State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authData, setAuthData] = useState({ username: '', password: '' });
  const [token, setToken] = useState(null);
  const [loginError, setLoginError] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Intelligence State
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ total: 0, positive: 0, negative: 0, neutral: 0, topics_ranking: {}, risk_thermal: Array(24).fill(0), controversy_count: 0 });
  const [sentimentHistory, setSentimentHistory] = useState([]);
  const [status, setStatus] = useState('disconnected');
  
  // Filtering
  const [filterPolarity, setFilterPolarity] = useState('ALL');
  const [filterTopic, setFilterTopic] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);
  const [isPurging, setIsPurging] = useState(false);

  const [sandboxText, setSandboxText] = useState('');
  const [sandboxResult, setSandboxResult] = useState(null);
  const [isSandboxLoading, setIsSandboxLoading] = useState(false);
  const socketRef = useRef(null);

  // 🔐 AUTH RECOVERY: Clear state on input (Bug #3)
  useEffect(() => { if (loginError) setLoginError(null); }, [authData]);

  // 🔐 LOGOUT: Total Sanitization (Bug #1)
  const handleDeauthorize = () => {
    setIsAuthenticated(false);
    setToken(null);
    setAuthData({ username: '', password: '' });
    setLoginError(null);
    socketRef.current?.close();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!authData.username || !authData.password) { setLoginError("REQUIRED_FIELDS_MISSING"); return; } // Bug #2
    setIsAuthLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username: authData.username, password: authData.password })
      });
      const data = await response.json();
      if (response.ok) { setToken(data.access_token); setIsAuthenticated(true); } 
      else { setLoginError("INVALID_INTEL_CREDENTIALS"); }
    } catch (err) { setLoginError("NODE_CONNECTION_FAILURE"); }
    setIsAuthLoading(false);
  };

  // 📡 INTELLIGENCE STREAM
  useEffect(() => {
    if (!isAuthenticated || !token) return;
    const connect = () => {
      const socket = new WebSocket(`ws://127.0.0.1:8000/ws?token=${token}`);
      socketRef.current = socket;
      socket.onopen = () => setStatus('connected');
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "STATS_UPDATE") { 
            setStats(data.stats); 
            setSentimentHistory(prev => [...prev, {
                time: new Date().toLocaleTimeString('en-GB'), // 24h format (Bug #16)
                pos: data.stats.positive, neg: data.stats.negative, neu: data.stats.neutral
            }].slice(-20));
        }
        else { setPosts(prev => [data, ...prev].slice(0, 50)); } // Cap at 50 (Bug #17)
      };
      socket.onclose = () => { setStatus('disconnected'); if(isAuthenticated) setTimeout(connect, 3000); };
    };
    connect();
    return () => socketRef.current?.close();
  }, [isAuthenticated, token]);

  const handlePurge = () => {
    setIsPurging(true);
    setTimeout(() => {
        setPosts([]);
        setStats(prev => ({ ...prev, total: 0 }));
        if(socketRef.current) socketRef.current.send(JSON.stringify({type:'PURGE_CACHE'}));
        setIsPurging(false);
    }, 800); // Bug #4 & #10
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000); // Bug #6
  };

  const filteredPosts = posts.filter(p => {
    if (filterPolarity !== 'ALL' && p.sentiment.toUpperCase() !== filterPolarity) return false;
    if (filterTopic !== 'ALL' && p.topic.toUpperCase() !== filterTopic) return false;
    return true;
  });

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-[#050505] text-slate-200 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_50%_50%,_rgba(15,23,42,1)_0%,_rgba(5,5,5,1)_100%)] selection:bg-cyan-500/30">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm bento-card p-10 glass-morphism border-[#ffffff10] relative z-10">
            <div className="text-center mb-10">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mx-auto mb-6 shadow-[0_0_15px_#22d3ee]"></div>
                <h1 className="text-3xl font-black text-white display-font tracking-tighter">AURORA <span className="text-cyan-400">SENTINEL</span></h1>
                <p className="text-[#64748b] text-[10px] font-black uppercase tracking-[0.3em] mt-2">v3.2 Hardened Intelligence</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
                <div className="relative">
                    <User className="absolute left-4 top-4 text-slate-500 w-4 h-4" />
                    <input 
                        required type="text" placeholder="OPERATOR_ID" value={authData.username}
                        onChange={(e) => setAuthData({...authData, username: e.target.value})}
                        className="w-full bg-black/40 border border-[#ffffff10] p-4 pl-12 rounded-2xl focus:border-cyan-500 transition-all font-black text-xs tracking-widest outline-none"
                    />
                </div>
                <div className="relative">
                    <Lock className="absolute left-4 top-4 text-slate-500 w-4 h-4" />
                    <input 
                        required type="password" placeholder="ACCESS_KEY" value={authData.password}
                        onChange={(e) => setAuthData({...authData, password: e.target.value})}
                        className="w-full bg-black/40 border border-[#ffffff10] p-4 pl-12 rounded-2xl focus:border-cyan-500 transition-all font-black text-xs tracking-widest outline-none"
                    />
                </div>
                <button disabled={isAuthLoading} type="submit" className="w-full py-5 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/10 transition-all hover:scale-[1.02] flex items-center justify-center gap-3">
                    {isAuthLoading ? <Loader2 className="animate-spin" size={20} /> : 'Authorize Handover'}
                </button>
                {loginError && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-500 text-[10px] font-black tracking-widest text-center uppercase">{loginError}</motion.p>}
            </form>
        </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-deep text-[#8b949e] font-['Outfit'] flex relative overflow-hidden selection:bg-cyan-500/20">
      <div className="aurora-glow top-[10%] left-[20%] opacity-20"></div>
      
      {/* 🏛️ SOVEREIGN SIDEBAR (Bug #5) */}
      <aside className="w-[280px] bg-bg-sidebar border-r border-[#ffffff05] h-screen sticky top-0 flex flex-col p-8 z-50">
        <div className="flex items-center gap-3 mb-16 px-4">
            <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-400/20">
                <Shield className="text-black w-4 h-4" />
            </div>
            <h1 className="text-sm font-black text-white display-font tracking-tighter uppercase">Sentinel v3.2</h1>
        </div>

        <nav className="flex-1 space-y-2">
            {[
                { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Central Stream' },
                { id: 'ANALYTICS', icon: BarChart3, label: 'Neural Core' },
                { id: 'RISK', icon: AlertCircle, label: 'Risk Vector' }
            ].map(item => (
                <button 
                    key={item.id} onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all font-bold text-[11px] tracking-widest uppercase group ${activeTab === item.id ? 'bg-[#ffffff05] text-white border border-[#ffffff05]' : 'hover:bg-[#ffffff02] text-[#484f58] hover:text-slate-300'}`}
                >
                    <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-cyan-400' : 'group-hover:text-cyan-400'}`} />
                    {item.label}
                </button>
            ))}
        </nav>

        <div className="mt-auto space-y-6 px-4">
            <div className="p-5 bg-black/40 border border-[#ffffff05] rounded-3xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="status-indicator"></div>
                    <span className="text-[9px] font-black uppercase text-[#10b981] tracking-[0.2em]">{status}</span>
                </div>
                <div className="space-y-1.5 text-[8px] font-bold text-[#484f58] uppercase tracking-widest">
                    <p>NODE: ALPHA-Ω-PROD</p>
                    <p className="text-cyan-500/50">SECURE: AES-256-GCM</p>
                </div>
            </div>
            <button onClick={handleDeauthorize} className="w-full flex items-center gap-4 py-4 text-rose-500/40 hover:text-rose-500 text-[10px] font-black uppercase tracking-widest transition-all group">
                <LogOut size={14} className="group-hover:-translate-x-1 transition-all" /> Deauthorize Terminal
            </button>
        </div>
      </aside>

      {/* 🚀 ELITE COMMAND INTERFACE */}
      <main className="flex-1 min-w-0 p-10 overflow-y-auto relative custom-scrollbar">
        <header className="flex justify-between items-center mb-10 max-w-[1400px] mx-auto">
            <div>
                <h2 className="text-3xl font-black text-white display-font tracking-tighter uppercase">Intelligence Command</h2>
                <div className="flex items-center gap-3 mt-1">
                    <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span className="text-[10px] text-[#484f58] font-black uppercase tracking-[0.2em] letter-spacing-wide">Secure Data Inflow Active</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex bg-black/40 border border-[#ffffff05] p-1 rounded-xl">
                    <button onClick={() => setIsDebugMode(false)} className={`px-4 py-2 text-[9px] font-black rounded-lg transition-all ${!isDebugMode ? 'bg-[#ffffff08] text-white shadow-lg' : 'text-[#484f58] hover:text-slate-300'}`}>LIVE</button>
                    <button onClick={() => setIsDebugMode(true)} className={`px-4 py-2 text-[9px] font-black rounded-lg transition-all ${isDebugMode ? 'bg-[#ef444420] text-rose-400 border border-rose-500/20' : 'text-[#484f58] hover:text-slate-300'}`}>DEBUG</button>
                </div>
                <button onClick={() => setShowSettings(true)} className="p-3 bento-card hover:border-white/20 transition-all text-[#484f58] hover:text-white"><Settings size={18} /></button>
            </div>
        </header>

        {/* 🏆 TABS LOGIC RENDERING (Bug #5) */}
        <div className="max-w-[1400px] mx-auto space-y-10">
            {activeTab === 'DASHBOARD' && (
                <>
                    {/* HERO KPI STRIP */}
                    <div className="grid grid-cols-5 gap-6">
                        {[
                            { label: "Signals Processed", val: stats.total, color: "text-indigo-400", metric: "TOTAL" },
                            { label: "Active Controversy", val: stats.controversy_count || 0, color: "text-rose-500", metric: "RISK" },
                            { label: "Neural Entropy", val: "42.1", color: "text-cyan-400", metric: "SCORE" },
                            { label: "Secured Nodes", val: "12", icon: Globe, color: "text-emerald-400", metric: "LIVE" },
                            { label: "Mood Polarity", val: stats.positive >= stats.negative ? "POSITIVE" : "NEGATIVE", color: "text-white", metric: "GLOBAL" }
                        ].map((kpi, i) => (
                            <motion.div key={i} whileHover={{ y: -5 }} className="bento-card p-6 border-[#ffffff05] bg-black/20 group">
                                <p className="text-[9px] font-black text-[#484f58] uppercase tracking-widest mb-4">{kpi.label}</p>
                                <div className="flex items-end gap-2">
                                     <span className={`text-2xl font-black display-font ${kpi.color}`}>{kpi.val}</span>
                                     <span className="text-[8px] font-bold text-[#484f58] mb-1 uppercase tracking-widest">{kpi.metric}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* INTERROGATION GRID */}
                    <div className="grid grid-cols-12 gap-8">
                        {/* THE FEED */}
                        <section className="col-span-12 lg:col-span-7 bento-card flex flex-col h-[700px] glass-morphism overflow-hidden border-[#ffffff05]">
                            <header className="p-8 border-b border-[#ffffff05] bg-black/20 flex flex-col gap-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_#6366f1]"></div>
                                        Alpha Stream Interrogation
                                    </h3>
                                    <button disabled={isPurging} onClick={handlePurge} className="text-[9px] font-black text-rose-500/60 hover:text-rose-500 transition-all uppercase tracking-widest flex items-center gap-2 group">
                                        {isPurging ? <Loader2 className="animate-spin" size={12} /> : <Trash2 size={12} className="group-hover:rotate-12 transition-all" />} 
                                        Global Intelligence Purge
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex bg-black border border-[#ffffff05] p-1 rounded-xl">
                                        {['ALL', 'POSITIVE', 'NEGATIVE'].map(p => (
                                            <button 
                                                key={p} onClick={() => setFilterPolarity(p)}
                                                className={`px-4 py-2 text-[8px] font-black rounded-lg transition-all ${filterPolarity === p ? 'bg-[#ffffff08] text-white shadow-lg' : 'text-[#484f58] hover:text-slate-300'}`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative flex-1">
                                        <Search className="absolute left-4 top-3 text-[#484f58] w-3.5 h-3.5" />
                                        <input 
                                            onChange={(e) => setFilterTopic(e.target.value.toUpperCase() || 'ALL')}
                                            className="bg-black border border-[#ffffff05] rounded-xl p-2.5 pl-10 text-[9px] w-full focus:border-cyan-400/30 transition-all font-black tracking-widest text-slate-300 outline-none" 
                                            placeholder="Sector Filtering... (e.g. TECH, AI)" 
                                        />
                                    </div>
                                </div>
                            </header>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-black/10">
                                <AnimatePresence initial={false}>
                                    {filteredPosts.map((post) => (
                                        <motion.div
                                            layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            key={post.id} className={`bento-card p-5 border-l-4 group hover:bg-[#ffffff04] transition-all relative overflow-hidden bg-black/20 ${isDebugMode ? 'border-dashed border-rose-500/20' : ''}`}
                                            style={{ borderLeftColor: SENTIMENT_COLORS[post.sentiment] || '#64748b' }}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-black text-xs text-white border border-white/10">
                                                        {post.username.substring(1, 2).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[11px] font-black text-white mono">{post.username}</span>
                                                            <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[7px] font-black uppercase rounded">Reddit</span>
                                                        </div>
                                                        <span className="text-[8px] font-bold text-[#484f58] uppercase tracking-widest mt-0.5">{post.topic}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[8px] font-black text-[#484f58] uppercase tracking-widest">Threat Score:</span>
                                                        <span className="text-[10px] font-black text-rose-500 mono">{(post.intensity * 100).toFixed(1)}</span>
                                                    </div>
                                                    <span className="text-[8px] font-bold text-[#484f58] mono uppercase">{new Date(post.timestamp).toLocaleTimeString('en-GB')}</span>
                                                </div>
                                            </div>
                                            <p className="text-[13px] text-slate-400 leading-relaxed mb-4">{post.text}</p>
                                            <div className="flex justify-between items-center border-t border-white/5 pt-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                                                        <div className="h-full bg-cyan-400 shadow-[0_0_8px_#22d3ee50]" style={{ width: `${post.intensity * 100}%` }} />
                                                    </div>
                                                    <span className={`text-[8px] font-black uppercase tracking-widest ${post.sentiment === 'positive' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                        {post.sentiment} PROBABILITY
                                                    </span>
                                                </div>
                                                <div className="flex gap-3">
                                                    <button onClick={() => copyToClipboard(JSON.stringify(post), post.id)} className="p-2 hover:bg-white/5 rounded-lg transition-all text-[#484f58] hover:text-white">
                                                        {copiedId === post.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                                    </button>
                                                    <ExternalLink size={12} className="text-[#484f58] hover:text-white transition-all cursor-pointer mt-2" />
                                                </div>
                                            </div>
                                            {isDebugMode && (
                                                <pre className="mt-4 p-3 bg-black rounded-lg text-[8px] font-mono text-rose-400/60 overflow-x-auto border border-rose-500/10">
                                                    {JSON.stringify(post, null, 2)}
                                                </pre>
                                            )}
                                        </motion.div>
                                    ))}
                                    {filteredPosts.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                                            <Radio size={48} className="mb-4 animate-pulse" />
                                            <p className="font-black text-xs uppercase tracking-[0.4em]">Awaiting Signals...</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </section>

                        <div className="col-span-12 lg:col-span-5 flex flex-col gap-8">
                            {/* MOMENTUM CONVERGENCE */}
                            <div className="bento-card p-8 h-[335px] bg-black/20 border-white/5 flex flex-col">
                                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                    <TrendingUp className="w-4 h-4 text-emerald-400 shadow-[0_0_8px_#10b98150]" />
                                    Momentum Flux
                                </h3>
                                <div className="flex-1">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart layout="vertical" data={Object.entries(stats.topics_ranking || {}).map(([k, v]) => ({ name: k, pulses: v }))}>
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" hide />
                                            <Bar dataKey="pulses" radius={[0, 4, 4, 0]}>
                                                {Object.entries(stats.topics_ranking || {}).map((_, i) => (
                                                    <Cell key={i} fill={i % 2 === 0 ? '#6366f1' : '#00f5d4'} />
                                                ))}
                                            </Bar>
                                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: '#0d1117', border: '1px solid #ffffff10', fontSize: '10px' }} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* RISK VECTOR HEATMAP */}
                            <div className="bento-card p-8 h-[335px] bg-black/20 border-white/5">
                                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                    <AlertCircle className="w-4 h-4 text-rose-500" />
                                    Regional Risk Matrix
                                </h3>
                                <div className="grid grid-cols-6 grid-rows-4 gap-2 h-44">
                                    {stats.risk_thermal?.map((v, i) => (
                                        <div key={i} className="rounded-md border border-white/5 group relative transition-all duration-500" style={{ backgroundColor: `rgba(239, 68, 68, ${Math.max(0.05, v)})` }}>
                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center bg-black/60 text-[7px] text-white font-black mono rounded-md">
                                                {(v * 100).toFixed(0)}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-6 text-[7px] font-black text-[#484f58] uppercase tracking-widest border-t border-white/5 pt-4">
                                    <span>Sector Index: L1-L24</span>
                                    <span>Time: 24H Persistence</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'ANALYTICS' && (
                <div className="grid grid-cols-12 gap-8">
                    <section className="col-span-12 lg:col-span-8 bento-card p-10 h-[500px] bg-black/20 border-white/5">
                        <header className="flex justify-between items-center mb-10">
                            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-4">
                                <Activity className="w-5 h-5 text-indigo-400" />
                                High-Fidelity Flux Persistence
                            </h3>
                            <div className="flex gap-6">
                                {['pos', 'neg', 'neu'].map(t => (
                                    <div key={t} className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${t==='pos'?'bg-emerald-500':t==='neg'?'bg-rose-500':'bg-slate-500'}`}></div>
                                        <span className="text-[8px] font-black text-[#484f58] uppercase">{t} Flux</span>
                                    </div>
                                ))}
                            </div>
                        </header>
                        <div className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={sentimentHistory}>
                                    <defs>
                                        <linearGradient id="fluxPos" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                                        <linearGradient id="fluxNeg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                                    </defs>
                                    <XAxis dataKey="time" hide />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #ffffff10', fontSize: '9px' }} />
                                    <Area type="monotone" dataKey="pos" stroke="#10b981" fill="url(#fluxPos)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="neg" stroke="#ef4444" fill="url(#fluxNeg)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="neu" stroke="#64748b" fillOpacity={0} strokeWidth={1} strokeDasharray="5 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    <section className="col-span-12 lg:col-span-4 bento-card p-10 h-[500px] bg-gradient-to-br from-black/40 to-[#010409] border-white/5">
                        <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-10 flex items-center gap-4">
                            <Terminal className="w-5 h-5 text-cyan-400" />
                            Neural Core Sandbox
                        </h3>
                        <div className="flex flex-col h-[350px]">
                            <textarea 
                                className="flex-1 bg-black/40 border border-white/10 rounded-3xl p-6 text-[12px] font-medium text-slate-300 outline-none focus:border-cyan-400/30 transition-all resize-none mb-6 placeholder:opacity-20 custom-scrollbar"
                                placeholder={"Input raw signal for interrogation... \nExample: 'The new quantum layer is seeing unprecedented stability.'"} // Bug #15
                                value={sandboxText}
                                onChange={(e) => setSandboxText(e.target.value)}
                            />
                            <button 
                                disabled={isSandboxLoading}
                                onClick={async () => {
                                    if(!sandboxText) return; setIsSandboxLoading(true);
                                    const res = await fetch(`http://127.0.0.1:8000/sandbox?text=${encodeURIComponent(sandboxText)}`, { method: 'POST' });
                                    setSandboxResult(await res.json()); setIsSandboxLoading(false);
                                }}
                                className="py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {isSandboxLoading ? <Loader2 className="animate-spin" size={14} /> : 'Execute Audit'}
                            </button>

                            <AnimatePresence>
                                {sandboxResult && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-6 bento-card border-emerald-500/10 bg-emerald-500/5">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[8px] font-black text-emerald-500 uppercase typewriter-text">Extraction Complete</span>
                                            <span className="text-[10px] font-black text-white mono">{(sandboxResult.intensity * 100).toFixed(1)}%</span>
                                        </div>
                                        <p className="text-sm font-black text-white display-font typewriter-text uppercase">{sandboxResult.emotion} | {sandboxResult.sentiment}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </section>
                </div>
            )}
        </div>

        {/* 🏛️ SETTINGS MODAL (Bug #7) */}
        <AnimatePresence>
            {showSettings && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-md bento-card p-10 bg-[#0d1117] border-white/10 relative">
                        <button onClick={() => setShowSettings(false)} className="absolute right-6 top-6 text-[#484f58] hover:text-white transition-all"><X size={20} /></button>
                        <h3 className="text-xl font-black text-white display-font tracking-tighter uppercase mb-8">System Configuration</h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Global Inflow Rate</span>
                                    <span className="text-[8px] font-bold text-[#484f58]">Real-time synchronization active</span>
                                </div>
                                <span className="text-xs font-black text-cyan-400 mono">1.2s avg</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Relational Warehouse</span>
                                    <span className="text-[8px] font-bold text-[#484f58]">SQLite / SSD Persistent</span>
                                </div>
                                <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Stable</span>
                            </div>
                            <p className="text-[8px] text-center text-[#484f58] uppercase font-black tracking-[0.3em] mt-10">Aurora Sentinel v3.2-Shield</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
      </main>
    </div>
  );
}
