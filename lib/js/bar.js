import { Audio } from './audio.js';
import { Builder } from './builder.js';
import { CLASS_BLOCK_ACTIVE, CLASS_DISABLED, CLASS_HIDDEN, AudioPlayingState, Container, } from './consts.js';
import { ResizeObserver } from './detection.js';
import { eventLogger } from './eventLogger.js';
import { LogType } from './log.js';
import { Readiant } from './readiant.js';
import { Text } from './text.js';
export class Bar {
    static get backwardButton() {
        return Readiant.root.querySelector('.rdnt__backward');
    }
    static get bar() {
        return Readiant.root.querySelector('.rdnt__bottom-bar');
    }
    static get closeButton() {
        return Readiant.root.querySelector('.rdnt__close-bar');
    }
    static get closeSettingsButton() {
        return Readiant.root.querySelector('.rdnt__close-bottom-bar-settings');
    }
    static get currentReadStop() {
        return Readiant.root.querySelector('.rdnt__current-selection--read-stop');
    }
    static get currentSubtitleFontSize() {
        return Readiant.root.querySelector('.rdnt__current-selection--subtitle-font-size');
    }
    static get forwardButton() {
        return Readiant.root.querySelector('.rdnt__forward');
    }
    static get readStopButtons() {
        return Readiant.root.querySelectorAll('.rdnt__read-stop');
    }
    static get settings() {
        return Readiant.root.querySelector('.rdnt__bottom-bar-settings');
    }
    static get settingsButtons() {
        return Readiant.root.querySelectorAll('.rdnt__bottom-bar-settings-button');
    }
    static get subtitlesRange() {
        return Readiant.root.querySelector('.rdnt__subtitles-range');
    }
    static get syntaxElement() {
        return Readiant.root.querySelector('.rdnt__bottom-bar__syntax');
    }
    static get syntaxOptionsElement() {
        return Readiant.root.querySelector('.rdnt__bottom-bar__options');
    }
    static register() {
        this.subtitlesRange?.addEventListener('change', (event) => {
            this.fontSizeSubtitles(event);
        });
        this.backwardButton?.addEventListener('click', (event) => {
            event.preventDefault();
            this.backward();
        });
        this.closeButton?.addEventListener('click', (event) => {
            event.preventDefault();
            this.toggle();
        });
        this.forwardButton?.addEventListener('click', (event) => {
            event.preventDefault();
            this.forward();
        });
        this.closeSettingsButton?.addEventListener('click', (event) => {
            event.preventDefault();
            Readiant.close([Container.BarSettings]);
        });
        for (const readStopButton of this.readStopButtons)
            readStopButton.addEventListener('click', (event) => {
                event.preventDefault();
                this.changeReadStop(event);
            });
        for (const settingsButton of this.settingsButtons)
            settingsButton.addEventListener('click', (event) => {
                event.preventDefault();
                const barHeight = this.bar?.offsetHeight;
                if (this.settings !== null &&
                    this.settings.classList.contains(CLASS_HIDDEN)) {
                    this.settings.style.bottom = `calc(${String(barHeight)}px + 1rem)`;
                    this.settings.style.maxHeight = `calc(100% - ${String(barHeight + 56)}px - 2rem)`;
                }
                Readiant.toggle(Container.BarSettings);
            });
        const syntaxEl = this.syntaxElement;
        if (syntaxEl !== null) {
            new MutationObserver(() => {
                const barHeight = this.bar?.offsetHeight;
                if (this.settings !== null &&
                    this.settings.classList.contains(CLASS_HIDDEN)) {
                    this.settings.style.bottom = `calc(${String(barHeight)}px + 1rem)`;
                    this.settings.style.maxHeight = `calc(100% - ${String(barHeight + 56)}px - 2rem)`;
                }
            }).observe(syntaxEl, {
                attributes: true,
                childList: true,
            });
        }
        if (this.bar !== null)
            new ResizeObserver(() => {
                const barHeight = this.bar.offsetHeight;
                Builder.adjust(barHeight);
            }).observe(this.bar);
    }
    static add(sentence, force = false) {
        const stripped = this.strip(sentence);
        if (!this.showing)
            this.toggle();
        const syntaxEl = this.syntaxElement;
        if (syntaxEl) {
            if (!force)
                syntaxEl.setAttribute('data-original', stripped);
            if (!Text.isTranslating || force)
                syntaxEl.innerHTML = sentence;
            else
                Text.translate(stripped);
        }
    }
    static backward() {
        switch (this.readStop) {
            case 2:
                Builder.startHighlightingBackward(2);
                break;
            case 3:
                Builder.startHighlightingBackward(3);
                break;
        }
    }
    static changeReadStop(event) {
        let title;
        let value;
        if (typeof event === 'number') {
            event = Math.abs(event);
            if (event < 1)
                event = 1;
            if (event > 3)
                event = 3;
            const element = Readiant.root.querySelector(`[data-read-stop="${String(event)}"]`);
            if (element !== null) {
                element.click();
                title = String(element.getAttribute('data-title'));
            }
            else
                title = '';
            value = event;
        }
        else {
            const element = event.currentTarget;
            title = String(element.getAttribute('data-title'));
            value = Number(String(element.getAttribute('data-read-stop')));
        }
        for (const readStopButton of this.readStopButtons) {
            readStopButton.classList.remove(CLASS_BLOCK_ACTIVE);
            if (readStopButton.getAttribute('data-read-stop') === String(value))
                readStopButton.classList.add(CLASS_BLOCK_ACTIVE);
        }
        if (value === 1) {
            this.backwardButton?.classList.add(CLASS_DISABLED);
            this.forwardButton?.classList.add(CLASS_DISABLED);
        }
        else {
            this.backwardButton?.classList.remove(CLASS_DISABLED);
            this.forwardButton?.classList.remove(CLASS_DISABLED);
        }
        if (this.currentReadStop)
            this.currentReadStop.textContent = title;
        this.readStop = value;
        eventLogger({
            type: LogType.ChangeReadStop,
            readStopLevel: value,
        });
    }
    static empty() {
        if (this.syntaxElement === null)
            return;
        this.syntaxElement.innerHTML = '';
        this.syntaxElement.removeAttribute('data-original');
    }
    static fontSizeSubtitles(event) {
        let value;
        if (typeof event === 'number')
            value = event;
        else {
            const input = event.currentTarget;
            value = Number(input.value);
        }
        if (value < 1)
            value = 1;
        if (value > 5)
            value = 5;
        this.syntaxElement?.classList.remove(`rdnt__bottom-bar__syntax--${String(this.fontSize)}`);
        this.fontSize = value;
        this.syntaxElement?.classList.add(`rdnt__bottom-bar__syntax--${String(this.fontSize)}`);
        if (this.currentSubtitleFontSize !== null)
            this.currentSubtitleFontSize.textContent = String(value + 10);
        eventLogger({
            type: LogType.ChangeSubtitleFontSize,
            subtitleFontSize: value,
        });
    }
    static forward() {
        switch (this.readStop) {
            case 2:
                Builder.startHighlightingForward(2);
                break;
            case 3:
                Builder.startHighlightingForward(3);
                break;
        }
    }
    static get() {
        return String(this.syntaxElement?.getAttribute('data-original')).trim();
    }
    static strip(string) {
        const doc = new DOMParser().parseFromString(string, 'text/html');
        const children = [...doc.body.children].map((element) => element.textContent);
        return children.join(' ');
    }
    static toggle() {
        this.bar.classList.toggle(CLASS_HIDDEN);
        this.syntaxElement?.classList.toggle(CLASS_HIDDEN);
        this.syntaxOptionsElement?.classList.toggle(CLASS_HIDDEN);
        this.showing = !this.showing;
        Readiant.close([Container.BarSettings]);
        if (!this.showing && Audio.playingState !== AudioPlayingState.Stopped)
            Audio.stop().catch((e) => {
                throw e;
            });
    }
}
Bar.fontSize = 1;
Bar.readStop = 1;
Bar.showing = false;
