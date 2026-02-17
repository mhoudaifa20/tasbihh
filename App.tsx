import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ViewState } from './types';
import { getStoredUser, saveStoredUser, clearStoredUser } from './utils/storage';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';
import { PrayerTimes } from './components/PrayerTimes';
import { TasbeehCounter } from './components/TasbeehCounter';
import { AdkarList } from './components/AdkarList';
import { Leaderboard } from './components/Leaderboard';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Sun, Moon, BookOpen, Globe, User as UserIcon, Settings } from 'lucide-react';

const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeView, setActiveView] = useState<ViewState>('salah');
  const [todayCount, setTodayCount] = useState(0);
  const { t } = useLanguage();

  // Initialize
  useEffect(() => {
    const saved = getStoredUser();
    if (saved) {
      setUser(saved);
      setTodayCount(saved.totalCount % 1000); 
    } else {
      setTimeout(() => setIsAuthOpen(true), 1000);
    }
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    saveStoredUser(newUser);
  };

  const handleGuest = () => {
    // Just close modal
  };

  const handleLogout = () => {
    setUser(null);
    clearStoredUser();
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    saveStoredUser(updatedUser);
  };

  const updateCount = (amount: number = 1) => {
    setTodayCount(prev => {
      const newCount = prev + amount;
      if (user) {
        const updatedUser = { ...user, totalCount: user.totalCount + amount };
        setUser(updatedUser);
        saveStoredUser(updatedUser);
      }
      return newCount;
    });
  };

  return (
    <div className="min-h-screen text-cream font-amiri overflow-x-hidden pb-20 md:pb-0">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-navy-mid/90 backdrop-blur-md border-b border-gold-dim shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gold to-gold-dim rounded-full flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(201,168,76,0.4)]">
              📿
            </div>
            <div>
              <h1 className="font-scheherazade text-2xl text-gold-light leading-none">{t('app_name')}</h1>
              <span className="text-[10px] text-cream-dim font-sans tracking-widest uppercase">TASBEEH GLOBAL</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2 bg-navy px-3 py-1.5 rounded-full border border-gold-dim/50">
                <div className="w-6 h-6 bg-gold text-navy rounded-full flex items-center justify-center text-xs font-bold">
                  {user.username[0].toUpperCase()}
                </div>
                <span className="text-sm hidden md:inline">{user.username}</span>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-2 text-sm bg-gold-dim/20 hover:bg-gold-dim/40 px-3 py-1.5 rounded-lg text-gold-light transition-colors"
              >
                <UserIcon size={16} />
                <span className="hidden md:inline">{t('login')}</span>
              </button>
            )}
            
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-cream-dim hover:text-gold transition-colors"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence mode='wait'>
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeView === 'salah' && (
              <div>
                <SectionTitle title={t('salah')} />
                <PrayerTimes />
              </div>
            )}
            {activeView === 'tasbeeh' && (
              <div>
                <SectionTitle title={t('tasbeeh')} />
                <TasbeehCounter 
                  onCount={() => updateCount(1)}
                  onSessionComplete={(val) => {}} 
                  todayTotal={user ? user.totalCount : todayCount} 
                />
              </div>
            )}
            {activeView === 'adkar' && (
              <div>
                <SectionTitle title={t('adkar')} />
                <AdkarList onCount={() => updateCount(1)} />
              </div>
            )}
            {activeView === 'leaderboard' && (
              <div>
                <SectionTitle title={t('leaderboard')} />
                <Leaderboard currentUser={user} todayCount={todayCount} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-navy-mid border-t border-gold-dim z-50 md:hidden">
        <div className="flex justify-around items-center p-2">
          <NavButton active={activeView === 'salah'} onClick={() => setActiveView('salah')} icon={<Moon size={20} />} label={t('salah')} />
          <NavButton active={activeView === 'tasbeeh'} onClick={() => setActiveView('tasbeeh')} icon={<div className="text-xl">📿</div>} label={t('tasbeeh')} />
          <NavButton active={activeView === 'adkar'} onClick={() => setActiveView('adkar')} icon={<BookOpen size={20} />} label={t('adkar')} />
          <NavButton active={activeView === 'leaderboard'} onClick={() => setActiveView('leaderboard')} icon={<Globe size={20} />} label={t('leaderboard')} />
        </div>
      </nav>

      {/* Desktop Navigation */}
      <div className="hidden md:flex fixed left-8 top-1/2 -translate-y-1/2 flex-col gap-4 z-40">
        <NavButtonDesktop active={activeView === 'salah'} onClick={() => setActiveView('salah')} icon={<Moon size={24} />} label={t('salah')} />
        <NavButtonDesktop active={activeView === 'tasbeeh'} onClick={() => setActiveView('tasbeeh')} icon={<div className="text-2xl">📿</div>} label={t('tasbeeh')} />
        <NavButtonDesktop active={activeView === 'adkar'} onClick={() => setActiveView('adkar')} icon={<BookOpen size={24} />} label={t('adkar')} />
        <NavButtonDesktop active={activeView === 'leaderboard'} onClick={() => setActiveView('leaderboard')} icon={<Globe size={24} />} label={t('leaderboard')} />
      </div>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        onGuest={handleGuest}
      />
      
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onUpdateUser={handleUpdateUser}
        onLogout={handleLogout}
      />
    </div>
  );
};

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <div className="text-center mb-8">
    <h2 className="font-scheherazade text-4xl text-gold-light drop-shadow-lg">{title}</h2>
    <div className="text-gold-dim mt-2 tracking-[0.5em] text-sm">✦ ✦ ✦</div>
  </div>
);

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${active ? 'text-gold' : 'text-cream-dim'}`}
  >
    <div className={`${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(201,168,76,0.6)]' : ''} transition-transform`}>{icon}</div>
    <span className="text-[10px] font-amiri">{label}</span>
  </button>
);

const NavButtonDesktop: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => {
  const { dir } = useLanguage();
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 transition-all border-l-4 w-40
        ${active ? 'bg-gradient-to-r from-gold-dim/20 to-transparent border-gold text-gold' : 'border-transparent text-cream-dim hover:text-gold-light hover:bg-white/5'}
        ${dir === 'rtl' ? 'rounded-l-full border-r-4 border-l-0' : 'rounded-r-full border-l-4 border-r-0'}
      `}
    >
      <div>{icon}</div>
      <span className="font-amiri text-lg">{label}</span>
    </button>
  );
};

const App: React.FC = () => (
  <LanguageProvider>
    <AppContent />
  </LanguageProvider>
);

export default App;
