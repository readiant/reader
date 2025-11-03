import { Builder } from './builder.js';
import { CLASS_BLOCK_ACTIVE, CLASS_DISABLED, CLASS_HIDDEN, CLASS_ROUND_BUTTON_ACTIVE, } from './consts.js';
import { Storage } from './storage.js';
export class LineHighlighter {
    static get bottom() {
        return document.getElementsByClassName('rdnt__line-highlighter--bottom')[0];
    }
    static get buttons() {
        return document.getElementsByClassName('rdnt__line-highlight');
    }
    static get center() {
        return document.getElementsByClassName('rdnt__line-highlighter--center')[0];
    }
    static get colorButtons() {
        return document.getElementsByClassName('rdnt__line-highlighter-color');
    }
    static get currents() {
        return document.getElementsByClassName('rdnt__current-selection--line-highlighter');
    }
    static get off() {
        return String(document.getElementsByClassName('rdnt__i18n')[0].getAttribute('data-off'));
    }
    static get on() {
        return String(document.getElementsByClassName('rdnt__i18n')[0].getAttribute('data-on'));
    }
    static get ranges() {
        return document.getElementsByClassName('rdnt__line-highlighter-range');
    }
    static get settings() {
        return document.getElementsByClassName('rdnt__line-highlighter-settings');
    }
    static get top() {
        return document.getElementsByClassName('rdnt__line-highlighter--top')[0];
    }
    static register() {
        for (const button of this.buttons)
            button.addEventListener('click', () => {
                this.toggle();
            });
        for (const range of this.ranges)
            range.addEventListener('change', (event) => {
                this.changeWidth(event);
            });
        for (const colorButton of this.colorButtons)
            colorButton.addEventListener('click', (event) => {
                this.changeColor(event);
            });
        if (Storage.data.pointer)
            document.addEventListener('pointermove', (event) => {
                this.position(event);
            });
        else if (Storage.data.touch)
            document.addEventListener('touchmove', (event) => {
                this.position(event);
            });
        else
            document.addEventListener('mousemove', (event) => {
                this.position(event);
            });
    }
    static changeColor(event) {
        const input = event.currentTarget;
        this.color = String(input.getAttribute('data-color'));
        for (const lineHighlighterColorButton of this.colorButtons) {
            lineHighlighterColorButton.classList.remove(CLASS_ROUND_BUTTON_ACTIVE);
            if (lineHighlighterColorButton.getAttribute('data-color') === this.color)
                lineHighlighterColorButton.classList.add(CLASS_ROUND_BUTTON_ACTIVE);
        }
        this.center.style.backgroundColor = this.color;
    }
    static changeWidth(event) {
        let value;
        if (typeof event === 'number')
            value = event;
        else {
            const input = event.currentTarget;
            value = Number(input.value);
        }
        for (const range of this.ranges)
            range.value = String(value);
        this.width = value;
    }
    static position(event) {
        if (!this.active)
            return;
        const y = 'changedTouches' in event ? event.changedTouches[0].pageY : event.pageY;
        this.top.style.height = `${String(y - 56 - this.width / 2)}px`;
        this.center.style.top = `${String(y - this.width / 2)}px`;
        this.center.style.height = `${String(this.width)}px`;
        this.bottom.style.top = `${String(y + this.width / 2)}px`;
    }
    static toggle() {
        this.active = !this.active;
        this.bottom.classList.toggle(CLASS_HIDDEN);
        for (const button of this.buttons)
            button.classList.toggle(CLASS_BLOCK_ACTIVE);
        this.center.classList.toggle(CLASS_HIDDEN);
        for (const settings of this.settings)
            settings.classList.toggle(CLASS_HIDDEN);
        this.top.classList.toggle(CLASS_HIDDEN);
        for (const current of this.currents)
            current.textContent = this.active ? this.on : this.off;
        if (this.active)
            Builder.layers.classList.add(CLASS_DISABLED);
        else
            Builder.layers.classList.remove(CLASS_DISABLED);
    }
}
LineHighlighter.active = false;
LineHighlighter.color = 'transparent';
LineHighlighter.width = 30;
