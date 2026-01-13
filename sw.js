const CACHE_NAME = 'focus-flow-v1';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './app_icon.png',
    './src/app.js',
    './src/utils/Store.js',
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
    './src/pages/Goals.js'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request))
    );
});
