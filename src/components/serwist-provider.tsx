'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export function SerwistProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [swRegistered, setSwRegistered] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if ('serviceWorker' in navigator) {
      (async () => {
        try {
          const { Serwist } = await import('@serwist/window');
          const sw = new Serwist('/sw.js', { scope: '/', type: 'classic' });
          sw.addEventListener('activated', () => setSwRegistered(true));
          sw.addEventListener('waiting', () => setUpdateAvailable(true));
          await sw.register();
          setSwRegistered(true);
        } catch {
          try {
            const reg = await navigator.serviceWorker.register('/sw.js');
            setSwRegistered(true);
            reg.addEventListener('updatefound', () => setUpdateAvailable(true));
          } catch (e) {
            console.error('[SW] Registration failed:', e);
          }
        }
      })();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg?.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      });
      window.location.reload();
    }
  };

  return (
    <>
      {children}
      <div className="fixed bottom-2 left-2 z-50">
        {!isOnline && (
          <Badge variant="outline" className="bg-red-950/80 border-red-500/30 text-red-400 text-[9px]">
            <WifiOff className="w-2.5 h-2.5 mr-1" />
            Brez povezave
          </Badge>
        )}
        {isOnline && swRegistered && !updateAvailable && (
          <Badge variant="outline" className="bg-green-950/60 border-green-500/20 text-green-400 text-[9px] opacity-50 hover:opacity-100 transition-opacity">
            <Wifi className="w-2.5 h-2.5 mr-1" />
            PWA
          </Badge>
        )}
        {updateAvailable && (
          <button
            onClick={handleUpdate}
            className="bg-amber-950/80 border border-amber-500/30 text-amber-400 text-[9px] px-2 py-1 rounded-full flex items-center gap-1 hover:bg-amber-900/80 transition-colors"
          >
            <RefreshCw className="w-2.5 h-2.5" />
            Posodobi aplikacijo
          </button>
        )}
      </div>
    </>
  );
}
