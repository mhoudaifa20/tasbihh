import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Moon, Sun, CloudSun, Sunset, Loader2, Calendar, Info, X, Volume2, VolumeX } from 'lucide-react';
import { fetchPrayerTimesByCity, fetchPrayerTimesByCoords, searchLocations } from '../services/prayerService';
import { PrayerTimesData, HijriDate, LocationSearchResult } from '../types';
import { PRAYER_DETAILS } from '../constants';
import { Modal } from './ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

export const PrayerTimes: React.FC = () => {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [times, setTimes] = useState<PrayerTimesData | null>(null);
  const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
  const [locationName, setLocationName] = useState('مكة المكرمة');
  const [nextPrayer, setNextPrayer] = useState<{name: string, time: string, timeLeft: string}>({ name: '', time: '', timeLeft: '' });
  
  // Audio State
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    return localStorage.getItem('adhan_enabled') === 'true';
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastPlayedTimeRef = useRef<string | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // State for details modal
  const [selectedPrayer, setSelectedPrayer] = useState<string | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('https://media.sd.ma/assala4/adhan/makkah.mp3');
    audioRef.current.volume = 0.5;

    handleSearchByCity('Makkah'); 
    
    const interval = setInterval(() => {
      updateCountdown();
      checkAdhanTrigger();
    }, 1000);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('adhan_enabled', String(isSoundEnabled));
    if (!isSoundEnabled && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [isSoundEnabled]);

  useEffect(() => {
    let isMounted = true;
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        setActiveSuggestionIndex(-1);
        try {
          const results = await searchLocations(searchQuery);
          if (isMounted) {
            setSuggestions(results);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error(error);
          if (isMounted) setSuggestions([]);
        } finally {
          if (isMounted) setIsSearching(false);
        }
      } else {
        if (isMounted) {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(delayDebounceFn);
    };
  }, [searchQuery]);

  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
  };

  const checkAdhanTrigger = () => {};

  const timesRef = useRef<PrayerTimesData | null>(null);
  useEffect(() => { timesRef.current = times; }, [times]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) {
      if (e.key === 'Enter') {
         e.preventDefault();
         handleSearchByCity(searchQuery);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
        handleLocationSelect(suggestions[activeSuggestionIndex]);
      } else {
         handleSearchByCity(searchQuery);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSearchByCity = async (searchCity: string) => {
    if (!searchCity.trim()) return;
    setLoading(true);
    setShowSuggestions(false);
    const result = await fetchPrayerTimesByCity(searchCity);
    if (result) {
      setTimes(result.timings);
      setHijriDate(result.date.hijri);
      setLocationName(searchCity === 'Makkah' ? (language === 'ar' ? 'مكة المكرمة' : 'Makkah') : result.timezone);
      setSearchQuery('');
    }
    setLoading(false);
  };

  const handleLocationSelect = async (location: LocationSearchResult) => {
    setLoading(true);
    setSearchQuery('');
    setShowSuggestions(false);
    const displayName = location.display_name.split(',')[0];
    setLocationName(displayName);

    const result = await fetchPrayerTimesByCoords(parseFloat(location.lat), parseFloat(location.lon));
    if (result) {
      setTimes(result.timings);
      setHijriDate(result.date.hijri);
    }
    setLoading(false);
  };

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const result = await fetchPrayerTimesByCoords(pos.coords.latitude, pos.coords.longitude);
        if (result) {
          setTimes(result.timings);
          setHijriDate(result.date.hijri);
          setLocationName(result.timezone);
        }
        setLoading(false);
      }, () => {
        setLoading(false);
        alert('Geolocation failed');
      });
    }
  };

  const updateCountdown = () => {
    const currentTimes = timesRef.current;
    if (!currentTimes) return;
    
    const now = new Date();
    const currentTimeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    if (isSoundEnabled && lastPlayedTimeRef.current !== currentTimeStr) {
      const prayersToCheck = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      const isPrayerTime = prayersToCheck.some(p => {
        const t = currentTimes[p as keyof PrayerTimesData].split(' ')[0];
        const [h, m] = t.split(':');
        const formattedT = `${Number(h)}:${m}`; 
        return t === String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0') 
            || t === currentTimeStr; 
      });

      if (isPrayerTime) {
        lastPlayedTimeRef.current = currentTimeStr;
        audioRef.current?.play().catch(e => console.log('Audio play blocked:', e));
      }
    }

    const prayers = [
      { key: 'Fajr', name: t('fajr') },
      { key: 'Dhuhr', name: t('dhuhr') },
      { key: 'Asr', name: t('asr') },
      { key: 'Maghrib', name: t('maghrib') },
      { key: 'Isha', name: t('isha') }
    ];

    for (const p of prayers) {
      const timeStr = currentTimes[p.key as keyof PrayerTimesData];
      if (!timeStr) continue;
      
      const [h, m] = timeStr.split(':').map(Number);
      const pDate = new Date();
      pDate.setHours(h, m, 0, 0);

      if (pDate > now) {
        const diff = pDate.getTime() - now.getTime();
        const hh = Math.floor(diff / 3600000);
        const mm = Math.floor((diff % 3600000) / 60000);
        const ss = Math.floor((diff % 60000) / 1000);
        setNextPrayer({
          name: p.name,
          time: timeStr,
          timeLeft: `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`
        });
        return;
      }
    }
    
    setNextPrayer({ name: t('fajr'), time: currentTimes.Fajr, timeLeft: '--:--:--' });
  };

  const todayDate = new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const cards = [
    { key: 'Fajr', name: t('fajr'), icon: <Moon className="text-gold" /> },
    { key: 'Dhuhr', name: t('dhuhr'), icon: <Sun className="text-gold" /> },
    { key: 'Asr', name: t('asr'), icon: <CloudSun className="text-gold" /> },
    { key: 'Maghrib', name: t('maghrib'), icon: <Sunset className="text-gold" /> },
    { key: 'Isha', name: t('isha'), icon: <Moon className="text-gold" /> },
  ];

  const selectedPrayerDetails = selectedPrayer ? PRAYER_DETAILS[selectedPrayer] : null;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header Info */}
      <div className="text-center mb-8">
        <div className="flex flex-col items-center gap-1 mb-4">
          <div className="text-cream-dim text-sm">{todayDate}</div>
          {hijriDate && (
            <div className="flex items-center gap-2 text-gold-light bg-gold/10 px-3 py-1 rounded-full text-xs font-amiri">
              <Calendar size={12} />
              <span>{hijriDate.day} {language === 'en' ? hijriDate.month.en : hijriDate.month.ar} {hijriDate.year}</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-center items-start gap-2 mb-6 relative z-30" ref={searchRef}>
          <div className="flex flex-col w-full max-w-xs relative">
            <div className={`flex bg-navy-light rounded-lg overflow-hidden border transition-colors relative z-10 ${showSuggestions ? 'border-gold rounded-b-none' : 'border-gold-dim'} p-1`}>
              <input 
                className="bg-transparent text-cream px-3 py-1 outline-none font-amiri placeholder:text-cream-dim/50 w-full"
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true); }}
              />
              <div className="flex items-center px-2">
                {isSearching ? (
                  <Loader2 size={18} className="text-gold animate-spin" />
                ) : searchQuery ? (
                   <button onClick={() => setSearchQuery('')} className="text-cream-dim hover:text-red-400">
                     <X size={16} />
                   </button>
                ) : (
                  <Search size={18} className="text-gold-dim" />
                )}
              </div>
            </div>

            <AnimatePresence>
              {showSuggestions && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full mt-0 left-0 right-0 bg-navy-mid border border-t-0 border-gold rounded-b-lg shadow-2xl overflow-hidden max-h-60 overflow-y-auto z-50 scrollbar-thin"
                >
                  {suggestions.length > 0 ? (
                    suggestions.map((item, index) => (
                      <button
                        key={item.place_id}
                        onClick={() => handleLocationSelect(item)}
                        className={`w-full text-start px-4 py-3 text-sm border-b border-white/5 last:border-0 transition-colors flex items-center gap-2
                          ${index === activeSuggestionIndex ? 'bg-gold-dim/30 text-gold' : 'text-cream hover:bg-gold-dim/20 hover:text-gold'}
                        `}
                      >
                        <MapPin size={14} className={`shrink-0 ${index === activeSuggestionIndex ? 'opacity-100' : 'opacity-50'}`} />
                        <span className="truncate">{item.display_name}</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-cream-dim text-sm">
                      {isSearching ? '...' : t('search_placeholder')}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={handleGeolocation} className="bg-navy-light border border-gold-dim text-gold p-2 rounded-lg hover:bg-gold-dim hover:text-navy transition-colors h-[42px] w-[42px] flex items-center justify-center">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <MapPin size={20} />}
          </button>

          <div 
            onClick={toggleSound}
            className={`border border-gold-dim p-2 rounded-lg transition-colors h-[42px] w-[54px] flex items-center justify-center cursor-pointer ${isSoundEnabled ? 'bg-gold-dim/20' : 'bg-navy-light'}`}
          >
             <div className={`relative w-10 h-6 rounded-full transition-colors duration-300 ${isSoundEnabled ? 'bg-gold' : 'bg-navy-mid border border-cream-dim/30'}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center transition-all duration-300 ${isSoundEnabled ? 'left-0.5' : 'right-0.5'}`}>
                  {isSoundEnabled ? <Volume2 size={10} className="text-gold-dim" /> : <VolumeX size={10} className="text-gray-400" />}
                </div>
              </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-scheherazade text-gold-light mt-4">
          {locationName}
        </h2>
      </div>

      <div className="bg-gradient-to-br from-navy-light to-navy-mid border border-gold rounded-2xl p-6 text-center mb-8 shadow-[0_0_20px_rgba(201,168,76,0.15)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="text-cream-dim text-sm mb-2">{t('time_remaining')}</div>
        <div className="text-2xl text-cream font-bold mb-1">{nextPrayer.name}</div>
        <div className="text-5xl md:text-6xl font-scheherazade text-gold-light dir-ltr font-bold tracking-wider drop-shadow-lg">
          {nextPrayer.timeLeft}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cards.map((card) => {
          const isNext = nextPrayer.name === card.name;
          return (
            <div 
              key={card.key}
              onClick={() => setSelectedPrayer(card.key)}
              className={`relative bg-navy-mid border cursor-pointer ${isNext ? 'border-gold shadow-[0_0_15px_rgba(201,168,76,0.2)] animate-scale-pulse' : 'border-gold-dim/30 hover:-translate-y-1'} rounded-2xl p-4 text-center transition-all duration-300 hover:border-gold-dim group`}
            >
              {isNext && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gold text-navy text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                  {t('next_prayer')}
                </span>
              )}
              <div className="flex justify-center mb-2 group-hover:scale-110 transition-transform">{card.icon}</div>
              <div className="text-gold-light font-scheherazade text-xl">{card.name}</div>
              <div className="text-2xl font-bold text-cream dir-ltr">
                {times ? times[card.key as keyof PrayerTimesData] : '--:--'}
              </div>
              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-emerald-light flex justify-center items-center gap-1">
                 <Info size={10} /> {t('details')}
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={!!selectedPrayer} onClose={() => setSelectedPrayer(null)}>
        {selectedPrayerDetails && times && (
          <div className="p-6 text-center">
             <h3 className="text-3xl font-scheherazade text-gold mb-2">{times[selectedPrayer as keyof PrayerTimesData]}</h3>
             
             <div className="text-4xl font-bold text-cream dir-ltr mb-4 tracking-widest">
                {t(selectedPrayer?.toLowerCase())}
             </div>

             <div className="bg-navy-mid/50 border border-gold-dim/20 rounded-xl p-4 mb-4 relative">
               <div className="text-gold-dim text-2xl absolute top-2 right-4 opacity-20">❝</div>
               <p className="font-scheherazade text-xl text-cream leading-relaxed mb-2 px-2">
                 {selectedPrayerDetails.hadith}
               </p>
               <p className="text-[10px] text-cream-dim font-sans">{selectedPrayerDetails.source}</p>
             </div>

             <div className="text-right">
               <h4 className="text-gold-light text-sm font-bold mb-1 border-b border-gold-dim/20 pb-1 inline-block">{t('benefit')}:</h4>
               <p className="text-sm text-cream-dim leading-relaxed">
                 {selectedPrayerDetails.benefit}
               </p>
             </div>

             <button 
               onClick={() => setSelectedPrayer(null)}
               className="mt-6 w-full bg-navy-light hover:bg-navy-mid border border-gold-dim text-gold py-2 rounded-lg transition-colors text-sm"
             >
               {t('close')}
             </button>
          </div>
        )}
      </Modal>
    </div>
  );
};
