
export type Language = 'ar' | 'en' | 'id' | 'tr' | 'ur';

export interface User {
  username: string;
  email: string;
  country: string;
  totalCount: number;
  streak: number;
}

export interface Dhikr {
  id: number;
  text: string;
  target: number;
  reward: string;
}

export interface AdkarItem {
  id: number;
  ar: string;
  tr: string;
  repeat: number;
}

export interface PrayerTimesData {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

export interface HijriDate {
  date: string;
  format: string;
  day: string;
  weekday: { en: string; ar: string };
  month: { number: number; en: string; ar: string };
  year: string;
  designation: { abbreviated: string; expanded: string };
}

export interface PrayerApiResponse {
  timings: PrayerTimesData;
  timezone: string;
  date: {
    readable: string;
    timestamp: string;
    hijri: HijriDate;
    gregorian: any;
  };
}

export interface LocationSearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export type ViewState = 'home' | 'salah' | 'tasbeeh' | 'adkar' | 'quran' | 'leaderboard' | 'qibla' | 'calendar' | 'istighfar' | 'spiritual_hub';

export interface LeaderboardEntry {
  name: string;
  country: string;
  count: number;
  streak: number;
  isMe?: boolean;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
  translation?: string; // For the second edition
  tafsir?: string; // For Tafsir Al-Muyassar
  surah?: {
    number: number;
    name: string;
    englishName: string;
  }
}

export interface PrayerAlertSettings {
  offset: number; // minutes
  sound: string; // url
  enabled: boolean;
}

export type PrayerSettingsMap = Record<string, PrayerAlertSettings>;
