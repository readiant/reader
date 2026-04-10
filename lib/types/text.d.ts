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
        if (this.translateButton === null)
            return;
        this.languages = translations;
        this.translateButton.addEventListener('click', (event) => {
            event.preventDefault();
            this.toggleTranslate();
        });
        if (typeof defaultLanguage !== 'undefined')
            this.language = defaultLanguage;
        const simplifiedLabel = Readiant.documentContext.createElement('label');
        simplifiedLabel.setAttribute('class', 'rdnt__radio');
        simplifiedLabel.setAttribute('role', 'button');
        simplifiedLabel.setAttribute('tabindex', '0');
        const simplifiedInput = Readiant.documentContext.createElement('input');
        simplifiedInput.setAttribute('class', 'rdnt__simplified');
        simplifiedInput.setAttribute('type', 'checkbox');
        const simplifiedSpan = Readiant.documentContext.createElement('span');
        simplifiedSpan.setAttribute('class', 'rdnt__radio-title');
        simplifiedSpan.innerText = translations.simplified;
        simplifiedLabel.appendChild(simplifiedInput);
        simplifiedLabel.appendChild(simplifiedSpan);
        simplifiedLabel.addEventListener('click', (event) => {
            event.preventDefault();
            this.toggleSimplified(simplifiedInput);
        });
        simplifiedLabel.addEventListener('keydown', (event) => {
            A11y.shortcut(event);
        });
        if (this.translateList)
            this.translateList.appendChild(simplifiedLabel);
        for (const [languageCode, language] of Object.entries(this.languages).sort((a, b) => a[1].localeCompare(b[1]))) {
            const label = Readiant.documentContext.createElement('label');
            label.setAttribute('class', 'rdnt__radio');
            label.setAttribute('role', 'button');
            label.setAttribute('tabindex', '0');
            const input = Readiant.documentContext.createElement('input');
            input.setAttribute('class', 'rdnt__translation');
            input.setAttribute('name', 'translation');
            input.setAttribute('type', 'radio');
            input.value = languageCode;
            if (languageCode === this.language)
                input.checked = true;
            const span = Readiant.documentContext.createElement('span');
            span.setAttribute('class', 'rdnt__radio-title');
            span.innerText = language;
            label.appendChild(input);
            label.appendChild(span);
            label.addEventListener('click', (event) => {
                event.preventDefault();
                this.switchTranslation(language, languageCode);
            });
            label.addEventListener('keydown', (event) => {
                A11y.shortcut(event);
            });
            if (this.translateList)
                this.translateList.appendChild(label);
        }
        Stream.setMessageHandler(ServerActionType.Translate, (data) => {
            this.onTranslate(data);
        });
    }
    static onTranslate(data) {
        const cachedElement = this.cache.get(data.original);
        const cached = typeof cachedElement !== 'undefined' ? cachedElement : {};
        const cacheKey = `${this.language}${this.simplified ? ':simplified' : ''}`;
        cached[cacheKey] = data.string;
        Bar.add(data.string, true);
        this.cache.set(data.original, cached);
    }
    static translate(string) {
        if (string !== '') {
            const cacheKey = `${this.language}${this.simplified ? ':simplified' : ''}`;
            const cached = this.cache.get(string);
            if (typeof cached === 'undefined' ||
                typeof cached[cacheKey] === 'undefined')
                Stream.send({
                    type: ClientActionType.TranslateRequest,
                    language: this.language,
                    simplified: this.simplified,
                    string,
                });
            else
                Bar.add(cached[cacheKey], true);
            eventLogger({
                type: LogType.Translate,
                language: this.language,
                text: string,
            });
        }
    }
    static switchTranslation(language, languageCode) {
        if (this.current !== null)
            this.current.textContent = language;
        this.language = languageCode;
        for (const el of Readiant.root.querySelectorAll('.rdnt__translation'))
            el.checked = el.value === languageCode;
        if (this.isTranslating)
            this.translate(Bar.get());
    }
    static toggleSimplified(input) {
        this.simplified = !this.simplified;
        input.checked = this.simplified;
        if (this.isTranslating)
            this.translate(Bar.get());
    }
    static toggleTranslate() {
        this.isTranslating = !this.isTranslating;
        this.translateButton?.classList.toggle(CLASS_ROUND_BUTTON_ACTIVE);
        if (this.isTranslating)
            this.translate(Bar.get());
    }
}
Text.cache = new Map();
Text.language = 'en-GB';
Text.languages = {};
Text.simplified = false;
Text.isTranslating = false;
