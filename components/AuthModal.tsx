import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { User } from '../types';
import { COUNTRIES } from '../constants';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  onGuest: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, onGuest }) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    country: '',
  });

  const handleSubmit = () => {
    if (mode === 'register') {
      if (!formData.username || !formData.country) return alert('Please fill required fields');
      const newUser: User = {
        username: formData.username,
        email: formData.email,
        country: formData.country,
        totalCount: 0,
        streak: 1,
      };
      onLogin(newUser);
    } else {
      if (!formData.email) return alert('Please enter email');
      const mockUser: User = {
        username: 'Returning User',
        email: formData.email,
        country: '🇸🇦 المملكة العربية السعودية',
        totalCount: 5000,
        streak: 12,
      };
      onLogin(mockUser);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-8 text-center">
        <div className="text-4xl mb-4">📿</div>
        <h2 className="font-scheherazade text-3xl text-gold-light mb-2">{t('app_name')}</h2>
        <p className="text-cream-dim text-sm mb-6">{t('register_cta')}</p>

        <div className="flex bg-navy p-1 rounded-xl mb-6 border border-gold-dim">
          <button
            className={`flex-1 py-2 rounded-lg text-sm font-amiri transition-colors ${mode === 'register' ? 'bg-gold-dim text-navy font-bold' : 'text-cream-dim hover:text-cream'}`}
            onClick={() => setMode('register')}
          >
            {t('register')}
          </button>
          <button
            className={`flex-1 py-2 rounded-lg text-sm font-amiri transition-colors ${mode === 'login' ? 'bg-gold-dim text-navy font-bold' : 'text-cream-dim hover:text-cream'}`}
            onClick={() => setMode('login')}
          >
            {t('login')}
          </button>
        </div>

        <div className="space-y-4 text-start">
          {mode === 'register' && (
            <div>
              <label className="block text-xs text-cream-dim mb-1">{t('username')}</label>
              <input
                type="text"
                className="w-full bg-navy border border-gold-dim rounded-lg p-3 text-cream focus:border-gold outline-none"
                placeholder="..."
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
          )}
          
          <div>
            <label className="block text-xs text-cream-dim mb-1">{t('email')}</label>
            <input
              type="email"
              dir="ltr"
              className="w-full bg-navy border border-gold-dim rounded-lg p-3 text-cream focus:border-gold outline-none placeholder:text-start"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs text-cream-dim mb-1">{t('password')}</label>
            <input
              type="password"
              dir="ltr"
              className="w-full bg-navy border border-gold-dim rounded-lg p-3 text-cream focus:border-gold outline-none"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs text-cream-dim mb-1">{t('country')}</label>
              <select
                className="w-full bg-navy border border-gold-dim rounded-lg p-3 text-cream focus:border-gold outline-none"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              >
                <option value="">-- {t('country')} --</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-gold-dim to-gold text-navy font-bold font-scheherazade text-xl py-3 rounded-xl hover:shadow-[0_0_20px_rgba(201,168,76,0.4)] transition-all transform hover:-translate-y-1 mt-6"
          >
            {mode === 'register' ? t('register') : t('login')}
          </button>

          <button
            onClick={() => {
              onGuest();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 text-cream-dim text-sm mt-4 hover:text-gold transition-colors"
          >
             {t('guest_continue')} <ArrowLeft size={14} className="rtl:rotate-180" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
