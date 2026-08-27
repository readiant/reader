import { Fullscreen } from './fullscreen.js';
import { Navigation } from './navigation.js';
import { Readiant } from './readiant.js';
import { ScreenMode } from './screenMode.js';
import { Zoom } from './zoom.js';
import { template } from './template.js';
import { styles } from './styles.js';
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
        if (initializedElements.has(this))
            return;
        initializedElements.add(this);
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
                const sheet = new CSSStyleSheet();
                await sheet.replace(styles);
                shadow.adoptedStyleSheets = [sheet];
                const parsedDoc = new DOMParser().parseFromString(template, 'text/html');
                shadow.appendChild(parsedDoc.body.firstElementChild ?? parsedDoc.body);
                const documentId = this.getAttribute('document-id');
                const url = this.getAttribute('url');
                if (documentId !== null || url !== null) {
                    await new Promise((resolve) => window.requestAnimationFrame(resolve));
                    const { Readiant } = await import('./readiant.js');
                    new Readiant(shadow);
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
        if (this.shadowRoot)
            Readiant.removeInstance(this.shadowRoot);
    }
    setContext() {
        if (this.shadowRoot) {
            Readiant.root = this.shadowRoot;
        }
    }
    get currentPage() {
        this.setContext();
        return Navigation.currentPage;
    }
    get totalPages() {
        this.setContext();
        return Navigation.pages.length;
    }
    get isLoaded() {
        this.setContext();
        return Readiant.root.querySelector('.rdnt__viewport') !== null;
    }
    goToPage(page) {
        this.setContext();
        Navigation.gotoPageDirectly(page);
    }
    nextPage() {
        this.setContext();
        Navigation.onRightPressed();
    }
    previousPage() {
        this.setContext();
        Navigation.onLeftPressed();
    }
    zoomIn() {
        this.setContext();
        const currentLevel = Zoom.level;
        Zoom.change(Math.min(currentLevel + 1, 5));
    }
    zoomOut() {
        this.setContext();
        const currentLevel = Zoom.level;
        Zoom.change(Math.max(currentLevel - 1, 1));
    }
    setZoom(level) {
        this.setContext();
        Zoom.change(level);
    }
    setTheme(theme) {
        this.setContext();
        const themeMap = { light: 1, sepia: 2, dark: 3 };
        ScreenMode.change(themeMap[theme] || 1);
    }
    async toggleFullscreen() {
        this.setContext();
        await Fullscreen.toggle();
    }
    print() {
        this.setContext();
        Readiant.windowContext.print();
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
