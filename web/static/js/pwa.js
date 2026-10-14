export function initPWA() {
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
        if (!document.querySelector('link[rel="manifest"]')) {
            const manifestLink = document.createElement('link');
            manifestLink.rel = 'manifest';
            manifestLink.href = 'manifest.json';
            document.head.appendChild(manifestLink);
        }
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js').then((reg) => {
                    console.log('PWA ServiceWorker registered with scope:', reg.scope);
                }).catch((err) => {
                    console.log('PWA ServiceWorker registration skipped/failed:', err);
                });
            });
        }
    }
}
