import { Audio } from './audio.js';
import { Bar } from './bar.js';
import { Colorblind } from './colorblind.js';
import { registerComponentDispatcher } from './eventLogger.js';
import { Fonts } from './fonts.js';
import { Fullscreen } from './fullscreen.js';
import { ImageQuality } from './imageQuality.js';
import { LineHighlighter } from './lineHighlighter.js';
import { Navigation } from './navigation.js';
import { Orientation } from './orientation.js';
import { Readiant } from './readiant.js';
import { ScreenMode } from './screenMode.js';
import { TextMode } from './textMode.js';
import { Zoom } from './zoom.js';
import { locales } from './localeDefaults.js';
import { template } from './template.js';
import { styles } from './styles.js';
function applyTranslations(tmpl, translations) {
    const merged = { ...(locales.en ?? {}), ...translations };
    return tmpl.replace(/\{\{([a-zA-Z][a-zA-Z0-9]*)\}\}/g, (_match, key) => merged[key] ?? '');
}
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
            'lang',
            'letter-spacing',
            'line-height',
            'line-highlighter-width',
            'orientation',
            'page',
            'playback-rate',
            'read-stop-level',
            'screen-mode-level',
            'subtitle-font-size',
            'subtitle-level',
            'text-mode-level',
            'translations',
            'url',
            'use-signed-urls',
            'word-spacing',
            'zoom-level',
        ];
    }
    attributeChangedCallback(name, _oldValue, newValue) {
        if (name === 'disable' ||
            name === 'concurrency-limit' ||
            name === 'use-signed-urls' ||
            name === 'translations' ||
            name === 'lang')
            return;
        if (name === 'document-id' || name === 'url') {
            if (this.shadowRoot && newValue !== null) {
                this.reload().catch((error) => {
                    console.error('[Readiant] Reload error:', error);
                });
            }
            return;
        }
        if (!this.isLoaded || newValue === null)
            return;
        this.setContext();
        switch (name) {
            case 'audio-highlighting-level':
                Audio.setLineHighlighterType(Number(newValue));
                break;
            case 'color-blind-filter':
                Colorblind.change(newValue);
                break;
            case 'countdown-level':
                Audio.countdownType(Number(newValue));
                break;
            case 'font':
                Fonts.change(newValue);
                break;
            case 'image-quality-level':
                ImageQuality.change(Number(newValue));
                break;
            case 'letter-spacing':
                Fonts.letterSpacing(Number(newValue));
                break;
            case 'line-height':
                Fonts.lineHeight(Number(newValue));
                break;
            case 'line-highlighter-width':
                LineHighlighter.changeWidth(Number(newValue));
                break;
            case 'orientation':
                Orientation.change(newValue === 'portrait' ? 2 : 1);
                break;
            case 'page':
                Navigation.gotoPageDirectly(Number(newValue));
                break;
            case 'playback-rate':
                Audio.setPlaybackRate(Number(newValue));
                break;
            case 'read-stop-level':
                Bar.changeReadStop(Number(newValue));
                break;
            case 'screen-mode-level':
                ScreenMode.change(Number(newValue));
                break;
            case 'subtitle-font-size':
                Bar.fontSizeSubtitles(Number(newValue));
                break;
            case 'subtitle-level':
                Audio.setSubtitlesType(Number(newValue));
                break;
            case 'text-mode-level':
                TextMode.change(Number(newValue));
                break;
            case 'word-spacing':
                Fonts.wordSpacing(Number(newValue));
                break;
            case 'zoom-level':
                Zoom.change(Number(newValue));
                break;
        }
    }
    connectedCallback() {
        if (initializedElements.has(this))
            return;
        initializedElements.add(this);
        ReadiantElement.instance = this;
        registerComponentDispatcher((type, detail) => {
            ReadiantElement.dispatchEvent(type, detail);
        });
        this.initialize().catch((error) => {
            console.error('[Readiant] Initialization error:', error);
        });
    }
    getTemplate() {
        const lang = this.getAttribute('lang');
        const translationsAttr = this.getAttribute('translations');
        const baseLocale = lang !== null ? (locales[lang] ?? locales.en ?? {}) : (locales.en ?? {});
        let overrides = {};
        if (translationsAttr !== null) {
            try {
                overrides = JSON.parse(translationsAttr);
            }
            catch {
                // invalid JSON — ignore
            }
        }
        return applyTranslations(template, { ...baseLocale, ...overrides });
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
                const parsedDoc = new DOMParser().parseFromString(this.getTemplate(), 'text/html');
                const container = parsedDoc.body.firstElementChild ?? parsedDoc.body;
                const langAttr = this.getAttribute('lang');
                if (langAttr !== null && container instanceof HTMLElement)
                    container.setAttribute('lang', langAttr);
                shadow.appendChild(container);
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
        if (this.shadowRoot) {
            Readiant.getInstance(this.shadowRoot)?.abort();
            Readiant.removeInstance(this.shadowRoot);
        }
    }
    async reload() {
        try {
            const shadow = this.shadowRoot;
            if (!shadow)
                return;
            Readiant.removeInstance(shadow);
            while (shadow.firstChild)
                shadow.removeChild(shadow.firstChild);
            const sheet = new CSSStyleSheet();
            await sheet.replace(styles);
            shadow.adoptedStyleSheets = [sheet];
            const parsedDoc = new DOMParser().parseFromString(this.getTemplate(), 'text/html');
            const container = parsedDoc.body.firstElementChild ?? parsedDoc.body;
            const langAttr = this.getAttribute('lang');
            if (langAttr !== null && container instanceof HTMLElement)
                container.setAttribute('lang', langAttr);
            shadow.appendChild(container);
            const documentId = this.getAttribute('document-id');
            const url = this.getAttribute('url');
            if (documentId !== null || url !== null) {
                await new Promise((resolve) => window.requestAnimationFrame(resolve));
                const { Readiant: ReadiantClass } = await import('./readiant.js');
                new ReadiantClass(shadow);
            }
        }
        catch (error) {
            Readiant.errorHandler(error);
        }
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
