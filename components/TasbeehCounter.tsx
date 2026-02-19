
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
  const [showParticles, setShowParticles] = useState(false);

  const activeDhikr: Dhikr = selectedDhikrId === 5 
    ? { id: 5, text: customDhikr.text || t('custom_dhikr'), target: customDhikr.target, reward: '' }
    : DHIKR_LIST.find(d => d.id === selectedDhikrId) || DHIKR_LIST[0];

  const handleTap = () => {
    const newCount = count + 1;
    
    // Check target before setting state to handle exact match logic immediately
    if (newCount >= activeDhikr.target) {
      setCount(0);
      onSessionComplete(activeDhikr.target);
      
      // Completion Feedback
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]); // Distinct pattern
      
      setMilestone(activeDhikr.reward || 'Alhamdulillah');
      setShowParticles(true);
      
      // Reset UI effects
      setTimeout(() => setShowParticles(false), 1000);
      setTimeout(() => setMilestone(null), 3000);
    } else {
      setCount(newCount);
      // Light Tap Feedback
      if (navigator.vibrate) navigator.vibrate(15); 
    }
    
    onCount();
  };

  const radius = 108;
  const circumference = 2 * Math.PI * radius;
  const progress = count / activeDhikr.target;
  const dashoffset = circumference - progress * circumference;

  // Particle colors from theme
  const particleColors = ['#084C3E', '#3FAF8F', '#D4AF37', '#E5C558', '#FFFFFF'];

  return (
    <div className="flex flex-col items-center">
      
      <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-lg">
        {DHIKR_LIST.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelectedDhikrId(d.id)}
            className={`px-4 py-2 rounded-full border text-sm font-bold transition-all ${
              selectedDhikrId === d.id
                ? 'bg-primary text-white border-primary shadow-md'
                : 'bg-surface border-gray-200 text-text-secondary hover:border-primary/50'
            }`}
          >
            {d.id === 5 ? t('custom_dhikr') : d.text.length > 15 ? d.text.substring(0, 15) + '...' : d.text}
          </button>
        ))}
      </div>

      <div className="relative w-72 h-72 mb-8 cursor-pointer group select-none" onClick={handleTap}>
        {/* Background Circle */}
        <div className="absolute inset-0 rounded-full bg-surface shadow-[0_10px_40px_rgba(0,0,0,0.05)] transform scale-90"></div>
        
        {/* Progress SVG */}
        <svg className="w-full h-full transform -rotate-90 relative z-10">
          <circle
            cx="144"
            cy="144"
            r={radius}
            className="stroke-gray-100 fill-none"
            strokeWidth="12"
          />
          <circle
            cx="144"
            cy="144"
            r={radius}
            className="fill-none transition-all duration-300 ease-out"
            strokeWidth="12"
            strokeLinecap="round"
            stroke="url(#emeraldGradient)"
            style={{ strokeDasharray: circumference, strokeDashoffset: dashoffset }}
          />
          <defs>
            <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3FAF8F" />
              <stop offset="100%" stopColor="#084C3E" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 overflow-visible">
          <motion.div
            key={count}
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-scheherazade text-7xl text-primary font-bold relative z-20"
          >
            {count}
          </motion.div>
          
          <div className="text-text-secondary text-sm mt-2 font-sans font-bold relative z-20">/ {activeDhikr.target}</div>
          <div className="text-secondary text-lg mt-2 font-scheherazade max-w-[160px] text-center truncate px-2 font-bold relative z-20">
            {activeDhikr.text}
          </div>

          {/* Particle Explosion */}
          <AnimatePresence>
            {showParticles && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
                      animate={{ 
                        opacity: 0, 
                        scale: 0, 
                        x: (Math.random() - 0.5) * 300, 
                        y: (Math.random() - 0.5) * 300,
                        rotate: Math.random() * 360
                      }}
                      transition={{ 
                        duration: 0.8, 
                        ease: "easeOut",
                        delay: Math.random() * 0.1 
                      }}
                      className="absolute w-3 h-3 rounded-full shadow-sm"
                      style={{ 
                          backgroundColor: particleColors[Math.floor(Math.random() * particleColors.length)] 
                      }}
                    />
                 ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <button
          onClick={handleTap}
          className="bg-accent text-primary font-bold font-scheherazade text-xl px-12 py-3 rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all"
        >
          {t('tasbeeh')}
        </button>
        <button
          onClick={() => {
              if (navigator.vibrate) navigator.vibrate(10);
              setCount(0);
          }}
          className="bg-surface border border-gray-200 text-text-secondary px-4 py-3 rounded-2xl hover:text-red-500 hover:border-red-200 transition-colors"
        >
          <RotateCcw size={24} />
        </button>
      </div>

      <div className="w-full max-w-md bg-surface border border-gray-100 rounded-2xl p-4 flex justify-between items-center shadow-sm">
        <div className="text-text-secondary text-sm font-bold">{t('total_today')}</div>
        <div className="text-2xl text-primary font-scheherazade font-bold">
          {todayTotal.toLocaleString()}
        </div>
      </div>

      <AnimatePresence>
        {milestone && (
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-4 rounded-full font-bold shadow-2xl z-50 whitespace-nowrap border border-accent/20 flex items-center gap-2"
          >
            <span>✨</span> {milestone}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
