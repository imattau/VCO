import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DiscoveryService } from '@/lib/discovery';
import { KeywordIndexData, ReportData } from '@vco/vco-schemas';

interface DiscoveryContextType {
  results: KeywordIndexData | null;
  history: string[];
  isSearching: boolean;
  search: (keyword: string) => Promise<void>;
  submitReport: (data: Omit<ReportData, 'schema' | 'timestampMs'>) => Promise<void>;
  clearHistory: () => void;
}

const DiscoveryContext = createContext<DiscoveryContextType | undefined>(undefined);

export function DiscoveryProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<KeywordIndexData | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('vco-search-history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (err) {
        console.error('Failed to parse search history:', err);
      }
    }
  }, []);

  // Update localStorage when history changes
  useEffect(() => {
    localStorage.setItem('vco-search-history', JSON.stringify(history));
  }, [history]);

  const search = async (keyword: string) => {
    const term = keyword.trim().toLowerCase();
    if (!term) return;

    setIsSearching(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 400));
      const res = await DiscoveryService.search(term);
      setResults(res);
      
      // Update history (move to top, unique)
      setHistory(prev => {
        const filtered = prev.filter(h => h !== term);
        return [term, ...filtered].slice(0, 10); // Keep last 10
      });
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const submitReport = async (data: Omit<ReportData, 'schema' | 'timestampMs'>) => {
    await DiscoveryService.submitReport(data);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('vco-search-history');
  };

  return (
    <DiscoveryContext.Provider value={{ 
      results, 
      history, 
      isSearching, 
      search, 
      submitReport, 
      clearHistory 
    }}>
      {children}
    </DiscoveryContext.Provider>
  );
}

export function useDiscovery() {
  const context = useContext(DiscoveryContext);
  if (context === undefined) {
    throw new Error('useDiscovery must be used within a DiscoveryProvider');
  }
  return context;
}
