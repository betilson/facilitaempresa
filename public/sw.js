// Service Worker for Facilita PWA
const CACHE_NAME = 'facilita-v1';
const STATIC_CACHE = 'facilita-static-v1';
const DYNAMIC_CACHE = 'facilita-dynamic-v1';

// Files to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/index.tsx',
    '/App.tsx',
    '/manifest.json',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[Service Worker] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch((error) => {
                console.error('[Service Worker] Failed to cache static assets:', error);
            })
    );
    self.skipWaiting(); // Activate immediately
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Take control immediately
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip Supabase API requests (always fetch fresh)
    if (request.url.includes('supabase.co')) {
        return;
    }

    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Return cached response and update cache in background
                    fetch(request).then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            caches.open(DYNAMIC_CACHE).then((cache) => {
                                cache.put(request, networkResponse.clone());
                            });
                        }
                    }).catch(() => {
                        // Network failed, but we have cache
                    });
                    return cachedResponse;
                }

                // Not in cache, fetch from network
                return fetch(request)
                    .then((networkResponse) => {
                        // Cache successful responses
                        if (networkResponse && networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            caches.open(DYNAMIC_CACHE).then((cache) => {
                                cache.put(request, responseClone);
                            });
                        }
                        return networkResponse;
                    })
                    .catch((error) => {
                        console.error('[Service Worker] Fetch failed:', error);
                        // Return offline page if available
                        return caches.match('/offline.html').then((offlineResponse) => {
                            return offlineResponse || new Response('Offline - Please check your connection', {
                                status: 503,
                                statusText: 'Service Unavailable',
                                headers: new Headers({ 'Content-Type': 'text/plain' })
                            });
                        });
                    });
            })
    );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync:', event.tag);
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    // Implement data sync logic here
    console.log('[Service Worker] Syncing data...');
}

// Push notifications
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push received:', event);
    const data = event.data ? event.data.json() : {};

    const title = data.title || 'Facilita';
    const options = {
        body: data.body || 'Nova notificação',
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        vibrate: [200, 100, 200],
        data: data.url || '/',
        actions: [
            { action: 'open', title: 'Abrir' },
            { action: 'close', title: 'Fechar' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification clicked:', event);
    event.notification.close();

    if (event.action === 'open' || !event.action) {
        const urlToOpen = event.notification.data || '/';
        event.waitUntil(
            clients.openWindow(urlToOpen)
        );
    }
});
