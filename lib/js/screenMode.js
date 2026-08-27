import { Builder } from './builder.js';
import { CLASS_BLOCK_ACTIVE } from './consts.js';
import { eventLogger } from './eventLogger.js';
import { LogType } from './log.js';
import { Readiant } from './readiant.js';
export class ScreenMode {
    static get buttons() {
        return Readiant.root.querySelectorAll('.rdnt__screen-mode');
    }
    static get current() {
        return Readiant.root.querySelector('.rdnt__current-selection--screen-mode');
    }
    static register() {
        for (const button of this.buttons)
            button.addEventListener('click', (event) => {
                event.preventDefault();
                this.change(event);
            });
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
            const element = Readiant.root.querySelector(`[data-screen-mode="${String(event)}"]`);
            if (element === null)
                return;
            element.click();
            title = String(element.getAttribute('data-title'));
            value = event;
        }
        else {
            const element = event.currentTarget;
            title = String(element.getAttribute('data-title'));
            value = Number(String(element.getAttribute('data-screen-mode')));
        }
        for (const button of this.buttons) {
            button.classList.remove(CLASS_BLOCK_ACTIVE);
            if (button.getAttribute('data-screen-mode') === String(value))
                button.classList.add(CLASS_BLOCK_ACTIVE);
        }
        Builder.screenMode(this.screenMode, value);
        if (this.current !== null)
            this.current.textContent = title;
        this.screenMode = value;
        eventLogger({
            type: LogType.ChangeScreenMode,
            screenModeLevel: value,
        });
    }
}
ScreenMode.screenMode = 1;
