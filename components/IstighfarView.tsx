
import React, { useState } from 'react';
import { ISTIGHFAR_DUAS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { Copy, Check, CloudRain, HeartHandshake, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

interface IstighfarViewProps {
  onCount: () => void;
}

export const IstighfarView: React.FC<IstighfarViewProps> = ({ onCount }) => {
  const { t } = useLanguage();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [count, setCount] = useState(0);

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      // Fallback for browsers/contexts where clipboard API fails
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (successful) {
          setCopiedIndex(index);
          setTimeout(() => setCopiedIndex(null), 2000);
        }
      } catch (fallbackErr) {
        console.error('Copy failed', fallbackErr);
      }
    }
  };

  const handleTap = () => {
      setCount(prev => prev + 1);
      onCount();
      if (navigator.vibrate) navigator.vibrate(15);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pb-24">
      
      {/* Counter Section */}
      <div className="flex flex-col items-center mb-8 pt-6">
         <div className="relative mb-6 group cursor-pointer" onClick={handleTap}>
             {/* Decorative rings */}
             <div className="absolute inset-0 rounded-full border-4 border-primary/5 scale-110 group-active:scale-100 transition-transform duration-300"></div>
             <div className="absolute inset-0 rounded-full border-4 border-primary/10 scale-125 opacity-50 group-active:scale-100 transition-transform duration-500"></div>
             
             {/* Main Button */}
             <div className="w-48 h-48 bg-surface rounded-full shadow-[0_10px_40px_rgba(8,76,62,0.1)] flex flex-col items-center justify-center border-2 border-primary/10 relative overflow-hidden z-10 active:scale-95 transition-transform duration-100">
                 <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50"></div>
                 <CloudRain size={32} className="text-primary/40 mb-2 relative z-10" />
                 <motion.div 
                    key={count}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="text-6xl font-scheherazade font-bold text-primary relative z-10"
                 >
                     {count}
                 </motion.div>
                 <span className="text-[10px] text-text-secondary uppercase tracking-widest mt-2 relative z-10">{t('tap_to_count')}</span>
             </div>
         </div>

         <button 
            onClick={() => { if(confirm(t('reset_btn') + '?')) setCount(0); }}
            className="flex items-center gap-2 text-text-secondary hover:text-red-500 text-xs px-4 py-2 rounded-full border border-gray-100 bg-surface/50 transition-colors"
         >
             <RotateCcw size={14} />
             {t('reset_btn')}
         </button>
      </div>

      <div className="flex items-center gap-2 mb-4 px-2">
         <HeartHandshake className="text-primary" size={20} />
         <h3 className="font-bold text-primary font-scheherazade text-xl">{t('istighfar_duas')}</h3>
      </div>

      <div className="space-y-4">
        {ISTIGHFAR_DUAS.map((dua, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-surface rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex justify-between items-start mb-3 relative z-10">
                <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded">{dua.title}</span>
                <button 
                    onClick={() => handleCopy(dua.text, idx)}
                    className="text-text-secondary hover:text-primary transition-colors p-1.5 bg-background rounded-lg"
                >
                    {copiedIndex === idx ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
            </div>

            <p className="font-scheherazade text-xl text-text-primary leading-loose text-center py-2 relative z-10" dir="rtl">
                {dua.text}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
