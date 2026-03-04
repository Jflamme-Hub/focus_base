const CACHE_NAME = 'focus-base-v9';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
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
    // Network first, fallback to cache
    e.respondWith(
        fetch(e.request).catch(() => caches.match(e.request))
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
