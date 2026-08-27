import { CLASS_HIDDEN } from './consts.js';
import { eventLogger } from './eventLogger.js';
import { LogType } from './log.js';
import { Navigation } from './navigation.js';
import { Readiant } from './readiant.js';
export class Print {
    static get button() {
        return Readiant.root.querySelector('.rdnt__print-button');
    }
    static get viewport() {
        return Readiant.root.querySelector('.rdnt__viewport');
    }
    static register() {
        if (this.button === null)
            return;
        this.button.addEventListener('click', (event) => {
            event.preventDefault();
            this.before();
            Readiant.windowContext.print();
        });
        this.button.classList.remove(CLASS_HIDDEN);
        const printChange = Readiant.windowContext.matchMedia('print');
        printChange.addEventListener('change', () => {
            if (printChange.matches)
                this.before();
            else
                this.after();
        });
        Readiant.windowContext.addEventListener('keydown', (event) => {
            this.shortcut(event);
        });
    }
    static after() {
        if (this.originals.length === 0)
            return;
        const pages = Readiant.root.querySelectorAll('.rdnt__page:not(.hidden)');
        for (const page of pages) {
            page.classList.remove('rdnt__page--height', 'rdnt__page--width', 'rdnt__page-print');
            page.classList.add(String(this.originals.shift()));
        }
        this.viewport?.classList.remove(pages.length === 1
            ? 'rdnt__viewport--print-portrait'
            : 'rdnt__viewport--print-landscape');
        eventLogger({
            type: LogType.Print,
            pages: Navigation.currentPages.map((page) => page.page),
        });
    }
    static before() {
        if (this.originals.length > 0)
            return;
        const pages = Readiant.root.querySelectorAll('.rdnt__page:not(.hidden)');
        this.viewport?.classList.add(pages.length === 1
            ? 'rdnt__viewport--print-portrait'
            : 'rdnt__viewport--print-landscape');
        for (const page of pages) {
            const viewBox = String(page.getAttribute('viewBox')).split(' ');
            const aspectRatio = Number(viewBox[3]) / Number(viewBox[2]);
            const hasHeight = page.classList.contains('rdnt__page--height');
            this.originals = [
                ...this.originals,
                hasHeight ? 'rdnt__page--height' : 'rdnt__page--width',
            ];
            page.classList.remove('rdnt__page--height', 'rdnt__page--width');
            page.classList.add('rdnt__page-print', `rdnt__page--${aspectRatio > 1.414 ? 'height' : 'width'}`);
        }
    }
    static remove() {
        if (this.button !== null)
            this.button.remove();
    }
    static shortcut(event) {
        let code;
        if (typeof event.key !== 'undefined')
            code = event.key;
        else if (event.keyIdentifier !==
            undefined)
            code = event.keyIdentifier;
        else
            return;
        if (code === 'p' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            this.before();
            Readiant.windowContext.print();
            if (typeof event.stopImmediatePropagation !== 'undefined')
                event.stopImmediatePropagation();
            else
                event.stopPropagation();
            return;
        }
    }
}
Print.originals = [];
