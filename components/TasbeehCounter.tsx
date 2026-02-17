import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DHIKR_LIST } from '../constants';
import { Dhikr } from '../types';
import { RotateCcw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface TasbeehCounterProps {
  onSessionComplete: (count: number) => void;
  onCount: () => void;
  todayTotal: number;
}

export const TasbeehCounter: React.FC<TasbeehCounterProps> = ({ onSessionComplete, onCount, todayTotal }) => {
  const { t } = useLanguage();
  const [selectedDhikrId, setSelectedDhikrId] = useState(0);
  const [count, setCount] = useState(0);
  const [customDhikr, setCustomDhikr] = useState({ text: '', target: 33 });
  const [milestone, setMilestone] = useState<string | null>(null);

  const vibrate = () => {
    if (navigator.vibrate) navigator.vibrate(30);
  };

  const activeDhikr: Dhikr = selectedDhikrId === 5 
    ? { id: 5, text: customDhikr.text || t('custom_dhikr'), target: customDhikr.target, reward: '' }
    : DHIKR_LIST.find(d => d.id === selectedDhikrId) || DHIKR_LIST[0];

  const handleTap = () => {
    const newCount = count + 1;
    setCount(newCount);
    onCount();
    vibrate();

    if (newCount >= activeDhikr.target) {
      setCount(0);
      onSessionComplete(activeDhikr.target);
      setMilestone(activeDhikr.reward || 'Alhamdulillah');
      setTimeout(() => setMilestone(null), 3000);
    }
  };

  const handleReset = () => {
    setCount(0);
  };

  const radius = 108;
  const circumference = 2 * Math.PI * radius;
  const progress = count / activeDhikr.target;
  const dashoffset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center">
      
      <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-lg">
        {DHIKR_LIST.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelectedDhikrId(d.id)}
            className={`px-4 py-2 rounded-full border text-sm md:text-base font-scheherazade transition-all ${
              selectedDhikrId === d.id
                ? 'bg-gradient-to-br from-gold-dim to-gold text-navy border-gold shadow-[0_0_15px_rgba(201,168,76,0.3)]'
                : 'bg-navy-light border-gold-dim text-cream-dim hover:border-gold'
            }`}
          >
            {d.id === 5 ? t('custom_dhikr') : d.text.length > 15 ? d.text.substring(0, 15) + '...' : d.text}
          </button>
        ))}
      </div>

      {selectedDhikrId === 5 && (
        <div className="w-full max-w-sm flex gap-2 mb-6">
          <input
            type="text"
            placeholder={t('write_dhikr')}
            className="flex-1 bg-navy-light border border-gold-dim rounded-lg px-4 py-2 text-cream outline-none focus:border-gold font-scheherazade"
            value={customDhikr.text}
            onChange={(e) => setCustomDhikr({...customDhikr, text: e.target.value})}
          />
          <input
            type="number"
            className="w-20 bg-navy-light border border-gold-dim rounded-lg px-2 py-2 text-center text-cream outline-none focus:border-gold"
            value={customDhikr.target}
            onChange={(e) => setCustomDhikr({...customDhikr, target: parseInt(e.target.value) || 33})}
          />
        </div>
      )}

      <div className="relative w-72 h-72 mb-8 cursor-pointer group" onClick={handleTap}>
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="144"
            cy="144"
            r={radius}
            className="stroke-navy-light fill-none"
            strokeWidth="12"
          />
          <circle
            cx="144"
            cy="144"
            r={radius}
            className="fill-none transition-all duration-300 ease-out"
            strokeWidth="12"
            strokeLinecap="round"
            stroke="url(#goldGradient)"
            style={{ strokeDasharray: circumference, strokeDashoffset: dashoffset }}
          />
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8a6f2e" />
              <stop offset="100%" stopColor="#e8c87a" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <motion.div
            key={count}
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-scheherazade text-7xl text-gold-light drop-shadow-[0_0_10px_rgba(201,168,76,0.5)]"
          >
            {count}
          </motion.div>
          <div className="text-cream-dim text-sm mt-2 font-amiri">/ {activeDhikr.target}</div>
          <div className="text-gold text-lg mt-2 font-scheherazade max-w-[160px] text-center truncate px-2">
            {activeDhikr.text}
          </div>
          <div className="text-cream-dim/60 text-xs mt-2">{t('tap_to_count')}</div>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <button
          onClick={handleTap}
          className="bg-gradient-to-br from-gold-dim to-gold text-navy font-bold font-scheherazade text-xl px-12 py-3 rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(201,168,76,0.4)] active:scale-95 transition-all"
        >
          {t('tasbeeh')}
        </button>
        <button
          onClick={handleReset}
          className="bg-navy-light border border-gold-dim text-cream-dim px-4 py-3 rounded-xl hover:border-red-400 hover:text-red-400 transition-colors"
          title={t('reset_btn')}
        >
          <RotateCcw size={24} />
        </button>
      </div>

      <div className="w-full max-w-md bg-navy-mid border border-gold-dim rounded-xl p-4 flex justify-between items-center">
        <div>
          <div className="text-cream-dim text-sm font-amiri">{t('total_today')}</div>
        </div>
        <div className="text-2xl text-gold-light font-scheherazade font-bold">
          {todayTotal.toLocaleString()}
        </div>
      </div>

      <AnimatePresence>
        {milestone && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-gold text-navy px-6 py-3 rounded-full font-scheherazade text-lg font-bold shadow-xl z-50 whitespace-nowrap"
          >
            {milestone}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
