import { Builder } from './builder.js';
import { CLASS_BLOCK_ACTIVE, CLASS_HIDDEN, ContentType, OrientationMode, PagePosition, } from './consts.js';
import { eventLogger } from './eventLogger.js';
import { LogType } from './log.js';
import { Orientation } from './orientation.js';
import { Readiant } from './readiant.js';
export class TextMode {
    static get buttons() {
        return Readiant.root.querySelectorAll('.rdnt__text-mode');
    }
    static get current() {
        return Readiant.root.querySelector('.rdnt__current-selection--text-mode');
    }
    static get title() {
        return Readiant.root.querySelector('.rdnt__block-title--text-mode');
    }
    static register() {
        for (const button of this.buttons)
            button.addEventListener('click', (event) => {
                this.change(event);
            });
        if (Readiant.type === ContentType.HTML)
            this.title.parentElement.classList.add(CLASS_HIDDEN);
    }
    static change(event) {
        let title;
        let value;
        if (typeof event === 'number') {
            event = Math.abs(event);
            if (event < 1)
                event = 1;
            if (event > 3)
                event = 3;
            const element = Readiant.root.querySelector(`[data-text-mode="${String(event)}"]`);
            if (element === null)
                return;
            element.click();
            title = String(element.getAttribute('data-title'));
            value = event;
        }
        else {
            const element = event.currentTarget;
            title = String(element.getAttribute('data-title'));
            value = Number(element.getAttribute('data-text-mode'));
        }
        for (const button of this.buttons) {
            button.classList.remove(CLASS_BLOCK_ACTIVE);
            if (button.getAttribute('data-text-mode') === String(value))
                button.classList.add(CLASS_BLOCK_ACTIVE);
        }
        switch (value) {
            case 1:
                Orientation.disableOrientationChange = false;
                Builder.hidePlainTextPage();
                Builder.start(PagePosition.Left);
                Builder.resize();
                break;
            case 2:
            case 3:
                if (Orientation.mode === OrientationMode.Landscape)
                    Orientation.toggle();
                Orientation.disableOrientationChange = true;
                Builder.plainText().catch((e) => {
                    throw e;
                });
                Builder.showPlainTextPage();
                if (value === 2)
                    Builder.start(PagePosition.Left);
                else
                    Builder.getPage(PagePosition.Left).classList.add(CLASS_HIDDEN);
                break;
        }
        this.current.textContent = title;
        this.level = value;
        eventLogger({
            type: LogType.ChangeTextMode,
            textModeLevel: this.level,
        });
    }
}
TextMode.level = 1;
