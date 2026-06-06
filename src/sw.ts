// ============================================================
// Monter Ograj PRO - Serwist Service Worker
// Advanced PWA z offline podporo za terensko delo
// ============================================================

import type { PrecacheEntry } from '@serwist/precaching';
import { ExpirationPlugin } from '@serwist/expiration';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from '@serwist/strategies';
import { registerRoute, NavigationRoute } from '@serwist/routing';
import { precacheAndRoute } from '@serwist/precaching';

// Precache static assets (auto-injected by @serwist/next)
declare const self: ServiceWorkerGlobalScope;
precacheAndRoute(self.__SW_MANIFEST as PrecacheEntry[]);

// ─── Navigation: NetworkFirst (show latest, fallback to cache) ───
registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: 'monter-navigation',
      networkTimeoutSeconds: 3,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 20,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        }),
      ],
    })
  )
);

// ─── Static assets: CacheFirst (CSS, JS, fonts, images) ───
registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font',
  new CacheFirst({
    cacheName: 'monter-static-assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// ─── Images: CacheFirst with longer TTL ───
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'monter-images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// ─── API calls: NetworkOnly (don't cache API) ───
// API routes should always be fresh
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'monter-api',
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 24 * 60 * 60, // 1 day
      }),
    ],
  })
);

// ─── Offline fallback ───
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});

// ─── Background sync for offline form submissions ───
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-project-data') {
    event.waitUntil(
      // Sync project data when back online
      Promise.resolve()
    );
  }
});

// ─── Push notifications (future: project reminders) ───
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title || 'Monter Ograj PRO', {
        body: data.body || 'Novo obvestilo',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        vibrate: [100, 50, 100],
        data: data,
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.openWindow('/')
  );
});
