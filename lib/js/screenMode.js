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
    static get state() {
        const inst = Readiant.getInstance(Readiant.root);
        if (!inst) {
            return undefined;
        }
        return inst.screenModeState;
    }
    static get screenMode() {
        return this.state?.screenMode ?? 1;
    }
    static set screenMode(val) {
        if (this.state)
            this.state.screenMode = val;
    }
    static resetState() {
        this.screenMode = 1;
    }
    static register() {
        const originalRoot = Readiant.root;
        Readiant.root = originalRoot;
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
            button.setAttribute('aria-pressed', 'false');
            if (button.getAttribute('data-screen-mode') === String(value)) {
                button.classList.add(CLASS_BLOCK_ACTIVE);
                button.setAttribute('aria-pressed', 'true');
            }
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
