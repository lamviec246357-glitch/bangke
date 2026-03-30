/* ── Service Worker — Bản Kê Tiền Mặt VER 2.0 ── */
const CACHE_NAME = 'banke-v2';
const ASSETS = [
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap',
    'https://html2canvas.hertzen.com/dist/html2canvas.min.js'
];

/* Cài đặt: cache tất cả tài nguyên */
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS).catch(err => {
                console.warn('Một số tài nguyên không cache được:', err);
            });
        })
    );
    self.skipWaiting();
});

/* Kích hoạt: xoá cache cũ */
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            )
        )
    );
    self.clients.claim();
});

/* Fetch: Cache First — ưu tiên cache, fallback về mạng */
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                if (!response || response.status !== 200 || response.type === 'opaque') {
                    return response;
                }
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                return response;
            }).catch(() => {
                // Nếu offline và không có cache → trả về trang chính
                if (event.request.destination === 'document') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
