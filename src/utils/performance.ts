import React from 'react';

// Performance monitoring utilities
export class PerformanceMonitor {
  private static metrics: { [key: string]: number[] } = {};

  static startTimer(name: string): void {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(`${name}-start`);
    }
  }

  static endTimer(name: string): number {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(`${name}-end`);
      window.performance.measure(name, `${name}-start`, `${name}-end`);
      
      const measure = window.performance.getEntriesByName(name)[0];
      const duration = measure.duration;
      
      // Store metric
      if (!this.metrics[name]) {
        this.metrics[name] = [];
      }
      this.metrics[name].push(duration);
      
      // Log in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    }
    return 0;
  }

  static getAverageTime(name: string): number {
    const times = this.metrics[name];
    if (!times || times.length === 0) return 0;
    
    const sum = times.reduce((acc, time) => acc + time, 0);
    return sum / times.length;
  }

  static logMetrics(): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Performance Metrics:');
      Object.entries(this.metrics).forEach(([name, times]) => {
        const avg = this.getAverageTime(name);
        console.log(`  ${name}: ${avg.toFixed(2)}ms (${times.length} samples)`);
      });
    }
  }
}

// React performance hooks
export function usePerformanceTimer(name: string) {
  return {
    start: () => PerformanceMonitor.startTimer(name),
    end: () => PerformanceMonitor.endTimer(name)
  };
} 