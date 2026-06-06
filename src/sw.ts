// ============================================================
// Monter Ograj PRO - Serwist Service Worker
// ============================================================

import type { PrecacheEntry } from '@serwist/precaching';
import { ExpirationPlugin } from '@serwist/expiration';
import { CacheFirst, NetworkFirst } from '@serwist/strategies';
import { registerRoute, NavigationRoute } from '@serwist/routing';
import { precacheAndRoute } from '@serwist/precaching';

declare const self: ServiceWorkerGlobalScope;
precacheAndRoute(self.__SW_MANIFEST as PrecacheEntry[]);

// Navigation: NetworkFirst
registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: 'monter-navigation',
      networkTimeoutSeconds: 3,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 20,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        }),
      ],
    })
  )
);

// Static assets: CacheFirst
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
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

// Images: CacheFirst
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'monter-images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});
