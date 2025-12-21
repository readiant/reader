import { Builder } from './builder.js';
import { CLASS_BLOCK_ACTIVE, CLASS_HIDDEN, ContentType } from './consts.js';
import { eventLogger } from './eventLogger.js';
import { EventMapper, LogType } from './log.js';
import { Readiant } from './readiant.js';
export class Fonts {
    static get buttons() {
        return Readiant.root.querySelectorAll('.rdnt__font');
    }
    static get currentFont() {
        return Readiant.root.querySelector('.rdnt__current-selection--font');
    }
    static get currentFontSize() {
        return Readiant.root.querySelector('.rdnt__current-selection--font-size');
    }
    static get currentLetterSpacing() {
        return Readiant.root.querySelector('.rdnt__current-selection--letter-spacing');
    }
    static get currentLineHeight() {
        return Readiant.root.querySelector('.rdnt__current-selection--line-height');
    }
    static get currentWordSpacing() {
        return Readiant.root.querySelector('.rdnt__current-selection--word-spacing');
    }
    static get fontSizeRange() {
        return Readiant.root.querySelector('.rdnt__font-size');
    }
    static get fontSizeTitle() {
        return Readiant.root.querySelector('.rdnt__block-title--font-size');
    }
    static get letterSpacingRange() {
        return Readiant.root.querySelector('.rdnt__letter-spacing');
    }
    static get letterSpacingTitle() {
        return Readiant.root.querySelector('.rdnt__block-title--letter-spacing');
    }
    static get least() {
        return String(Readiant.root.querySelector('.rdnt__i18n')?.getAttribute('data-least'));
    }
    static get less() {
        return String(Readiant.root.querySelector('.rdnt__i18n')?.getAttribute('data-less'));
    }
    static get lineHeightButtons() {
        return Readiant.root.querySelectorAll('.rdnt__line-height');
    }
    static get lineHeightTitle() {
        return Readiant.root.querySelector('.rdnt__block-title--line-height');
    }
    static get more() {
        return String(Readiant.root.querySelector('.rdnt__i18n')?.getAttribute('data-more'));
    }
    static get most() {
        return String(Readiant.root.querySelector('.rdnt__i18n')?.getAttribute('data-most'));
    }
    static get normal() {
        return String(Readiant.root.querySelector('.rdnt__i18n')?.getAttribute('data-normal'));
    }
    static get wordSpacingRange() {
        return Readiant.root.querySelector('.rdnt__word-spacing');
    }
    static get wordSpacingTitle() {
        return Readiant.root.querySelector('.rdnt__block-title--word-spacing');
    }
    static register() {
        for (const button of this.buttons)
            button.addEventListener('change', (event) => {
                this.change(event);
            });
        this.fontSizeRange?.addEventListener('change', (event) => {
            this.fontSize(event);
        });
        this.letterSpacingRange?.addEventListener('change', (event) => {
            this.letterSpacing(event);
        });
        for (const lineHeightButton of this.lineHeightButtons)
            lineHeightButton.addEventListener('click', (event) => {
                this.lineHeight(event);
            });
        this.wordSpacingRange?.addEventListener('change', (event) => {
            this.wordSpacing(event);
        });
        if (Readiant.type === ContentType.HTML) {
            this.wordSpacingTitle?.parentElement?.classList.add(CLASS_HIDDEN);
        }
        else {
            this.lineHeightTitle?.parentElement?.classList.add(CLASS_HIDDEN);
            if (this.active === 'rdnt__font--original') {
                this.fontSizeTitle?.parentElement?.classList.add(CLASS_HIDDEN);
                this.letterSpacingTitle?.parentElement?.classList.add(CLASS_HIDDEN);
                this.wordSpacingTitle?.parentElement?.classList.add(CLASS_HIDDEN);
            }
        }
    }
    static change(event) {
        let title;
        let value;
        if (typeof event === 'string') {
            const element = Readiant.root.querySelector(`[value="${event}"]`);
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
                this.fontSizeTitle?.parentElement?.classList.remove(CLASS_HIDDEN);
                this.letterSpacingTitle?.parentElement?.classList.remove(CLASS_HIDDEN);
                this.wordSpacingTitle?.parentElement?.classList.remove(CLASS_HIDDEN);
            }
            else {
                this.fontSizeTitle?.parentElement?.classList.add(CLASS_HIDDEN);
                this.letterSpacingTitle?.parentElement?.classList.add(CLASS_HIDDEN);
                this.wordSpacingTitle?.parentElement?.classList.add(CLASS_HIDDEN);
            }
        }
        this.active = value;
        if (this.currentFont !== null)
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
            if (this.fontSizeRange !== null)
                this.fontSizeRange.value = String(event);
            value = event;
        }
        else {
            const input = event.currentTarget;
            value = Number(input.value);
        }
        Builder.fontSize(value);
        if (this.currentFontSize !== null)
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
            if (this.letterSpacingRange !== null)
                this.letterSpacingRange.value = String(event);
            value = event;
        }
        else {
            const input = event.currentTarget;
            value = Number(input.value);
        }
        Builder.letterSpacing(value);
        if (this.currentLetterSpacing !== null)
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
            const element = Readiant.root.querySelector(`[data-line-height="${String(event)}"]`);
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
        if (this.currentLineHeight !== null)
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
            if (this.wordSpacingRange !== null)
                this.wordSpacingRange.value = String(event);
            value = event;
        }
        else {
            const input = event.currentTarget;
            value = Number(input.value);
        }
        Builder.wordSpacing(value);
        if (this.currentWordSpacing !== null)
            this.currentWordSpacing.textContent = this.convert(value);
        eventLogger({
            type: LogType.ChangeWordSpacing,
            wordSpacing: value,
        });
    }
}
Fonts.active = 'rdnt__font--original';
