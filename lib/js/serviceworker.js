import { Readiant } from './readiant.js';
export function registerServiceWorker() {
    if ('serviceWorker' in navigator)
        Readiant.windowContext.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch((e) => {
                console.error(e);
            });
        });
}
