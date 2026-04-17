import { A11y } from './a11y.js';
import { Bar } from './bar.js';
import { Builder } from './builder.js';
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
        this.translateButton.setAttribute('aria-pressed', 'false');
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
        Builder.onPlainTextRendered = () => {
            this.translatePageSentences(Builder.plainTextSentences());
        };
    }
    static onTranslate(data) {
        const cachedElement = this.cache.get(data.original);
        const cached = typeof cachedElement !== 'undefined' ? cachedElement : {};
        const cacheKey = `${data.language}${data.simplified === true ? ':simplified' : ''}`;
        cached[cacheKey] = data.string;
        this.cache.set(data.original, cached);
        const pendingKey = `${data.language}:${data.simplified === true ? '1' : '0'}:${data.original}`;
        const pendingIndices = this.pendingSentences.get(pendingKey);
        if (typeof pendingIndices !== 'undefined') {
            for (const index of pendingIndices)
                Builder.setPlainTextSentenceTranslation(index, data.string);
            this.pendingSentences.delete(pendingKey);
        }
        else {
            Bar.add(data.string, true);
        }
    }
    static translatePageSentences(sentences) {
        if (!this.isTranslating || sentences.length === 0)
            return;
        const cacheKey = `${this.language}${this.simplified ? ':simplified' : ''}`;
        for (const sentence of sentences) {
            if (sentence.text === '')
                continue;
            const cached = this.cache.get(sentence.text);
            if (typeof cached !== 'undefined' &&
                typeof cached[cacheKey] !== 'undefined') {
                Builder.setPlainTextSentenceTranslation(sentence.index, cached[cacheKey]);
            }
            else {
                const pendingKey = `${this.language}:${this.simplified ? '1' : '0'}:${sentence.text}`;
                const existing = this.pendingSentences.get(pendingKey);
                if (typeof existing !== 'undefined') {
                    existing.push(sentence.index);
                }
                else {
                    this.pendingSentences.set(pendingKey, [sentence.index]);
                    Stream.send({
                        type: ClientActionType.TranslateRequest,
                        language: this.language,
                        simplified: this.simplified,
                        string: sentence.text,
                    });
                }
            }
        }
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
        if (this.isTranslating) {
            this.translate(Bar.get());
            this.pendingSentences.clear();
            Builder.clearPlainTextTranslations();
            this.translatePageSentences(Builder.plainTextSentences());
        }
    }
    static toggleSimplified(input) {
        this.simplified = !this.simplified;
        input.checked = this.simplified;
        if (this.isTranslating) {
            this.translate(Bar.get());
            this.pendingSentences.clear();
            Builder.clearPlainTextTranslations();
            this.translatePageSentences(Builder.plainTextSentences());
        }
    }
    static toggleTranslate() {
        this.isTranslating = !this.isTranslating;
        this.translateButton?.classList.toggle(CLASS_ROUND_BUTTON_ACTIVE);
        this.translateButton?.setAttribute('aria-pressed', String(this.isTranslating));
        if (this.isTranslating) {
            this.translate(Bar.get());
            this.translatePageSentences(Builder.plainTextSentences());
        }
        else {
            this.pendingSentences.clear();
            Builder.clearPlainTextTranslations();
        }
    }
}
Text.cache = new Map();
Text.pendingSentences = new Map();
Text.language = 'en-GB';
Text.languages = {};
Text.simplified = false;
Text.isTranslating = false;
