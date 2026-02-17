import React, { useState } from 'react';
import { ADKAR_DATA } from '../constants';
import { CheckCircle2, Plus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AdkarListProps {
  onCount: () => void;
}

export const AdkarList: React.FC<AdkarListProps> = ({ onCount }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('morning');
  const [progress, setProgress] = useState<Record<string, number>>({});

  const items = ADKAR_DATA[activeTab] || [];

  const handleIncrement = (id: number, repeat: number) => {
    setProgress(prev => {
      const current = prev[id] || 0;
      if (current < repeat) {
        onCount();
        return { ...prev, [id]: current + 1 };
      }
      return prev;
    });
  };

  const getCount = (id: number) => progress[id] || 0;

  const completedItems = items.filter(i => getCount(i.id) >= i.repeat).length;
  const totalPercentage = items.length > 0 ? (completedItems / items.length) * 100 : 0;

  const tabs = [
    { id: 'morning', label: `☀️ ${t('morning_adkar')}` },
    { id: 'evening', label: `🌙 ${t('evening_adkar')}` },
    { id: 'prayer', label: `🤲 ${t('prayer_adkar')}` },
    { id: 'sleep', label: `😴 ${t('sleep_adkar')}` },
    { id: 'travel', label: `✈️ ${t('travel_adkar')}` },
    { id: 'protection', label: `🛡️ ${t('protection_adkar')}` }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full border text-sm font-scheherazade transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-br from-gold-dim to-gold text-navy border-gold'
                : 'bg-navy-light border-gold-dim text-cream-dim hover:bg-navy-mid'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="w-full bg-navy-light h-2 rounded-full mb-8 overflow-hidden border border-gold-dim/20">
        <div 
          className="h-full bg-gradient-to-r from-gold-dim to-gold transition-all duration-500 ease-out"
          style={{ width: `${totalPercentage}%` }}
        />
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => {
          const current = getCount(item.id);
          const isDone = current >= item.repeat;

          return (
            <div 
              key={item.id}
              className={`bg-gradient-to-br from-navy-mid to-navy-light border ${isDone ? 'border-emerald-light/50 opacity-70' : 'border-gold-dim'} rounded-2xl p-6 relative overflow-hidden transition-all`}
            >
              {isDone && (
                <div className="absolute top-4 left-4 text-emerald-light bg-emerald-light/10 p-1 rounded-full">
                  <CheckCircle2 />
                </div>
              )}
              
              <div className="text-xs text-gold-dim mb-3 font-mono">
                 {idx + 1} / {items.length}
              </div>

              <div className="text-center mb-4">
                <p className="font-scheherazade text-2xl md:text-3xl text-cream leading-loose mb-2">
                  {item.ar}
                </p>
                <p className="text-xs text-cream-dim italic font-sans">{item.tr}</p>
              </div>

              <div className="flex justify-between items-center mt-4 border-t border-white/5 pt-4">
                <div className="text-xs text-cream-dim">
                  {t('count_unit')}: {item.repeat}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-scheherazade text-xl text-gold-light dir-ltr w-12 text-center">
                    {current} / {item.repeat}
                  </span>
                  <button
                    onClick={() => handleIncrement(item.id, item.repeat)}
                    disabled={isDone}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isDone 
                        ? 'bg-emerald-light/20 text-emerald-light cursor-default' 
                        : 'bg-gold text-navy hover:scale-110 shadow-lg shadow-gold/20'
                    }`}
                  >
                    {isDone ? <CheckCircle2 size={20} /> : <Plus size={20} />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
