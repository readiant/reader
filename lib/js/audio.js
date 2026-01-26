import { Bar } from './bar.js';
import { Builder } from './builder.js';
import { CLASS_BLOCK_ACTIVE, CLASS_HIDDEN, CLASS_VISUALLY_HIDDEN, AudioPlayingState, OrientationMode, } from './consts.js';
import { eventLogger } from './eventLogger.js';
import { LogType } from './log.js';
import { Navigation } from './navigation.js';
import { Orientation } from './orientation.js';
import { Storage } from './storage.js';
import { Stream } from './stream.js';
import { Text } from './text.js';
import { ClientActionType, ServerActionType, SpeechMarkType, } from './consts.js';
import { Readiant } from './readiant.js';
export class Audio {
    static get countdownButtons() {
        return Readiant.root.querySelectorAll('.rdnt__countdown-button');
    }
    static get countdownCurrent() {
        return Readiant.root.querySelector('.rdnt__current-selection--countdown');
    }
    static get countdownElement() {
        return Readiant.root.querySelector('.rdnt__countdown');
    }
    static get countdownSettings() {
        return Readiant.root.querySelector('.rdnt__countdown-settings');
    }
    static get lineHighlighterButtons() {
        return Readiant.root.querySelectorAll('.rdnt__audio-line-highlighter-button');
    }
    static get lineHighlighterCurrent() {
        return Readiant.root.querySelector('.rdnt__current-selection--audio-line-highlighter');
    }
    static get pauseButton() {
        return Readiant.root.querySelector('.rdnt__pause');
    }
    static get playButton() {
        return Readiant.root.querySelector('.rdnt__play');
    }
    static get playbackRateMinus() {
        return Readiant.root.querySelector('.rdnt__playback-rate--minus');
    }
    static get playbackRatePlus() {
        return Readiant.root.querySelector('.rdnt__playback-rate--plus');
    }
    static get playbackRateCurrent() {
        return Readiant.root.querySelector('.rdnt__current-selection--playback-rate');
    }
    static get playbackRateInputs() {
        return Readiant.root.querySelectorAll('.rdnt__playback-rate');
    }
    static get playbackRateSettings() {
        return Readiant.root.querySelector('.rdnt__playback-rate-settings');
    }
    static get playbackRateTopSettings() {
        return Readiant.root.querySelector('.rdnt__menu__buttons-audio');
    }
    static get progressElement() {
        return Readiant.root.querySelector('.rdnt__audio-progress');
    }
    static get progressValue() {
        return Readiant.root.querySelector('.rdnt__audio-progress-value');
    }
    static get providersList() {
        return Readiant.root.querySelector('.rdnt__providers-list');
    }
    static get providersSettings() {
        return Readiant.root.querySelector('.rdnt__providers-settings');
    }
    static get settingsButtons() {
        return Readiant.root.querySelectorAll('.rdnt__bottom-bar-settings-button');
    }
    static get startButton() {
        return Readiant.root.querySelector('.rdnt__start');
    }
    static get stopButton() {
        return Readiant.root.querySelector('.rdnt__stop');
    }
    static get subtitlesButtons() {
        return Readiant.root.querySelectorAll('.rdnt__subtitles-button');
    }
    static get subtitlesCurrent() {
        return Readiant.root.querySelector('.rdnt__current-selection--subtitles');
    }
    static get subtitlesFontSizeSettings() {
        return Readiant.root.querySelector('.rdnt__subtitles-font-size-settings');
    }
    static get voice() {
        return String(Readiant.root.querySelector('.rdnt__i18n')?.getAttribute('data-voice'));
    }
    static get playing() {
        return typeof this.element === 'undefined' ? false : !this.element.paused;
    }
    static async register(availableAudio) {
        if (Object.keys(availableAudio).length === 0) {
            this.remove();
            return;
        }
        for (const settingsButton of this.settingsButtons)
            if (settingsButton.classList.contains(CLASS_HIDDEN))
                settingsButton.classList.remove(CLASS_HIDDEN);
        this.availableAudio = availableAudio;
        this.startButton?.classList.remove(CLASS_HIDDEN);
        this.countdownSettings?.classList.remove(CLASS_HIDDEN);
        this.playButton?.classList.remove(CLASS_HIDDEN);
        this.playbackRateSettings?.classList.remove(CLASS_HIDDEN);
        this.progressElement?.classList.remove(CLASS_HIDDEN);
        for (const provider of Object.keys(this.availableAudio))
            this.providers.add(provider);
        [...this.providers]
            .sort((a, b) => {
            const aNum = a.toLowerCase().includes('elevenlabs')
                ? 1
                : a.toLowerCase().includes('chirp')
                    ? 0
                    : -1;
            const bNum = b.toLowerCase().includes('elevenlabs')
                ? 1
                : b.toLowerCase().includes('chirp')
                    ? 0
                    : -1;
            return bNum - aNum;
        })
            .forEach((provider) => {
            if (typeof this.provider === 'undefined') {
                if (typeof Readiant.locale === 'undefined')
                    this.provider = provider;
                else if (provider.toLowerCase().includes(`-${Readiant.locale}`))
                    this.provider = provider;
            }
        });
        if (typeof this.provider === 'undefined')
            this.provider = this.providers.values().next().value;
        for (const countdownButton of this.countdownButtons)
            countdownButton.addEventListener('click', (event) => {
                this.countdownType(event);
            });
        for (const lineHighlighterButton of this.lineHighlighterButtons)
            lineHighlighterButton.addEventListener('click', (event) => {
                this.setLineHighlighterType(event);
            });
        this.pauseButton?.addEventListener('click', () => {
            this.pause().catch((e) => {
                throw e;
            });
        });
        this.playButton?.addEventListener('click', () => {
            this.play().catch((e) => {
                throw e;
            });
        });
        this.playbackRateMinus?.addEventListener('click', () => {
            this.setPlaybackRate(this.playbackRate - 0.1);
        });
        this.playbackRatePlus?.addEventListener('click', () => {
            this.setPlaybackRate(this.playbackRate + 0.1);
        });
        for (const playbackRateInput of this.playbackRateInputs)
            playbackRateInput.addEventListener('change', (event) => {
                this.onPlaybackRateChange(event).catch((e) => {
                    throw e;
                });
            });
        this.progressElement?.addEventListener('click', (event) => this.seek(event));
        this.startButton?.addEventListener('click', () => {
            this.play(true).catch((e) => {
                throw e;
            });
        });
        this.stopButton?.addEventListener('click', () => {
            this.stop().catch((e) => {
                throw e;
            });
        });
        for (const subtitlesButton of this.subtitlesButtons)
            subtitlesButton.addEventListener('click', (event) => {
                this.setSubtitlesType(event);
            });
        if (this.providers.size > 1) {
            this.providersSettings?.classList.remove(CLASS_HIDDEN);
            let index = 1;
            for (const provider of this.providers) {
                const label = Readiant.documentContext.createElement('label');
                label.setAttribute('class', 'rdnt__radio');
                const input = Readiant.documentContext.createElement('input');
                input.setAttribute('class', 'rdnt__provider');
                input.setAttribute('name', 'provider');
                input.setAttribute('type', 'radio');
                if (provider === this.provider)
                    input.setAttribute('checked', 'checked');
                const span = Readiant.documentContext.createElement('span');
                span.setAttribute('class', 'rdnt__radio-title');
                span.innerText = `${this.voice} ${String(index)}`;
                label.appendChild(input);
                label.appendChild(span);
                label.addEventListener('click', async () => {
                    await this.switchAudio(provider);
                });
                if (this.providersList)
                    this.providersList.appendChild(label);
                index++;
            }
        }
        Navigation.addHandler(async (page) => {
            Bar.empty();
            this.stopTimer();
            this.stopCurrentAudio();
            if (this.playingState === AudioPlayingState.Playing) {
                const currentPage = Navigation.currentPages.find((currentPage) => currentPage.page === page);
                if (typeof currentPage === 'undefined')
                    return;
                await this.start(0, currentPage.position);
            }
        });
        this.fetchSpeechMarks();
        Readiant.windowContext.addEventListener('keydown', (event) => {
            this.shortcut(event);
        });
    }
    static add(page, provider, language, voiceId) {
        const key = typeof language !== 'undefined' && typeof voiceId !== 'undefined'
            ? `${provider}__${language}__${voiceId}`
            : provider;
        if (typeof this.availableAudio[key] === 'undefined')
            this.availableAudio[key] = [];
        if (!this.availableAudio[key].includes(page))
            this.availableAudio[key].push(page);
        else
            Storage.deleteAudio(`${key}__${String(page)}`);
    }
    static addSpeechMarksToPage(position, syntax) {
        if (syntax.length > 0)
            Builder.textSentences(syntax
                .filter((s) => s.type === SpeechMarkType.Sentence)
                .map((s) => s.value), position, syntax.map((s, index) => ({ ...s, index })));
    }
    static countdownType(event) {
        let title;
        let value;
        if (typeof event === 'number') {
            event = Math.abs(event);
            if (event < 1)
                event = 1;
            if (event > 3)
                event = 3;
            const element = Readiant.root.querySelector(`[data-countdown="${String(event)}"]`);
            if (element !== null) {
                element.click();
                title = String(element.getAttribute('data-title'));
            }
            else
                title = '';
            value = event;
        }
        else {
            const input = event.currentTarget;
            title = String(input.getAttribute('data-title'));
            value = Number(input.getAttribute('data-countdown'));
            if (value < 1)
                value = 1;
            if (value > 3)
                value = 3;
        }
        this.timerType = value;
        if (this.countdownCurrent !== null)
            this.countdownCurrent.textContent = title;
        for (const countdownButton of this.countdownButtons) {
            countdownButton.classList.remove(CLASS_BLOCK_ACTIVE);
            const currentcountdownType = countdownButton.getAttribute('data-countdown');
            if (Number(currentcountdownType) === value)
                countdownButton.classList.add(CLASS_BLOCK_ACTIVE);
        }
        eventLogger({
            type: LogType.ChangeCountdown,
            countdownLevel: value,
        });
    }
    static fetchAudio(provider, page, time) {
        if (!Stream.hasMessageHandler(ServerActionType.Audio))
            Stream.setMessageHandler(ServerActionType.Audio, async (data) => this.onAudio(data));
        Stream.send({
            type: ClientActionType.AudioRequest,
            pages: [page],
            provider,
            time,
        });
    }
    static fetchSpeechMarks() {
        if (typeof this.provider === 'undefined')
            return;
        if (!Stream.hasMessageHandler(ServerActionType.SpeechMark))
            Stream.setMessageHandler(ServerActionType.SpeechMark, async (data) => this.onSpeechMark(data));
        for (const currentPage of Navigation.currentPages) {
            if (!Storage.hasSyntax(`${this.provider}__${String(currentPage.page)}`))
                Stream.send({
                    type: ClientActionType.SpeechMarkRequest,
                    pages: [currentPage.page],
                    provider: this.provider,
                });
            else {
                const syntax = Storage.getSyntax(`${this.provider}__${String(currentPage.page)}`);
                this.addSpeechMarksToPage(currentPage.position, syntax);
            }
        }
    }
    static async onAudio(data) {
        if (typeof data.transfer !== 'undefined') {
            const file = new Blob(Stream.transfers[data.transfer].chunks);
            const audio = new Uint8Array(await file.arrayBuffer());
            Storage.storeAudio(`${data.provider}__${String(data.page)}`, audio);
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete Stream.transfers[data.transfer];
        }
        else
            Storage.storeAudio(`${data.provider}__${String(data.page)}`, new Uint8Array());
        if (Navigation.currentPage === data.page) {
            const currentPage = Navigation.currentPages.find((currentPage) => currentPage.page === data.page);
            if (typeof currentPage === 'undefined')
                return;
            await this.start(typeof data.time !== 'undefined' ? data.time : 0, currentPage.position);
        }
    }
    static async onCanPlayThrough(time) {
        if (this.playing || typeof this.element === 'undefined')
            return;
        Readiant.windowContext.setTimeout(async () => {
            if (typeof this.element === 'undefined')
                return;
            const element = this.element;
            element.currentTime = time;
            element.onended = () => {
                this.startTimerForNextPage();
            };
            element.onplaying = () => {
                this.onProgress();
            };
            element.playbackRate = this.playbackRate;
            await element.play();
        }, 10);
        if (this.progressValue !== null)
            this.progressValue.style.width = `${String(Math.min(Math.max(0, time / this.element.duration), 1) * 100)}%`;
    }
    static async onPlaybackRateChange(event) {
        const input = event.currentTarget;
        this.playbackRate = parseFloat(input.value);
        if (this.playbackRate < 0.5)
            this.playbackRate = 0.5;
        if (this.playbackRate > 1.6)
            this.playbackRate = 1.6;
        if (typeof this.element !== 'undefined')
            this.element.playbackRate = this.playbackRate;
        for (const playbackRateInput of this.playbackRateInputs)
            playbackRateInput.value = String(this.playbackRate);
        if (this.playbackRateCurrent !== null)
            this.playbackRateCurrent.textContent = `${String(this.playbackRate * 100)}%`;
        eventLogger({
            type: LogType.ChangePlaybackRate,
            playbackRate: this.playbackRate,
        });
    }
    static onProgress() {
        if (!this.playing ||
            typeof this.element === 'undefined' ||
            typeof this.provider === 'undefined')
            return;
        const currentTime = this.element.currentTime;
        const playbackTime = Math.floor(currentTime * 1000);
        const highestPlayback = this.playback.get(Navigation.currentPage);
        const highest = typeof highestPlayback !== 'undefined' ? highestPlayback : 0;
        const percentage = currentTime / this.element.duration;
        if (percentage > highest)
            this.playback.set(Navigation.currentPage, percentage);
        if (this.progressValue !== null)
            this.progressValue.style.width = `${String(percentage * 100)}%`;
        this.show(this.provider, playbackTime);
        if (Bar.readStop === 2 &&
            typeof this.endSentenceTime !== 'undefined' &&
            this.endSentenceTime - playbackTime < 100) {
            if (typeof this.startSentenceTime !== 'undefined')
                this.startTime = this.startSentenceTime / 1000;
            this.pause().catch((e) => {
                throw e;
            });
        }
        else if (Bar.readStop === 3 &&
            typeof this.endWordTime !== 'undefined' &&
            this.endWordTime - playbackTime < 100) {
            if (typeof this.startWordTime !== 'undefined')
                this.startTime = this.startWordTime / 1000;
            this.pause().catch((e) => {
                throw e;
            });
        }
        else
            Readiant.windowContext.setTimeout(() => {
                this.onProgress();
            }, 10);
    }
    static async onSpeechMark(data) {
        if (typeof this.provider === 'undefined')
            return;
        if (typeof data.speechMark !== 'undefined') {
            let previousTime = 0;
            const speechMark = data.speechMark;
            Storage.storeSyntax(`${this.provider}__${String(data.page)}`, speechMark.map((speechMark) => {
                if (speechMark.time < previousTime)
                    speechMark.time = previousTime;
                else
                    previousTime = speechMark.time;
                return speechMark;
            }));
            const position = Navigation.currentPages.find((currentPage) => currentPage.page === data.page);
            if (typeof position === 'undefined')
                return;
            this.addSpeechMarksToPage(position.position, data.speechMark);
        }
    }
    static async pause() {
        if (typeof this.element === 'undefined')
            return;
        this.element.pause();
        this.playingState = AudioPlayingState.Paused;
        if (this.pauseButton !== null &&
            !this.pauseButton.classList.contains(CLASS_HIDDEN)) {
            this.pauseButton.classList.add(CLASS_HIDDEN);
            this.playButton?.classList.remove(CLASS_HIDDEN);
        }
        if (this.stopButton !== null &&
            !this.stopButton.classList.contains(CLASS_HIDDEN)) {
            this.stopButton.classList.add(CLASS_HIDDEN);
            this.startButton?.classList.remove(CLASS_HIDDEN);
        }
        eventLogger({
            type: LogType.AudioPause,
        });
    }
    static async play(force = false) {
        if (typeof this.element === 'undefined')
            this.element = Readiant.documentContext.createElement('audio');
        const position = Navigation.currentPages.find((currentPage) => currentPage.page === Navigation.currentPage);
        if (typeof position === 'undefined')
            return;
        const startSide = position.position;
        const startTime = this.startTime;
        if (force ||
            this.element.src === '' ||
            Navigation.currentPage !== this.playingPage)
            await this.start(typeof startTime !== 'undefined' ? startTime : 0, startSide);
        else {
            Readiant.windowContext.setTimeout(async () => {
                if (typeof this.element === 'undefined')
                    return;
                const element = this.element;
                if (typeof startTime !== 'undefined')
                    element.currentTime = startTime;
                await element.play();
            }, 10);
            this.playingState = AudioPlayingState.Playing;
        }
        this.startTime = undefined;
        if (this.startButton !== null &&
            !this.startButton.classList.contains(CLASS_HIDDEN))
            this.startButton.classList.add(CLASS_HIDDEN);
        if (this.stopButton !== null &&
            this.stopButton.classList.contains(CLASS_HIDDEN))
            this.stopButton.classList.remove(CLASS_HIDDEN);
        if (this.playButton !== null &&
            !this.playButton.classList.contains(CLASS_HIDDEN)) {
            this.playButton.classList.add(CLASS_HIDDEN);
            this.pauseButton?.classList.remove(CLASS_HIDDEN);
        }
        eventLogger({
            type: LogType.AudioPlay,
        });
    }
    static remove() {
        if (this.settingsButtons !== null)
            for (const settingsButton of this.settingsButtons)
                settingsButton.remove();
        if (this.startButton !== null)
            this.startButton.remove();
        if (this.stopButton !== null)
            this.stopButton.remove();
        if (this.countdownSettings !== null)
            this.countdownSettings.remove();
        if (this.pauseButton !== null)
            this.pauseButton.remove();
        if (this.playButton !== null)
            this.playButton.remove();
        if (this.playbackRateSettings !== null)
            this.playbackRateSettings.remove();
        if (this.playbackRateTopSettings !== null)
            this.playbackRateTopSettings.remove();
        if (this.progressElement !== null)
            this.progressElement.remove();
        if (this.providersSettings !== null)
            this.providersSettings.remove();
    }
    static resetEndSentenceTime() {
        this.endSentenceTime = undefined;
    }
    static resetStartSentenceTime() {
        this.startSentenceTime = undefined;
    }
    static resetEndWordTime() {
        this.endWordTime = undefined;
    }
    static resetStartWordTime() {
        this.startWordTime = undefined;
    }
    static async seek(event) {
        if (typeof this.element === 'undefined' || event.currentTarget === null)
            return;
        const element = event.currentTarget.getBoundingClientRect();
        const percentage = Math.min(Math.max(0, (event.clientX - element.left) / element.width), 1);
        await this.start(percentage * this.element.duration);
    }
    static setEndSentenceTime(time) {
        this.endSentenceTime = time;
    }
    static setStartSentenceTime(time) {
        this.startSentenceTime = time;
    }
    static setEndWordTime(time) {
        this.endWordTime = time;
    }
    static setStartWordTime(time) {
        this.startWordTime = time;
    }
    static setLineHighlighterType(event) {
        let title;
        let value;
        if (typeof event === 'number') {
            event = Math.abs(event);
            if (event < 1)
                event = 1;
            if (event > 3)
                event = 3;
            const element = Readiant.root.querySelector(`[data-audio-line-highlighter="${String(event)}"]`);
            if (element !== null) {
                element.click();
                title = String(element.getAttribute('data-title'));
            }
            else
                title = '';
            value = event;
        }
        else {
            const input = event.currentTarget;
            title = String(input.getAttribute('data-title'));
            value = Number(input.getAttribute('data-audio-line-highlighter'));
            if (value < 1)
                value = 1;
            if (value > 3)
                value = 3;
        }
        this.lineHighlighter = value;
        if (this.lineHighlighterCurrent !== null)
            this.lineHighlighterCurrent.textContent = title;
        for (const lineHighlighterButton of this.lineHighlighterButtons) {
            lineHighlighterButton.classList.remove(CLASS_BLOCK_ACTIVE);
            const currentLineHighlighterType = lineHighlighterButton.getAttribute('data-audio-line-highlighter');
            if (Number(currentLineHighlighterType) === value)
                lineHighlighterButton.classList.add(CLASS_BLOCK_ACTIVE);
        }
        eventLogger({
            type: LogType.ChangeAudioHighlighting,
            audioHighlightingLevel: value,
        });
    }
    static setPlaybackRate(playbackRate) {
        if (playbackRate < 0.5)
            playbackRate = 0.5;
        if (playbackRate > 1.6)
            playbackRate = 1.6;
        this.playbackRate = playbackRate;
        for (const playbackRateInput of this.playbackRateInputs)
            playbackRateInput.value = String(playbackRate);
        if (this.playbackRateCurrent !== null)
            this.playbackRateCurrent.textContent = `${String(this.playbackRate * 100)}%`;
    }
    static setStartTime(page, time) {
        time = time / 1000;
        const position = Navigation.currentPages.find((currentPage) => currentPage.page === page);
        if (typeof position === 'undefined')
            return;
        this.resetStartSentenceTime();
        this.resetStartWordTime();
        if (Navigation.currentPage !== position.page)
            Navigation.currentPage = position.page;
        if (this.playing)
            this.start(time, position.position).catch((e) => {
                throw e;
            });
        else
            this.startTime = time;
    }
    static setSubtitlesType(event) {
        let title;
        let value;
        if (typeof event === 'number') {
            event = Math.abs(event);
            if (event < 1)
                event = 1;
            if (event > 3)
                event = 3;
            const element = Readiant.root.querySelector(`[data-subtitles="${String(event)}"]`);
            if (element !== null) {
                element.click();
                title = String(element.getAttribute('data-title'));
            }
            else
                title = '';
            value = event;
        }
        else {
            const input = event.currentTarget;
            title = String(input.getAttribute('data-title'));
            value = Number(input.getAttribute('data-subtitles'));
            if (value < 1)
                value = 1;
            if (value > 3)
                value = 3;
        }
        switch (value) {
            case 1:
                Bar.syntaxElement?.classList.remove('words-hidden');
                Bar.bar.classList.remove(CLASS_VISUALLY_HIDDEN);
                Bar.syntaxElement?.classList.remove(CLASS_VISUALLY_HIDDEN);
                this.subtitlesFontSizeSettings?.classList.remove(CLASS_HIDDEN);
                break;
            case 2:
                Bar.syntaxElement?.classList.add('words-hidden');
                Bar.bar.classList.remove(CLASS_VISUALLY_HIDDEN);
                Bar.syntaxElement?.classList.remove(CLASS_VISUALLY_HIDDEN);
                this.subtitlesFontSizeSettings?.classList.remove(CLASS_HIDDEN);
                break;
            case 3:
                Bar.syntaxElement?.classList.remove('words-hidden');
                Bar.bar.classList.add(CLASS_VISUALLY_HIDDEN);
                Bar.syntaxElement?.classList.add(CLASS_VISUALLY_HIDDEN);
                this.subtitlesFontSizeSettings?.classList.add(CLASS_HIDDEN);
                break;
        }
        this.subtitles = value;
        if (this.subtitlesCurrent !== null)
            this.subtitlesCurrent.textContent = title;
        for (const subtitlesButton of this.subtitlesButtons) {
            subtitlesButton.classList.remove(CLASS_BLOCK_ACTIVE);
            const currentSubtitlesType = subtitlesButton.getAttribute('data-subtitles');
            if (Number(currentSubtitlesType) === value)
                subtitlesButton.classList.add(CLASS_BLOCK_ACTIVE);
        }
        eventLogger({
            type: LogType.ChangeSubtitle,
            subtitleLevel: value,
        });
    }
    static shortcut(event) {
        const focus = Readiant.root.activeElement;
        if (focus !== null &&
            (focus.tagName === 'BUTTON' || focus.tagName === 'INPUT'))
            return;
        let code;
        if (typeof event.key !== 'undefined')
            code = event.key;
        else if (event.keyIdentifier !==
            undefined)
            code = event.keyIdentifier;
        else
            return;
        if (code === 'Spacebar' || code === ' ') {
            event.preventDefault();
            if (this.playingState === AudioPlayingState.Playing)
                this.pause().catch((e) => {
                    throw e;
                });
            else
                this.play(this.playingState !== AudioPlayingState.Paused).catch((e) => {
                    throw e;
                });
            return;
        }
    }
    static show(provider, playbackTime) {
        const position = Navigation.currentPages.find((currentPage) => currentPage.page === Navigation.currentPage);
        if (typeof position === 'undefined')
            return;
        if (!Bar.showing)
            Bar.toggle();
        if (!Storage.hasSyntax(`${provider}__${String(Navigation.currentPage)}`))
            return;
        Bar.empty();
        const syntax = Storage.getSyntax(`${provider}__${String(Navigation.currentPage)}`);
        const sentenceStart = syntax.filter((syntax) => syntax.time <= playbackTime && syntax.type === SpeechMarkType.Sentence);
        if (sentenceStart.length > 0)
            this.setStartSentenceTime(sentenceStart[sentenceStart.length - 1].time);
        else
            this.resetStartSentenceTime();
        const sentenceEnd = syntax.find((syntax) => syntax.time > playbackTime && syntax.type === SpeechMarkType.Sentence);
        if (typeof sentenceEnd !== 'undefined')
            this.setEndSentenceTime(sentenceEnd.time);
        else
            this.resetEndSentenceTime();
        const wordStart = syntax.filter((syntax) => syntax.time <= playbackTime && syntax.type === SpeechMarkType.Word);
        if (wordStart.length > 0)
            this.setStartWordTime(wordStart[wordStart.length - 1].time);
        else
            this.resetStartWordTime();
        const wordEnd = syntax.find((syntax) => syntax.time > playbackTime && syntax.type === SpeechMarkType.Word);
        if (typeof wordEnd !== 'undefined')
            this.setEndWordTime(wordEnd.time);
        else
            this.resetEndWordTime();
        this.update(syntax, playbackTime, position.position);
    }
    static async start(time, side) {
        if (typeof this.element === 'undefined' ||
            typeof this.provider === 'undefined')
            return;
        if (this.playing)
            this.stopCurrentAudio();
        this.playingState = AudioPlayingState.Playing;
        const position = typeof side === 'undefined'
            ? Navigation.currentPages[0]
            : Navigation.currentPages.find((currentPage) => currentPage.position === side);
        if (typeof position === 'undefined')
            return;
        if (Navigation.currentPage !== position.page)
            Navigation.currentPage = position.page;
        if (!this.availableAudio[this.provider].includes(Navigation.currentPage)) {
            this.startTimerForNextPage();
            return;
        }
        if (!Storage.hasAudio(`${this.provider}__${String(Navigation.currentPage)}`)) {
            this.fetchAudio(this.provider, Navigation.currentPage, time);
            return;
        }
        const audio = Storage.getAudio(`${this.provider}__${String(Navigation.currentPage)}`);
        if (audio.length === 0) {
            this.startTimerForNextPage();
            return;
        }
        const src = window.URL.createObjectURL(new Blob([audio.buffer], {
            type: 'audio/mpeg',
        }));
        this.playingPage = Navigation.currentPage;
        this.element.src = src;
        this.element.oncanplaythrough = () => this.onCanPlayThrough(time);
        this.element.load();
    }
    static startTimerForNextPage(seconds = 3) {
        if (!Navigation.isAtLastPage()) {
            if (Navigation.currentPage % 2 === 0 &&
                Orientation.mode === OrientationMode.Landscape)
                Navigation.nextPage();
            else {
                if (this.timerType === 3)
                    return;
                if (this.timerType === 1) {
                    this.runningTimer = true;
                    Readiant.windowContext.setTimeout(() => {
                        if (!this.runningTimer)
                            return;
                        if (seconds <= 0) {
                            if (this.countdownElement !== null)
                                this.countdownElement.classList.add(CLASS_HIDDEN);
                            this.stopTimer();
                            Navigation.nextPage();
                        }
                        else {
                            if (this.countdownElement !== null) {
                                this.countdownElement.classList.remove(CLASS_HIDDEN);
                                this.countdownElement.innerHTML = String(seconds);
                            }
                            this.startTimerForNextPage(seconds - 1);
                        }
                    }, 1000);
                }
                else
                    Navigation.nextPage();
            }
        }
    }
    static async stop() {
        this.stopCurrentAudio();
        this.stopTimer();
        this.playingState = AudioPlayingState.Stopped;
        if (this.startButton !== null &&
            this.startButton.classList.contains(CLASS_HIDDEN))
            this.startButton.classList.remove(CLASS_HIDDEN);
        if (this.stopButton !== null &&
            !this.stopButton.classList.contains(CLASS_HIDDEN))
            this.stopButton.classList.add(CLASS_HIDDEN);
        if (this.pauseButton !== null &&
            !this.pauseButton.classList.contains(CLASS_HIDDEN)) {
            this.pauseButton.classList.add(CLASS_HIDDEN);
            this.playButton?.classList.remove(CLASS_HIDDEN);
        }
        Bar.empty();
        Builder.stopHighlightingSyntax();
    }
    static stopCurrentAudio() {
        if (typeof this.element === 'undefined')
            return;
        this.element.removeAttribute('src');
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        this.element.oncanplaythrough = () => { };
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        this.element.onended = () => { };
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        this.element.onplaying = () => { };
        this.element.pause();
        this.element.currentTime = 0;
        if (this.progressValue !== null)
            this.progressValue.style.width = `0`;
    }
    static stopTimer() {
        this.runningTimer = false;
        this.countdownElement?.classList.add(CLASS_HIDDEN);
    }
    static async switchAudio(provider) {
        if (this.playingState === AudioPlayingState.Playing)
            await this.pause();
        this.stopCurrentAudio();
        this.provider = provider;
        this.fetchSpeechMarks();
        if (this.playingState === AudioPlayingState.Playing)
            await this.play();
    }
    static update(syntax, playbackTime, side) {
        if (typeof syntax === 'undefined')
            return;
        const sentences = syntax.filter((s) => playbackTime > s.time && s.type === SpeechMarkType.Sentence);
        const sentence = sentences[sentences.length - 1];
        const wordsInSentence = syntax
            .slice(syntax.indexOf(sentence) + 1)
            .filter((item) => item.type === SpeechMarkType.Word && item.value !== '');
        const words = wordsInSentence.filter((s) => playbackTime >= s.time && s.type === SpeechMarkType.Word);
        const word = words[words.length - 1];
        Builder.stopHighlightingSyntax();
        if (typeof sentence === 'undefined' || typeof word === 'undefined')
            Bar.empty();
        else {
            const wordIndexInSyntax = syntax.indexOf(word);
            try {
                Builder.startHighlightingSyntax(syntax, this.lineHighlighter, wordIndexInSyntax, side);
            }
            catch (_) {
                Builder.stopHighlightingSyntax();
            }
            const wordStart = this.wordStart(sentence.value, wordsInSentence.map((word) => word.value), wordsInSentence.indexOf(word));
            const wordEnd = this.wordEnd(sentence.value, word.value, wordStart);
            if (Text.isTranslating)
                Text.translate(sentence.value);
            else
                Bar.add(Bar.readStop === 3
                    ? `<span class="rdnt__bottom-bar__word--highlight">
              ${sentence.value.substring(wordStart, wordEnd)}
                </span>`
                    : `${sentence.value
                        .substring(0, wordStart)
                        .split(' ')
                        .filter((word) => word !== '')
                        .map((word) => `<span class="rdnt__bottom-bar__word">${word}</span>`)
                        .join('')}<span class="rdnt__bottom-bar__word rdnt__bottom-bar__word--highlight">${sentence.value.substring(wordStart, wordEnd)}</span>${sentence.value
                        .substring(wordEnd)
                        .split(' ')
                        .filter((word) => word !== '')
                        .map((word) => `<span class="rdnt__bottom-bar__word">${word}</span>`)
                        .join('')}`, true);
        }
    }
    static wordEnd(sentence, word, wordStart) {
        let sentenceIndex = wordStart;
        for (const letter of word) {
            while (sentence[sentenceIndex] !== letter) {
                if (sentenceIndex >= sentence.length)
                    return sentenceIndex;
                sentenceIndex++;
            }
            sentenceIndex++;
        }
        return sentenceIndex;
    }
    static wordStart(sentence, wordsInSentence, index) {
        let sentenceIndex = 0;
        for (let wordIndex = 0; wordIndex < wordsInSentence.length; wordIndex++) {
            const word = wordsInSentence[wordIndex];
            for (const letter of word) {
                while (sentence[sentenceIndex] !== letter) {
                    if (sentenceIndex >= sentence.length)
                        return sentenceIndex;
                    sentenceIndex++;
                }
                if (wordIndex === index)
                    return sentenceIndex;
            }
            sentenceIndex++;
        }
        Readiant.errorHandler(new Error('Could not find word'));
        return 0;
    }
}
Audio.providers = new Set();
Audio.lineHighlighter = 1;
Audio.playbackRate = 1;
Audio.playingPage = 0;
Audio.runningTimer = false;
Audio.subtitles = 1;
Audio.playback = new Map();
Audio.playingState = AudioPlayingState.Initial;
Audio.timerType = 1;
