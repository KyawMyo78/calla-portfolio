'use client';

import { useEffect, useCallback } from 'react';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEYS = {
  SKILLS: 'portfolio_cache_skills',
  EXPERIENCE: 'portfolio_cache_experience',
  PROJECTS: 'portfolio_cache_projects',
  BLOG: 'portfolio_cache_blog',
  ACHIEVEMENTS: 'portfolio_cache_achievements',
  PROFILE: 'portfolio_cache_profile',
  SITE_SETTINGS: 'portfolio_cache_site_settings',
};

interface CachedData<T> {
  data: T;
  timestamp: number;
}

// Helper to check if cache is valid
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_DURATION;
};

// Helper to get cached data
export const getCachedData = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = sessionStorage.getItem(key);
    if (!cached) return null;

    const parsed: CachedData<T> = JSON.parse(cached);
    if (isCacheValid(parsed.timestamp)) {
      return parsed.data;
    } else {
      // Remove expired cache
      sessionStorage.removeItem(key);
      return null;
    }
  } catch (error) {
    console.error(`Error reading cache for ${key}:`, error);
    return null;
  }
};

// Helper to set cached data
export const setCachedData = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const cached: CachedData<T> = {
      data,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(key, JSON.stringify(cached));
  } catch (error) {
    console.error(`Error writing cache for ${key}:`, error);
  }
};

// Helper to clear all cache
export const clearAllCache = (): void => {
  if (typeof window === 'undefined') return;
  
  Object.values(CACHE_KEYS).forEach(key => {
    sessionStorage.removeItem(key);
  });
};

export default function useDataPrefetch() {
  const prefetchData = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const timestamp = new Date().getTime();

    try {
      // Check if we already have valid cached data for all endpoints
      const hasValidCache = Object.values(CACHE_KEYS).every(key => {
        const cached = sessionStorage.getItem(key);
        if (!cached) return false;
        try {
          const parsed = JSON.parse(cached);
          return isCacheValid(parsed.timestamp);
        } catch {
          return false;
        }
      });

      if (hasValidCache) {
        console.log('✅ All data already cached, skipping prefetch');
        return;
      }

      console.log('🔄 Starting data prefetch...');

      // Fetch all data in parallel
      const [
        profileRes,
        settingsRes,
        skillsRes,
        experienceRes,
        projectsRes,
        blogRes,
        achievementsRes,
      ] = await Promise.all([
        fetch(`/api/profile?t=${timestamp}`).catch(err => {
          console.error('Profile prefetch failed:', err);
          return null;
        }),
        fetch(`/api/site-settings?t=${timestamp}`).catch(err => {
          console.error('Site settings prefetch failed:', err);
          return null;
        }),
        fetch(`/api/portfolio?type=skills&t=${timestamp}`).catch(err => {
          console.error('Skills prefetch failed:', err);
          return null;
        }),
        fetch(`/api/portfolio?type=experience&t=${timestamp}`).catch(err => {
          console.error('Experience prefetch failed:', err);
          return null;
        }),
        fetch(`/api/portfolio?type=projects&t=${timestamp}`).catch(err => {
          console.error('Projects prefetch failed:', err);
          return null;
        }),
        fetch(`/api/blog?t=${timestamp}`).catch(err => {
          console.error('Blog prefetch failed:', err);
          return null;
        }),
        fetch(`/api/portfolio?type=achievements&t=${timestamp}`).catch(err => {
          console.error('Achievements prefetch failed:', err);
          return null;
        }),
      ]);

      // Process and cache each response
      if (profileRes?.ok) {
        const profileData = await profileRes.json();
        if (profileData.success) {
          setCachedData(CACHE_KEYS.PROFILE, profileData.data);
        }
      }

      if (settingsRes?.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData.success) {
          setCachedData(CACHE_KEYS.SITE_SETTINGS, settingsData.data);
        }
      }

      if (skillsRes?.ok) {
        const skillsData = await skillsRes.json();
        if (skillsData.success && Array.isArray(skillsData.data)) {
          setCachedData(CACHE_KEYS.SKILLS, skillsData.data);
        }
      }

      if (experienceRes?.ok) {
        const experienceData = await experienceRes.json();
        if (experienceData.success && Array.isArray(experienceData.data)) {
          setCachedData(CACHE_KEYS.EXPERIENCE, experienceData.data);
        }
      }

      if (projectsRes?.ok) {
        const projectsData = await projectsRes.json();
        if (projectsData.success && Array.isArray(projectsData.data)) {
          setCachedData(CACHE_KEYS.PROJECTS, projectsData.data);
        }
      }

      if (blogRes?.ok) {
        const blogData = await blogRes.json();
        if (blogData.success && Array.isArray(blogData.data)) {
          setCachedData(CACHE_KEYS.BLOG, blogData.data);
        }
      }

      if (achievementsRes?.ok) {
        const achievementsData = await achievementsRes.json();
        if (achievementsData.success && Array.isArray(achievementsData.data)) {
          setCachedData(CACHE_KEYS.ACHIEVEMENTS, achievementsData.data);
        }
      }

      console.log('✅ Data prefetch completed successfully');
    } catch (error) {
      console.error('Error during data prefetch:', error);
    }
  }, []);

  useEffect(() => {
    // Delay prefetch slightly to not interfere with initial page render
    const timer = setTimeout(() => {
      prefetchData();
    }, 500);

    return () => clearTimeout(timer);
  }, [prefetchData]);

  return { prefetchData, clearCache: clearAllCache };
}

export { CACHE_KEYS };
