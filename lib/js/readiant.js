import { ClientActionType, ServerActionType, DocumentType, } from './consts.js';
import { A11y } from './a11y.js';
import { Annotations } from './annotations.js';
import { Audio } from './audio.js';
import { Bar } from './bar.js';
import { ReadiantElement } from './base.js';
import { Builder } from './builder.js';
import { Chapters } from './chapters.js';
import { Colorblind } from './colorblind.js';
import { CLASS_BUTTON_ACTIVE, CLASS_HIDDEN, CLASS_NAVIGATION_NEXT_ACTIVE, CLASS_PREVIEW, AcceptedTypes, Container, ContentType, Direction, Fn, OrientationMode, PagePosition, } from './consts.js';
import { connectionInfo, orientation, webP } from './detection.js';
import { isOffline } from './env.js';
import { eventLogger } from './eventLogger.js';
import { Fonts } from './fonts.js';
import { Fullscreen } from './fullscreen.js';
import { ImageQuality } from './imageQuality.js';
import { Issues } from './issues.js';
import { LineHighlighter } from './lineHighlighter.js';
import { EventMapper, LogType } from './log.js';
import { Navigation } from './navigation.js';
import { Orientation } from './orientation.js';
import { Print } from './print.js';
import { ScreenMode } from './screenMode.js';
import { Search } from './search.js';
import { Storage } from './storage.js';
import { Stream } from './stream.js';
import { Text } from './text.js';
import { TextMode } from './textMode.js';
import { Zoom } from './zoom.js';
export class Readiant {
    static get menuButtons() {
        return Readiant.root.querySelector('.rdnt__menu__buttons');
    }
    static get pageNumber() {
        return Readiant.root.querySelector('.rdnt__page-number');
    }
    static close(containers) {
        if (typeof containers === 'undefined')
            containers = [
                Container.Annotations,
                Container.BarSettings,
                Container.Chapters,
                Container.ScreenSettings,
                Container.Search,
                Container.Settings,
            ];
        for (const container of containers) {
            const element = Readiant.root.querySelector(`.${container}`);
            if (element !== null && !element.classList.contains(CLASS_HIDDEN))
                this.toggle(container);
        }
        const rootNode = Readiant.root.getRootNode();
        if (rootNode instanceof Document) {
            rootNode.documentElement.removeEventListener('click', this.closeOnClick);
            rootNode.documentElement.removeEventListener('keydown', this.closeOnEscape);
        }
        else {
            rootNode.host.removeEventListener('click', this.closeOnClick);
            rootNode.host.removeEventListener('keydown', this.closeOnEscape);
        }
    }
    static closeOnEscape(event) {
        if (event.key === 'Escape') {
            Readiant.close();
        }
    }
    static closeOnClick(event) {
        const containers = [
            Container.Annotations,
            Container.BarSettings,
            Container.Chapters,
            Container.ScreenSettings,
            Container.Search,
            Container.Settings,
            'rdnt__bottom-bar-settings-button',
            'rdnt__button',
            'rdnt__navigation',
        ];
        const path = event.composedPath().filter((element) => typeof element.classList !== 'undefined');
        if (path.filter((value) => containers.some((container) => value.classList.contains(container))).length > 0)
            return;
        Readiant.close();
    }
    static errorHandler(message) {
        if (ReadiantElement.instance) {
            console.error('[Readiant Error]', message);
            ReadiantElement.dispatchEvent('error', {
                message: String(message),
                type: 'readiant-error',
            });
        }
        else {
            const div = document.createElement('div');
            div.setAttribute('class', 'rdnt__error');
            const p = document.createElement('p');
            p.setAttribute('class', 'rdnt__error-message');
            p.textContent = String(message);
            div.appendChild(p);
            document.body.appendChild(div);
        }
    }
    static set localization(locale) {
        switch (locale.toLowerCase()) {
            case 'en':
            case 'en_ca':
            case 'en_gb':
            case 'en_us':
            case 'en-ca':
            case 'en-gb':
            case 'en-us': {
                this.locale = 'en';
                break;
            }
            case 'nl':
            case 'nl-nl':
            case 'nl_nl': {
                this.locale = 'nl';
                break;
            }
            case 'be':
            case 'nl_be':
            case 'nl-be': {
                this.locale = 'be';
                break;
            }
        }
    }
    static toggle(container) {
        const button = Readiant.root.querySelector(`.${container}-button`);
        const element = Readiant.root.querySelector(`.${container}`);
        const nextButton = Readiant.root.querySelector('.rdnt__navigation--next');
        if (element.classList.contains(CLASS_HIDDEN))
            this.close();
        element.classList.toggle(CLASS_HIDDEN);
        nextButton.classList.toggle(CLASS_NAVIGATION_NEXT_ACTIVE);
        if (element.classList.contains(CLASS_HIDDEN)) {
            button.classList.remove(CLASS_BUTTON_ACTIVE);
            button.setAttribute('aria-expanded', 'false');
        }
        else {
            button.classList.add(CLASS_BUTTON_ACTIVE);
            button.setAttribute('aria-expanded', 'true');
        }
        if (!element.classList.contains(CLASS_HIDDEN)) {
            const rootNode = Readiant.root.getRootNode();
            if (rootNode instanceof Document) {
                rootNode.documentElement.addEventListener('click', this.closeOnClick);
                rootNode.documentElement.addEventListener('keydown', this.closeOnEscape);
            }
            else {
                rootNode.host.addEventListener('click', this.closeOnClick);
                rootNode.host.addEventListener('keydown', this.closeOnEscape);
            }
            const firstMenuItem = element.querySelector('[role="menuitem"]');
            if (firstMenuItem !== null)
                firstMenuItem.focus();
        }
    }
    static toggleMenu() {
        this.menuButtons?.classList.toggle(CLASS_HIDDEN);
        this.pageNumber?.classList.toggle(CLASS_HIDDEN);
    }
    constructor(root) {
        this.advancedSettings = Readiant.root.querySelectorAll('.rdnt__advanced-settings');
        this.audioButton = Readiant.root.querySelector('.rdnt__start');
        this.closeScreenSettingsButton = Readiant.root.querySelector('.rdnt__close-screen-settings');
        this.closeSettingsButton = Readiant.root.querySelector('.rdnt__close-settings');
        this.moreButton = Readiant.root.querySelector('.rdnt__more');
        this.printButton = Readiant.root.querySelector('.rdnt__print-button');
        this.screenSettingsButton = Readiant.root.querySelector('.rdnt__screen-settings-button');
        this.settingsButton = Readiant.root.querySelector('.rdnt__settings-button');
        this.toggleButtons = Readiant.root.querySelectorAll('.rdnt__block-toggle');
        this.accepted = {
            audioHighlightingLevel: AcceptedTypes.Number,
            colorBlindFilter: AcceptedTypes.String,
            concurrencyLimit: AcceptedTypes.Number,
            countdownLevel: AcceptedTypes.Number,
            disable: AcceptedTypes.StringArray,
            font: AcceptedTypes.String,
            fontSize: AcceptedTypes.Number,
            id: AcceptedTypes.String,
            imageQualityLevel: AcceptedTypes.Number,
            letterSpacing: AcceptedTypes.Number,
            lineHeight: AcceptedTypes.Number,
            locale: AcceptedTypes.String,
            localeTranslations: AcceptedTypes.String,
            orientation: AcceptedTypes.String,
            page: AcceptedTypes.Number,
            playbackRate: AcceptedTypes.Number,
            readStopLevel: AcceptedTypes.Number,
            screenModeLevel: AcceptedTypes.Number,
            singlePage: AcceptedTypes.Boolean,
            subtitleFontSize: AcceptedTypes.Number,
            subtitleLevel: AcceptedTypes.Number,
            textModeLevel: AcceptedTypes.Number,
            touch: AcceptedTypes.Boolean,
            url: AcceptedTypes.String,
            useSignedUrls: AcceptedTypes.Boolean,
            wordSpacing: AcceptedTypes.Number,
            zoomLevel: AcceptedTypes.Number,
        };
        this.options = {
            disable: [],
            orientation,
            page: 1,
        };
        this.connected = false;
        this.fonts = {};
        if (root) {
            Readiant.root = root;
        }
        if (isOffline) {
            this.connect().catch((e) => {
                Readiant.errorHandler(e);
            });
        }
        else {
            if (process.env.ENV !== 'LOCAL' && window.self === window.top)
                Readiant.errorHandler(new Error('Only supports embedded documents.'));
            else {
                if (typeof Storage.data.code === 'undefined')
                    Readiant.errorHandler(new Error('Missing parameter UUID'));
                else {
                    this.connect()
                        .then(() => {
                        window.addEventListener('message', (event) => this.parentMessageHandler(event));
                    })
                        .catch((e) => {
                        Readiant.errorHandler(e);
                    });
                }
            }
        }
    }
    async connect() {
        this.options = { ...this.options, ...this.parse() };
        if (this.options.singlePage === true) {
            document.body.classList.add(CLASS_PREVIEW);
            this.options.orientation = OrientationMode.Portrait;
            Readiant.preview = true;
        }
        Orientation.register(this.options.orientation);
        if (isOffline)
            await this.populate();
        else if (Storage.data.stored !== Storage.data.code) {
            const supportsWebP = await webP();
            Stream.setMessageHandler(ServerActionType.Connected, () => {
                Stream.backoff = [1000, 2500, 5000, 10000];
                if (!this.connected) {
                    Stream.setMessageHandler(ServerActionType.PDFDocumentInfo, async (data) => this.connectPDF(data));
                    Stream.setMessageHandler(ServerActionType.EPUBDocumentInfo, async (data) => this.connectEPUB(data));
                }
                Stream.send({
                    connection: connectionInfo().connection,
                    id: this.options.id,
                    page: this.options.page,
                    type: ClientActionType.ClientInfo,
                    webP: supportsWebP,
                });
            });
            await Stream.setup();
        }
    }
    async populate() {
        if (typeof this.options.url === 'undefined' &&
            typeof this.options.id === 'undefined') {
            Readiant.errorHandler(new Error('Missing required parameters: document-id or url'));
            return;
        }
        let indexUrl;
        if (this.options.useSignedUrls === true &&
            typeof this.options.url !== 'undefined') {
            indexUrl = this.options.url;
            if (typeof this.options.id === 'undefined') {
                this.options.id = `doc-${String(Date.now())}`;
            }
        }
        else {
            if (typeof this.options.id === 'undefined') {
                Readiant.errorHandler(new Error('Missing ID parameter.'));
                return;
            }
            if (typeof this.options.url === 'undefined')
                this.options.url = `./docs/${this.options.id}/`;
            indexUrl = `${this.options.url}index.json`;
        }
        const response = await fetch(indexUrl, {
            mode: 'cors',
            credentials: 'omit',
            headers: {
                Accept: 'application/json, audio/mpeg, image/*, */*',
            },
        });
        if (!response.ok) {
            Readiant.errorHandler(new Error(`Failed to load document: ${String(response.status)} ${response.statusText}`));
            return;
        }
        let index;
        try {
            index = (await response.json());
        }
        catch (error) {
            Readiant.errorHandler(new Error(`Invalid document format: ${error instanceof Error ? error.message : String(error)}`));
            return;
        }
        if (typeof index.blueprints !== 'undefined')
            for (const data of index.blueprints) {
                Storage.storePage(data.page, {
                    blueprint: Builder.pageGroup(data.blueprint.map((blueprint) => `rdnt.${blueprint}`)),
                    elements: data.blueprint.map((blueprint) => `rdnt.${blueprint}`),
                    rotation: typeof data.rotation !== 'undefined' ? data.rotation : 0,
                    viewBox: data.viewBox,
                });
            }
        const concurrencyLimit = typeof this.options.concurrencyLimit === 'number' &&
            this.options.concurrencyLimit > 0
            ? this.options.concurrencyLimit
            : 6;
        await this.fetchFilesWithConcurrencyLimit(index.files, index.imageInfo, concurrencyLimit);
        if (index.type === DocumentType.ePub)
            await this.connectEPUB({
                chapters: index.chapters,
                direction: index.direction,
                document: this.options.id,
                indexes: index.indexes,
                pageCounts: index.pageCounts,
                tableOfContents: '',
                translations: {},
                type: ServerActionType.EPUBDocumentInfo,
            });
        else
            await this.connectPDF({
                availableAudio: index.availableAudio,
                chapters: index.chapters,
                document: this.options.id,
                inverted: index.inverted,
                offset: index.offset,
                pages: Array.from({ length: index.pages }, (_, i) => i + 1),
                rtl: index.rtl,
                spread: index.spread,
                translations: {},
                type: ServerActionType.PDFDocumentInfo,
            });
    }
    async fetchFilesWithConcurrencyLimit(files, imageInfo, limit) {
        const queue = [...files];
        const workers = [];
        const processFile = async (file) => {
            const isFullUrl = file.startsWith('http://') || file.startsWith('https://');
            const fileUrl = isFullUrl ? file : `${String(this.options.url)}${file}`;
            const filePath = isFullUrl ? new URL(file).pathname : file;
            const [...parts] = filePath.split('/');
            const filename = String(parts.pop());
            const [...segments] = filename.split('.');
            const fileExtension = String(segments.pop());
            const fileNameWithoutExtension = segments.join('.');
            const response = await fetch(fileUrl, {
                mode: 'cors',
                credentials: 'omit',
                headers: {
                    Accept: 'application/json, audio/mpeg, image/*, */*',
                },
            });
            if (filePath.startsWith('audio/') || filePath.includes('/audio/')) {
                const provider = parts[parts.length - 1];
                if (fileExtension === 'mp3') {
                    const audio = await response.blob();
                    Storage.storeAudio(`${provider}__${fileNameWithoutExtension}`, new Uint8Array(await audio.arrayBuffer()));
                }
                else if (fileExtension === 'json') {
                    const syntax = (await response.json());
                    Storage.storeSyntax(`${provider}__${fileNameWithoutExtension}`, syntax);
                }
                return;
            }
            if (filePath.startsWith('elements/') || filePath.includes('/elements/')) {
                const elements = await this.replaceImageURLs((await response.json()), imageInfo);
                for (const [id, element] of elements)
                    Storage.storeElement(id, element);
                return;
            }
            if (filePath.startsWith('textContent/') ||
                filePath.includes('/textContent/')) {
                const textContent = (await response.json());
                Storage.storeText(Number(filename), {
                    content: textContent.content.map((a) => ({
                        ...a,
                        content: Navigation.unescapeHTMLNamedEntities(a.content),
                        transform: [
                            a.transform[0],
                            a.transform[1],
                            a.transform[2],
                            a.transform[3],
                            a.transform[4],
                            a.transform[5] + a.fontSize * 0.8,
                        ],
                    })),
                    sentences: textContent.sentences,
                });
                return;
            }
            if (filePath.startsWith('definitions') ||
                filePath.includes('/definitions')) {
                const elements = (await response.json());
                await Builder.definitions(await this.replaceImageURLs(elements, imageInfo));
                return;
            }
            if (filePath.startsWith('stylesheet') ||
                filePath.includes('/stylesheet')) {
                const css = await response.text();
                this.stylesheetText = css;
                return;
            }
            if (filePath.startsWith('fonts/') || filePath.includes('/fonts/')) {
                const fontName = fileNameWithoutExtension;
                if (typeof this.fonts[fontName] === 'undefined')
                    this.fonts[fontName] = {};
                const fontUrl = isFullUrl ? file : `${String(this.options.url)}${file}`;
                this.fonts[fontName][fileExtension] = fontUrl;
                return;
            }
        };
        const worker = async () => {
            while (queue.length > 0) {
                const file = queue.shift();
                if (typeof file === 'string')
                    await processFile(file);
            }
        };
        for (let i = 0; i < Math.min(limit, files.length); i++)
            workers.push(worker());
        await Promise.all(workers);
    }
    async connectEPUB({ chapters, direction, document, indexes, pageCounts, translations, }) {
        if (this.connected)
            return;
        const directionFromString = (s) => s === 'rtl' ? Direction.Rtl : Direction.Ltr;
        Readiant.type = ContentType.HTML;
        Builder.register();
        Builder.setDirection(directionFromString(direction));
        Builder.setStylesheet(document, this.fonts, this.stylesheetText);
        Navigation.register(this.options.page, [], pageCounts, indexes, directionFromString(direction));
        await this.register({}, chapters, translations);
    }
    async connectPDF({ availableAudio, chapters, document, inverted, offset, pages, rtl, spread, translations, }) {
        if (this.connected)
            return;
        Readiant.type = ContentType.SVG;
        Builder.register();
        Builder.setDirection(rtl ? Direction.Rtl : Direction.Ltr);
        Builder.setStylesheet(document, this.fonts, this.stylesheetText);
        Navigation.register(this.options.page, pages, [], [], inverted ? Direction.Rtl : Direction.Ltr, offset, spread);
        await this.register(availableAudio, chapters, translations);
    }
    async register(availableAudio, documentChapters, translations) {
        this.connected = true;
        this.closeScreenSettingsButton?.addEventListener('click', () => {
            Readiant.close([Container.ScreenSettings]);
        });
        this.closeSettingsButton?.addEventListener('click', () => {
            Readiant.close([Container.Settings]);
        });
        this.moreButton?.addEventListener('click', () => {
            Readiant.toggleMenu();
        });
        for (const toggleButton of this.toggleButtons)
            toggleButton.parentNode.addEventListener('click', (event) => {
                this.toggleBlock(event);
            });
        this.screenSettingsButton?.addEventListener('click', () => {
            Readiant.toggle(Container.ScreenSettings);
        });
        this.settingsButton?.addEventListener('click', () => {
            Readiant.toggle(Container.Settings);
        });
        Bar.register();
        Colorblind.register();
        Fonts.register();
        Fullscreen.register();
        ImageQuality.register();
        Issues.register();
        LineHighlighter.register();
        ScreenMode.register();
        TextMode.register();
        if (Readiant.type === ContentType.SVG) {
            Text.register(translations, this.options.localeTranslations);
            if (typeof this.options.readStopLevel !== 'undefined')
                Bar.changeReadStop(this.options.readStopLevel);
            if (typeof this.options.textModeLevel !== 'undefined')
                TextMode.change(this.options.textModeLevel);
        }
        Zoom.register();
        if (typeof this.options.colorBlindFilter !== 'undefined') {
            const colorBlindFilter = [...EventMapper].find(([_k, v]) => v === this.options.colorBlindFilter);
            if (typeof colorBlindFilter !== 'undefined')
                Colorblind.change(colorBlindFilter[0]);
        }
        if (typeof this.options.font !== 'undefined') {
            const font = [...EventMapper].find(([_k, v]) => v === this.options.font);
            if (typeof font !== 'undefined')
                Fonts.change(font[0]);
        }
        if (typeof this.options.fontSize !== 'undefined')
            Fonts.fontSize(this.options.fontSize);
        if (typeof this.options.imageQualityLevel !== 'undefined')
            ImageQuality.change(this.options.imageQualityLevel);
        if (typeof this.options.letterSpacing !== 'undefined')
            Fonts.letterSpacing(this.options.letterSpacing);
        if (typeof this.options.lineHeight !== 'undefined')
            Fonts.lineHeight(this.options.lineHeight);
        if (typeof this.options.screenModeLevel !== 'undefined')
            ScreenMode.change(this.options.screenModeLevel);
        if (typeof this.options.subtitleFontSize !== 'undefined')
            Bar.fontSizeSubtitles(this.options.subtitleFontSize);
        if (typeof this.options.wordSpacing !== 'undefined')
            Fonts.wordSpacing(this.options.wordSpacing);
        if (typeof this.options.zoomLevel !== 'undefined')
            Zoom.change(this.options.zoomLevel);
        if (this.options.disable.includes(Fn.AdvancedSettings)) {
            for (const advancedSetting of this.advancedSettings)
                advancedSetting.classList.add(CLASS_HIDDEN);
        }
        if (!this.options.disable.includes(Fn.Annotations) &&
            Readiant.type === ContentType.SVG)
            Annotations.register();
        else
            Annotations.remove();
        if (this.audioButton !== null && Readiant.type === ContentType.SVG) {
            await Audio.register(availableAudio);
            if (typeof this.options.audioHighlightingLevel !== 'undefined')
                Audio.setLineHighlighterType(this.options.audioHighlightingLevel);
            if (typeof this.options.countdownLevel !== 'undefined')
                Audio.countdownType(this.options.countdownLevel);
            if (typeof this.options.playbackRate !== 'undefined')
                Audio.setPlaybackRate(this.options.playbackRate);
            if (typeof this.options.subtitleLevel !== 'undefined')
                Audio.setSubtitlesType(this.options.subtitleLevel);
        }
        else
            Audio.remove();
        if (typeof documentChapters !== 'undefined')
            Chapters.register(documentChapters);
        else
            Chapters.remove();
        if (!this.options.disable.includes(Fn.Search))
            Search.register();
        else
            Search.remove();
        if (this.options.disable.includes(Fn.Animations))
            Builder.disableAnimations();
        if (!this.options.disable.includes(Fn.Print) &&
            this.printButton !== null &&
            Readiant.type === ContentType.SVG)
            Print.register();
        else
            Print.remove();
        A11y.register();
        ReadiantElement.dispatchEvent('document-loaded', {
            documentId: this.options.id,
            isReady: true,
        });
        eventLogger({
            type: LogType.Ready,
        });
    }
    async parentMessageHandler(event) {
        if (event.source === window || event.source === null)
            return;
        if (typeof event.data === 'undefined' ||
            !Object.prototype.hasOwnProperty.call(event.data, 'type'))
            return;
        const data = event.data;
        switch (data.type) {
            case LogType.AddAnnotations:
                if (!this.options.disable.includes(Fn.Annotations) &&
                    Readiant.type === ContentType.SVG) {
                    Annotations.add(data.annotations);
                    ReadiantElement.dispatchEvent('annotations-added', {
                        annotations: data.annotations,
                        count: data.annotations.length,
                    });
                }
                break;
            case LogType.AudioPlay:
                await Audio.play();
                ReadiantElement.dispatchEvent('audio-play', {
                    isPlaying: true,
                    action: 'play',
                });
                break;
            case LogType.AudioPause:
                await Audio.pause();
                ReadiantElement.dispatchEvent('audio-pause', {
                    isPlaying: false,
                    action: 'pause',
                });
                break;
            case LogType.ChangeAudioHighlighting:
                Audio.setLineHighlighterType(data.audioHighlightingLevel);
                ReadiantElement.dispatchEvent('audio-highlighting-changed', {
                    level: data.audioHighlightingLevel,
                    audioHighlightingLevel: data.audioHighlightingLevel,
                });
                break;
            case LogType.ChangeColorBlindFilter: {
                const colorBlindFilter = [...EventMapper].find(([_k, v]) => v === data.colorBlindFilter);
                if (typeof colorBlindFilter !== 'undefined') {
                    Colorblind.change(colorBlindFilter[0]);
                    ReadiantElement.dispatchEvent('color-blind-filter-changed', {
                        filter: data.colorBlindFilter,
                        filterKey: colorBlindFilter[0],
                    });
                }
                break;
            }
            case LogType.ChangeCountdown: {
                Audio.countdownType(data.countdownLevel);
                ReadiantElement.dispatchEvent('countdown-changed', {
                    level: data.countdownLevel,
                    countdownLevel: data.countdownLevel,
                });
                break;
            }
            case LogType.ChangeFont: {
                const font = [...EventMapper].find(([_k, v]) => v === data.font);
                if (typeof font !== 'undefined') {
                    Fonts.change(font[0]);
                    ReadiantElement.dispatchEvent('font-changed', {
                        font: data.font,
                        fontKey: font[0],
                    });
                }
                break;
            }
            case LogType.ChangeFontSize:
                Fonts.fontSize(data.fontSize);
                ReadiantElement.dispatchEvent('font-size-changed', {
                    fontSize: data.fontSize,
                    size: data.fontSize,
                });
                break;
            case LogType.ChangeImageQuality:
                ImageQuality.change(data.imageQualityLevel);
                ReadiantElement.dispatchEvent('image-quality-changed', {
                    level: data.imageQualityLevel,
                    imageQualityLevel: data.imageQualityLevel,
                });
                break;
            case LogType.ChangeLetterSpacing:
                Fonts.letterSpacing(data.letterSpacing);
                ReadiantElement.dispatchEvent('letter-spacing-changed', {
                    spacing: data.letterSpacing,
                    letterSpacing: data.letterSpacing,
                });
                break;
            case LogType.ChangeLineHeight:
                Fonts.lineHeight(data.lineHeight);
                ReadiantElement.dispatchEvent('line-height-changed', {
                    height: data.lineHeight,
                    lineHeight: data.lineHeight,
                });
                break;
            case LogType.ChangePlaybackRate:
                Audio.setPlaybackRate(data.playbackRate);
                ReadiantElement.dispatchEvent('playback-rate-changed', {
                    rate: data.playbackRate,
                    playbackRate: data.playbackRate,
                });
                break;
            case LogType.ChangeReadStop:
                Bar.changeReadStop(data.readStopLevel);
                ReadiantElement.dispatchEvent('read-stop-changed', {
                    level: data.readStopLevel,
                    readStopLevel: data.readStopLevel,
                });
                break;
            case LogType.ChangeScreenMode:
                ScreenMode.change(data.screenModeLevel);
                ReadiantElement.dispatchEvent('theme-changed', {
                    theme: data.screenModeLevel,
                    level: data.screenModeLevel,
                });
                break;
            case LogType.ChangeSubtitle:
                Audio.setSubtitlesType(data.subtitleLevel);
                ReadiantElement.dispatchEvent('subtitle-changed', {
                    level: data.subtitleLevel,
                    subtitleLevel: data.subtitleLevel,
                });
                break;
            case LogType.ChangeSubtitleFontSize:
                Bar.fontSizeSubtitles(data.subtitleFontSize);
                ReadiantElement.dispatchEvent('subtitle-font-size-changed', {
                    fontSize: data.subtitleFontSize,
                    subtitleFontSize: data.subtitleFontSize,
                });
                break;
            case LogType.ChangeTextMode:
                TextMode.change(data.textModeLevel);
                ReadiantElement.dispatchEvent('text-mode-changed', {
                    level: data.textModeLevel,
                    textModeLevel: data.textModeLevel,
                });
                break;
            case LogType.ChangeWordSpacing:
                Fonts.wordSpacing(data.wordSpacing);
                ReadiantElement.dispatchEvent('word-spacing-changed', {
                    spacing: data.wordSpacing,
                    wordSpacing: data.wordSpacing,
                });
                break;
            case LogType.ChangeZoomLevel:
                Zoom.change(data.zoomLevel);
                ReadiantElement.dispatchEvent('zoom-changed', {
                    zoom: data.zoomLevel,
                    level: data.zoomLevel,
                });
                break;
            case LogType.GotoPage:
            case LogType.InitialPage:
                Navigation.gotoPageDirectly(data.pages[0]);
                ReadiantElement.dispatchEvent('page-changed', {
                    page: data.pages[0],
                    currentPage: data.pages[0],
                    totalPages: Navigation.pages.length,
                });
                break;
            case LogType.NextPage:
                Navigation.onRightPressed();
                ReadiantElement.dispatchEvent('page-changed', {
                    page: Navigation.currentPage,
                    currentPage: Navigation.currentPage,
                    totalPages: Navigation.pages.length,
                    direction: 'next',
                });
                break;
            case LogType.PreviousPage:
                Navigation.onLeftPressed();
                ReadiantElement.dispatchEvent('page-changed', {
                    page: Navigation.currentPage,
                    currentPage: Navigation.currentPage,
                    totalPages: Navigation.pages.length,
                    direction: 'previous',
                });
                break;
            case LogType.ShouldAddAvailableAudio:
                Audio.add(data.page, data.provider, data.language, data.voiceId);
                ReadiantElement.dispatchEvent('audio-added', {
                    page: data.page,
                    provider: data.provider,
                    language: data.language,
                    voiceId: data.voiceId,
                });
                break;
            case LogType.StartHighlighting:
                Builder.startHighlighting(PagePosition.Left, data.indices);
                ReadiantElement.dispatchEvent('highlighting-started', {
                    position: PagePosition.Left,
                    indices: data.indices,
                });
                break;
            case LogType.StopHighlighting:
                Builder.stopHighlighting();
                ReadiantElement.dispatchEvent('highlighting-stopped', {
                    action: 'stop',
                });
                break;
            case LogType.SwitchAudio:
                await Audio.switchAudio(data.key);
                ReadiantElement.dispatchEvent('audio-switched', {
                    key: data.key,
                    audioKey: data.key,
                });
                break;
            case LogType.ToggleFullscreen:
                await Fullscreen.toggle();
                ReadiantElement.dispatchEvent('fullscreen-changed', {
                    isFullscreen: document.fullscreenElement !== null,
                });
                break;
            case LogType.ToggleOrientation:
                Orientation.toggle();
                ReadiantElement.dispatchEvent('orientation-changed', {
                    action: 'toggle',
                    orientation: 'toggled',
                });
                break;
        }
    }
    parse() {
        const options = {};
        if (ReadiantElement.instance) {
            const documentIdValue = ReadiantElement.instance.getAttribute('document-id');
            if (documentIdValue !== null)
                options.id =
                    documentIdValue;
            for (const [key, type] of Object.entries(this.accepted)) {
                const attrName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                const attrValue = ReadiantElement.instance.getAttribute(attrName);
                if (attrValue !== null) {
                    switch (type) {
                        case AcceptedTypes.Boolean:
                            options[key] = attrValue === 'true' || attrValue === '';
                            break;
                        case AcceptedTypes.Number:
                            options[key] = Number(attrValue);
                            break;
                        case AcceptedTypes.String:
                            options[key] = attrValue;
                            break;
                        case AcceptedTypes.StringArray:
                            options[key] = attrValue.split(',').map((v) => v.trim());
                            break;
                    }
                }
            }
        }
        if (Object.keys(options).length === 0 && window.location.search !== '') {
            const matches = window.location.search
                .slice(window.location.search.indexOf('?') + 1)
                .match(/[\w\d%\-!.~'()*]+=[\w\d%\-!.,~'()*]+/g);
            return matches !== null
                ? matches
                    .map((value) => value.split('=').map(decodeURIComponent))
                    .reduce((obj, [key, value]) => {
                    if (Object.prototype.hasOwnProperty.call(this.accepted, key)) {
                        switch (this.accepted[key]) {
                            case AcceptedTypes.Boolean:
                                obj[key] = Boolean(value);
                                break;
                            case AcceptedTypes.Number:
                                obj[key] = Number(value);
                                break;
                            case AcceptedTypes.String:
                                obj[key] = value;
                                break;
                            case AcceptedTypes.StringArray:
                                obj[key] = value.split(',').map((value) => value.trim());
                                break;
                        }
                    }
                    return obj;
                }, {})
                : {};
        }
        return options;
    }
    async replaceImageURL(definition, imageInfo) {
        if (!(definition.includes('<image') || definition.includes('<img')) ||
            typeof this.options.id === 'undefined' ||
            typeof this.options.url === 'undefined' ||
            typeof imageInfo === 'undefined')
            return definition;
        let def = definition;
        for (const info of imageInfo) {
            const imageUrl = this.options.useSignedUrls === true &&
                typeof info.signedUrl === 'string'
                ? info.signedUrl
                : `${this.options.url}images/${info.id}_4.${info.transparent ? 'png' : 'jpg'}`;
            def = def.replaceAll(info.id, imageUrl);
        }
        return def;
    }
    async replaceImageURLs(elements, imageInfo) {
        return Promise.all(elements.map(async (element) => [
            `rdnt.${element[0]}`,
            await this.replaceImageURL(element[1]
                .replaceAll(`id="${element[0]}"`, `id="rdnt.${element[0]}"`)
                .replaceAll(/xlink:href="#/g, 'xlink:href="#rdnt.')
                .replaceAll(/"url\(#/g, '"url(#rdnt.'), imageInfo),
        ]));
    }
    toggleBlock(event) {
        const element = event.currentTarget;
        const block = element.nextElementSibling;
        const parent = element.parentNode;
        const top = parent.parentNode;
        const toggle = element.children[1];
        const toggleButtons = top.querySelectorAll('.rdnt__block-toggle');
        for (const toggleButton of toggleButtons) {
            if (toggleButton.isEqualNode(toggle) ||
                toggleButton.classList.contains('rdnt__block-toggle--ignore'))
                continue;
            toggleButton.classList.remove('rdnt__block-toggle--active');
            if (toggleButton.parentNode !== null &&
                toggleButton.parentNode.nextElementSibling !==
                    null)
                toggleButton.parentNode
                    .nextElementSibling.classList.remove('rdnt__block-view--active');
        }
        toggle.classList.toggle('rdnt__block-toggle--active');
        block.classList.toggle('rdnt__block-view--active');
    }
}
Readiant.root = document;
Readiant.preview = false;
Readiant.type = ContentType.SVG;
export default () => new Readiant();
