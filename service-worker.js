const CACHE_NAME = 'focus-base-v49';
const ASSETS = [
    './',
    './index.html',
    './privacy.html',
    './app.webmanifest',
    './app_icon_192.png',
    './app_icon_512.png',
    './src/app.js',
    './src/utils/Store.js',
    './src/components/Sidebar.js',
    './src/pages/Notes.js',
    './src/styles/notes.css',
    './src/styles/main.css',
    './src/styles/dashboard.css',
    './src/styles/components.css',
    './src/styles/modal.css',
    './src/components/Sidebar.js',
    './src/components/TaskCard.js',
    './src/components/AddModal.js',
    './src/components/DeleteModal.js',
    './src/components/FocusMode.js',
    './src/pages/Dashboard.js',
    './src/pages/SchoolWork.js',
    './src/pages/HouseWork.js',
    './src/pages/Work.js',
    './src/pages/Appointments.js',
    './src/pages/Settings.js',
    './src/pages/WeekReview.js',
    './src/pages/Goals.js',
    './src/components/RoutineModal.js',
    './src/pages/Routines.js'
];

self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (e) => {
    // Cache first, fallback to network (better for PWA offline score)
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        }).then(() => self.clients.claim())
    );
});

// Background Sync
self.addEventListener('sync', (e) => {
    if (e.tag === 'sync-data') {
        console.log('Service Worker: Background sync triggered');
        // Basic placeholder for actual sync logic if implemented
        e.waitUntil(Promise.resolve());
    }
});

// Periodic Background Sync
self.addEventListener('periodicsync', (e) => {
    if (e.tag === 'update-data') {
        console.log('Service Worker: Periodic sync triggered');
        // Basic placeholder for actual periodic fetch logic if implemented
        e.waitUntil(Promise.resolve());
    }
});

// Push Notifications
self.addEventListener('push', (e) => {
    const title = 'Focus Base';
    const options = {
        body: e.data ? e.data.text() : 'You have a new notification!',
        icon: './app_icon_192.png',
        badge: './app_icon_192.png'
    };
    e.waitUntil(self.registration.showNotification(title, options));
});
