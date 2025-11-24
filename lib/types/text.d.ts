import { A11y } from './a11y.js';
import { Bar } from './bar.js';
import { CLASS_ROUND_BUTTON_ACTIVE } from './consts.js';
import { eventLogger } from './eventLogger.js';
import { LogType } from './log.js';
import { Readiant } from './readiant.js';
import { Stream } from './stream.js';
import { ClientActionType, ServerActionType, } from './consts.js';
export class Text {
    static get current() {
        return Readiant.root.querySelector('.rdnt__current-selection--translation');
    }
    static get translateButton() {
        return Readiant.root.querySelector('.rdnt__translate');
    }
    static get translateList() {
        return Readiant.root.querySelector('.rdnt__translation-list');
    }
    static register(translations, defaultLanguage) {
        if (this.translateButton !== null) {
            this.languages = translations;
            this.translateButton.addEventListener('click', () => {
                this.toggleTranslate();
            });
            if (typeof defaultLanguage !== 'undefined')
                this.language = defaultLanguage;
            for (const [languageCode, language] of Object.entries(this.languages).sort((a, b) => a[1].localeCompare(b[1]))) {
                const label = document.createElement('label');
                label.setAttribute('class', 'rdnt__radio');
                label.setAttribute('role', 'button');
                label.setAttribute('tabindex', '0');
                const input = document.createElement('input');
                input.setAttribute('class', 'rdnt__translation');
                input.setAttribute('name', 'translation');
                input.setAttribute('type', 'radio');
                if (languageCode === this.language)
                    input.checked = true;
                const span = document.createElement('span');
                span.setAttribute('class', 'rdnt__radio-title');
                span.innerText = language;
                label.appendChild(input);
                label.appendChild(span);
                label.addEventListener('click', () => {
                    this.switchTranslation(language, languageCode);
                });
                label.addEventListener('keydown', (event) => {
                    A11y.shortcut(event);
                });
                this.translateList.appendChild(label);
            }
            Stream.setMessageHandler(ServerActionType.Translate, (data) => {
                this.onTranslate(data);
            });
        }
    }
    static onTranslate(data) {
        const cachedElement = this.cache.get(data.original);
        const cached = typeof cachedElement !== 'undefined' ? cachedElement : {};
        cached[this.language] = data.string;
        Bar.add(data.string, true);
        this.cache.set(data.original, cached);
    }
    static translate(string) {
        if (string !== '') {
            const cached = this.cache.get(string);
            if (typeof cached === 'undefined' ||
                typeof cached[this.language] === 'undefined')
                Stream.send({
                    type: ClientActionType.TranslateRequest,
                    language: this.language,
                    string,
                });
            else
                Bar.add(cached[this.language], true);
            eventLogger({
                type: LogType.Translate,
                language: this.language,
                text: string,
            });
        }
    }
    static switchTranslation(language, languageCode) {
        this.current.textContent = language;
        this.language = languageCode;
        if (this.isTranslating)
            this.translate(Bar.get());
    }
    static toggleTranslate() {
        this.isTranslating = !this.isTranslating;
        this.translateButton.classList.toggle(CLASS_ROUND_BUTTON_ACTIVE);
        if (this.isTranslating)
            this.translate(Bar.get());
    }
}
Text.cache = new Map();
Text.language = 'en-GB';
Text.languages = {};
Text.isTranslating = false;
