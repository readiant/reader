import { A11y } from './a11y.js';
import { Bar } from './bar.js';
import { Builder } from './builder.js';
import { eventLogger } from './eventLogger.js';
import { LogType } from './log.js';
import { Readiant } from './readiant.js';
import { Stream } from './stream.js';
import { TextMode } from './textMode.js';
import { ClientActionType, ServerActionType, } from './consts.js';
export class Text {
    static get current() {
        return Readiant.root.querySelector('.rdnt__current-selection--translation');
    }
    static get currentSimplified() {
        return Readiant.root.querySelector('.rdnt__current-selection--simplified');
    }
    static get off() {
        return String(Readiant.root.querySelector('.rdnt__i18n')?.getAttribute('data-off'));
    }
    static get on() {
        return String(Readiant.root.querySelector('.rdnt__i18n')?.getAttribute('data-on'));
    }
    static get standard() {
        return String(Readiant.root.querySelector('.rdnt__i18n')?.getAttribute('data-standard'));
    }
    static get translationSettingsButton() {
        return Readiant.root.querySelector('.rdnt__translation-settings-button');
    }
    static get translateList() {
        return Readiant.root.querySelector('.rdnt__translation-list');
    }
    static resetState() {
        this.barLoadingText = null;
        this.language = 'nl';
        this.languages = {};
        this.simplified = false;
        this.isTranslating = false;
        this.originalHTML = null;
    }
    static register(translations, defaultLanguage) {
        const translateList = this.translateList;
        if (translateList === null)
            return;
        this.languages = translations;
        const settingsButton = this.translationSettingsButton;
        if (settingsButton !== null && this.originalHTML === null)
            this.originalHTML = settingsButton.innerHTML;
        if (typeof defaultLanguage !== 'undefined') {
            this.language = defaultLanguage;
            if (this.current !== null &&
                typeof translations[defaultLanguage] !== 'undefined')
                this.current.textContent = translations[defaultLanguage].name;
        }
        else if (!this.isTranslating && this.current !== null) {
            this.current.textContent = this.standard;
        }
        const standardLabel = Readiant.documentContext.createElement('label');
        standardLabel.setAttribute('class', 'rdnt__radio rdnt__standard');
        standardLabel.setAttribute('role', 'button');
        standardLabel.setAttribute('tabindex', '0');
        const standardInput = Readiant.documentContext.createElement('input');
        standardInput.setAttribute('class', 'rdnt__translation');
        standardInput.setAttribute('name', 'translation');
        standardInput.setAttribute('type', 'radio');
        standardInput.value = '';
        standardInput.checked = !this.isTranslating;
        const standardSpan = Readiant.documentContext.createElement('span');
        standardSpan.setAttribute('class', 'rdnt__radio-title');
        standardSpan.innerText = this.standard;
        standardLabel.appendChild(standardInput);
        standardLabel.appendChild(standardSpan);
        standardLabel.addEventListener('click', (event) => {
            event.preventDefault();
            this.selectStandard();
        });
        standardLabel.addEventListener('keydown', (event) => {
            A11y.shortcut(event);
        });
        translateList.appendChild(standardLabel);
        for (const [languageCode, langData] of Object.entries(this.languages).sort((a, b) => a[1].name.localeCompare(b[1].name))) {
            const label = Readiant.documentContext.createElement('label');
            label.setAttribute('class', 'rdnt__radio');
            label.setAttribute('role', 'button');
            label.setAttribute('tabindex', '0');
            const input = Readiant.documentContext.createElement('input');
            input.setAttribute('class', 'rdnt__translation');
            input.setAttribute('name', 'translation');
            input.setAttribute('type', 'radio');
            input.value = languageCode;
            if (this.isTranslating && languageCode === this.language)
                input.checked = true;
            const flag = Readiant.documentContext.createElement('img');
            flag.setAttribute('class', 'rdnt__radio-flag');
            flag.setAttribute('aria-hidden', 'true');
            if (langData.flag !== '')
                flag.setAttribute('src', langData.flag);
            const span = Readiant.documentContext.createElement('span');
            span.setAttribute('class', 'rdnt__radio-title');
            span.innerText = langData.name;
            label.appendChild(input);
            label.appendChild(flag);
            label.appendChild(span);
            label.addEventListener('click', (event) => {
                event.preventDefault();
                this.switchTranslation(langData.name, languageCode);
            });
            label.addEventListener('keydown', (event) => {
                A11y.shortcut(event);
            });
            translateList.appendChild(label);
        }
        for (const label of Readiant.root.querySelectorAll('.rdnt__simplified-radio')) {
            const input = label.querySelector('.rdnt__simplified');
            label.addEventListener('click', (event) => {
                event.preventDefault();
                if (input === null)
                    return;
                for (const el of Readiant.root.querySelectorAll('.rdnt__simplified'))
                    el.checked = el === input;
                const newSimplified = input.value === '1';
                if (this.simplified === newSimplified)
                    return;
                this.simplified = newSimplified;
                if (this.currentSimplified !== null)
                    this.currentSimplified.textContent = this.simplified
                        ? this.on
                        : this.off;
                if (this.simplified || this.isTranslating) {
                    if (this.simplified && !this.isTranslating)
                        TextMode.change(2);
                    if (this.isTranslating || !this.simplified) {
                        this.pendingSentences.clear();
                        Builder.clearPlainTextTranslations();
                    }
                    this.translatePageSentences(Builder.plainTextSentences());
                    this.translate(Bar.get());
                }
                else {
                    this.pendingSentences.clear();
                    Builder.clearPlainTextTranslations();
                    TextMode.change(1);
                }
            });
            label.addEventListener('keydown', (event) => {
                A11y.shortcut(event);
            });
        }
        Stream.setMessageHandler(ServerActionType.Translate, (data) => {
            this.onTranslate(data);
        });
        Builder.onPlainTextRendered = () => {
            this.translatePageSentences(Builder.plainTextSentences());
        };
    }
    static activateTranslate() {
        if (this.isTranslating)
            return;
        this.isTranslating = true;
        TextMode.change(2);
        for (const el of Readiant.root.querySelectorAll('.rdnt__translation'))
            el.checked = el.value === this.language;
        this.updateTopNavButtonFlag();
        this.pendingSentences.clear();
        Builder.clearPlainTextTranslations();
        const activateTranslateSentences = Builder.plainTextSentences();
        this.translatePageSentences(activateTranslateSentences);
        this.translate(Bar.get());
    }
    static activateSimplified() {
        if (this.simplified)
            return;
        this.simplified = true;
        TextMode.change(2);
        for (const el of Readiant.root.querySelectorAll('.rdnt__simplified'))
            el.checked = el.value === '1';
        if (this.currentSimplified !== null)
            this.currentSimplified.textContent = this.on;
        if (this.isTranslating) {
            for (const el of Readiant.root.querySelectorAll('.rdnt__translation'))
                el.checked = el.value === this.language;
            this.updateTopNavButtonFlag();
            this.pendingSentences.clear();
            Builder.clearPlainTextTranslations();
        }
        const sentences = Builder.plainTextSentences();
        this.translatePageSentences(sentences);
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
        if ((!this.isTranslating && !this.simplified) || sentences.length === 0) {
            return;
        }
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
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    static updateMenuLoadingState() { }
    static switchTranslation(language, languageCode) {
        if (this.current !== null)
            this.current.textContent = language;
        this.language = languageCode;
        for (const el of Readiant.root.querySelectorAll('.rdnt__translation'))
            el.checked = el.value === languageCode;
        if (!this.isTranslating)
            this.isTranslating = true;
        TextMode.change(2);
        this.updateTopNavButtonFlag();
        this.pendingSentences.clear();
        Builder.clearPlainTextTranslations();
        this.translatePageSentences(Builder.plainTextSentences());
        this.translate(Bar.get());
    }
    static selectStandard() {
        this.isTranslating = false;
        for (const el of Readiant.root.querySelectorAll('.rdnt__translation'))
            el.checked = el.value === '';
        if (this.current !== null)
            this.current.textContent = this.standard;
        this.clearTopNavButtonFlag();
        this.pendingSentences.clear();
        Builder.clearPlainTextTranslations();
        if (this.simplified) {
            this.translatePageSentences(Builder.plainTextSentences());
            this.translate(Bar.get());
        }
        else {
            TextMode.change(1);
        }
    }
    static updateTopNavButtonFlag() {
        const button = this.translationSettingsButton;
        if (button === null)
            return;
        const langData = this.languages[this.language];
        if (typeof langData === 'undefined')
            return;
        if (langData.flag !== '') {
            button.querySelector('.rdnt__translation-settings-flag')?.remove();
            const icon = button.querySelector('.rdnt__button-icon');
            if (icon !== null)
                icon.style.visibility = 'hidden';
            const img = Readiant.documentContext.createElement('img');
            img.setAttribute('src', langData.flag);
            img.setAttribute('class', 'rdnt__translation-settings-flag');
            img.setAttribute('aria-hidden', 'true');
            button.appendChild(img);
        }
        else {
            this.clearTopNavButtonFlag();
        }
    }
    static clearTopNavButtonFlag() {
        const button = this.translationSettingsButton;
        if (button === null)
            return;
        button.querySelector('.rdnt__translation-settings-flag')?.remove();
        const icon = button.querySelector('.rdnt__button-icon');
        if (icon !== null)
            icon.style.visibility = '';
    }
}
Text.cache = new Map();
Text.pendingSentences = new Map();
Text.barLoadingText = null;
Text.language = 'nl';
Text.languages = {};
Text.simplified = false;
Text.originalHTML = null;
Text.isTranslating = false;
