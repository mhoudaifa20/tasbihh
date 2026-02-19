
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ViewState } from './types';
import { getStoredUser, saveStoredUser } from './utils/storage';
import { SettingsModal } from './components/SettingsModal';
import { PrayerTimes } from './components/PrayerTimes';
import { TasbeehCounter } from './components/TasbeehCounter';
import { AdkarList } from './components/AdkarList';
import { Leaderboard } from './components/Leaderboard';
import { QuranView } from './components/QuranView';
import { QiblaCompass } from './components/QiblaCompass';
import { CalendarView } from './components/CalendarView';
import { IstighfarView } from './components/IstighfarView';
import { SpiritualHub } from './components/SpiritualHub';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Moon, BookOpen, Globe, Settings, Book, Compass, Home, User as UserIcon, Calendar, CloudRain, Trophy } from 'lucide-react';

// --- Mosque Illustration Component ---
const MosqueHeaderArt = () => (
  <svg className="absolute bottom-0 right-0 w-full h-auto opacity-30 pointer-events-none mix-blend-overlay" viewBox="0 0 1440 320" preserveAspectRatio="none">
    <path fill="currentColor" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
    <path fill="currentColor" fillOpacity="0.5" d="M0,256L60,245.3C120,235,240,213,360,208C480,203,600,213,720,234.7C840,256,960,288,1080,282.7C1200,277,1320,235,1380,213.3L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
  </svg>
);

// --- Home Dashboard Component ---
const HomeDashboard: React.FC<{
  user: User | null;
  onNavigate: (view: ViewState) => void;
  todayCount: number;
}> = ({ user, onNavigate, todayCount }) => {
  const { t } = useLanguage();

  const features = [
    { id: 'quran', icon: <BookOpen size={24} />, label: t('quran'), color: 'bg-emerald-100 text-emerald-700' },
    { id: 'adkar', icon: <Book size={24} />, label: t('adkar'), color: 'bg-amber-100 text-amber-700' },
    { id: 'tasbeeh', icon: <div className="text-2xl -mt-1">📿</div>, label: t('tasbeeh'), color: 'bg-blue-100 text-blue-700' },
    { id: 'spiritual_hub', icon: <Trophy size={24} />, label: t('spiritual_hub'), color: 'bg-yellow-100 text-yellow-700' },
    { id: 'qibla', icon: <Compass size={24} />, label: t('qibla'), color: 'bg-purple-100 text-purple-700' },
    { id: 'calendar', icon: <Calendar size={24} />, label: t('calendar'), color: 'bg-orange-100 text-orange-700' },
    { id: 'salah', icon: <Moon size={24} />, label: t('salah'), color: 'bg-teal-100 text-teal-700' },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-light shadow-xl text-white p-6 md:p-8">
        <MosqueHeaderArt />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-emerald-100 text-sm font-amiri mb-1">{t('app_name')}</p>
              <h1 className="text-3xl font-scheherazade font-bold text-accent">{user?.username || t('guest_continue')}</h1>
              <p className="text-xs text-emerald-200 flex items-center gap-1 mt-1">
                <Globe size={12} /> {user?.country || 'Global'}
              </p>
            </div>
            {user && (
              <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2">
                 <span className="text-accent font-bold font-scheherazade">{todayCount}</span>
                 <span className="text-[10px] text-emerald-100 uppercase tracking-widest">{t('count_unit')}</span>
              </div>
            )}
          </div>
          
          <div className="mt-8">
             <PrayerTimes isWidget={true} />
          </div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div>
        <h3 className="text-lg font-bold text-primary mb-4 px-2 font-scheherazade">{t('details')}</h3>
        <div className="grid grid-cols-3 gap-4">
          {features.map((f, idx) => (
            <motion.button
              key={f.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate(f.id as ViewState)}
              className={`flex flex-col items-center gap-3 p-4 bg-surface rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${f.id === 'spiritual_hub' ? 'col-span-2 sm:col-span-1 border-yellow-200/50 bg-gradient-to-br from-white to-yellow-50' : ''}`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${f.color}`}>
                {f.icon}
              </div>
              <span className="text-sm font-bold text-text-primary">{f.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Daily Content / Adkar Teaser */}
      <div className="bg-surface rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between relative overflow-hidden group cursor-pointer" onClick={() => onNavigate('adkar')}>
         <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-secondary/20 transition-colors"></div>
         <div className="relative z-10">
            <h4 className="text-primary font-bold mb-1">{t('morning_adkar')}</h4>
            <p className="text-text-secondary text-xs">Start your day with remembrance</p>
         </div>
         <div className="relative z-10 bg-secondary/10 p-3 rounded-full text-secondary-dim">
            <Book size={24} />
         </div>
      </div>
    </div>
  );
};

// --- Main App Content ---
const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeView, setActiveView] = useState<ViewState>('home'); // Default to home
  const [todayCount, setTodayCount] = useState(0);
  const { t } = useLanguage();

  // Initialize
  useEffect(() => {
    const saved = getStoredUser();
    if (saved) {
      setUser(saved);
      setTodayCount(saved.totalCount % 1000); 
    } else {
      const defaultUser: User = {
        username: 'Muslim',
        email: '',
        country: '🌍 Global',
        totalCount: 0,
        streak: 1,
      };
      setUser(defaultUser);
      saveStoredUser(defaultUser);
    }
  }, []);

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
    <div className="min-h-screen text-text-primary font-amiri overflow-x-hidden pb-safe bg-background">
      
      {/* Top Bar (Simple) - Only show on non-home pages or simplified */}
      {activeView !== 'home' && (
        <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-gray-100">
          <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
             <button onClick={() => setActiveView('home')} className="text-primary hover:text-secondary">
               <Home size={22} />
             </button>
             <h2 className="font-scheherazade text-xl text-primary font-bold">{t(activeView)}</h2>
             <button onClick={() => setIsSettingsOpen(true)} className="text-text-secondary hover:text-primary">
               <Settings size={22} />
             </button>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 relative z-10 min-h-[85vh]">
        <AnimatePresence mode='wait'>
          <motion.div
            key={activeView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeView === 'home' && (
              <HomeDashboard user={user} onNavigate={setActiveView} todayCount={todayCount} />
            )}
            {activeView === 'salah' && (
               <PrayerTimes /> // Full view
            )}
            {activeView === 'tasbeeh' && (
               <div className="pt-4">
                 <TasbeehCounter 
                  onCount={() => updateCount(1)}
                  onSessionComplete={(val) => {}} 
                  todayTotal={user ? user.totalCount : todayCount} 
                />
               </div>
            )}
            {activeView === 'adkar' && (
               <AdkarList onCount={() => updateCount(1)} />
            )}
            {activeView === 'quran' && (
               <QuranView />
            )}
            {activeView === 'leaderboard' && (
               <Leaderboard currentUser={user} todayCount={todayCount} />
            )}
            {activeView === 'spiritual_hub' && (
               <SpiritualHub user={user} todayCount={todayCount} />
            )}
            {activeView === 'qibla' && (
               <QiblaCompass />
            )}
            {activeView === 'calendar' && (
               <CalendarView />
            )}
            {activeView === 'istighfar' && (
               <IstighfarView onCount={() => updateCount(1)} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-100 z-50 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
        <div className="flex justify-around items-center px-2 py-3 max-w-md mx-auto">
          <NavButton active={activeView === 'home'} onClick={() => setActiveView('home')} icon={<Home size={22} />} label="Home" />
          <NavButton active={activeView === 'quran'} onClick={() => setActiveView('quran')} icon={<BookOpen size={22} />} label={t('quran')} />
          {/* Middle Action Button */}
          <div className="relative -mt-8">
            <button 
              onClick={() => setActiveView('tasbeeh')}
              className="w-14 h-14 bg-gradient-to-br from-accent to-accent-dim rounded-full flex items-center justify-center text-white shadow-lg shadow-accent/40 border-4 border-surface transform active:scale-95 transition-transform"
            >
              <div className="text-2xl mt-1">📿</div>
            </button>
          </div>
          <NavButton active={activeView === 'istighfar'} onClick={() => setActiveView('istighfar')} icon={<CloudRain size={22} />} label={t('istighfar')} />
          {/* Swapped Leaderboard button for Spiritual Hub button */}
          <NavButton active={activeView === 'spiritual_hub'} onClick={() => setActiveView('spiritual_hub')} icon={<Trophy size={22} />} label={t('spiritual_hub')} />
        </div>
      </nav>
      
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onUpdateUser={handleUpdateUser}
      />
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 min-w-[60px]
      ${active ? 'text-primary font-bold' : 'text-text-secondary hover:text-primary'}
    `}
  >
    <div className={`transition-transform duration-300 ${active ? 'scale-110 -translate-y-1' : ''}`}>{icon}</div>
    {active && <div className="w-1 h-1 rounded-full bg-primary mt-1"></div>}
  </button>
);

const App: React.FC = () => (
  <LanguageProvider>
    <AppContent />
  </LanguageProvider>
);

export default App;
