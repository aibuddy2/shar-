
import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Newspaper, 
  Users, 
  Heart, 
  BookOpen, 
  ShieldCheck,
  LogOut,
  X,
  LogIn,
  Settings
} from 'lucide-react';
import { supabase } from './supabase';
import { Profile } from './types';
import HomeView from './views/HomeView';
import NewsView from './views/NewsView';
import AgentsView from './views/AgentsView';
import KnowledgeView from './views/KnowledgeView';
import FavoritesView from './views/FavoritesView';
import AuthView from './views/AuthView';
import AdminDashboardView from './views/AdminDashboardView';
import Splash from './components/Splash';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [logoTapCount, setLogoTapCount] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
        // If we are on auth screen but already have a session, go home
        if (activeTab === 'auth') setActiveTab('home');
      }
      setTimeout(() => setLoading(false), 2000);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
        // Automatically redirect to home if user was on the auth screen and just logged in
        setActiveTab((prev) => prev === 'auth' ? 'home' : prev);
      } else {
        setProfile(null);
        setIsAdminMode(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [activeTab]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) {
        setProfile(data);
      } else {
        // Create profile if it doesn't exist
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert([{ 
            id: userId, 
            email: session?.user?.email, 
            role: 'user', 
            has_survival_pack: false 
          }])
          .select()
          .single();
        if (newProfile) setProfile(newProfile);
      }
    } catch (err) {
      console.error("Profile fetch error", err);
    }
  };

  const handleLogoTap = () => {
    const newCount = logoTapCount + 1;
    if (newCount >= 5) {
      setIsAdminMode(true);
      setLogoTapCount(0);
      alert("Developer Admin Mode Activated");
    } else {
      setLogoTapCount(newCount);
      setTimeout(() => setLogoTapCount(0), 2000);
    }
  };

  if (loading) return <Splash />;

  const renderView = () => {
    if (isAdminMode) return <AdminDashboardView onClose={() => setIsAdminMode(false)} />;
    
    // Safety check: if user is logged in but on 'auth' tab, show 'home'
    if (session && activeTab === 'auth') {
      return <HomeView profile={profile} onAdminClick={() => setIsAdminMode(true)} onUpdateProfile={() => session && fetchProfile(session.user.id)} />;
    }

    switch (activeTab) {
      case 'home': 
        return <HomeView profile={profile} onAdminClick={() => setIsAdminMode(true)} onUpdateProfile={() => session && fetchProfile(session.user.id)} />;
      case 'news': 
        return <NewsView />;
      case 'agents': 
        return <AgentsView profile={profile} onUpdateProfile={() => session && fetchProfile(session.user.id)} />;
      case 'favorites': 
        if (!session) return <AuthView onBack={() => setActiveTab('home')} />;
        return <FavoritesView />;
      case 'knowledge': 
        return <KnowledgeView />;
      case 'auth':
        return <AuthView onBack={() => setActiveTab('home')} />;
      default: 
        return <HomeView profile={profile} onAdminClick={() => setIsAdminMode(true)} onUpdateProfile={() => session && fetchProfile(session.user.id)} />;
    }
  };

  const NavItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button 
      onClick={() => {
        setActiveTab(id);
        setIsAdminMode(false);
      }}
      className={`flex flex-col items-center justify-center space-y-1 transition-all duration-300 ${
        activeTab === id && !isAdminMode ? 'text-blue-600 scale-110' : 'text-slate-400'
      }`}
    >
      <Icon size={24} strokeWidth={activeTab === id && !isAdminMode ? 2.5 : 2} />
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto relative bg-slate-50 shadow-2xl overflow-hidden">
      <header className="glass-header sticky top-0 z-40 px-6 py-4 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center space-x-2" onClick={handleLogoTap}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl select-none active:scale-90 transition-transform">
            ရှာ
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">ရှာ (Shar)</h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-tight">လိုအပ်တာရှာ</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {session ? (
            <>
              {(profile?.role === 'admin' || isAdminMode) && (
                <button 
                  onClick={() => setIsAdminMode(!isAdminMode)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-xl transition-all ${
                    isAdminMode 
                    ? 'bg-slate-800 text-white' 
                    : 'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}
                >
                  {isAdminMode ? <X size={16} /> : <ShieldCheck size={16} />}
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {isAdminMode ? 'Exit' : 'CMS'}
                  </span>
                </button>
              )}
              <button 
                onClick={() => supabase.auth.signOut()}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <button 
              onClick={() => setActiveTab('auth')}
              className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold shadow-md active:scale-95 transition-all"
            >
              <LogIn size={14} />
              <span>ဝင်ရန်</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32">
        {renderView()}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-sm glass-header border border-white/20 shadow-2xl rounded-[40px] px-6 py-4 flex justify-between items-center z-50">
        <NavItem id="home" icon={Home} label="ပင်မ" />
        <NavItem id="news" icon={Newspaper} label="သတင်း" />
        <NavItem id="agents" icon={Users} label="အေးဂျင့်" />
        <NavItem id="favorites" icon={Heart} label="သိမ်းထား" />
        <NavItem id="knowledge" icon={BookOpen} label="ဗဟုသုတ" />
      </nav>
    </div>
  );
};

export default App;
