// Safe access to webpack-injected globals with fallbacks
export const VARIANT_VALUE = typeof VARIANT !== 'undefined' ? VARIANT : 'OFFLINE';
export const VERSION_VALUE = typeof VERSION !== 'undefined' ? VERSION : '0.8.2';
export const isOffline = VARIANT_VALUE === 'OFFLINE';
export const isDefault = VARIANT_VALUE === 'DEFAULT';
