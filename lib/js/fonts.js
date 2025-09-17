import { Builder } from './builder.js';
import { CLASS_BLOCK_ACTIVE, CLASS_HIDDEN, ContentType } from './consts.js';
import { eventLogger } from './eventLogger.js';
import { EventMapper, LogType } from './log.js';
import { Readiant } from './readiant.js';
export class Fonts {
    static register() {
        for (const button of this.buttons)
            button.addEventListener('change', (event) => {
                this.change(event);
            });
        this.fontSizeRange.addEventListener('change', (event) => {
            this.fontSize(event);
        });
        this.letterSpacingRange.addEventListener('change', (event) => {
            this.letterSpacing(event);
        });
        for (const lineHeightButton of this.lineHeightButtons)
            lineHeightButton.addEventListener('click', (event) => {
                this.lineHeight(event);
            });
        this.wordSpacingRange.addEventListener('change', (event) => {
            this.wordSpacing(event);
        });
        if (Readiant.type === ContentType.HTML) {
            this.wordSpacingTitle.parentElement.classList.add(CLASS_HIDDEN);
        }
        else {
            this.lineHeightTitle.parentElement.classList.add(CLASS_HIDDEN);
            if (this.active === 'rdnt__font--original') {
                this.fontSizeTitle.parentElement.classList.add(CLASS_HIDDEN);
                this.letterSpacingTitle.parentElement.classList.add(CLASS_HIDDEN);
                this.wordSpacingTitle.parentElement.classList.add(CLASS_HIDDEN);
            }
        }
    }
    static change(event) {
        let title;
        let value;
        if (typeof event === 'string') {
            const element = document.querySelector(`[value="${event}"]`);
            if (element !== null) {
                element.checked = true;
                title = element.nextElementSibling.textContent;
            }
            else
                title = '';
            value = event;
        }
        else {
            const element = event.currentTarget;
            title = element.nextElementSibling.textContent;
            value = element.value;
        }
        if (this.active === value)
            return;
        Builder.font(this.active, value);
        if (Readiant.type === ContentType.SVG) {
            if (value !== 'rdnt__font--original') {
                this.fontSizeTitle.parentElement.classList.remove(CLASS_HIDDEN);
                this.letterSpacingTitle.parentElement.classList.remove(CLASS_HIDDEN);
                this.wordSpacingTitle.parentElement.classList.remove(CLASS_HIDDEN);
            }
            else {
                this.fontSizeTitle.parentElement.classList.add(CLASS_HIDDEN);
                this.letterSpacingTitle.parentElement.classList.add(CLASS_HIDDEN);
                this.wordSpacingTitle.parentElement.classList.add(CLASS_HIDDEN);
            }
        }
        this.active = value;
        this.currentFont.textContent = title;
        eventLogger({
            type: LogType.ChangeFont,
            font: EventMapper.get(value),
        });
    }
    static convert(number) {
        switch (number) {
            case 1:
                return this.least;
            case 2:
                return this.less;
            case 3:
            default:
                return this.normal;
            case 4:
                return this.more;
            case 5:
                return this.most;
        }
    }
    static fontSize(event, overwrite) {
        if (this.active === 'rdnt_active--original' && overwrite !== true)
            return;
        let value;
        if (typeof event === 'number') {
            event = Math.abs(event);
            if (event < 1)
                event = 1;
            if (event > 12)
                event = 12;
            this.fontSizeRange.value = String(event);
            value = event;
        }
        else {
            const input = event.currentTarget;
            value = Number(input.value);
        }
        Builder.fontSize(value);
        this.currentFontSize.textContent = String(value + 10);
        eventLogger({
            type: LogType.ChangeFontSize,
            fontSize: value,
        });
    }
    static letterSpacing(event, overwrite) {
        if (this.active === 'rdnt_active--original' && overwrite !== true)
            return;
        let value;
        if (typeof event === 'number') {
            event = Math.abs(event);
            if (event < 1)
                event = 1;
            if (event > 5)
                event = 5;
            this.letterSpacingRange.value = String(event);
            value = event;
        }
        else {
            const input = event.currentTarget;
            value = Number(input.value);
        }
        Builder.letterSpacing(value);
        this.currentLetterSpacing.textContent = this.convert(value);
        eventLogger({
            type: LogType.ChangeLetterSpacing,
            letterSpacing: value,
        });
    }
    static lineHeight(event) {
        let value;
        if (typeof event === 'number') {
            event = Math.abs(event);
            if (event < 1)
                event = 1;
            if (event > 3)
                event = 3;
            const element = document.querySelector(`[data-line-height="${String(event)}"]`);
            if (element !== null)
                element.click();
            value = event;
        }
        else {
            const input = event.currentTarget;
            value = Number(String(input.getAttribute('data-line-height')));
        }
        for (const lineHeightButton of this.lineHeightButtons) {
            lineHeightButton.classList.remove(CLASS_BLOCK_ACTIVE);
            if (lineHeightButton.getAttribute('data-line-height') === String(value))
                lineHeightButton.classList.add(CLASS_BLOCK_ACTIVE);
        }
        Builder.lineHeight(value);
        this.currentLineHeight.textContent = this.convert(value + 1);
        eventLogger({
            type: LogType.ChangeLineHeight,
            lineHeight: value,
        });
    }
    static wordSpacing(event, overwrite) {
        if (this.active === 'rdnt_active--original' && overwrite !== true)
            return;
        let value;
        if (typeof event === 'number') {
            event = Math.abs(event);
            if (event < 1)
                event = 1;
            if (event > 5)
                event = 5;
            this.wordSpacingRange.value = String(event);
            value = event;
        }
        else {
            const input = event.currentTarget;
            value = Number(input.value);
        }
        Builder.wordSpacing(value);
        this.currentWordSpacing.textContent = this.convert(value);
        eventLogger({
            type: LogType.ChangeWordSpacing,
            wordSpacing: value,
        });
    }
}
Fonts.buttons = document.getElementsByClassName('rdnt__font');
Fonts.currentFont = document.getElementsByClassName('rdnt__current-selection--font')[0];
Fonts.currentFontSize = document.getElementsByClassName('rdnt__current-selection--font-size')[0];
Fonts.currentLetterSpacing = document.getElementsByClassName('rdnt__current-selection--letter-spacing')[0];
Fonts.currentLineHeight = document.getElementsByClassName('rdnt__current-selection--line-height')[0];
Fonts.currentWordSpacing = document.getElementsByClassName('rdnt__current-selection--word-spacing')[0];
Fonts.fontSizeRange = document.getElementsByClassName('rdnt__font-size')[0];
Fonts.fontSizeTitle = document.getElementsByClassName('rdnt__block-title--font-size')[0];
Fonts.letterSpacingRange = document.getElementsByClassName('rdnt__letter-spacing')[0];
Fonts.letterSpacingTitle = document.getElementsByClassName('rdnt__block-title--letter-spacing')[0];
Fonts.least = String(document.getElementsByClassName('rdnt__i18n')[0].getAttribute('data-least'));
Fonts.less = String(document.getElementsByClassName('rdnt__i18n')[0].getAttribute('data-less'));
Fonts.lineHeightButtons = document.getElementsByClassName('rdnt__line-height');
Fonts.lineHeightTitle = document.getElementsByClassName('rdnt__block-title--line-height')[0];
Fonts.more = String(document.getElementsByClassName('rdnt__i18n')[0].getAttribute('data-more'));
Fonts.most = String(document.getElementsByClassName('rdnt__i18n')[0].getAttribute('data-most'));
Fonts.normal = String(document.getElementsByClassName('rdnt__i18n')[0].getAttribute('data-normal'));
Fonts.wordSpacingRange = document.getElementsByClassName('rdnt__word-spacing')[0];
Fonts.wordSpacingTitle = document.getElementsByClassName('rdnt__block-title--word-spacing')[0];
Fonts.active = 'rdnt__font--original';
