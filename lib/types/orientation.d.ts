import { Builder } from './builder.js';
import { CLASS_BLOCK_ACTIVE, CLASS_BLOCK_TITLE_DISABLE, ContentType, OrientationMode, } from './consts.js';
import { eventLogger } from './eventLogger.js';
import { LogType } from './log.js';
import { Navigation } from './navigation.js';
import { Readiant } from './readiant.js';
import { Storage } from './storage.js';
export class Orientation {
    static get buttons() {
        return Readiant.root.querySelectorAll('.rdnt__orientation');
    }
    static get current() {
        return Readiant.root.querySelector('.rdnt__current-selection--orientation');
    }
    static get title() {
        return Readiant.root.querySelector('.rdnt__orientation-settings--title');
    }
    static register(orientation) {
        this.mode = orientation;
        for (const button of this.buttons)
            button.addEventListener('click', (event) => {
                event.preventDefault();
                this.change(event);
            });
        if (!Storage.data.hover && (Storage.data.pointer || Storage.data.touch)) {
            const orientationChange = Readiant.windowContext.matchMedia('(orientation: portrait)');
            orientationChange.addEventListener('change', () => {
                if ((orientationChange.matches &&
                    this.mode !== OrientationMode.Portrait) ||
                    (!orientationChange.matches &&
                        this.mode !== OrientationMode.Landscape))
                    this.toggle();
            });
        }
        const value = this.mode === OrientationMode.Landscape ? 1 : 2;
        for (const button of this.buttons) {
            button.classList.remove(CLASS_BLOCK_ACTIVE);
            if (button.getAttribute('data-orientation') === String(value))
                button.classList.add(CLASS_BLOCK_ACTIVE);
        }
    }
    static get disableOrientationChange() {
        return this._disableOrientationChange;
    }
    static set disableOrientationChange(d) {
        if (this._disableOrientationChange !== d)
            Orientation.title?.classList.toggle(CLASS_BLOCK_TITLE_DISABLE);
        this._disableOrientationChange = d;
    }
    static set mode(mode) {
        if (Readiant.type === ContentType.HTML)
            Builder.forcePortrait(mode === OrientationMode.Portrait);
        this._mode = mode;
    }
    static get mode() {
        if (Readiant.type === ContentType.HTML)
            this._mode = Builder.computeOrientation();
        return this._mode;
    }
    static change(event) {
        if (this.disableOrientationChange)
            return;
        let title;
        let value;
        if (typeof event === 'number') {
            event = Math.abs(event);
            if (event < 1)
                event = 1;
            if (event > 2)
                event = 2;
            const element = Readiant.root.querySelector(`[data-orientation="${String(event)}"]`);
            if (element === null)
                return;
            element.click();
            title = String(element.getAttribute('data-title'));
            value = event;
        }
        else {
            const element = event.currentTarget;
            title = String(element.getAttribute('data-title'));
            value = Number(String(element.getAttribute('data-orientation')));
        }
        for (const button of this.buttons) {
            button.classList.remove(CLASS_BLOCK_ACTIVE);
            if (button.getAttribute('data-orientation') === String(value))
                button.classList.add(CLASS_BLOCK_ACTIVE);
        }
        if (this.current !== null)
            this.current.textContent = title;
        this.mode =
            value === 1 ? OrientationMode.Landscape : OrientationMode.Portrait;
        if (Readiant.type === ContentType.HTML)
            this.toggleHTML();
        if (Readiant.type === ContentType.SVG)
            this.toggleSVG();
        eventLogger({
            type: LogType.ToggleOrientation,
            orientation: this.mode,
        });
    }
    static toggle() {
        if (this.disableOrientationChange)
            return;
        const viewports = [
            OrientationMode.Portrait,
            OrientationMode.Landscape,
        ];
        const currentViewport = viewports.indexOf(this.mode);
        this.mode =
            currentViewport + 1 === viewports.length
                ? viewports[0]
                : viewports[currentViewport + 1];
        if (Readiant.type === ContentType.HTML)
            this.toggleHTML();
        if (Readiant.type === ContentType.SVG)
            this.toggleSVG();
        const value = this.mode === OrientationMode.Portrait ? 1 : 2;
        const element = Readiant.root.querySelector(`[data-orientation="${String(value)}"]`);
        const title = element !== null ? String(element.getAttribute('data-title')) : '';
        for (const button of this.buttons) {
            button.classList.remove(CLASS_BLOCK_ACTIVE);
            if (button.getAttribute('data-orientation') === String(value))
                button.classList.add(CLASS_BLOCK_ACTIVE);
        }
        if (this.current !== null)
            this.current.textContent = title;
        eventLogger({
            type: LogType.ToggleOrientation,
            orientation: this.mode,
        });
    }
    static toggleHTML() {
        if (this.mode === OrientationMode.Portrait && Navigation.hasRegistered)
            if (typeof Navigation.direction !== 'undefined' &&
                Navigation.currentPage % 2 === 0 &&
                Navigation.currentPage !== 1)
                Builder.scrollToOffset(Navigation.currentPage);
        Builder.resize();
    }
    static toggleSVG() {
        if (Navigation.hasRegistered) {
            Navigation.currentPage = Navigation.currentPages[0].page;
            Navigation.currentPages = Navigation.generatePagesToRender();
            Navigation.preparePages(Navigation.currentPages, Orientation.mode);
        }
        Builder.resize();
    }
}
Orientation._disableOrientationChange = false;
Orientation._mode = OrientationMode.Landscape;
