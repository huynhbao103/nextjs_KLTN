import { useMemo } from 'react';
import { SessionWeatherData, WeatherData } from '@/types/weather';

// Types cho session data
export interface SessionData {
  mood?: string;
  weather?: SessionWeatherData;
  formProgress?: number;
  profileComplete?: boolean;
  lastUpdated?: string;
  expiresAt?: string; // Thêm expiration time
}

// Constants
const SESSION_TTL = 30 * 60 * 1000; // 30 phút
const PROFILE_UPDATE_INTERVAL = 30 * 24 * 60 * 60 * 1000; // 30 ngày

// Utility function để chuyển đổi WeatherData thành SessionWeatherData
export function convertToSessionWeatherData(weatherData: WeatherData): SessionWeatherData {
  return {
    current: {
      location: {
        name: weatherData.location.name || '',
        country: weatherData.location.country || '',
        region: weatherData.location.region || ''
      },
      lat: weatherData.location.lat || 0,
      lon: weatherData.location.lon || 0,
      temp_c: weatherData.current.temp_c || 0,
      temp_f: weatherData.current.temp_f || 0,
      feelslike_c: weatherData.current.feelslike_c || 0,
      feelslike_f: weatherData.current.feelslike_f || 0,
      condition: {
        text: weatherData.current.condition?.text || 'Unknown',
        icon: weatherData.current.condition?.icon || ''
      },
      last_updated: weatherData.current.last_updated || new Date().toISOString()
    }
  };
}

// Utility functions cho sessionStorage
export const sessionStore = {
  // Current mood
  setMood: (mood: string) => {
    const expiresAt = new Date(Date.now() + SESSION_TTL).toISOString();
    window.sessionStorage.setItem('currentMood', mood);
    window.sessionStorage.setItem('lastUpdated', new Date().toISOString());
    window.sessionStorage.setItem('expiresAt', expiresAt);
  },
  
  getMood: (): string | null => {
    const expiresAt = window.sessionStorage.getItem('expiresAt');
    if (expiresAt && new Date(expiresAt) < new Date()) {
      sessionStore.clearAll();
      return null;
    }
    return window.sessionStorage.getItem('currentMood');
  },

  // Weather data - chỉ lưu thông tin cần thiết
  setWeather: (weather: WeatherData) => {
    const expiresAt = new Date(Date.now() + SESSION_TTL).toISOString();
    
    // Chuyển đổi sang format đơn giản
    const simplifiedWeather = convertToSessionWeatherData(weather);
    
    window.sessionStorage.setItem('weatherData', JSON.stringify(simplifiedWeather));
    window.sessionStorage.setItem('expiresAt', expiresAt);
  },
  
  getWeather: (): SessionWeatherData | null => {
    const expiresAt = window.sessionStorage.getItem('expiresAt');
    if (expiresAt && new Date(expiresAt) < new Date()) {
      sessionStore.clearAll();
      return null;
    }
    const data = window.sessionStorage.getItem('weatherData');
    return data ? JSON.parse(data) : null;
  },

  // Form progress
  setFormProgress: (step: number) => {
    window.sessionStorage.setItem('formStep', step.toString());
  },
  
  getFormProgress: (): number => {
    return parseInt(window.sessionStorage.getItem('formStep') || '0');
  },

  // Profile completion status
  setProfileComplete: (complete: boolean) => {
    window.sessionStorage.setItem('profileComplete', complete.toString());
  },
  
  getProfileComplete: (): boolean => {
    return window.sessionStorage.getItem('profileComplete') === 'true';
  },

  // Check if session is expired
  isExpired: (): boolean => {
    const expiresAt = window.sessionStorage.getItem('expiresAt');
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  },

  // Get remaining time in minutes
  getRemainingTime: (): number => {
    const expiresAt = window.sessionStorage.getItem('expiresAt');
    if (!expiresAt) return 0;
    const remaining = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.floor(remaining / (1000 * 60)));
  },

  // Get all session data
  getAllData: (): SessionData => {
    // Check expiration first
    if (sessionStore.isExpired()) {
      sessionStore.clearAll();
      return {};
    }

    return {
      mood: sessionStore.getMood() || undefined,
      weather: sessionStore.getWeather() || undefined,
      formProgress: sessionStore.getFormProgress(),
      profileComplete: sessionStore.getProfileComplete(),
      lastUpdated: window.sessionStorage.getItem('lastUpdated') || undefined,
      expiresAt: window.sessionStorage.getItem('expiresAt') || undefined
    };
  },

  // Clear all session data
  clearAll: () => {
    window.sessionStorage.removeItem('currentMood');
    window.sessionStorage.removeItem('weatherData');
    window.sessionStorage.removeItem('locationData'); // Clear locationData cũ
    window.sessionStorage.removeItem('formStep');
    window.sessionStorage.removeItem('profileComplete');
    window.sessionStorage.removeItem('lastUpdated');
    window.sessionStorage.removeItem('expiresAt');
  },

  // Clear old session data (migration)
  clearOldData: () => {
    // Clear locationData cũ vì giờ chỉ dùng weatherData
    window.sessionStorage.removeItem('locationData');
  },

  // Check if session has data
  hasData: (): boolean => {
    if (sessionStore.isExpired()) {
      sessionStore.clearAll();
      return false;
    }
    return !!(sessionStore.getMood() || sessionStore.getWeather());
  }
};

// Profile validation utilities
export const profileValidation = {
  // Check if profile needs update (30 days)
  needsUpdate: (lastUpdateDate: string | Date): boolean => {
    if (!lastUpdateDate) return true; // No last update date, needs update
    
    const lastUpdate = new Date(lastUpdateDate);
    const now = new Date();
    
    // For debugging: log the dates
    console.log('Profile validation dates:', {
      lastUpdate: lastUpdate.toISOString(),
      now: now.toISOString(),
      lastUpdateYear: lastUpdate.getFullYear(),
      nowYear: now.getFullYear()
    });
    
    // If lastUpdate is in the future, treat it as if it was set 31 days ago
    // This handles system clock issues
    if (lastUpdate > now) {
      console.log('Last update date is in the future, treating as old data');
      return true; // Needs update
    }
    
    const thirtyDaysAgo = new Date(now.getTime() - PROFILE_UPDATE_INTERVAL);
    const needsUpdate = lastUpdate < thirtyDaysAgo;
    
    console.log('Profile validation:', {
      lastUpdate: lastUpdate.toISOString(),
      now: now.toISOString(),
      thirtyDaysAgo: thirtyDaysAgo.toISOString(),
      needsUpdate
    });
    
    return needsUpdate;
  },

  // Get days until next required update
  getDaysUntilUpdate: (lastUpdateDate: string | Date): number => {
    if (!lastUpdateDate) return 0;
    
    const lastUpdate = new Date(lastUpdateDate);
    const now = new Date();
    
    // If lastUpdate is in the future, return 0 (needs update now)
    if (lastUpdate > now) {
      return 0;
    }
    
    const nextUpdate = new Date(lastUpdate.getTime() + PROFILE_UPDATE_INTERVAL);
    const daysRemaining = Math.ceil((nextUpdate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysRemaining);
  },

  // Check if profile is complete
  isComplete: (profile: any): boolean => {
    const isComplete = !!(
      profile.name &&
      profile.gender &&
      profile.weight &&
      profile.height &&
      profile.activityLevel &&
      profile.dateOfBirth
    );
    
    console.log('Profile completeness check:', {
      name: !!profile.name,
      gender: !!profile.gender,
      weight: !!profile.weight,
      height: !!profile.height,
      activityLevel: !!profile.activityLevel,
      dateOfBirth: !!profile.dateOfBirth,
      isComplete
    });
    
    return isComplete;
  }
};

// Hook để sử dụng trong React components
export const useSessionStorage = () => {
  const sessionMethods = useMemo(() => ({
    setMood: (mood: string) => {
      sessionStore.setMood(mood);
    },

    getMood: () => {
      return sessionStore.getMood();
    },

    setWeather: (weather: WeatherData) => {
      sessionStore.setWeather(weather);
    },

    getWeather: () => {
      return sessionStore.getWeather();
    },

    setFormProgress: (step: number) => {
      sessionStore.setFormProgress(step);
    },

    getFormProgress: () => {
      return sessionStore.getFormProgress();
    },

    setProfileComplete: (complete: boolean) => {
      sessionStore.setProfileComplete(complete);
    },

    getProfileComplete: () => {
      return sessionStore.getProfileComplete();
    },

    getAllData: () => {
      return sessionStore.getAllData();
    },

    clearAll: () => {
      sessionStore.clearAll();
    },

    clearOldData: () => {
      sessionStore.clearOldData();
    },

    hasData: () => {
      return sessionStore.hasData();
    },

    isExpired: () => {
      return sessionStore.isExpired();
    },

    getRemainingTime: () => {
      return sessionStore.getRemainingTime();
    }
  }), []); // Empty dependency array since these are static methods

  return sessionMethods;
}; 