import { PrayerApiResponse, LocationSearchResult } from '../types';

export const fetchPrayerTimesByCity = async (city: string): Promise<PrayerApiResponse | null> => {
  try {
    const today = new Date();
    const d = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    const response = await fetch(`https://api.aladhan.com/v1/timingsByCity/${d}?city=${encodeURIComponent(city)}&country=&method=2`);
    const data = await response.json();
    if (data.code === 200) {
      return { 
        timings: data.data.timings, 
        timezone: city,
        date: data.data.date 
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching prayer times by city:", error);
    return null;
  }
};

export const fetchPrayerTimesByCoords = async (lat: number, lng: number): Promise<PrayerApiResponse | null> => {
  try {
    const today = new Date();
    const d = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    const response = await fetch(`https://api.aladhan.com/v1/timings/${d}?latitude=${lat}&longitude=${lng}&method=2`);
    const data = await response.json();
    if (data.code === 200) {
      return { 
        timings: data.data.timings, 
        timezone: data.data.meta.timezone,
        date: data.data.date
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching prayer times by coords:", error);
    return null;
  }
};

export const searchLocations = async (query: string): Promise<LocationSearchResult[]> => {
  try {
    // Using OpenStreetMap Nominatim API (Free, no key required for low volume)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&accept_language=ar&limit=5&addressdetails=1`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error searching locations:", error);
    return [];
  }
};