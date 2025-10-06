/**
 * First load all polyfills.
 */
import startReadiant from './readiant.js';
// #!if ENV !== 'LOCAL'
import { registerServiceWorker } from './serviceworker.js';
registerServiceWorker();
// !#endif
startReadiant();
