
import React, { useState } from 'react';
import { User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Leaderboard } from './Leaderboard';
import { Flame, Trophy, BookOpen, Users, Star, CheckCircle2, Circle, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpiritualHubProps {
  user: User | null;
  todayCount: number;
}

export const SpiritualHub: React.FC<SpiritualHubProps> = ({ user, todayCount }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'streak' | 'khatma' | 'community'>('streak');

  // Khatma State
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [pagesInput, setPagesInput] = useState('');
  const [sessionContribution, setSessionContribution] = useState(0);

  // Mock data for Khatma
  const baseGlobalPages = 452030;
  const globalPagesRead = baseGlobalPages + sessionContribution;
  const currentKhatmaId = 842;
  const totalQuranPages = 604;
  const currentKhatmaProgress = (globalPagesRead % totalQuranPages); 
  const progressPercent = (currentKhatmaProgress / totalQuranPages) * 100;

  const handleSubmitContribution = () => {
      const pages = parseInt(pagesInput);
      if (!isNaN(pages) && pages > 0) {
          setSessionContribution(prev => prev + pages);
          setPagesInput('');
          setIsInputOpen(false);
          if (navigator.vibrate) navigator.vibrate([50, 50]);
      }
  };

  return (
    <div className="w-full max-w-2xl mx-auto pb-24">
      {/* Header */}
      <div className="text-center mb-6 pt-4">
        <h2 className="font-scheherazade text-4xl font-bold text-primary mb-2 drop-shadow-sm">{t('spiritual_hub')}</h2>
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto rounded-full"></div>
      </div>

      {/* Tabs */}
      <div className="flex bg-surface rounded-2xl p-1.5 mb-8 shadow-sm border border-gray-100 mx-4 relative z-10">
        {[
          { id: 'streak', label: t('my_streak'), icon: Flame },
          { id: 'khatma', label: t('global_khatma'), icon: BookOpen },
          { id: 'community', label: t('community'), icon: Users },
        ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all relative ${
                  isActive ? 'text-primary font-bold' : 'text-text-secondary hover:text-primary'
                }`}
              >
                {isActive && (
                    <motion.div
                        layoutId="activeHubTab"
                        className="absolute inset-0 bg-primary/5 rounded-xl border border-primary/10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                )}
                <Icon size={18} className={isActive ? "text-accent" : ""} />
                <span className="text-sm font-sans">{tab.label}</span>
              </button>
            )
        })}
      </div>

      {/* Content Area */}
      <div className="px-4">
        {activeTab === 'streak' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
             {/* Main Streak Card */}
             <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-8 text-white text-center relative overflow-hidden shadow-xl shadow-primary/20">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                 <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                 
                 <div className="relative z-10">
                     <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                        <Flame size={40} className="text-accent drop-shadow-[0_0_10px_rgba(212,175,55,0.8)]" fill="#D4AF37" />
                     </div>
                     <div className="text-6xl font-bold font-sans mb-1">{user?.streak || 0}</div>
                     <div className="text-emerald-100 uppercase tracking-widest text-xs font-bold">{t('current_streak')}</div>
                 </div>
             </div>

             {/* Daily Goal */}
             <div className="bg-surface rounded-2xl p-6 border border-gray-100 shadow-sm">
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-primary text-lg flex items-center gap-2">
                         <Star size={20} className="text-accent" fill="#D4AF37" />
                         {t('daily_goal')}
                     </h3>
                     <span className="text-sm font-bold text-text-secondary">{Math.min(todayCount, 100)} / 100</span>
                 </div>
                 
                 <div className="h-4 bg-gray-100 rounded-full overflow-hidden mb-2">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((todayCount / 100) * 100, 100)}%` }}
                        className="h-full bg-gradient-to-r from-accent to-amber-400 rounded-full"
                     ></motion.div>
                 </div>
                 <p className="text-xs text-text-secondary text-center">
                    {todayCount >= 100 ? "Masha'Allah! Daily goal completed." : "Keep going to maintain your streak!"}
                 </p>
             </div>
          </motion.div>
        )}

        {activeTab === 'khatma' && (
           <motion.div 
             initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
             className="space-y-6"
           >
              <div className="bg-surface rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
                  <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold mb-4">
                      {t('global_khatma')} #{currentKhatmaId}
                  </span>
                  
                  <div className="relative w-48 h-48 mx-auto mb-6 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90">
                          <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" className="text-gray-100" fill="none" />
                          <circle 
                            cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" 
                            className="text-primary transition-all duration-1000 ease-out" 
                            fill="none" 
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 88}
                            strokeDashoffset={(2 * Math.PI * 88) * (1 - progressPercent / 100)}
                          />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-bold text-primary">{Math.round(progressPercent)}%</span>
                          <span className="text-xs text-text-secondary">{t('global_progress')}</span>
                      </div>
                  </div>

                  <div className="flex justify-between items-center bg-gray-50 rounded-xl p-4 mb-4">
                       <div className="text-start">
                           <div className="text-xs text-text-secondary mb-1">{t('pages_read')}</div>
                           <div className="font-bold text-xl text-primary">{currentKhatmaProgress} <span className="text-sm text-gray-400">/ 604</span></div>
                       </div>
                       <div className="text-end">
                           <div className="text-xs text-text-secondary mb-1">{t('khatma_completion')}</div>
                           <div className="font-bold text-primary">~2 hrs</div>
                       </div>
                  </div>

                  <AnimatePresence mode="wait">
                      {!isInputOpen ? (
                          <motion.button 
                            key="btn"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsInputOpen(true)}
                            className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                          >
                              <BookOpen size={18} />
                              {t('contribute')}
                          </motion.button>
                      ) : (
                          <motion.div 
                             key="input"
                             initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                             className="bg-gray-50 p-4 rounded-xl border border-gray-100 overflow-hidden"
                          >
                              <label className="block text-sm text-text-secondary mb-2 text-start">{t('pages_read')}</label>
                              <div className="flex gap-2">
                                  <input 
                                    type="number" 
                                    value={pagesInput}
                                    onChange={(e) => setPagesInput(e.target.value)}
                                    className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-primary text-lg font-bold text-center"
                                    placeholder="0"
                                    min="1"
                                    autoFocus
                                  />
                                  <button 
                                    onClick={handleSubmitContribution}
                                    className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-primary-dark transition-colors"
                                  >
                                    <Check size={20} />
                                  </button>
                                  <button 
                                    onClick={() => setIsInputOpen(false)}
                                    className="bg-gray-200 text-text-secondary px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                                  >
                                    <X size={20} />
                                  </button>
                              </div>
                              {sessionContribution > 0 && (
                                  <p className="text-xs text-emerald-600 mt-2 font-bold">
                                      + {sessionContribution} pages contributed this session
                                  </p>
                              )}
                          </motion.div>
                      )}
                  </AnimatePresence>
              </div>
           </motion.div>
        )}

        {activeTab === 'community' && (
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
               <Leaderboard currentUser={user} todayCount={todayCount} />
           </motion.div>
        )}
      </div>
    </div>
  );
};
