import { CLASS_BLOCK_ACTIVE } from './consts.js';
import { eventLogger } from './eventLogger.js';
import { EventMapper, LogType } from './log.js';
import { Readiant } from './readiant.js';
export class Colorblind {
    static get current() {
        return Readiant.root.querySelector('.rdnt__current-selection--colorblind');
    }
    static get none() {
        return String(Readiant.root.querySelector('.rdnt__i18n')?.getAttribute('data-none'));
    }
    static register() {
        const buttons = Readiant.root.querySelectorAll('.rdnt__colorblind');
        for (const button of buttons)
            button.addEventListener('click', (event) => {
                this.change(event);
            });
    }
    static change(event) {
        if (typeof this.active !== 'undefined')
            document.documentElement.classList.remove(this.active);
        let title = '';
        let value;
        if (typeof event === 'string') {
            const element = Readiant.root.querySelector(`[value="${event}"]`);
            if (element !== null) {
                element.checked = true;
                title =
                    element.nextElementSibling !== null
                        ? element.nextElementSibling.textContent
                        : String(element.getAttribute('data-title'));
            }
            else
                title = '';
            value = event;
        }
        else {
            const element = event.currentTarget;
            title =
                element.nextElementSibling !== null
                    ? element.nextElementSibling.textContent
                    : String(element.getAttribute('data-title'));
            value = element.value;
            if (value === this.active) {
                element.checked = false;
                title = this.none;
                value = null;
            }
        }
        const buttons = Readiant.root.querySelectorAll('.rdnt__block-button.rdnt__colorblind');
        for (const button of buttons) {
            button.classList.remove(CLASS_BLOCK_ACTIVE);
            if (button.getAttribute('data-title') === title)
                button.classList.add(CLASS_BLOCK_ACTIVE);
        }
        if (value !== null)
            document.documentElement.classList.add(value);
        this.active = value ?? undefined;
        if (this.current !== null)
            this.current.textContent = title;
        eventLogger({
            type: LogType.ChangeColorBlindFilter,
            colorBlindFilter: value !== null ? EventMapper.get(value) : undefined,
        });
    }
}
