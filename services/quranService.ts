
import { Language, Surah, Ayah } from '../types';

const BASE_URL = 'https://api.alquran.cloud/v1';

const EDITION_MAP: Record<string, string> = {
  ar: 'quran-uthmani', 
  en: 'en.asad',
  id: 'id.indonesian',
  tr: 'tr.diyanet',
  ur: 'ur.jalandhry'
};

const TAFSIR_EDITION = 'ar.muyassar';

export interface QuranSearchResult {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  surah: {
    number: number;
    name: string;
    englishName: string;
    revelationType: string;
  }
}

export const fetchSurahList = async (): Promise<Surah[]> => {
  try {
    const response = await fetch(`${BASE_URL}/surah`);
    const data = await response.json();
    if (data.code === 200) {
      return data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching surah list:", error);
    return [];
  }
};

// Fetch a specific page (1-604) to mimic physical Quran
export const fetchQuranPage = async (pageNumber: number): Promise<Ayah[]> => {
  try {
    const response = await fetch(`${BASE_URL}/page/${pageNumber}/quran-uthmani`);
    const data = await response.json();

    if (data.code === 200) {
      return data.data.ayahs.map((ayah: any) => ({
        number: ayah.number,
        text: ayah.text,
        numberInSurah: ayah.numberInSurah,
        juz: ayah.juz,
        page: ayah.page,
        surah: ayah.surah
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching quran page:", error);
    return [];
  }
};

export const fetchSurahDetails = async (surahNumber: number, language: Language): Promise<Ayah[]> => {
  try {
    const translationEdition = EDITION_MAP[language] || 'en.asad';
    const isArabic = language === 'ar';
    const editionsToFetch = isArabic 
        ? `quran-uthmani,${TAFSIR_EDITION}`
        : `quran-uthmani,${translationEdition},${TAFSIR_EDITION}`;
    
    const response = await fetch(`${BASE_URL}/surah/${surahNumber}/editions/${editionsToFetch}`);
    const data = await response.json();

    if (data.code === 200 && Array.isArray(data.data)) {
      const arabicData = data.data[0];
      let translationData = null;
      let tafsirData = null;

      if (isArabic) {
        tafsirData = data.data[1];
      } else {
        translationData = data.data[1];
        tafsirData = data.data[2];
      }
      
      return arabicData.ayahs.map((ayah: any, index: number) => ({
        number: ayah.number,
        text: ayah.text,
        numberInSurah: ayah.numberInSurah,
        juz: ayah.juz,
        page: ayah.page,
        translation: translationData ? translationData.ayahs[index].text : undefined,
        tafsir: tafsirData ? tafsirData.ayahs[index].text : undefined
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching surah details:", error);
    return [];
  }
};

export const searchQuran = async (query: string, language: Language): Promise<QuranSearchResult[]> => {
  try {
     const edition = language === 'ar' ? 'quran-uthmani' : (EDITION_MAP[language] || 'en.asad');
     const response = await fetch(`${BASE_URL}/search/${encodeURIComponent(query)}/all/${edition}`);
     const data = await response.json();
     if (data.code === 200) {
       return data.data.matches;
     }
     return [];
  } catch (error) {
    console.error("Search error", error);
    return [];
  }
};
