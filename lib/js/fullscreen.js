import { CLASS_BLOCK_ACTIVE, CLASS_BUTTON_ACTIVE, CLASS_HIDDEN, CLASS_PREVIEW, } from './consts.js';
import { eventLogger } from './eventLogger.js';
import { fullscreen } from './detection.js';
import { LogType } from './log.js';
import { Readiant } from './readiant.js';
export class Fullscreen {
    static register() {
        if (!fullscreen)
            return;
        for (const button of this.buttons)
            button.addEventListener('click', (event) => this.change(event));
        this.toggleButton.addEventListener('click', () => this.toggle());
        this.toggleButton.classList.remove(CLASS_HIDDEN);
        this.enableIcon.classList.remove(CLASS_HIDDEN);
        document.addEventListener('fullscreenchange', () => this.detect());
    }
    static async change(event) {
        let title;
        let value;
        if (typeof event === 'number') {
            event = Math.abs(event);
            if (event < 0)
                event = 0;
            if (event > 1)
                event = 1;
            const element = document.querySelector(`[data-fullscreen="${String(event)}"]`);
            if (element === null)
                return;
            element.click();
            title = String(element.getAttribute('data-title'));
            value = event;
        }
        else {
            const element = event.currentTarget;
            title = String(element.getAttribute('data-title'));
            value = Number(String(element.getAttribute('data-fullscreen')));
        }
        for (const button of this.buttons) {
            button.classList.remove(CLASS_BLOCK_ACTIVE);
            if (button.getAttribute('data-fullscreen') === String(value))
                button.classList.add(CLASS_BLOCK_ACTIVE);
        }
        this.current.textContent = title;
        if (value === 0)
            await this.exit();
        else
            this.request();
        this.active = value === 1;
        eventLogger({
            type: LogType.ToggleFullscreen,
            isFullscreen: this.active,
        });
    }
    static async detect() {
        const isFullscreen = document.fullscreenElement !== null;
        if (this.active !== isFullscreen)
            await this.toggle(true);
    }
    static exit() {
        if (typeof document.exitFullscreen !==
            'undefined')
            return document.exitFullscreen();
        else if (typeof document
            .msExitFullscreen !== 'undefined') {
            document.msExitFullscreen();
            return;
        }
        else if (typeof document
            .mozCancelFullScreen !== 'undefined') {
            document.mozCancelFullScreen();
            return;
        }
        else if (typeof document
            .webkitExitFullscreen !== 'undefined') {
            document.webkitExitFullscreen();
            return;
        }
    }
    static request() {
        const element = document.documentElement;
        if (typeof element.requestFullscreen !==
            'undefined') {
            element.requestFullscreen();
            return;
        }
        else if (typeof element
            .msRequestFullscreen !== 'undefined') {
            element.msRequestFullscreen();
            return;
        }
        else if (typeof element
            .mozRequestFullScreen !== 'undefined') {
            element.mozRequestFullScreen();
            return;
        }
        else if (typeof element
            .webkitRequestFullscreen !== 'undefined') {
            element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            return;
        }
    }
    static async toggle(skip = false) {
        this.toggleButton.classList.toggle(CLASS_BUTTON_ACTIVE);
        this.enableIcon.classList.toggle(CLASS_HIDDEN);
        this.exitIcon.classList.toggle(CLASS_HIDDEN);
        if (!skip) {
            if (this.active)
                await this.exit();
            else
                this.request();
        }
        this.active = !this.active;
        if (Readiant.preview)
            document.body.classList.toggle(CLASS_PREVIEW);
        eventLogger({
            type: LogType.ToggleFullscreen,
            isFullscreen: this.active,
        });
    }
}
Fullscreen.buttons = document.getElementsByClassName('rdnt__fullscreen-button');
Fullscreen.current = document.getElementsByClassName('rdnt__current-selection--fullscreen')[0];
Fullscreen.enableIcon = document.getElementsByClassName('rdnt__button-fullscreen')[0];
Fullscreen.exitIcon = document.getElementsByClassName('rdnt__button-fullscreen-disabled')[0];
Fullscreen.toggleButton = document.getElementsByClassName('rdnt__fullscreen-toggle')[0];
Fullscreen.active = false;
