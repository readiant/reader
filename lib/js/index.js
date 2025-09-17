/**
 * First load all polyfills.
 */
import startReadiant from './readiant.js';
import { registerServiceWorker } from './serviceworker.js';
if (process.env.ENV === 'PROD')
    registerServiceWorker();
startReadiant();
