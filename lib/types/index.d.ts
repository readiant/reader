// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./jsx.d.ts" />
/**
 * First load all polyfills.
 */
import startReadiant from './readiant.js';
import { registerServiceWorker } from './serviceworker.js';
registerServiceWorker();
startReadiant();
/**
 * Export public API for TypeScript consumers
 */
export { ReadiantElement } from './base.js';
