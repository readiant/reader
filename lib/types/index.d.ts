import startReadiant from './readiant.js';
import { registerServiceWorker } from './serviceworker.js';
registerServiceWorker();
startReadiant();
/**
 * Export public API for TypeScript consumers
 */
export { ReadiantElement } from './base.js';
