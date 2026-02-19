
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchHijriCalendar } from '../services/prayerService';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from 'lucide-react';

interface CalendarDay {
  gregorian: {
    date: string;
    day: string;
    weekday: { en: string };
    month: { number: number; en: string };
    year: string;
  };
  hijri: {
    date: string;
    day: string;
    weekday: { en: string; ar: string };
    month: { number: number; en: string; ar: string };
    year: string;
    holidays: string[];
  };
}

export const CalendarView: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  const loadCalendarData = async () => {
    setLoading(true);
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    const data = await fetchHijriCalendar(month, year);
    setCalendarData(data);
    setLoading(false);
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  // Generate grid cells
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sunday
  
  // Create blank cells for days before start of month
  const blanks = Array(firstDayOfMonth).fill(null);

  const monthNames = {
     ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
     en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
     tr: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
     id: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
     ur: ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر']
  };

  const weekDays = {
      ar: ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
      en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      tr: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
      id: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
      ur: ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ']
  };

  const currentMonthName = monthNames[language as keyof typeof monthNames]?.[currentDate.getMonth()] || monthNames['en'][currentDate.getMonth()];
  const currentHijriMonth = calendarData.length > 0 ? (language === 'en' ? calendarData[10].hijri.month.en : calendarData[10].hijri.month.ar) : '...';
  const currentHijriYear = calendarData.length > 0 ? calendarData[10].hijri.year : '...';

  // Highlight holidays
  const getEventForDay = (day: CalendarDay) => {
      // Prioritize holidays array from API, but also manually map common ones if API misses
      if (day.hijri.holidays.length > 0) return day.hijri.holidays[0];
      
      const hDay = parseInt(day.hijri.day);
      const hMonth = day.hijri.month.number;

      if (hMonth === 9 && hDay === 1) return t('ramadan_start') || "Ramadan";
      if (hMonth === 10 && hDay === 1) return t('eid_fitr') || "Eid al-Fitr";
      if (hMonth === 12 && hDay === 9) return t('arafah') || "Arafah";
      if (hMonth === 12 && hDay === 10) return t('eid_adha') || "Eid al-Adha";
      if (hMonth === 1 && hDay === 1) return t('islamic_new_year') || "New Year";
      if (hMonth === 1 && hDay === 10) return t('ashura') || "Ashura";
      if (hMonth === 3 && hDay === 12) return t('mawlid') || "Mawlid";
      
      return null;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 pb-24">
      
      {/* Header */}
      <div className="bg-surface rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
         <div className="flex justify-between items-center mb-4">
             <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100 text-primary">
                 {dir === 'rtl' ? <ChevronRight /> : <ChevronLeft />}
             </button>
             <div className="text-center">
                 <h2 className="text-2xl font-bold font-scheherazade text-primary">{currentMonthName} {currentDate.getFullYear()}</h2>
                 <p className="text-sm text-text-secondary font-scheherazade">{currentHijriMonth} {currentHijriYear}</p>
             </div>
             <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100 text-primary">
                 {dir === 'rtl' ? <ChevronLeft /> : <ChevronRight />}
             </button>
         </div>

         {/* Grid */}
         <div className="grid grid-cols-7 gap-1 text-center mb-2">
             {weekDays[language as keyof typeof weekDays]?.map((day, i) => (
                 <div key={i} className="text-xs font-bold text-text-secondary py-2">{day}</div>
             ))}
         </div>
         
         {loading ? (
             <div className="h-64 flex items-center justify-center">
                 <Loader2 className="animate-spin text-primary" size={32} />
             </div>
         ) : (
             <div className="grid grid-cols-7 gap-1">
                 {blanks.map((_, i) => <div key={`blank-${i}`} className="aspect-square"></div>)}
                 
                 {calendarData.map((day, i) => {
                     const isToday = 
                        parseInt(day.gregorian.day) === new Date().getDate() && 
                        day.gregorian.month.number === new Date().getMonth() + 1 &&
                        day.gregorian.year === new Date().getFullYear().toString();
                     
                     const event = getEventForDay(day);
                     const isFriday = day.gregorian.weekday.en === 'Friday';

                     return (
                         <div key={i} className={`aspect-square relative rounded-xl border flex flex-col items-center justify-between p-1 transition-all overflow-hidden
                            ${isToday 
                                ? 'bg-primary text-white border-primary shadow-lg scale-105 z-10' 
                                : event 
                                    ? 'bg-accent/10 border-accent/30 text-primary'
                                    : 'bg-background border-transparent hover:border-gray-200'
                            }
                         `}>
                             <div className="flex flex-col items-center justify-center flex-1 w-full">
                                <span className={`text-sm font-bold leading-tight ${isToday ? 'text-white' : 'text-text-primary'}`}>{parseInt(day.gregorian.day)}</span>
                                <span className={`text-[10px] font-scheherazade leading-tight ${isToday ? 'text-emerald-200' : isFriday ? 'text-accent' : 'text-text-secondary'}`}>{day.hijri.day}</span>
                             </div>
                             
                             {event && (
                                 <div className={`w-full text-[7px] sm:text-[9px] leading-tight text-center font-bold px-0.5 pb-0.5 line-clamp-2 ${isToday ? 'text-gold' : 'text-primary'}`}>
                                     {event}
                                 </div>
                             )}
                         </div>
                     );
                 })}
             </div>
         )}
      </div>
    </div>
  );
};
