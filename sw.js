const CACHE_NAME = 'ai-creative-suite-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/config.ts',
  '/manifest.json',
  '/contexts/AdContext.tsx',
  '/contexts/AuthContext.tsx',
  '/contexts/ThemeContext.tsx',
  '/hooks/useLocalStorage.ts',
  '/services/geminiService.ts',
  '/services/jwt.ts',
  '/components/AdBanner.tsx',
  '/components/BackgroundSlideshow.tsx',
  '/components/CameraModal.tsx',
  '/components/FavoritesView.tsx',
  '/components/GeneratedVideoCard.tsx',
  '/components/GeneratorView.tsx',
  '/components/Loader.tsx',
  '/components/LoginButton.tsx',
  '/components/Navigation.tsx',
  '/components/SetWallpaperModal.tsx',
  '/components/UserMenu.tsx',
  '/components/VideoCard.tsx',
  '/components/VideoView.tsx',
  '/components/WallpaperCard.tsx',
  '/components/icons/AppIcon.tsx',
  '/components/icons/CameraIcon.tsx',
  '/components/icons/CopyIcon.tsx',
  '/components/icons/DownloadIcon.tsx',
  '/components/icons/HeartIcon.tsx',
  '/components/icons/LoginIcon.tsx',
  '/components/icons/MagicWandIcon.tsx',
  '/components/icons/MoonIcon.tsx',
  '/components/icons/SparklesIcon.tsx',
  '/components/icons/SunIcon.tsx',
  '/components/icons/UploadIcon.tsx',
  '/components/icons/VideoIcon.tsx',
  '/components/icons/WallpaperIcon.tsx',
  '/components/icons/XCircleIcon.tsx',
  'https://cdn.tailwindcss.com',
  'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
  'https://esm.sh/react@^19.1.1',
  'https://esm.sh/react-dom@^19.1.1/',
  'https://esm.sh/react@^19.1.1/',
  'https://esm.sh/@google/genai@^1.13.0'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              if (event.request.url.startsWith('https://esm.sh/')) {
                 return response; // Don't cache opaque responses from CDNs
              }
            }
             
            // IMPORTANT: DONT'T CLONE THE RESPONSE since we are not caching it
            return response;
          }
        );
      }
    )
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});