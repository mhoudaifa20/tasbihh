
import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { useLanguage } from '../contexts/LanguageContext';
import { COUNTRIES } from '../constants';
import { Language, User } from '../types';
import { Globe, Share2, MapPin, Check, User as UserIcon, Save } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdateUser: (user: User) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, user, onUpdateUser }) => {
  const { language, setLanguage, t } = useLanguage();
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');
  
  // Local state to manage inputs before saving
  const [formData, setFormData] = useState({
      username: '',
      country: ''
  });

  // Sync formData with user prop when modal opens or user changes
  useEffect(() => {
      if (user) {
          setFormData({
              username: user.username,
              country: user.country
          });
      }
  }, [user, isOpen]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  const handleSave = () => {
      if (user) {
          onUpdateUser({
              ...user,
              username: formData.username,
              country: formData.country
          });
          onClose();
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

  const copyToClipboard = async () => {
    const text = window.location.href;
    try {
      await navigator.clipboard.writeText(text);
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    } catch (err) {
       // Fallback for permissions issues
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
           setShareStatus('copied');
           setTimeout(() => setShareStatus('idle'), 2000);
         }
       } catch (fallbackErr) {
         console.error('Copy failed', fallbackErr);
       }
    }
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

          {/* User Settings */}
          {user && (
            <>
              {/* Username */}
              <div className="flex flex-col gap-2">
                <label className="text-sm text-cream-dim flex items-center gap-2">
                  <UserIcon size={16} /> {t('username')}
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="bg-navy-light border border-gold-dim rounded-lg p-3 text-cream focus:border-gold outline-none"
                  placeholder={t('username')}
                />
              </div>

              {/* Country */}
              <div className="flex flex-col gap-2">
                <label className="text-sm text-cream-dim flex items-center gap-2">
                  <MapPin size={16} /> {t('change_country')}
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  className="bg-navy-light border border-gold-dim rounded-lg p-3 text-cream focus:border-gold outline-none"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                className="w-full bg-primary text-white py-3 rounded-lg font-bold shadow-lg hover:bg-primary-dark transition-all flex items-center justify-center gap-2 mt-2"
              >
                  <Save size={18} />
                  {t('save')}
              </button>
            </>
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
          </div>
        </div>
      </div>
    </Modal>
  );
};
