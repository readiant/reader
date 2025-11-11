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

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'readiant-reader': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        'document-id'?: string;
        page?: number | string;
        url?: string;
        'use-signed-urls'?: boolean | string;
        orientation?: string;
        disable?: string;

        'zoom-level'?: number | string;
        font?: string;
        'font-size'?: number | string;
        'letter-spacing'?: number | string;
        'line-height'?: number | string;
        'word-spacing'?: number | string;
        'screen-mode-level'?: number | string;
        'color-blind-filter'?: string;
        'image-quality-level'?: number | string;
        'text-mode-level'?: number | string;

        // Audio options
        'audio-highlighting-level'?: number | string;
        'countdown-level'?: number | string;
        'playback-rate'?: number | string;
        'read-stop-level'?: number | string;
        'subtitle-font-size'?: number | string;
        'subtitle-level'?: number | string;

        onDocumentLoaded?: (
          event: CustomEvent<{
            documentId: string;
            totalPages: number;
            isReady: boolean;
          }>,
        ) => void;
        onPageChanged?: (
          event: CustomEvent<{
            page: number;
            currentPage: number;
            totalPages: number;
            direction?: string;
          }>,
        ) => void;
        onZoomChanged?: (
          event: CustomEvent<{ zoom: number; level: number }>,
        ) => void;
        onThemeChanged?: (
          event: CustomEvent<{ theme: number; level: number }>,
        ) => void;
        onError?: (
          event: CustomEvent<{ message: string; type: string }>,
        ) => void;
      };
    }
  }
}