import { isOffline } from './env.js';
import startReadiant from './readiant.js';
import { registerServiceWorker } from './serviceworker.js';
if (!isOffline) {
    registerServiceWorker();
    startReadiant();
}
/**
 * Export public API for TypeScript consumers
 */
export { ReadiantElement } from './base.js';
