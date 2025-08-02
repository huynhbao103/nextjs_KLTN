// Cache manager utility
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize = 100; // Giới hạn số lượng items trong cache

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // Cleanup cache nếu quá lớn
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Kiểm tra TTL
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    // Kiểm tra TTL
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  size(): number {
    return this.cache.size;
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

// Utility functions
export const createCacheKey = (...parts: (string | number)[]): string => {
  return parts.join('_');
};

export const withCache = async <T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000
): Promise<T> => {
  // Kiểm tra cache trước
  const cached = cacheManager.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Thực hiện function và cache kết quả
  const result = await fn();
  cacheManager.set(key, result, ttl);
  
  return result;
}; 