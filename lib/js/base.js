import { Fullscreen } from './fullscreen.js';
import { Navigation } from './navigation.js';
import { ScreenMode } from './screenMode.js';
import { Zoom } from './zoom.js';
const initializedElements = new WeakSet();
class ReadiantElement extends HTMLElement {
    static get observedAttributes() {
        return [
            'audio-highlighting-level',
            'color-blind-filter',
            'concurrency-limit',
            'countdown-level',
            'disable',
            'document-id',
            'font',
            'image-quality-level',
            'letter-spacing',
            'line-height',
            'orientation',
            'page',
            'playback-rate',
            'read-stop-level',
            'screen-mode-level',
            'subtitle-font-size',
            'subtitle-level',
            'text-mode-level',
            'url',
            'use-signed-urls',
            'word-spacing',
            'zoom-level',
        ];
    }
    connectedCallback() {
        if (window.__readiant_initialized === true || initializedElements.has(this))
            return;
        initializedElements.add(this);
        window.__readiant_initialized = true;
        ReadiantElement.instance = this;
        this.initialize().catch((error) => {
            console.error('[Readiant] Initialization error:', error);
        });
    }
    async initialize() {
        try {
            if (this.shadowRoot)
                return;
            const shadow = this.attachShadow({ mode: 'open' });
            try {
                const styleResponse = await fetch('./dist/lib/css/style.css');
                if (!styleResponse.ok) {
                    const { Readiant } = await import('./readiant.js');
                    Readiant.errorHandler(new Error(`Failed to load styles: ${String(styleResponse.status)} ${styleResponse.statusText}`));
                    return;
                }
                const styleText = await styleResponse.text();
                const style = document.createElement('style');
                style.textContent = styleText;
                shadow.appendChild(style);
                const response = await fetch('./dist/lib/template.html');
                if (!response.ok) {
                    const { Readiant } = await import('./readiant.js');
                    Readiant.errorHandler(new Error(`Failed to load template: ${String(response.status)} ${response.statusText}`));
                    return;
                }
                const html = await response.text();
                const parsedDoc = new DOMParser().parseFromString(html, 'text/html');
                shadow.appendChild(parsedDoc.body.firstElementChild ?? parsedDoc.body);
                const documentId = this.getAttribute('document-id');
                const url = this.getAttribute('url');
                if (documentId !== null || url !== null) {
                    const { Readiant } = await import('./readiant.js');
                    new Readiant();
                }
            }
            catch (error) {
                const { Readiant } = await import('./readiant.js');
                Readiant.errorHandler(error);
            }
        }
        catch (error) {
            console.error('[Readiant] Fatal error in initialize:', error);
        }
    }
    disconnectedCallback() {
        ReadiantElement.instance = null;
    }
    get currentPage() {
        return Navigation.currentPage;
    }
    get totalPages() {
        return Navigation.pages.length;
    }
    get isLoaded() {
        return document.querySelector('.rdnt__viewport') !== null;
    }
    goToPage(page) {
        Navigation.gotoPageDirectly(page);
    }
    nextPage() {
        Navigation.onRightPressed();
    }
    previousPage() {
        Navigation.onLeftPressed();
    }
    zoomIn() {
        const currentLevel = Zoom.level;
        Zoom.change(Math.min(currentLevel + 1, 5));
    }
    zoomOut() {
        const currentLevel = Zoom.level;
        Zoom.change(Math.max(currentLevel - 1, 1));
    }
    setZoom(level) {
        Zoom.change(level);
    }
    setTheme(theme) {
        const themeMap = { light: 1, sepia: 2, dark: 3 };
        ScreenMode.change(themeMap[theme] || 1);
    }
    async toggleFullscreen() {
        await Fullscreen.toggle();
    }
    print() {
        window.print();
    }
    dispatchReadiantEvent(type, detail) {
        this.dispatchEvent(new CustomEvent(type, { detail }));
    }
    static dispatchEvent(type, detail) {
        if (ReadiantElement.instance)
            ReadiantElement.instance.dispatchReadiantEvent(type, detail);
    }
}
ReadiantElement.instance = null;
customElements.define('readiant-reader', ReadiantElement);
export { ReadiantElement };
