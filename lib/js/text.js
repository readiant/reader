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
    static get translateMenuButton() {
        return Readiant.root.querySelector('.rdnt__translate-menu-button');
    }
    static get simplifiedMenuButton() {
        return Readiant.root.querySelector('.rdnt__simplified-menu-button');
    }
    static get translateList() {
        return Readiant.root.querySelector('.rdnt__translation-list');
    }
    static resetState() {
        this.barLoadingText = null;
        this.language = 'en-GB';
        this.languages = {};
        this.simplified = false;
        this.isTranslating = false;
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
        if (typeof defaultLanguage !== 'undefined') {
            this.language = defaultLanguage;
            if (this.current !== null &&
                typeof translations[defaultLanguage] !== 'undefined')
                this.current.textContent = translations[defaultLanguage];
        }
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
        this.translateMenuButton?.addEventListener('click', (event) => {
            event.preventDefault();
            this.toggleTranslate();
        });
        this.simplifiedMenuButton?.addEventListener('click', (event) => {
            event.preventDefault();
            this.activateSimplified();
        });
    }
    static activateTranslate() {
        if (this.isTranslating)
            return;
        this.isTranslating = true;
        this.translateButton?.classList.add(CLASS_ROUND_BUTTON_ACTIVE);
        this.translateButton?.setAttribute('aria-pressed', 'true');
        this.translateMenuButton?.classList.add(CLASS_ROUND_BUTTON_ACTIVE);
        const translateLabel = this.translateButton?.dataset.labelOff;
        if (typeof translateLabel !== 'undefined')
            this.translateButton?.setAttribute('aria-label', translateLabel);
        const translateMenuLabel = this.translateMenuButton?.dataset.labelOff;
        if (typeof translateMenuLabel !== 'undefined')
            this.translateMenuButton?.setAttribute('aria-label', translateMenuLabel);
        this.translatePageSentences(Builder.plainTextSentences());
        this.translate(Bar.get());
    }
    static activateSimplified() {
        this.simplified = true;
        const simplifiedInput = Readiant.root.querySelector('.rdnt__simplified');
        if (simplifiedInput !== null)
            simplifiedInput.checked = true;
        if (!this.isTranslating) {
            this.isTranslating = true;
            this.translateButton?.classList.add(CLASS_ROUND_BUTTON_ACTIVE);
            this.translateButton?.setAttribute('aria-pressed', 'true');
            this.translateMenuButton?.classList.add(CLASS_ROUND_BUTTON_ACTIVE);
        }
        this.simplifiedMenuButton?.classList.add(CLASS_ROUND_BUTTON_ACTIVE);
        const simplifiedMenuLabel = this.simplifiedMenuButton?.dataset.labelOff;
        if (typeof simplifiedMenuLabel !== 'undefined')
            this.simplifiedMenuButton?.setAttribute('aria-label', simplifiedMenuLabel);
        this.pendingSentences.clear();
        Builder.clearPlainTextTranslations();
        this.translatePageSentences(Builder.plainTextSentences());
        this.translate(Bar.get());
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
            if (this.barLoadingText === data.original) {
                this.barLoadingText = null;
                Bar.syntaxElement?.classList.remove('rdnt__translation--loading');
                if (Bar.showing)
                    Bar.add(data.string, true);
            }
        }
        else {
            Bar.syntaxElement?.classList.remove('rdnt__translation--loading');
            if (Bar.showing)
                Bar.add(data.string, true);
        }
        this.updateMenuLoadingState();
    }
    static translatePageSentences(sentences) {
        if (!this.isTranslating || sentences.length === 0)
            return;
        const cacheKey = `${this.language}${this.simplified ? ':simplified' : ''}`;
        const simplifiedKey = this.simplified ? '1' : '0';
        const toSend = new Set();
        for (const sentence of sentences) {
            if (sentence.text === '')
                continue;
            const cached = this.cache.get(sentence.text);
            if (typeof cached !== 'undefined' &&
                typeof cached[cacheKey] !== 'undefined') {
                Builder.setPlainTextSentenceTranslation(sentence.index, cached[cacheKey]);
                continue;
            }
            const pendingKey = `${this.language}:${simplifiedKey}:${sentence.text}`;
            const existing = this.pendingSentences.get(pendingKey);
            if (typeof existing !== 'undefined') {
                existing.push(sentence.index);
            }
            else {
                this.pendingSentences.set(pendingKey, [sentence.index]);
                toSend.add(sentence.text);
            }
            Builder.setPlainTextSentenceLoading(sentence.index);
        }
        const allSentences = [...toSend];
        if (allSentences.length > 0)
            Stream.send({
                type: ClientActionType.TranslateRequest,
                language: this.language,
                simplified: this.simplified,
                sentences: allSentences,
            });
        this.updateMenuLoadingState();
    }
    static translate(string) {
        if (string !== '' && Bar.showing) {
            const cacheKey = `${this.language}${this.simplified ? ':simplified' : ''}`;
            const cached = this.cache.get(string);
            if (typeof cached === 'undefined' ||
                typeof cached[cacheKey] === 'undefined') {
                this.barLoadingText = string;
                Bar.syntaxElement?.classList.add('rdnt__translation--loading');
                const pendingKey = `${this.language}:${this.simplified ? '1' : '0'}:${string}`;
                if (!this.pendingSentences.has(pendingKey))
                    Stream.send({
                        type: ClientActionType.TranslateRequest,
                        language: this.language,
                        simplified: this.simplified,
                        sentences: [string],
                    });
                this.updateMenuLoadingState();
            }
            else
                Bar.add(cached[cacheKey], true);
            eventLogger({
                type: LogType.Translate,
                language: this.language,
                text: string,
            });
        }
    }
    static updateMenuLoadingState() {
        const isLoading = this.pendingSentences.size > 0 || this.barLoadingText !== null;
        if (isLoading && this.isTranslating)
            this.translateMenuButton?.classList.add('rdnt__translation--loading');
        else
            this.translateMenuButton?.classList.remove('rdnt__translation--loading');
        if (isLoading && this.simplified)
            this.simplifiedMenuButton?.classList.add('rdnt__translation--loading');
        else
            this.simplifiedMenuButton?.classList.remove('rdnt__translation--loading');
    }
    static switchTranslation(language, languageCode) {
        if (this.current !== null)
            this.current.textContent = language;
        this.language = languageCode;
        for (const el of Readiant.root.querySelectorAll('.rdnt__translation'))
            el.checked = el.value === languageCode;
        if (this.isTranslating) {
            this.pendingSentences.clear();
            Builder.clearPlainTextTranslations();
            this.translatePageSentences(Builder.plainTextSentences());
            this.translate(Bar.get());
        }
    }
    static toggleSimplified(input) {
        this.simplified = !this.simplified;
        input.checked = this.simplified;
        if (this.simplified)
            this.simplifiedMenuButton?.classList.add(CLASS_ROUND_BUTTON_ACTIVE);
        else
            this.simplifiedMenuButton?.classList.remove(CLASS_ROUND_BUTTON_ACTIVE);
        if (this.isTranslating) {
            this.pendingSentences.clear();
            Builder.clearPlainTextTranslations();
            this.translatePageSentences(Builder.plainTextSentences());
            this.translate(Bar.get());
        }
    }
    static toggleTranslate() {
        this.isTranslating = !this.isTranslating;
        this.translateButton?.classList.toggle(CLASS_ROUND_BUTTON_ACTIVE);
        this.translateButton?.setAttribute('aria-pressed', String(this.isTranslating));
        this.translateMenuButton?.classList.toggle(CLASS_ROUND_BUTTON_ACTIVE);
        if (!this.isTranslating)
            this.simplifiedMenuButton?.classList.remove(CLASS_ROUND_BUTTON_ACTIVE);
        const translateLabel = this.isTranslating
            ? this.translateButton?.dataset.labelOff
            : this.translateButton?.dataset.labelOn;
        if (typeof translateLabel !== 'undefined')
            this.translateButton?.setAttribute('aria-label', translateLabel);
        const translateMenuLabel = this.isTranslating
            ? this.translateMenuButton?.dataset.labelOff
            : this.translateMenuButton?.dataset.labelOn;
        if (typeof translateMenuLabel !== 'undefined')
            this.translateMenuButton?.setAttribute('aria-label', translateMenuLabel);
        if (this.isTranslating) {
            this.translatePageSentences(Builder.plainTextSentences());
            this.translate(Bar.get());
        }
        else {
            this.pendingSentences.clear();
            Builder.clearPlainTextTranslations();
            Bar.syntaxElement?.classList.remove('rdnt__translation--loading');
            this.updateMenuLoadingState();
        }
    }
}
Text.cache = new Map();
Text.pendingSentences = new Map();
Text.barLoadingText = null;
Text.language = 'en-GB';
Text.languages = {};
Text.simplified = false;
Text.isTranslating = false;
