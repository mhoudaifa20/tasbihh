import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { useLanguage } from '../contexts/LanguageContext';
import { COUNTRIES } from '../constants';
import { Language, User } from '../types';
import { Globe, Share2, KeyRound, MapPin, LogOut, Check, Loader2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, user, onUpdateUser, onLogout }) => {
  const { language, setLanguage, t } = useLanguage();
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');
  const [resetStatus, setResetStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (user) {
      onUpdateUser({ ...user, country: e.target.value });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Tasbeeh Global',
      text: t('share_message'),
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
             copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareStatus('copied');
    setTimeout(() => setShareStatus('idle'), 2000);
  };

  const handleResetPassword = () => {
    if (resetStatus !== 'idle') return;
    
    setResetStatus('sending');
    // Simulate API delay
    setTimeout(() => {
      setResetStatus('sent');
      setTimeout(() => setResetStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-scheherazade text-gold-light mb-6 text-center border-b border-gold-dim/20 pb-4">
          {t('settings')}
        </h2>

        <div className="space-y-6">
          {/* Language */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-cream-dim flex items-center gap-2">
              <Globe size={16} /> {t('language')}
            </label>
            <select
              value={language}
              onChange={handleLanguageChange}
              className="bg-navy-light border border-gold-dim rounded-lg p-3 text-cream focus:border-gold outline-none"
            >
              <option value="ar">العربية (Arabic)</option>
              <option value="en">English</option>
              <option value="id">Bahasa Indonesia</option>
              <option value="tr">Türkçe (Turkish)</option>
              <option value="ur">اردو (Urdu)</option>
            </select>
          </div>

          {/* Country (Only if logged in) */}
          {user && (
            <div className="flex flex-col gap-2">
              <label className="text-sm text-cream-dim flex items-center gap-2">
                <MapPin size={16} /> {t('change_country')}
              </label>
              <select
                value={user.country}
                onChange={handleCountryChange}
                className="bg-navy-light border border-gold-dim rounded-lg p-3 text-cream focus:border-gold outline-none"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4 border-t border-gold-dim/20">
            <button
              onClick={handleShare}
              className="flex items-center justify-between p-3 rounded-lg bg-navy-mid hover:bg-navy-light border border-gold-dim/30 text-cream transition-colors group"
            >
              <span className="flex items-center gap-2">
                {shareStatus === 'copied' ? <Check size={16} className="text-emerald-light" /> : <Share2 size={16} />} 
                {shareStatus === 'copied' ? t('copied') : t('share_app')}
              </span>
              {shareStatus === 'copied' && <span className="text-xs text-emerald-light">✓</span>}
            </button>
            
            <button
              onClick={handleResetPassword}
              disabled={resetStatus !== 'idle'}
              className="flex items-center justify-between p-3 rounded-lg bg-navy-mid hover:bg-navy-light border border-gold-dim/30 text-cream transition-colors disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                {resetStatus === 'sending' ? <Loader2 size={16} className="animate-spin" /> : 
                 resetStatus === 'sent' ? <Check size={16} className="text-emerald-light" /> :
                 <KeyRound size={16} />} 
                {resetStatus === 'sent' ? t('reset_password_sent') : t('reset_password')}
              </span>
            </button>

             {user && (
               <button
                 onClick={() => { onLogout(); onClose(); }}
                 className="flex items-center justify-between p-3 rounded-lg bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 text-red-200 transition-colors mt-2"
               >
                 <span className="flex items-center gap-2"><LogOut size={16} /> {t('logout')}</span>
               </button>
             )}
          </div>
        </div>
      </div>
    </Modal>
  );
};