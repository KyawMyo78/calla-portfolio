'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { getCachedData, setCachedData, CACHE_KEYS } from '@/hooks/useDataPrefetch';

interface PortfolioDataContextType {
  getCachedSkills: () => any[] | null;
  getCachedExperience: () => any[] | null;
  getCachedProjects: () => any[] | null;
  getCachedBlog: () => any[] | null;
  getCachedAchievements: () => any[] | null;
  getCachedProfile: () => any | null;
  getCachedSiteSettings: () => any | null;
  updateCache: (key: string, data: any) => void;
  hasCachedData: (key: string) => boolean;
}

const PortfolioDataContext = createContext<PortfolioDataContextType | undefined>(undefined);

export function PortfolioDataProvider({ children }: { children: ReactNode }) {
  const [, forceUpdate] = useState(0);

  const getCachedSkills = useCallback(() => {
    return getCachedData<any[]>(CACHE_KEYS.SKILLS);
  }, []);

  const getCachedExperience = useCallback(() => {
    return getCachedData<any[]>(CACHE_KEYS.EXPERIENCE);
  }, []);

  const getCachedProjects = useCallback(() => {
    return getCachedData<any[]>(CACHE_KEYS.PROJECTS);
  }, []);

  const getCachedBlog = useCallback(() => {
    return getCachedData<any[]>(CACHE_KEYS.BLOG);
  }, []);

  const getCachedAchievements = useCallback(() => {
    return getCachedData<any[]>(CACHE_KEYS.ACHIEVEMENTS);
  }, []);

  const getCachedProfile = useCallback(() => {
    return getCachedData<any>(CACHE_KEYS.PROFILE);
  }, []);

  const getCachedSiteSettings = useCallback(() => {
    return getCachedData<any>(CACHE_KEYS.SITE_SETTINGS);
  }, []);

  const updateCache = useCallback((key: string, data: any) => {
    setCachedData(key, data);
    forceUpdate(prev => prev + 1);
  }, []);

  const hasCachedData = useCallback((key: string) => {
    return getCachedData(key) !== null;
  }, []);

  const value = {
    getCachedSkills,
    getCachedExperience,
    getCachedProjects,
    getCachedBlog,
    getCachedAchievements,
    getCachedProfile,
    getCachedSiteSettings,
    updateCache,
    hasCachedData,
  };

  return (
    <PortfolioDataContext.Provider value={value}>
      {children}
    </PortfolioDataContext.Provider>
  );
}

export function usePortfolioData() {
  const context = useContext(PortfolioDataContext);
  if (context === undefined) {
    throw new Error('usePortfolioData must be used within a PortfolioDataProvider');
  }
  return context;
}
