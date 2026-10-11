/**
 * CodeType PwaProvider Component
 * Registers offline service worker and exposes offline status indicator.
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

interface PwaContextType {
  isOnline: boolean;
}

const PwaContext = createContext<PwaContextType>({ isOnline: true });

export function usePwa() {
  return useContext(PwaContext);
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    // Register service worker in browser environment
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then(() => {
            // Service worker successfully registered
          })
          .catch(() => {
            // Registration failed or ignored in development
          });
      });
    }

    // Network connection status listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <PwaContext.Provider value={{ isOnline }}>
      {children}
      {/* Offline Status Pill */}
      {!isOnline && (
        <div className="fixed bottom-3 right-3 z-50 flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono bg-zinc-900 border border-amber-600/60 text-amber-300 rounded-full shadow-lg animate-pulse">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Ready</span>
        </div>
      )}
    </PwaContext.Provider>
  );
}
