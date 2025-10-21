import { Navigation } from './navigation.js';
import { Zoom } from './zoom.js';
import { ScreenMode } from './screenMode.js';
import { Fullscreen } from './fullscreen.js';
class ReadiantElement extends HTMLElement {
    static get observedAttributes() {
        return [
            'audio-highlighting-level',
            'color-blind-filter',
            'countdown-level',
            'disable',
            'font',
            'font-size',
            'id',
            'image-quality-level',
            'letter-spacing',
            'line-height',
            'locale',
            'locale-translations',
            'orientation',
            'page',
            'playback-rate',
            'read-stop-level',
            'screen-mode-level',
            'single-page',
            'subtitle-font-size',
            'subtitle-level',
            'text-mode-level',
            'touch',
            'url',
            'use-signed-urls',
            'word-spacing',
            'zoom-level',
        ];
    }
    async connectedCallback() {
        ReadiantElement.instance = this;
        this.updateUrlParams();
        const response = await fetch('../template.html');
        const html = await response.text();
        this.innerHTML = new DOMParser().parseFromString(html, 'text/html').body.innerHTML;
        const { Readiant } = await import('./readiant.js');
        new Readiant();
    }
    disconnectedCallback() {
        ReadiantElement.instance = null;
    }
    attributeChangedCallback(_name, oldValue, newValue) {
        if (oldValue !== newValue)
            this.updateUrlParams();
    }
    updateUrlParams() {
        const params = new URLSearchParams();
        const attributeMap = {
            'audio-highlighting-level': 'audioHighlightingLevel',
            'color-blind-filter': 'colorBlindFilter',
            'countdown-level': 'countdownLevel',
            disable: 'disable',
            font: 'font',
            'font-size': 'fontSize',
            id: 'id',
            'image-quality-level': 'imageQualityLevel',
            'letter-spacing': 'letterSpacing',
            'line-height': 'lineHeight',
            locale: 'locale',
            'locale-translations': 'localeTranslations',
            orientation: 'orientation',
            page: 'page',
            'playback-rate': 'playbackRate',
            'read-stop-level': 'readStopLevel',
            'screen-mode-level': 'screenModeLevel',
            'single-page': 'singlePage',
            'subtitle-font-size': 'subtitleFontSize',
            'subtitle-level': 'subtitleLevel',
            'text-mode-level': 'textModeLevel',
            touch: 'touch',
            url: 'url',
            'use-signed-urls': 'useSignedUrls',
            'word-spacing': 'wordSpacing',
            'zoom-level': 'zoomLevel',
        };
        for (const [htmlAttr, urlParam] of Object.entries(attributeMap)) {
            const value = this.getAttribute(htmlAttr);
            if (value !== null) {
                params.set(urlParam, value);
            }
        }
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newUrl);
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
customElements.define('readiant', ReadiantElement);
export { ReadiantElement };
