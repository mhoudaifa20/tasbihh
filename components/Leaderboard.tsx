import React, { useState } from 'react';
import { MOCK_LEADERBOARD } from '../constants';
import { User } from '../types';
import { Flame } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LeaderboardProps {
  currentUser: User | null;
  todayCount: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ currentUser, todayCount }) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<'today' | 'week' | 'all'>('all');

  const data = [...MOCK_LEADERBOARD];
  
  if (currentUser) {
    data.push({
      name: currentUser.username,
      country: currentUser.country,
      count: todayCount + (currentUser.totalCount || 0), 
      streak: currentUser.streak,
      isMe: true
    });
  }

  const multiplier = filter === 'today' ? 0.05 : filter === 'week' ? 0.3 : 1;
  const displayData = data
    .map(d => ({ ...d, count: Math.floor(d.count * multiplier) }))
    .sort((a, b) => b.count - a.count);

  const myRankIndex = displayData.findIndex(d => d.isMe);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <p className="text-cream-dim text-sm">{t('compete_text')}</p>
        <div className="flex bg-navy-light rounded-lg p-1 border border-gold-dim">
          {['today', 'week', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-1.5 rounded text-xs font-amiri transition-all ${
                filter === f ? 'bg-gold-dim text-navy font-bold' : 'text-cream-dim hover:text-cream'
              }`}
            >
              {t(`filter_${f}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-navy-light to-navy-mid border-2 border-gold rounded-xl p-5 mb-8 flex items-center gap-4 relative shadow-[0_0_20px_rgba(201,168,76,0.1)]">
        <div className="absolute top-2 right-3 text-[10px] text-gold uppercase tracking-wider">{t('your_rank')}</div>
        
        <div className={`w-14 h-14 rounded-full flex items-center justify-center font-scheherazade text-2xl font-bold border-2 ${
           myRankIndex === 0 ? 'bg-yellow-500 border-yellow-300 text-navy' :
           myRankIndex === 1 ? 'bg-gray-400 border-gray-200 text-navy' :
           myRankIndex === 2 ? 'bg-amber-700 border-amber-500 text-white' :
           'bg-navy-mid border-gold-dim text-gold'
        }`}>
          {currentUser ? (myRankIndex + 1) : '-'}
        </div>

        <div className="flex-1">
          <h3 className="font-scheherazade text-xl text-cream">
            {currentUser ? currentUser.username : t('register')}
          </h3>
          <p className="text-xs text-cream-dim">{currentUser?.country || '—'}</p>
        </div>

        <div className="text-left">
          <div className="font-scheherazade text-2xl text-gold-light font-bold dir-ltr">
            {currentUser ? displayData.find(d => d.isMe)?.count.toLocaleString() : 0}
          </div>
          <div className="text-[10px] text-cream-dim">{t('count_unit')}</div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {displayData.slice(0, 10).map((user, idx) => (
          <div 
            key={idx}
            className={`flex items-center gap-4 bg-navy-mid/80 border ${user.isMe ? 'border-gold bg-gold/5' : 'border-gold-dim/30'} rounded-xl p-4 transition-transform hover:-translate-x-1`}
          >
            <div className="w-8 text-center font-scheherazade text-xl text-cream-dim">
              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
            </div>
            
            <div className="text-2xl">{user.country.split(' ')[0]}</div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`font-scheherazade text-lg ${user.isMe ? 'text-gold' : 'text-cream'}`}>
                  {user.name}
                </span>
                {user.isMe && <span className="text-[10px] bg-gold/20 text-gold px-1.5 rounded">{t('your_rank')}</span>}
              </div>
              <div className="text-[10px] text-cream-dim truncate max-w-[150px]">
                {user.country.split(' ').slice(1).join(' ')}
              </div>
            </div>

            <div className="text-right">
              <div className="font-scheherazade text-xl text-gold-light font-bold dir-ltr">
                {user.count.toLocaleString()}
              </div>
              <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-light">
                <Flame size={10} />
                <span>{user.streak} {t('streak')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
