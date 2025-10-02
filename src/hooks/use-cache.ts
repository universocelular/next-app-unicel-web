"use client";

import { useState, useEffect, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutos por defecto

  set<T>(key: string, data: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  invalidate(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

// Instancia global del caché
const globalCache = new MemoryCache();

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    enabled?: boolean;
    dependencies?: any[];
  } = {}
) {
  const { ttl, enabled = true, dependencies = [] } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const fetcherRef = useRef(fetcher);
  
  // Actualizar la referencia del fetcher
  fetcherRef.current = fetcher;

  useEffect(() => {
    if (!enabled) return;

    const fetchData = async () => {
      try {
        // Verificar caché primero
        if (globalCache.has(key)) {
          const cachedData = globalCache.get<T>(key);
          if (cachedData !== null) {
            setData(cachedData);
            setError(null);
            return;
          }
        }

        setLoading(true);
        setError(null);
        
        const result = await fetcherRef.current();
        
        // Guardar en caché
        globalCache.set(key, result, ttl);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [key, enabled, ttl, ...dependencies]);

  const invalidate = () => {
    globalCache.invalidate(key);
  };

  const refresh = async () => {
    globalCache.invalidate(key);
    setLoading(true);
    try {
      const result = await fetcherRef.current();
      globalCache.set(key, result, ttl);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    invalidate,
    refresh,
    isFromCache: globalCache.has(key)
  };
}

export { globalCache };