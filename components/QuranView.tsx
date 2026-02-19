
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { fetchSurahList, fetchSurahDetails, searchQuran, QuranSearchResult } from '../services/quranService';
import { Surah, Ayah } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Search, Loader2, X, Menu, ArrowRight, ArrowLeft, BookOpen, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Modal } from './ui/Modal';

// Extracted TafsirModal
interface TafsirModalProps {
  ayah: Ayah | null;
  onClose: () => void;
  surahAyahs: Ayah[];
  onSelectAyah: (ayah: Ayah) => void;
  language: string;
  t: (key: string) => string;
  dir: string;
  currentSurahName?: string;
}

const TafsirModal: React.FC<TafsirModalProps> = ({ 
  ayah, onClose, surahAyahs, onSelectAyah, language, t, dir, currentSurahName
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }, [ayah?.numberInSurah, ayah?.surah?.number]);

    if (!ayah) return null;
    
    const currentIndex = surahAyahs.findIndex(a => a.numberInSurah === ayah.numberInSurah);
    const hasNext = currentIndex < surahAyahs.length - 1;
    const hasPrev = currentIndex > 0;

    const navigate = (direction: 'next' | 'prev') => {
        const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
        if (newIndex >= 0 && newIndex < surahAyahs.length) onSelectAyah(surahAyahs[newIndex]);
    };

    return (
        <Modal isOpen={!!ayah} onClose={onClose}>
            <div className="p-6 max-h-[85vh] h-[85vh] flex flex-col bg-surface">
                <div className="flex justify-between items-start mb-4 shrink-0">
                     <div className="flex flex-col">
                        <span className="text-xs text-primary font-bold uppercase tracking-wider">{t('tafsir')}</span>
                        <span className="text-[10px] text-text-secondary">{currentSurahName} • Ayah {ayah.numberInSurah}</span>
                     </div>
                     <button onClick={onClose} className="text-text-secondary hover:text-red-500"><X size={20} /></button>
                </div>
                <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin pr-2">
                    <div className="bg-background rounded-xl p-6 mb-6 border border-gray-100">
                        <p className="font-scheherazade text-3xl text-center text-primary leading-loose" dir="rtl">{ayah.text}</p>
                    </div>
                    {ayah.translation && language !== 'ar' && (
                        <div className="mb-6 pb-4 border-b border-gray-100">
                            <p className="text-text-secondary font-amiri text-lg leading-relaxed italic">{ayah.translation}</p>
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <BookOpen size={16} className="text-accent" />
                            <h4 className="text-accent text-sm font-bold">{t('tafsir_source')}</h4>
                        </div>
                        <p className="font-scheherazade text-xl text-text-primary leading-[2.2] text-justify" dir="rtl">{ayah.tafsir || t('failed_load')}</p>
                    </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-2 shrink-0">
                     <button onClick={() => navigate('prev')} disabled={!hasPrev} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${!hasPrev ? 'opacity-30' : 'text-primary bg-primary/5'}`}>
                         {dir === 'rtl' ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                         <span>{t('previous_ayah') || 'Prev'}</span>
                     </button>
                     <button onClick={() => navigate('next')} disabled={!hasNext} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${!hasNext ? 'opacity-30' : 'text-primary bg-primary/5'}`}>
                         <span>{t('next_ayah') || 'Next'}</span>
                         {dir === 'rtl' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                     </button>
                </div>
            </div>
        </Modal>
    );
};

export const QuranView: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<QuranSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [currentSurahNum, setCurrentSurahNum] = useState<number>(1);
  const [surahAyahs, setSurahAyahs] = useState<Ayah[]>([]);
  const [loadingSurah, setLoadingSurah] = useState(false);
  const [showSurahListModal, setShowSurahListModal] = useState(false);
  const [targetAyahNum, setTargetAyahNum] = useState<number | null>(null);
  const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const ayahRefs = useRef<Record<number, HTMLSpanElement | null>>({});

  useEffect(() => {
    fetchSurahList().then(setSurahs);
    const saved = localStorage.getItem('last_quran_surah');
    loadSurah(saved ? parseInt(saved) : 1);
  }, []);

  // Intersection Observer to track reading progress
  useEffect(() => {
    if (loadingSurah || surahAyahs.length === 0) return;

    const observerOptions = {
        root: null,
        // Trigger when the element is near the top of the viewport (reading line)
        rootMargin: '-10% 0px -80% 0px', 
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const ayahNum = parseInt(entry.target.getAttribute('data-ayah') || '0');
                if (ayahNum > 0) {
                    const bookmarks = JSON.parse(localStorage.getItem('quran_bookmarks') || '{}');
                    // Avoid unnecessary writes if the value hasn't changed
                    if (bookmarks[currentSurahNum] !== ayahNum) {
                        bookmarks[currentSurahNum] = ayahNum;
                        localStorage.setItem('quran_bookmarks', JSON.stringify(bookmarks));
                    }
                }
            }
        });
    }, observerOptions);

    // Observe all ayah elements
    Object.values(ayahRefs.current).forEach((el) => {
        if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [surahAyahs, loadingSurah, currentSurahNum]);

  useEffect(() => {
    if (targetAyahNum && !loadingSurah && surahAyahs.length > 0) {
        // Short timeout to ensure DOM render before scrolling
        setTimeout(() => {
            const element = ayahRefs.current[targetAyahNum];
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('bg-accent/20');
                setTimeout(() => element.classList.remove('bg-accent/20'), 2000);
                setTargetAyahNum(null);
            }
        }, 100);
    }
  }, [loadingSurah, surahAyahs, targetAyahNum]);

  const loadSurah = async (num: number) => {
    setLoadingSurah(true);
    setCurrentSurahNum(num);
    localStorage.setItem('last_quran_surah', num.toString());
    
    // Check for saved bookmark/scroll position
    const bookmarks = JSON.parse(localStorage.getItem('quran_bookmarks') || '{}');
    const savedAyah = bookmarks[num];
    
    if (savedAyah) {
        setTargetAyahNum(savedAyah);
    } else {
        setTargetAyahNum(null);
    }

    const ayahs = await fetchSurahDetails(num, language);
    setSurahAyahs(ayahs);
    setLoadingSurah(false);
    
    // Only scroll to top if we don't have a target ayah (meaning start of Surah)
    if (!savedAyah && topRef.current) {
         topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    setSearching(true);
    const results = await searchQuran(searchQuery, language);
    setSearchResults(results);
    setSearching(false);
  };

  const currentSurahInfo = surahs.find(s => s.number === currentSurahNum);

  // Surah List Modal
  const SurahListModal = () => (
    <Modal isOpen={showSurahListModal} onClose={() => setShowSurahListModal(false)}>
      <div className="p-6 h-[70vh] flex flex-col bg-surface">
        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
            <h3 className="font-scheherazade text-2xl text-primary">{t('surah_list')}</h3>
            <button onClick={() => setShowSurahListModal(false)}><X size={20} className="text-text-secondary" /></button>
        </div>
        <div className="overflow-y-auto pr-2 space-y-2 flex-1 scrollbar-thin">
            {surahs.map((surah) => (
              <button
                key={surah.number}
                onClick={() => { setCurrentSurahNum(surah.number); loadSurah(surah.number); setShowSurahListModal(false); }}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${currentSurahNum === surah.number ? 'bg-primary/5 border-primary text-primary' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
              >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono opacity-50 w-8 bg-gray-100 rounded py-1">{surah.number}</span>
                    <span className="font-scheherazade text-lg font-bold">{surah.name}</span>
                  </div>
                  <span className="text-[10px] text-text-secondary">{surah.numberOfAyahs} {t('ayahs')}</span>
              </button>
            ))}
        </div>
      </div>
    </Modal>
  );

  return (
    <div className="w-full max-w-4xl mx-auto min-h-[calc(100vh-150px)] relative" ref={topRef}>
       <div className="sticky top-0 z-30 bg-background/95 backdrop-blur shadow-sm border-b border-gray-100 pb-3 pt-3 flex flex-col gap-2">
          {!searching && !searchResults.length ? (
            <div className="flex justify-between items-center px-2">
              <button onClick={() => setShowSurahListModal(true)} className="flex items-center gap-3 text-primary bg-surface px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                <Menu size={20} />
                <div className="flex flex-col items-start">
                   <span className="font-scheherazade text-xl leading-none font-bold">{currentSurahInfo?.name || '...'}</span>
                   <span className="text-[10px] text-text-secondary uppercase tracking-wider">{currentSurahInfo?.revelationType}</span>
                </div>
              </button>
              <button onClick={() => setSearching(true)} className="p-3 bg-surface rounded-xl text-text-secondary border border-gray-200 shadow-sm"><Search size={20} /></button>
            </div>
          ) : (
             <div className="relative px-2">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <input 
                    type="text" placeholder={t('search_placeholder')} value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} autoFocus
                    className="w-full bg-surface border border-primary rounded-xl py-3 px-4 text-text-primary shadow-sm outline-none"
                  />
                  <button type="button" onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="text-text-secondary"><X size={24} /></button>
                </form>
             </div>
          )}
       </div>

      {searching || searchResults.length > 0 ? (
        <div className="pt-4 pb-20 px-2">
             {searchResults.map((result, idx) => (
                <div key={idx} className="w-full text-start bg-surface border border-gray-100 rounded-xl p-4 mb-3 shadow-sm" onClick={() => { loadSurah(result.surah.number); setTargetAyahNum(result.numberInSurah); setSearchQuery(''); setSearchResults([]); }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-primary font-bold">{result.surah.name}</span>
                    <span className="text-[10px] bg-gray-100 px-2 py-1 rounded">Ayah {result.numberInSurah}</span>
                  </div>
                  <p className="font-scheherazade text-xl text-text-primary leading-loose" dir="rtl">{result.text}</p>
                </div>
             ))}
             {searching && <div className="text-center py-10"><Loader2 className="animate-spin inline text-primary" /></div>}
        </div>
      ) : (
        <div className="py-4 pb-32 px-1">
           {loadingSurah ? <div className="text-center py-20"><Loader2 className="animate-spin inline text-primary" size={30} /></div> : (
             <div className="min-h-[70vh]">
                <div className="relative mb-8 text-center pt-4">
                    <div className="absolute inset-x-0 top-1/2 h-px bg-gray-200"></div>
                    <div className="relative inline-block bg-background px-6">
                         <span className="font-scheherazade text-4xl text-primary font-bold">سورة {currentSurahInfo?.name}</span>
                    </div>
                </div>
                {currentSurahNum !== 9 && <div className="text-center mb-8 font-scheherazade text-2xl text-text-secondary">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>}
                
                <div className="font-scheherazade text-3xl text-text-primary leading-[2.8] text-justify" dir="rtl" style={{ textAlignLast: 'center' }}>
                    {surahAyahs.map((ayah) => {
                         let text = ayah.text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '').trim();
                         return (
                           <React.Fragment key={ayah.number}>
                             <span 
                                ref={el => { ayahRefs.current[ayah.numberInSurah] = el }} 
                                onClick={() => setSelectedAyah(ayah)} 
                                className="hover:bg-primary/5 cursor-pointer rounded px-1"
                                data-ayah={ayah.numberInSurah}
                             >
                                {text}
                             </span>
                             <span className="inline-flex items-center justify-center w-[30px] h-[30px] mx-1 align-middle relative text-accent" style={{ top: '5px' }}>
                                <svg viewBox="0 0 50 50" className="w-full h-full fill-none stroke-current stroke-[2]"><path d="M25 5 L45 25 L25 45 L5 25 Z" /></svg>
                                <span className="absolute text-[10px] font-sans font-bold text-primary">{ayah.numberInSurah}</span>
                             </span>
                           </React.Fragment>
                         );
                    })}
                </div>

                {createPortal(
                    <div className="fixed bottom-[84px] left-0 right-0 z-[60] pointer-events-none flex justify-center px-4">
                        <div className="w-full max-w-lg flex justify-between pointer-events-auto">
                            {currentSurahNum < 114 && (
                                <button onClick={() => loadSurah(currentSurahNum + 1)} className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-full shadow-lg">
                                     {dir === 'rtl' ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
                                    <span className="font-scheherazade font-bold">التالية</span>
                                </button>
                            )}
                            {currentSurahNum > 1 && (
                                <button onClick={() => loadSurah(currentSurahNum - 1)} className="flex items-center gap-2 bg-surface text-text-secondary px-5 py-3 rounded-full shadow-lg border border-gray-100">
                                    {dir === 'rtl' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
                                    <span className="font-scheherazade font-bold">السابقة</span>
                                </button>
                            )}
                        </div>
                    </div>,
                    document.body
                )}
             </div>
           )}
        </div>
      )}
      <SurahListModal />
      <TafsirModal ayah={selectedAyah} onClose={() => setSelectedAyah(null)} surahAyahs={surahAyahs} onSelectAyah={setSelectedAyah} language={language} t={t} dir={dir} currentSurahName={currentSurahInfo?.name} />
    </div>
  );
};
