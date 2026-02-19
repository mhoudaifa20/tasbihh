
import React, { useState, useEffect } from 'react';
import { ADKAR_DATA } from '../constants';
import { Check, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

interface AdkarListProps {
  onCount: () => void;
}

export const AdkarList: React.FC<AdkarListProps> = ({ onCount }) => {
  const { t, dir } = useLanguage();
  const [activeTab, setActiveTab] = useState('morning');
  const [progress, setProgress] = useState<Record<string, number>>({});
  
  // Load progress from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('adkar_progress');
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load progress');
      }
    }
  }, []);

  // Save progress whenever it changes
  useEffect(() => {
    localStorage.setItem('adkar_progress', JSON.stringify(progress));
  }, [progress]);

  const items = ADKAR_DATA[activeTab] || [];

  const handleIncrement = (id: number, repeat: number) => {
    setProgress(prev => {
      const current = prev[id] || 0;
      if (current < repeat) {
        if (current + 1 === repeat) {
            // Optional: Haptic feedback on completion
            if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
        } else {
            if (navigator.vibrate) navigator.vibrate(20);
        }
        onCount();
        return { ...prev, [id]: current + 1 };
      }
      return prev;
    });
  };

  const handleReset = (id: number) => {
    if (confirm(t('reset_btn') + '?')) {
        setProgress(prev => ({ ...prev, [id]: 0 }));
    }
  };

  const getCount = (id: number) => progress[id] || 0;

  const completedItems = items.filter(i => getCount(i.id) >= i.repeat).length;
  const totalPercentage = items.length > 0 ? (completedItems / items.length) * 100 : 0;

  const tabs = [
    { id: 'morning', label: t('morning_adkar'), icon: '☀️' },
    { id: 'evening', label: t('evening_adkar'), icon: '🌙' },
    { id: 'prayer', label: t('prayer_adkar'), icon: '🤲' },
    { id: 'sleep', label: t('sleep_adkar'), icon: '😴' },
    { id: 'travel', label: t('travel_adkar'), icon: '✈️' },
    { id: 'protection', label: t('protection_adkar'), icon: '🛡️' }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-2">
      {/* Category Tabs */}
      <div className="relative mb-8">
        <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar snap-x">
          {tabs.map((tab) => {
             const isActive = activeTab === tab.id;
             return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-bold transition-all whitespace-nowrap snap-center shrink-0 z-10 ${
                  isActive ? 'text-navy' : 'text-cream-dim hover:text-cream bg-navy-light/50 border border-white/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-gold-dim to-gold rounded-full -z-10 shadow-[0_0_15px_rgba(201,168,76,0.4)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="text-lg">{tab.icon}</span>
                <span className="font-amiri">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Progress Bar */}
      <div className="flex items-center gap-4 mb-8 bg-navy-mid/50 p-4 rounded-2xl border border-gold-dim/10">
        <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center border border-gold-dim/30 shadow-inner">
           <span className="text-xs font-bold text-gold-light">{Math.round(totalPercentage)}%</span>
        </div>
        <div className="flex-1">
            <div className="flex justify-between text-xs text-cream-dim mb-2 font-amiri">
                <span>{t('total_today')}</span>
                <span>{completedItems} / {items.length}</span>
            </div>
            <div className="w-full bg-navy h-2.5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <motion.div 
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 relative"
                initial={{ width: 0 }}
                animate={{ width: `${totalPercentage}%` }}
                transition={{ duration: 0.8, ease: "circOut" }}
                >
                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}></div>
                </motion.div>
            </div>
        </div>
      </div>

      {/* Adkar List */}
      <motion.div 
        layout
        className="grid grid-cols-1 gap-4"
      >
        <AnimatePresence mode='popLayout'>
          {items.map((item, idx) => {
            const current = getCount(item.id);
            const isDone = current >= item.repeat;
            const progressPercent = (current / item.repeat) * 100;
            const radius = 22;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (current / item.repeat) * circumference;

            return (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className={`relative group bg-navy-mid border ${isDone ? 'border-emerald-500/30' : 'border-gold-dim/20'} rounded-2xl p-5 overflow-hidden transition-all hover:border-gold-dim/50 hover:shadow-lg hover:shadow-black/20`}
              >
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                {isDone && <div className="absolute inset-0 bg-emerald-900/10 pointer-events-none transition-colors"></div>}

                <div className="flex items-start gap-4 relative z-10">
                   {/* Counter Button (Circular Progress) */}
                   <div className="shrink-0 relative">
                      <button
                        onClick={() => handleIncrement(item.id, item.repeat)}
                        disabled={isDone}
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-95 z-20 relative
                          ${isDone 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-navy-light text-gold hover:bg-navy border-4 border-navy-mid'
                          }`}
                      >
                         {isDone ? (
                             <Check size={28} className="animate-in zoom-in duration-300" />
                         ) : (
                             <span className="font-bold text-lg font-scheherazade pt-1">{item.repeat - current}</span>
                         )}
                      </button>
                      
                      {/* SVG Progress Ring */}
                      {!isDone && (
                          <svg className="absolute -top-1 -left-1 w-[72px] h-[72px] -rotate-90 pointer-events-none z-10">
                              <circle
                                cx="36" cy="36" r={radius}
                                stroke="currentColor" strokeWidth="3" fill="transparent"
                                className="text-navy-light stroke-current opacity-30"
                              />
                              <circle
                                cx="36" cy="36" r={radius}
                                stroke="currentColor" strokeWidth="3" fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                className="text-gold stroke-current transition-all duration-300 ease-out"
                              />
                          </svg>
                      )}
                   </div>

                   {/* Content */}
                   <div className="flex-1 min-w-0 pt-1">
                      <div className="flex justify-between items-start mb-2">
                          <div className="text-[10px] text-cream-dim/60 font-mono bg-black/20 px-2 py-0.5 rounded-md">
                              #{idx + 1}
                          </div>
                          {current > 0 && !isDone && (
                             <button 
                               onClick={() => handleReset(item.id)}
                               className="text-cream-dim hover:text-red-400 transition-colors p-1"
                               title={t('reset_btn')}
                             >
                                <RotateCcw size={14} />
                             </button>
                          )}
                      </div>
                      
                      <p className={`font-scheherazade text-xl md:text-2xl leading-relaxed mb-2 ${isDone ? 'text-emerald-100' : 'text-cream'}`}>
                        {item.ar}
                      </p>
                      
                      <p className="text-sm text-cream-dim/70 font-amiri leading-relaxed border-t border-white/5 pt-2 mt-2">
                        {item.tr}
                      </p>

                      {isDone && (
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 inline-flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-400/10 px-2 py-1 rounded"
                          >
                              <Check size={12} /> {t('completed')}
                          </motion.div>
                      )}
                   </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {items.length === 0 && (
          <div className="text-center py-20 text-cream-dim opacity-50">
              <p>No adkar found for this category.</p>
          </div>
      )}
    </div>
  );
};
