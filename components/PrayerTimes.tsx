
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Moon, Sun, CloudSun, Sunset, Loader2, Calendar as CalendarIcon, Volume2, VolumeX, Settings2, Play, Square, Check, BookOpen } from 'lucide-react';
import { fetchPrayerTimesByCity, fetchPrayerTimesByCoords, searchLocations } from '../services/prayerService';
import { PrayerTimesData, HijriDate, LocationSearchResult, PrayerSettingsMap } from '../types';
import { PRAYER_DETAILS, ADHAN_SOURCES } from '../constants';
import { Modal } from './ui/Modal';
import { useLanguage } from '../contexts/LanguageContext';

interface PrayerTimesProps {
    isWidget?: boolean;
}

export const PrayerTimes: React.FC<PrayerTimesProps> = ({ isWidget = false }) => {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [times, setTimes] = useState<PrayerTimesData | null>(null);
  const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
  const [locationName, setLocationName] = useState(() => localStorage.getItem('last_city') || (language === 'ar' ? 'مكة المكرمة' : 'Makkah'));
  const [nextPrayer, setNextPrayer] = useState<{name: string, time: string, timeLeft: string}>({ name: '', time: '', timeLeft: '--:--:--' });
  
  // Audio State (Global Mute Toggle)
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => localStorage.getItem('adhan_enabled') === 'true');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);

  // Prayer Specific Settings (Offset, Sound, Enabled)
  const [prayerSettings, setPrayerSettings] = useState<PrayerSettingsMap>(() => {
    const saved = localStorage.getItem('prayer_settings');
    if (saved) return JSON.parse(saved);
    return {
      Fajr: { offset: 0, sound: ADHAN_SOURCES[0].url, enabled: true },
      Dhuhr: { offset: 0, sound: ADHAN_SOURCES[0].url, enabled: true },
      Asr: { offset: 0, sound: ADHAN_SOURCES[0].url, enabled: true },
      Maghrib: { offset: 0, sound: ADHAN_SOURCES[0].url, enabled: true },
      Isha: { offset: 0, sound: ADHAN_SOURCES[0].url, enabled: true },
    };
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Search & Calendar State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [selectedDate] = useState(new Date()); 
  const [selectedPrayer, setSelectedPrayer] = useState<string | null>(null);
  const coordsRef = useRef<{lat: number, lon: number} | null>(null);

  useEffect(() => {
    // Initialize Main Audio
    audioRef.current = new Audio();
    previewAudioRef.current = new Audio();

    const savedCoords = localStorage.getItem('last_coords');
    if (savedCoords) {
        try {
            const { lat, lon, name } = JSON.parse(savedCoords);
            coordsRef.current = { lat, lon };
            if (name) setLocationName(name);
            fetchByCoords(lat, lon, selectedDate);
        } catch (e) {
            fetchByCity(locationName, selectedDate);
        }
    } else {
        fetchByCity(locationName, selectedDate);
    }
    
    const interval = setInterval(() => { updateCountdown(); }, 1000);
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      if (previewAudioRef.current) { previewAudioRef.current.pause(); previewAudioRef.current = null; }
    };
  }, []);

  useEffect(() => {
      if (coordsRef.current) {
          fetchByCoords(coordsRef.current.lat, coordsRef.current.lon, selectedDate);
      } else {
          fetchByCity(locationName, selectedDate);
      }
  }, [selectedDate]);

  useEffect(() => {
    localStorage.setItem('prayer_settings', JSON.stringify(prayerSettings));
  }, [prayerSettings]);

  const timesRef = useRef<PrayerTimesData | null>(null);
  useEffect(() => { timesRef.current = times; }, [times]);

  const fetchByCity = async (city: string, date: Date) => {
      setLoading(true);
      const result = await fetchPrayerTimesByCity(city, date);
      if (result) {
          setTimes(result.timings);
          setHijriDate(result.date.hijri);
      }
      setLoading(false);
  }

  const fetchByCoords = async (lat: number, lon: number, date: Date) => {
      setLoading(true);
      const result = await fetchPrayerTimesByCoords(lat, lon, date);
      if (result) {
          setTimes(result.timings);
          setHijriDate(result.date.hijri);
      }
      setLoading(false);
  }

  const handleLocationSelect = async (location: LocationSearchResult) => {
    setLoading(true);
    setSearchQuery('');
    setShowSuggestions(false);
    const displayName = location.display_name.split(',')[0];
    setLocationName(displayName);
    localStorage.setItem('last_city', displayName);
    
    const lat = parseFloat(location.lat);
    const lon = parseFloat(location.lon);
    
    coordsRef.current = { lat, lon };
    localStorage.setItem('last_coords', JSON.stringify({ lat, lon, name: displayName }));

    const result = await fetchPrayerTimesByCoords(lat, lon, selectedDate);
    if (result) {
      setTimes(result.timings);
      setHijriDate(result.date.hijri);
    }
    setLoading(false);
  };

  // Helper to adjust time string by minutes
  const adjustTime = (timeStr: string, offset: number) => {
    if (!timeStr) return timeStr;
    const [h, m] = timeStr.split(' ')[0].split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + offset, 0, 0);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const updateCountdown = () => {
    const isToday = selectedDate.toDateString() === new Date().toDateString();
    if (!isToday) { setNextPrayer({ name: '', time: '', timeLeft: '--:--:--' }); return; }

    const currentTimes = timesRef.current;
    if (!currentTimes) return;
    
    const now = new Date();
    // Logic for next prayer only tracks obligatory prayers
    const obligatoryPrayers = [
      { key: 'Fajr', name: t('fajr') },
      { key: 'Dhuhr', name: t('dhuhr') },
      { key: 'Asr', name: t('asr') },
      { key: 'Maghrib', name: t('maghrib') },
      { key: 'Isha', name: t('isha') }
    ];

    let nextPrayerFound = null;

    for (const p of obligatoryPrayers) {
      const rawTime = currentTimes[p.key as keyof PrayerTimesData];
      if (!rawTime) continue;

      // Apply User Offset
      const offset = prayerSettings[p.key]?.offset || 0;
      const [h, m] = rawTime.split(' ')[0].split(':').map(Number);
      const pDate = new Date(); 
      pDate.setHours(h, m + offset, 0, 0);

      if (pDate > now) {
        nextPrayerFound = { name: p.name, time: adjustTime(rawTime, offset), targetDate: pDate, key: p.key };
        break;
      }
    }

    // Wrap to next day Fajr
    if (!nextPrayerFound && currentTimes.Fajr) {
        const rawTime = currentTimes.Fajr;
        const offset = prayerSettings['Fajr']?.offset || 0;
        const [h, m] = rawTime.split(' ')[0].split(':').map(Number);
        
        const pDate = new Date(); 
        pDate.setDate(pDate.getDate() + 1); 
        pDate.setHours(h, m + offset, 0, 0);
        
        nextPrayerFound = { name: t('fajr'), time: adjustTime(rawTime, offset), targetDate: pDate, key: 'Fajr' };
    }

    if (nextPrayerFound) {
      const diff = nextPrayerFound.targetDate.getTime() - now.getTime();
      const hh = Math.floor(diff / 3600000);
      const mm = Math.floor((diff % 3600000) / 60000);
      const ss = Math.floor((diff % 60000) / 1000);
      
      const timeLeftStr = `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
      
      setNextPrayer({
        name: nextPrayerFound.name,
        time: nextPrayerFound.time,
        timeLeft: timeLeftStr
      });

      // Trigger Audio if Time matches 00:00:00 AND enabled
      if (hh === 0 && mm === 0 && ss === 0 && isSoundEnabled && audioRef.current) {
          const settings = prayerSettings[nextPrayerFound.key];
          if (settings && settings.enabled) {
              audioRef.current.src = settings.sound;
              audioRef.current.play().catch(e => console.log('Audio play blocked', e));
          }
      }
    }
  };

  const handlePreviewSound = (url: string) => {
      if (previewAudioRef.current) {
          if (playingPreview === url) {
              previewAudioRef.current.pause();
              setPlayingPreview(null);
          } else {
              previewAudioRef.current.src = url;
              previewAudioRef.current.play();
              setPlayingPreview(url);
              previewAudioRef.current.onended = () => setPlayingPreview(null);
          }
      }
  };

  const updateSetting = (prayerKey: string, field: keyof typeof prayerSettings['Fajr'], value: any) => {
      setPrayerSettings(prev => ({
          ...prev,
          [prayerKey]: {
              ...prev[prayerKey],
              [field]: value
          }
      }));
  };

  // Full chronological list including Sunrise for display
  const prayers = [
    { key: 'Fajr', name: t('fajr'), icon: <Moon size={isWidget ? 16 : 20} /> },
    { key: 'Sunrise', name: t('sunrise'), icon: <Sunset size={isWidget ? 16 : 20} /> },
    { key: 'Dhuhr', name: t('dhuhr'), icon: <Sun size={isWidget ? 16 : 20} /> },
    { key: 'Asr', name: t('asr'), icon: <CloudSun size={isWidget ? 16 : 20} /> },
    { key: 'Maghrib', name: t('maghrib'), icon: <Sunset size={isWidget ? 16 : 20} /> },
    { key: 'Isha', name: t('isha'), icon: <Moon size={isWidget ? 16 : 20} /> },
  ];

  if (isWidget) {
    return (
      <div>
         <div className="mb-4">
             <span className="text-emerald-100 text-xs uppercase tracking-wider">{t('next_prayer')}</span>
             <div className="flex justify-between items-end">
                 <h2 className="text-2xl font-bold text-white">{nextPrayer.name}</h2>
                 <div className="text-4xl font-scheherazade text-accent font-bold dir-ltr">{nextPrayer.timeLeft}</div>
             </div>
         </div>
         {/* Changed to Grid to ensure all 5 prayers fit without scrolling */}
         <div className="grid grid-cols-5 gap-1 sm:gap-2">
             {prayers.filter(p => p.key !== 'Sunrise').map((p) => {
                 const rawTime = times ? times[p.key as keyof PrayerTimesData]?.split(' ')[0] : '--:--';
                 const offset = prayerSettings[p.key]?.offset || 0;
                 const time = adjustTime(rawTime, offset);
                 const isNext = nextPrayer.name === p.name;
                 return (
                     <div key={p.key} className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${isNext ? 'bg-accent text-primary font-bold shadow-lg' : 'bg-white/10 text-emerald-100'}`}>
                         <span className="mb-1 opacity-80">{p.icon}</span>
                         <span className="text-[9px] sm:text-[10px] uppercase mb-1 truncate w-full text-center">{p.name}</span>
                         <span className="text-xs sm:text-sm font-sans">{time}</span>
                     </div>
                 )
             })}
         </div>
      </div>
    );
  }

  // Full View Render
  const selectedDateDisplay = selectedDate.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const featuredHadith = PRAYER_DETAILS.Fajr; // Using Fajr hadith as a default featured one for now

  return (
    <div className="w-full max-w-md mx-auto pb-44">
       {/* Location & Controls Header */}
       <div className="bg-surface rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
           <div className="flex items-center gap-2 mb-2 relative" ref={searchRef}>
               <MapPin className="text-primary shrink-0" size={20} />
               <div className="relative flex-1">
                   <input 
                       className="w-full bg-background border-none rounded-lg px-3 py-2 text-text-primary text-sm focus:ring-1 focus:ring-primary outline-none"
                       placeholder={t('search_placeholder')}
                       value={searchQuery}
                       onChange={(e) => { setSearchQuery(e.target.value); if(e.target.value.length>2) { setIsSearching(true); searchLocations(e.target.value).then(r => {setSuggestions(r); setShowSuggestions(true); setIsSearching(false)}) } }}
                       onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true); }}
                   />
                   {showSuggestions && (
                       <div className="absolute top-full left-0 right-0 bg-surface border border-gray-100 shadow-xl rounded-lg mt-1 z-50 max-h-48 overflow-y-auto">
                           {suggestions.map(s => (
                               <button key={s.place_id} onClick={() => handleLocationSelect(s)} className="w-full text-start px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0">{s.display_name}</button>
                           ))}
                       </div>
                   )}
               </div>
               
               <button 
                  onClick={() => setSettingsOpen(true)}
                  className="p-2 rounded-full text-text-secondary hover:bg-gray-100 transition-colors"
                  title={t('configure_alerts')}
               >
                   <Settings2 size={20} />
               </button>

               <button onClick={() => setIsSoundEnabled(!isSoundEnabled)} className={`p-2 rounded-full ${isSoundEnabled ? 'text-primary bg-primary/10' : 'text-gray-400'}`}>
                   {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
               </button>
           </div>
           <div className="text-center">
                <span className="text-text-primary font-bold font-scheherazade text-lg">{locationName}</span>
           </div>
       </div>

       {/* Islamic Date & Hadith Card (New Dedicated Section) */}
       {hijriDate && (
           <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6 mb-8 text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
               <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
               
               <div className="relative z-10">
                   <div className="flex items-center justify-center gap-2 mb-2">
                       <CalendarIcon size={16} className="text-primary" />
                       <span className="text-sm font-bold text-primary tracking-wide uppercase">{t('today')}</span>
                   </div>
                   
                   <h2 className="text-3xl font-scheherazade font-bold text-primary mb-1">
                       {hijriDate.day} {language === 'en' ? hijriDate.month.en : hijriDate.month.ar} {hijriDate.year}
                   </h2>
                   <p className="text-sm text-text-secondary mb-6 font-serif">{selectedDateDisplay}</p>
                   
                   <div className="border-t border-primary/10 pt-4 mt-2">
                       <span className="text-xs text-accent font-bold uppercase tracking-widest mb-2 block">{t('featured_hadith')}</span>
                       <p className="text-text-primary italic font-serif leading-relaxed text-sm">
                           "{featuredHadith.hadith}"
                       </p>
                       <p className="text-xs text-text-secondary mt-2 opacity-70">- {featuredHadith.source}</p>
                   </div>
               </div>
           </div>
       )}

      {/* Prayer List - Chronological Order (Fajr -> Sunrise -> ... -> Isha) */}
      <div className="flex flex-col gap-3 mb-8">
        {prayers.map((card) => {
          const isNext = selectedDate.toDateString() === new Date().toDateString() && nextPrayer.name === card.name;
          const rawTime = times ? times[card.key as keyof PrayerTimesData]?.split(' ')[0] : '--:--';
          const offset = prayerSettings[card.key]?.offset || 0;
          const displayTime = adjustTime(rawTime, offset);
          const isSunrise = card.key === 'Sunrise';
          
          return (
            <div 
              key={card.key}
              onClick={() => setSelectedPrayer(card.key)}
              className={`relative flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 shadow-sm border
                ${isSunrise 
                    ? 'bg-amber-50/50 border-amber-100 text-amber-800 hover:border-amber-300 cursor-pointer' 
                    : isNext 
                        ? 'bg-primary text-white border-primary shadow-md transform scale-[1.02] cursor-pointer' 
                        : 'bg-surface text-text-primary border-gray-100 hover:border-secondary/50 cursor-pointer'
                }
              `}
            >
              <div className="flex items-center gap-4">
                <div className={`${isNext ? 'text-accent' : isSunrise ? 'text-amber-500' : 'text-secondary'}`}>{card.icon}</div>
                <div className={`font-scheherazade text-xl font-bold`}>{card.name}</div>
              </div>
              
              <div className="flex items-center gap-4">
                 {!isSunrise && offset !== 0 && (
                     <span className={`text-[10px] ${isNext ? 'text-white/70' : 'text-text-secondary'}`}>
                         {offset > 0 ? '+' : ''}{offset} {t('minutes')}
                     </span>
                 )}
                 <div className={`text-xl font-bold dir-ltr font-sans`}>
                    {displayTime}
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Modal */}
      <Modal isOpen={!!selectedPrayer && !settingsOpen} onClose={() => setSelectedPrayer(null)}>
         {selectedPrayer && times && PRAYER_DETAILS[selectedPrayer] && (
             <div className="p-6 text-center bg-surface">
                 <h3 className="text-3xl font-scheherazade text-primary mb-2">
                     {adjustTime(times[selectedPrayer as keyof PrayerTimesData]?.split(' ')[0], prayerSettings[selectedPrayer]?.offset || 0)}
                 </h3>
                 <div className="text-xl font-bold text-text-secondary mb-4">{t(selectedPrayer.toLowerCase())}</div>
                 
                 {PRAYER_DETAILS[selectedPrayer].verse && (
                   <div className="mb-6 relative">
                     <BookOpen className="w-4 h-4 text-accent mx-auto mb-2 opacity-50" />
                     <p className="font-scheherazade text-xl text-primary leading-loose" dir="rtl">
                       {PRAYER_DETAILS[selectedPrayer].verse}
                     </p>
                   </div>
                 )}

                 <div className="bg-background rounded-xl p-4 mb-4 text-text-primary italic font-serif leading-relaxed border border-gray-100">
                     <span className="text-accent text-2xl font-serif">"</span>
                     {PRAYER_DETAILS[selectedPrayer].hadith}
                     <span className="text-accent text-2xl font-serif">"</span>
                     {PRAYER_DETAILS[selectedPrayer].source && (
                        <div className="text-xs text-text-secondary mt-2 not-italic font-sans">- {PRAYER_DETAILS[selectedPrayer].source}</div>
                     )}
                 </div>
                 <p className="text-sm text-text-secondary">{PRAYER_DETAILS[selectedPrayer].benefit}</p>
             </div>
         )}
      </Modal>

      {/* Settings Modal */}
      <Modal isOpen={settingsOpen} onClose={() => { setSettingsOpen(false); if(previewAudioRef.current) previewAudioRef.current.pause(); setPlayingPreview(null); }}>
          <div className="p-6 bg-surface max-h-[85vh] overflow-y-auto scrollbar-thin">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-2xl font-scheherazade text-primary">{t('configure_alerts')}</h3>
                 <button onClick={() => setSettingsOpen(false)} className="text-text-secondary"><Settings2 size={20} /></button>
              </div>

              <div className="space-y-6">
                  {prayers.filter(p => p.key !== 'Sunrise').map((p) => {
                      const settings = prayerSettings[p.key] || { offset: 0, sound: ADHAN_SOURCES[0].url, enabled: true };
                      return (
                          <div key={p.key} className="bg-background rounded-xl p-4 border border-gray-100">
                              <div className="flex justify-between items-center mb-3">
                                  <div className="flex items-center gap-2">
                                      <span className="text-primary">{p.icon}</span>
                                      <span className="font-scheherazade text-lg font-bold">{p.name}</span>
                                  </div>
                                  <button 
                                      onClick={() => updateSetting(p.key, 'enabled', !settings.enabled)}
                                      className={`w-10 h-5 rounded-full relative transition-colors ${settings.enabled ? 'bg-primary' : 'bg-gray-300'}`}
                                  >
                                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${settings.enabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                  </button>
                              </div>

                              <div className="space-y-3">
                                  {/* Offset Slider/Input */}
                                  <div className="flex items-center justify-between gap-4">
                                      <label className="text-xs text-text-secondary">{t('time_offset')} ({t('minutes')})</label>
                                      <div className="flex items-center gap-2">
                                          <button onClick={() => updateSetting(p.key, 'offset', settings.offset - 1)} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-lg">-</button>
                                          <input 
                                            type="number" 
                                            value={settings.offset}
                                            onChange={(e) => updateSetting(p.key, 'offset', parseInt(e.target.value) || 0)}
                                            className="w-16 text-center bg-white border border-gray-200 rounded-lg py-1.5 text-sm"
                                          />
                                          <button onClick={() => updateSetting(p.key, 'offset', settings.offset + 1)} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-lg">+</button>
                                      </div>
                                  </div>

                                  {/* Sound Selector */}
                                  <div>
                                      <label className="text-xs text-text-secondary mb-1 block">{t('adhan_sound')}</label>
                                      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                          {ADHAN_SOURCES.map((sound) => {
                                              const isSelected = settings.sound === sound.url;
                                              const isPlaying = playingPreview === sound.url;
                                              return (
                                                  <div 
                                                    key={sound.id}
                                                    onClick={() => updateSetting(p.key, 'sound', sound.url)}
                                                    className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-xs cursor-pointer border transition-all ${isSelected ? 'bg-primary/10 border-primary text-primary font-bold' : 'bg-white border-gray-200 text-text-secondary'}`}
                                                  >
                                                      {isSelected && <Check size={12} />}
                                                      <span>{sound.name}</span>
                                                      <button 
                                                          onClick={(e) => { e.stopPropagation(); handlePreviewSound(sound.url); }}
                                                          className={`ml-1 p-1 rounded-full ${isPlaying ? 'bg-accent text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                                                      >
                                                          {isPlaying ? <Square size={10} fill="currentColor" /> : <Play size={10} fill="currentColor" />}
                                                      </button>
                                                  </div>
                                              );
                                          })}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      </Modal>
    </div>
  );
};
