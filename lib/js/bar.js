import { Audio } from './audio.js';
import { Builder } from './builder.js';
import { CLASS_BLOCK_ACTIVE, CLASS_DISABLED, CLASS_HIDDEN, AudioPlayingState, Container, } from './consts.js';
import { ResizeObserver } from './detection.js';
import { eventLogger } from './eventLogger.js';
import { LogType } from './log.js';
import { Readiant } from './readiant.js';
import { Text } from './text.js';
export class Bar {
    static register() {
        this.subtitlesRange.addEventListener('change', (event) => {
            this.fontSizeSubtitles(event);
        });
        this.backwardButton.addEventListener('click', () => {
            this.backward();
        });
        this.closeButton.addEventListener('click', () => {
            this.toggle();
        });
        this.forwardButton.addEventListener('click', () => {
            this.forward();
        });
        this.closeSettingsButton.addEventListener('click', () => {
            Readiant.close([Container.BarSettings]);
        });
        for (const readStopButton of this.readStopButtons)
            readStopButton.addEventListener('click', (event) => {
                this.changeReadStop(event);
            });
        for (const settingsButton of this.settingsButtons)
            settingsButton.addEventListener('click', () => {
                if (this.settings.classList.contains(CLASS_HIDDEN)) {
                    this.settings.style.bottom = `calc(${String(this.bar.offsetHeight)}px + 1rem)`;
                    this.settings.style.maxHeight = `calc(100% - ${String(this.bar.offsetHeight + 56)}px - 2rem)`;
                }
                Readiant.toggle(Container.BarSettings);
            });
        new MutationObserver(() => {
            if (!this.settings.classList.contains(CLASS_HIDDEN)) {
                this.settings.style.bottom = `calc(${String(this.bar.offsetHeight)}px + 1rem)`;
                this.settings.style.maxHeight = `calc(100% - ${String(this.bar.offsetHeight + 56)}px - 2rem)`;
            }
        }).observe(this.syntaxElement, {
            attributes: true,
            childList: true,
        });
        new ResizeObserver(() => {
            Builder.adjust(this.bar.offsetHeight);
        }).observe(this.bar);
    }
    static add(sentence, force = false) {
        const stripped = this.strip(sentence);
        if (!this.showing)
            this.toggle();
        if (!force)
            this.syntaxElement.setAttribute('data-original', stripped);
        if (!Text.isTranslating || force)
            this.syntaxElement.innerHTML = sentence;
        else
            Text.translate(stripped);
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
            const element = document.querySelector(`[data-read-stop="${String(event)}"]`);
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
            this.backwardButton.classList.add(CLASS_DISABLED);
            this.forwardButton.classList.add(CLASS_DISABLED);
        }
        else {
            this.backwardButton.classList.remove(CLASS_DISABLED);
            this.forwardButton.classList.remove(CLASS_DISABLED);
        }
        this.currentReadStop.textContent = title;
        this.readStop = value;
        eventLogger({
            type: LogType.ChangeReadStop,
            readStopLevel: value,
        });
    }
    static empty() {
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
        this.syntaxElement.classList.remove(`rdnt__bottom-bar__syntax--${String(this.fontSize)}`);
        this.fontSize = value;
        this.syntaxElement.classList.add(`rdnt__bottom-bar__syntax--${String(this.fontSize)}`);
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
        return String(this.syntaxElement.getAttribute('data-original')).trim();
    }
    static strip(string) {
        const doc = new DOMParser().parseFromString(string, 'text/html');
        const children = [...doc.body.children].map((element) => element.textContent);
        return children.join(' ');
    }
    static toggle() {
        this.bar.classList.toggle(CLASS_HIDDEN);
        this.syntaxElement.classList.toggle(CLASS_HIDDEN);
        this.syntaxOptionsElement.classList.toggle(CLASS_HIDDEN);
        this.showing = !this.showing;
        Readiant.close([Container.BarSettings]);
        if (!this.showing && Audio.playingState !== AudioPlayingState.Stopped)
            Audio.stop().catch((e) => {
                throw e;
            });
    }
}
Bar.backwardButton = document.getElementsByClassName('rdnt__backward')[0];
Bar.bar = document.getElementsByClassName('rdnt__bottom-bar')[0];
Bar.closeButton = document.getElementsByClassName('rdnt__close-bar')[0];
Bar.closeSettingsButton = document.getElementsByClassName('rdnt__close-bottom-bar-settings')[0];
Bar.currentReadStop = document.getElementsByClassName('rdnt__current-selection--read-stop')[0];
Bar.currentSubtitleFontSize = document.getElementsByClassName('rdnt__current-selection--subtitle-font-size')[0];
Bar.forwardButton = document.getElementsByClassName('rdnt__forward')[0];
Bar.readStopButtons = document.getElementsByClassName('rdnt__read-stop');
Bar.settings = document.getElementsByClassName('rdnt__bottom-bar-settings')[0];
Bar.settingsButtons = document.getElementsByClassName('rdnt__bottom-bar-settings-button');
Bar.subtitlesRange = document.getElementsByClassName('rdnt__subtitles-range')[0];
Bar.syntaxElement = document.getElementsByClassName('rdnt__bottom-bar__syntax')[0];
Bar.syntaxOptionsElement = document.getElementsByClassName('rdnt__bottom-bar__options')[0];
Bar.fontSize = 1;
Bar.readStop = 1;
Bar.showing = false;
