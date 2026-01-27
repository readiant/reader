var _a;
import groupBy from 'lodash/groupBy.js';
import { Layout, SpeechMarkType, EffectiveConnectionType, } from './consts.js';
import { A11y } from './a11y.js';
import { Annotations } from './annotations.js';
import { Audio } from './audio.js';
import { Bar } from './bar.js';
import { CLASS_ACTIVE, CLASS_ANIMATE_LEFT, CLASS_ANIMATE_RIGHT, CLASS_HIDDEN, CLASS_HIGHLIGHT_ACTIVE, CLASS_HIGHLIGHT_IGNORE, CLASS_HIGHLIGHT_SYNTAX_ACTIVE, CLASS_HIGHLIGHT_SYNTAX_WORD_ACTIVE, CLASS_HIGHLIGHT_WORD, CLASS_HIGHLIGHT_WORD_ACTIVE, CLASS_SINGLE, CLASS_VISUALLY_HIDDEN, NAMESPACE_SVG, NAMESPACE_XLINK, AudioPlayingState, ContentType, Direction, OrientationMode, PagePosition, } from './consts.js';
import { debounce } from './debounce.js';
import { ResizeObserver, specGetScrollLeft, specSetScrollLeft, } from './detection.js';
import { eventLogger } from './eventLogger.js';
import { Fonts } from './fonts.js';
import { Fullscreen } from './fullscreen.js';
import { LogType } from './log.js';
import { Navigation } from './navigation.js';
import { Orientation } from './orientation.js';
import { Readiant } from './readiant.js';
import { Storage } from './storage.js';
import { TextMode } from './textMode.js';
import { Zoom } from './zoom.js';
export class Builder {
    static get animationLeft() {
        return Readiant.root.querySelector('.rdnt__animation--left');
    }
    static get animationLeftFront() {
        return Readiant.root.querySelector('.rdnt__animation--left-front');
    }
    static get animationLeftBack() {
        return Readiant.root.querySelector('.rdnt__animation--left-back');
    }
    static get animationRight() {
        return Readiant.root.querySelector('.rdnt__animation--right');
    }
    static get animationRightFront() {
        return Readiant.root.querySelector('.rdnt__animation--right-front');
    }
    static get animationRightBack() {
        return Readiant.root.querySelector('.rdnt__animation--right-back');
    }
    static get defs() {
        return Readiant.root.querySelector('.rdnt__defs');
    }
    static get elems() {
        return Readiant.root.querySelector('.rdnt__elements');
    }
    static get htmlLayer() {
        return Readiant.root.querySelector('.rdnt__layer--html');
    }
    static get htmlTextLayer() {
        return Readiant.root.querySelector('.rdnt__text--html');
    }
    static get htmlPage() {
        return Readiant.root.querySelector('.rdnt__html-page');
    }
    static get htmlPageContent() {
        return Readiant.root.querySelector('.rdnt__html-page--content');
    }
    static get layers() {
        return Readiant.root.querySelector('.rdnt__layers');
    }
    static get left() {
        return Readiant.root.querySelector('.rdnt__page--left');
    }
    static get leftLayer() {
        return Readiant.root.querySelector('.rdnt__layer--left');
    }
    static get leftTextLayer() {
        return Readiant.root.querySelector('.rdnt__text--left');
    }
    static get plainTextPage() {
        return Readiant.root.querySelector('.rdnt__plain-text-page');
    }
    static get plainTextPageContent() {
        return Readiant.root.querySelector('.rdnt__plain-text-page__content');
    }
    static get plainTextPageLines() {
        return Readiant.root.querySelector('.rdnt__plain-text-page__lines');
    }
    static get progress() {
        return Readiant.root.querySelector('.rdnt__progress-value');
    }
    static get right() {
        return Readiant.root.querySelector('.rdnt__page--right');
    }
    static get rightLayer() {
        return Readiant.root.querySelector('.rdnt__layer--right');
    }
    static get rightTextLayer() {
        return Readiant.root.querySelector('.rdnt__text--right');
    }
    static get wordLabel() {
        return String(Readiant.root
            .querySelector('.rdnt__i18n')
            ?.getAttribute('data-word-label'));
    }
    static get viewport() {
        return Readiant.root.querySelector('.rdnt__viewport');
    }
    static get currentPage() {
        return this.htmlPage === null
            ? 0
            : Math.floor(specGetScrollLeft(this.htmlPage) / this.pageSizeHTML());
    }
    static register() {
        if (Readiant.type === ContentType.HTML) {
            this.htmlPage?.classList.remove(CLASS_HIDDEN);
            this.left?.remove();
            this.leftLayer?.remove();
            this.right?.remove();
            this.rightLayer?.remove();
        }
        else {
            this.left?.classList.remove(CLASS_HIDDEN);
            this.right?.classList.remove(CLASS_HIDDEN);
            this.addHandler((page, side) => {
                if (TextMode.level !== 3)
                    this.start(side);
                if (Storage.hasText(page)) {
                    const { elements, viewBox } = Storage.getPage(page);
                    const textContent = Storage.getText(page);
                    this.textLayer(elements, textContent, side, viewBox);
                    if (textContent.sentences.length > 0)
                        this.textSentences(textContent.sentences, side);
                    Audio.fetchSpeechMarks();
                    if (typeof this.highlightOnLoad !== 'undefined' &&
                        textContent.sentences.length > 0) {
                        if (this.highlightOnLoad.first)
                            this.startHighlightingForward(this.highlightOnLoad.wordOrSentence, true);
                        else if (this.highlightOnLoad.last)
                            this.startHighlightingBackward(this.highlightOnLoad.wordOrSentence, true);
                    }
                    if (TextMode.level !== 1 &&
                        Orientation.mode === OrientationMode.Portrait)
                        this.plainText().catch((e) => {
                            throw e;
                        });
                    Zoom.scroll().catch((e) => {
                        throw e;
                    });
                }
                else {
                    Navigation.addTextHandler(page, ({ page, position: side }) => {
                        const { elements, viewBox } = Storage.getPage(page);
                        const textContent = Storage.getText(page);
                        this.textLayer(elements, textContent, side, viewBox);
                        if (textContent.sentences.length > 0)
                            this.textSentences(textContent.sentences, side);
                        Audio.fetchSpeechMarks();
                        if (typeof this.highlightOnLoad !== 'undefined' &&
                            textContent.sentences.length > 0) {
                            if (this.highlightOnLoad.first)
                                this.startHighlightingForward(this.highlightOnLoad.wordOrSentence, true);
                            else if (this.highlightOnLoad.last)
                                this.startHighlightingBackward(this.highlightOnLoad.wordOrSentence, true);
                        }
                        if (TextMode.level !== 1 &&
                            Orientation.mode === OrientationMode.Portrait)
                            this.plainText().catch((e) => {
                                throw e;
                            });
                        Zoom.scroll().catch((e) => {
                            throw e;
                        });
                    });
                }
            });
            Navigation.addHandler((newPage) => {
                const currentPage = Navigation.currentPages.find((page) => page.page === newPage);
                if (typeof currentPage !== 'undefined') {
                    this.currentSentenceIndex = 0;
                    this.currentSide = currentPage.position;
                    this.currentWordIndex = 0;
                }
            });
            if (this.viewport !== null)
                new MutationObserver(() => {
                    this.layer(PagePosition.Left);
                    this.layer(PagePosition.Right);
                }).observe(this.viewport, {
                    attributes: true,
                    childList: true,
                    subtree: true,
                });
            this.htmlPage?.remove();
            this.htmlLayer?.remove();
        }
        this.observe();
    }
    static addHandler(handler) {
        this.handlers.add(handler);
    }
    static async addToCache(elements) {
        const fragment = Readiant.documentContext.createDocumentFragment();
        const placeholder = Readiant.documentContext.createElementNS(NAMESPACE_SVG, 'svg');
        for (const [id, element] of elements) {
            placeholder.innerHTML = element;
            if (placeholder.firstElementChild === null)
                continue;
            if (placeholder.firstElementChild.tagName.toLowerCase() === 'a') {
                const href = placeholder.firstChild.getAttributeNS(NAMESPACE_XLINK, 'href');
                if (href !== null)
                    this.cachedLinks.set(id, href);
            }
            fragment.appendChild(placeholder.firstElementChild);
            this.cachedElements.add(id);
        }
        await this.waitForNextFrame();
        if (this.elems)
            this.elems.appendChild(this.convert(fragment));
        if (this.hasFontChanged) {
            const textElements = this.elems?.getElementsByTagNameNS(NAMESPACE_SVG, 'text');
            for (const textElement of textElements) {
                if (!textElement.hasAttribute('data-x')) {
                    const x = textElement.getAttribute('x');
                    if (x !== null) {
                        textElement.setAttribute('x', x.split(',')[0]);
                        textElement.setAttribute('data-x', x);
                    }
                }
                if (!textElement.hasAttribute('data-y')) {
                    const y = textElement.getAttribute('y');
                    if (y !== null) {
                        textElement.setAttribute('y', y.split(',')[0]);
                        textElement.setAttribute('data-y', y);
                    }
                }
                if (!textElement.hasAttribute('data-glyphs'))
                    textElement.setAttribute('data-glyphs', textElement.textContent);
                textElement.textContent = textElement.getAttribute('data-content');
                textElement.classList.add(this.activeFont, this.activeFontSize, this.activeWordSpacing, this.activeLetterSpacing);
            }
        }
    }
    static adjust(height) {
        if (this.viewport === null)
            return;
        if (height === 0) {
            this.viewport.style.removeProperty('height');
            this.viewport.style.removeProperty('padding-bottom');
        }
        else {
            this.viewport.style.height = `calc(100% + ${String(height)}px)`;
            this.viewport.style.paddingBottom = `calc(2rem + ${String(height)}px)`;
        }
        this.layer(PagePosition.Left);
        this.layer(PagePosition.Right);
    }
    static animateLeft() {
        if (this.animationLeft === null ||
            this.layers === null ||
            this.viewport === null)
            return;
        if (this.animationDisabled || Navigation.currentPage === 1) {
            this.layer(PagePosition.Left);
            return;
        }
        this.animationPages = Navigation.animationPages;
        this.isAnimating = true;
        const toFirst = Math.min(...Navigation.pages) === Navigation.currentPage - 1;
        const isLast = Math.max(...Navigation.pages) === Navigation.currentPage;
        const translateX = parseFloat(this.animationLeft.style.width) / 2;
        const computedStyle = Readiant.windowContext.getComputedStyle(this.animationLeft);
        if (computedStyle.animationName !== 'none') {
            this.animationLeft.classList.remove(CLASS_ACTIVE);
            this.isAnimating = false;
            this.leftLayer?.classList.remove(CLASS_ANIMATE_LEFT);
            this.rightLayer?.classList.remove(CLASS_ANIMATE_LEFT);
            this.layers.style.transition = 'none';
            this.layers.style.removeProperty('perspective');
            this.layers.style.removeProperty('transform');
            this.viewport.style.transition = 'none';
            this.viewport.style.removeProperty('transform');
            this.layer(PagePosition.Left);
        }
        const handleAnimationCancel = () => {
            this.animationLeft?.removeEventListener('animationend', handleAnimationEnd);
            this.animationLeft?.removeEventListener('animationcancel', handleAnimationCancel);
            this.animationLeft?.classList.remove(CLASS_ACTIVE);
            this.isAnimating = false;
            this.leftLayer?.classList.remove(CLASS_ANIMATE_LEFT);
            this.rightLayer?.classList.remove(CLASS_ANIMATE_LEFT);
            if (this.layers !== null) {
                this.layers.style.transition = 'none';
                this.layers.style.removeProperty('perspective');
                this.layers.style.removeProperty('transform');
            }
            if (this.viewport !== null) {
                this.viewport.style.transition = 'none';
                this.viewport.style.removeProperty('transform');
            }
            this.layer(PagePosition.Left);
        };
        const handleAnimationEnd = () => {
            this.animationLeft?.removeEventListener('animationend', handleAnimationEnd);
            this.animationLeft?.removeEventListener('animationcancel', handleAnimationCancel);
            this.animationLeft?.classList.remove(CLASS_ACTIVE);
            this.isAnimating = false;
            this.leftLayer?.classList.remove(CLASS_ANIMATE_LEFT);
            this.rightLayer?.classList.remove(CLASS_ANIMATE_LEFT);
            if (this.layers !== null) {
                this.layers.style.transition = 'none';
                this.layers.style.removeProperty('perspective');
                this.layers.style.removeProperty('transform');
            }
            if (this.viewport !== null) {
                this.viewport.style.transition = 'none';
                this.viewport.style.removeProperty('transform');
            }
            this.layer(PagePosition.Left);
        };
        this.layers.style.perspective = '250vh';
        if (toFirst || isLast) {
            this.layers.style.transition = 'transform 0.9s ease-in-out';
            this.viewport.style.transition = 'transform 0.9s ease-in-out';
            this.layers.style.transform = `translateX(-${String(translateX)}px)`;
            this.viewport.style.transform = `translateX(-${String(translateX)}px)`;
        }
        this.animationLeft.classList.add(CLASS_ACTIVE);
        this.leftLayer?.classList.add(CLASS_ANIMATE_LEFT);
        this.rightLayer?.classList.add(CLASS_ANIMATE_LEFT);
        this.animationLeft.addEventListener('animationend', handleAnimationEnd);
        this.animationLeft.addEventListener('animationcancel', handleAnimationCancel);
    }
    static animateRight() {
        if (this.animationRight === null ||
            this.layers === null ||
            this.viewport === null)
            return;
        if (this.animationDisabled ||
            Math.max(...Navigation.pages) === Navigation.currentPage) {
            this.layer(PagePosition.Right);
            return;
        }
        this.animationPages = Navigation.animationPages;
        this.isAnimating = true;
        const orientation = this.computeOrientation();
        const isFirst = Math.min(...Navigation.pages) === Navigation.currentPage;
        const toLast = Math.max(...Navigation.pages) ===
            Navigation.currentPage +
                (orientation === OrientationMode.Landscape ? 2 : 1);
        const translateX = parseFloat(this.animationRight.style.width) / 2;
        const computedStyle = Readiant.windowContext.getComputedStyle(this.animationRight);
        if (computedStyle.animationName !== 'none') {
            this.animationRight.classList.remove(CLASS_ACTIVE);
            this.isAnimating = false;
            this.leftLayer?.classList.remove(CLASS_ANIMATE_RIGHT);
            this.rightLayer?.classList.remove(CLASS_ANIMATE_RIGHT);
            this.layers.style.transition = 'none';
            this.layers.style.removeProperty('perspective');
            this.layers.style.removeProperty('transform');
            this.viewport.style.transition = 'none';
            this.viewport.style.removeProperty('transform');
            this.layer(PagePosition.Right);
        }
        const handleAnimationCancel = () => {
            this.animationRight?.removeEventListener('animationend', handleAnimationEnd);
            this.animationRight?.removeEventListener('animationcancel', handleAnimationCancel);
            this.animationRight?.classList.remove(CLASS_ACTIVE);
            this.isAnimating = false;
            this.leftLayer?.classList.remove(CLASS_ANIMATE_RIGHT);
            this.rightLayer?.classList.remove(CLASS_ANIMATE_RIGHT);
            if (this.layers !== null) {
                this.layers.style.transition = 'none';
                this.layers.style.removeProperty('perspective');
                this.layers.style.removeProperty('transform');
            }
            if (this.viewport !== null) {
                this.viewport.style.transition = 'none';
                this.viewport.style.removeProperty('transform');
            }
            this.layer(PagePosition.Right);
        };
        const handleAnimationEnd = () => {
            this.animationRight?.removeEventListener('animationend', handleAnimationEnd);
            this.animationRight?.removeEventListener('animationcancel', handleAnimationCancel);
            this.animationRight?.classList.remove(CLASS_ACTIVE);
            this.isAnimating = false;
            this.leftLayer?.classList.remove(CLASS_ANIMATE_RIGHT);
            this.rightLayer?.classList.remove(CLASS_ANIMATE_RIGHT);
            if (this.layers !== null) {
                this.layers.style.transition = 'none';
                this.layers.style.removeProperty('perspective');
                this.layers.style.removeProperty('transform');
            }
            if (this.viewport !== null) {
                this.viewport.style.transition = 'none';
                this.viewport.style.removeProperty('transform');
            }
            this.layer(PagePosition.Right);
        };
        this.layers.style.perspective = '250vh';
        if (isFirst || toLast) {
            this.layers.style.transition = 'transform 0.9s ease-in-out';
            this.viewport.style.transition = 'transform 0.9s ease-in-out';
            this.layers.style.transform = `translateX(${String(translateX)}px)`;
            this.viewport.style.transform = `translateX(${String(translateX)}px)`;
        }
        this.animationRight.classList.add(CLASS_ACTIVE);
        this.leftLayer?.classList.add(CLASS_ANIMATE_RIGHT);
        this.rightLayer?.classList.add(CLASS_ANIMATE_RIGHT);
        this.animationRight.addEventListener('animationend', handleAnimationEnd);
        this.animationRight.addEventListener('animationcancel', handleAnimationCancel);
    }
    static async animation(side, blueprint, viewBox, isBack) {
        await this.waitForAnimation(side === PagePosition.Left ? this.animationLeft : this.animationRight);
        const sideElement = side === PagePosition.Left
            ? isBack
                ? this.animationLeftBack
                : this.animationLeftFront
            : isBack
                ? this.animationRightBack
                : this.animationRightFront;
        if (sideElement !== null) {
            this.clear(sideElement);
            sideElement.innerHTML = `<svg viewBox="${viewBox.join(' ')}">${blueprint}</svg>`;
        }
    }
    static async cache(pages) {
        const elements = Storage.getBlueprints(pages);
        const add = this.cachedElements.size > 0
            ? [...elements].filter((x) => !this.cachedElements.has(x))
            : [...elements];
        const del = this.cachedElements.size > 0
            ? [...this.cachedElements].filter((x) => !elements.has(x))
            : [];
        const stored = Storage.getElements(add);
        this.wantedElements = new Set([...this.wantedElements, ...stored.missing]);
        await this.waitForNextFrame();
        if (this.elems)
            this.elems.appendChild(this.convert(stored.elements));
        await this.waitForNextFrame();
        if (this.hasFontChanged) {
            const textElements = this.elems?.getElementsByTagNameNS(NAMESPACE_SVG, 'text');
            for (const textElement of textElements) {
                if (!textElement.hasAttribute('data-x')) {
                    const x = textElement.getAttribute('x');
                    if (x !== null) {
                        textElement.setAttribute('x', x.split(',')[0]);
                        textElement.setAttribute('data-x', x);
                    }
                }
                if (!textElement.hasAttribute('data-y')) {
                    const y = textElement.getAttribute('y');
                    if (y !== null) {
                        textElement.setAttribute('y', y.split(',')[0]);
                        textElement.setAttribute('data-y', y);
                    }
                }
                if (!textElement.hasAttribute('data-glyphs'))
                    textElement.setAttribute('data-glyphs', textElement.textContent);
                textElement.textContent = textElement.getAttribute('data-content');
                textElement.classList.add(this.activeFont, this.activeFontSize, this.activeWordSpacing, this.activeLetterSpacing);
            }
        }
        for (const id of del) {
            const element = Readiant.root.getElementById(id);
            if (element !== null) {
                element.remove();
                if (this.cachedLinks.has(id))
                    this.cachedLinks.delete(id);
            }
        }
        this.cachedElements = elements;
    }
    static changeFontForText(activeFont, newFont) {
        const textElements = this.elems?.getElementsByTagNameNS(NAMESPACE_SVG, 'text');
        this.activeFont = newFont;
        this.hasFontChanged =
            activeFont === this.ORIGINAL_FONT ||
                (activeFont !== this.ORIGINAL_FONT && newFont !== this.ORIGINAL_FONT);
        for (const textElement of textElements) {
            if (newFont !== this.ORIGINAL_FONT) {
                textElement.classList.add(newFont);
                if (activeFont !== this.ORIGINAL_FONT)
                    textElement.classList.remove(activeFont);
            }
            else {
                const classList = textElement.classList;
                let newClass = [];
                for (const className of classList) {
                    if (!className.startsWith('rdnt__'))
                        newClass = [...newClass, className];
                }
                textElement.classList.remove(...textElement.classList);
                textElement.classList.add(...newClass);
            }
            if (newFont === this.ORIGINAL_FONT &&
                textElement.hasAttribute('data-glyphs')) {
                textElement.textContent = textElement.getAttribute('data-glyphs');
                const dataX = textElement.getAttribute('data-x');
                if (dataX !== null) {
                    textElement.setAttribute('x', dataX);
                    textElement.removeAttribute('data-x');
                }
                const dataY = textElement.getAttribute('data-y');
                if (dataY !== null) {
                    textElement.setAttribute('y', dataY);
                    textElement.removeAttribute('data-y');
                }
            }
            else if (newFont !== this.ORIGINAL_FONT) {
                if (!textElement.hasAttribute('data-glyphs'))
                    textElement.setAttribute('data-glyphs', textElement.textContent);
                if (!textElement.hasAttribute('data-x')) {
                    const x = textElement.getAttribute('x');
                    if (x !== null) {
                        textElement.setAttribute('x', x.split(',')[0]);
                        textElement.setAttribute('data-x', x);
                    }
                }
                if (!textElement.hasAttribute('data-y')) {
                    const y = textElement.getAttribute('y');
                    if (y !== null) {
                        textElement.setAttribute('y', y.split(',')[0]);
                        textElement.setAttribute('data-y', y);
                    }
                }
                textElement.textContent = textElement.getAttribute('data-content');
            }
        }
        this.defaultFontSettings(newFont);
    }
    static async changeProgress(percentage) {
        await this.waitForNextFrame();
        percentage =
            Navigation.direction === Direction.Rtl ? 100 - percentage : percentage;
        this.progress?.setAttribute('style', `width:${percentage.toPrecision(2)}%`);
    }
    static clear(element) {
        if (element === null)
            return;
        while (element.firstChild !== null)
            element.removeChild(element.firstChild);
    }
    static computeOrientation() {
        if (this.forcingPortrait || this.layout === Layout.PrePaginated)
            return OrientationMode.Portrait;
        return Readiant.windowContext.matchMedia(`(max-width: ${String(this.PORTRAIT_WIDTH)}px)`).matches
            ? OrientationMode.Portrait
            : OrientationMode.Landscape;
    }
    static computeTransform(rotation) {
        let svgTransform = [1, 0, 0, -1, 0, 0];
        const radians = (rotation / 180) * Math.PI;
        const cosTheta = Math.cos(radians);
        const sinTheta = Math.sin(radians);
        svgTransform = this.transform([cosTheta, sinTheta, -sinTheta, cosTheta, 0, 0], svgTransform);
        return `transform:matrix(${svgTransform.join()})`;
    }
    static convert(fragment) {
        const aElements = fragment.querySelectorAll('a');
        for (const aElement of aElements) {
            if (aElement.hasAttribute('data-goto'))
                aElement.addEventListener('click', (event) => {
                    event.preventDefault();
                    Navigation.gotoPage(Number(String(aElement.getAttribute('data-goto'))));
                });
        }
        if (typeof this.currentImageQuality !== 'undefined') {
            const imageElements = fragment.querySelectorAll('image[*|href*="_"]');
            for (const image of Array.from(imageElements)) {
                const href = image.getAttributeNS(NAMESPACE_XLINK, 'href');
                if (href !== null)
                    image.setAttributeNS(NAMESPACE_XLINK, 'href', href.replace(new RegExp('_(0.5|[0-9]).', 'gi'), `_${this.currentImageQuality}.`));
            }
        }
        return fragment;
    }
    static defaultFontSettings(newFont) {
        if (newFont === this.ORIGINAL_FONT)
            return;
        let newFontSize = 8;
        let newLetterSpacing = 3;
        const newWordSpacing = 3;
        switch (newFont) {
            case 'rdnt__font--dyslexia': {
                newFontSize = 2;
                newLetterSpacing = 2;
                break;
            }
            case 'rdnt__font--lora': {
                newFontSize = 5;
                break;
            }
            case 'rdnt__font--merriweather': {
                newFontSize = 3;
                break;
            }
            case 'rdnt__font--muli': {
                newFontSize = 4;
                break;
            }
            case 'rdnt__font--mukta': {
                newFontSize = 6;
                break;
            }
            case 'rdnt__font--roboto': {
                newFontSize = 5;
                break;
            }
        }
        Fonts.fontSize(newFontSize, true);
        Fonts.letterSpacing(newLetterSpacing, true);
        Fonts.wordSpacing(newWordSpacing, true);
    }
    static async definitions(elements) {
        const fragment = Readiant.documentContext.createDocumentFragment();
        for (const element of elements)
            fragment.appendChild(Storage.convertStringToElement(element[1]));
        await this.waitForNextFrame();
        if (this.defs)
            this.defs.appendChild(fragment);
    }
    static disableAnimations() {
        this.animationDisabled = true;
    }
    static processTextElementContent(textElement, textContent, textElementsAndContent) {
        const matches = this.findAllMatchingContent(textElement, textContent);
        for (const match of matches) {
            if (textElementsAndContent.has(match.index)) {
                const existing = textElementsAndContent.get(match.index);
                textElementsAndContent.set(match.index, {
                    ...existing,
                    elements: [...existing.elements, textElement],
                });
            }
            else {
                textElementsAndContent.set(match.index, {
                    ...match,
                    elements: [textElement],
                    x: textElement.x,
                });
            }
        }
    }
    static findAllMatchingContent(textElement, textContent) {
        const matches = [];
        const isWhitespace = textElement.content.replace(/\s+/g, '').length === 0;
        let remainingContent = isWhitespace
            ? textElement.content
            : this.normalize(textElement.content);
        const processedIndices = new Set();
        if (!isWhitespace) {
            const exactMatches = textContent.content
                .map((content, index) => ({
                content: content.content,
                ignore: content.ignore,
                index,
                original: typeof content.originalText !== 'undefined'
                    ? content.originalText
                    : content.content,
                transform: content.transform,
            }))
                .filter((content) => content.content === textElement.content);
            if (exactMatches.length === 1)
                return exactMatches;
        }
        const potentialMatches = textContent.content
            .map((content, index) => ({
            content: content.content,
            ignore: content.ignore,
            index,
            original: typeof content.originalText !== 'undefined'
                ? content.originalText
                : content.content,
            transform: content.transform,
        }))
            .filter((content) => {
            const characterWidth = Math.ceil(textElement.style.width / textElement.content.length);
            const contentLength = content.content.length;
            const xTolerance = Math.min(100, Math.max(20, contentLength * 2));
            const yTolerance = Math.ceil(textElement.style.height / 2);
            const xInBounds = content.transform[4] <= textElement.transform[4] + xTolerance &&
                content.transform[4] + Math.ceil(characterWidth * contentLength) >=
                    textElement.transform[4] - xTolerance;
            const yInBounds = content.transform[5] <= textElement.transform[5] + yTolerance &&
                content.transform[5] + Math.ceil(textElement.style.height) >=
                    textElement.transform[5] - yTolerance;
            return xInBounds && yInBounds;
        })
            .filter((content) => {
            if (isWhitespace)
                return true;
            const normalizedTextElement = this.normalize(textElement.content);
            const normalizedOriginal = this.normalize(content.original);
            if (normalizedOriginal.length === 0 &&
                normalizedTextElement.length !== 0)
                return false;
            if (normalizedTextElement.length === 0)
                return content.original.includes(textElement.content);
            return (normalizedOriginal.includes(normalizedTextElement) ||
                normalizedTextElement.includes(normalizedOriginal));
        })
            .sort((a, b) => {
            const yDistanceA = Math.abs(textElement.transform[5] - a.transform[5]);
            const yDistanceB = Math.abs(textElement.transform[5] - b.transform[5]);
            if (yDistanceA !== yDistanceB)
                return yDistanceA - yDistanceB;
            const xDistanceA = Math.abs(textElement.transform[4] - a.transform[4]);
            const xDistanceB = Math.abs(textElement.transform[4] - b.transform[4]);
            return xDistanceA - xDistanceB;
        });
        if (potentialMatches.length === 0)
            return matches;
        for (const match of potentialMatches) {
            if (processedIndices.has(match.index))
                continue;
            const original = this.normalize(match.original);
            const remaining = this.normalize(remainingContent);
            let shouldMatch = false;
            if (original.length > 0) {
                if (remaining === original)
                    shouldMatch = true;
                else if (remaining.startsWith(original) || remaining.endsWith(original))
                    shouldMatch = true;
                else if (remaining.includes(original) || original.includes(remaining)) {
                    const matchRatio = Math.min(original.length / remaining.length, remaining.length / original.length);
                    const betterMatchExists = potentialMatches
                        .slice(potentialMatches.indexOf(match) + 1)
                        .some((laterMatch) => {
                        if (processedIndices.has(laterMatch.index))
                            return false;
                        const laterOriginal = this.normalize(laterMatch.original);
                        const laterMatchRatio = Math.min(laterOriginal.length / remaining.length, remaining.length / laterOriginal.length);
                        return (laterMatchRatio > matchRatio || remaining === laterOriginal);
                    });
                    shouldMatch = matchRatio > 0.7 && !betterMatchExists;
                }
            }
            if (shouldMatch) {
                matches.push(match);
                processedIndices.add(match.index);
                remainingContent = remainingContent.replace(original, '');
                if (remainingContent.trim() === '')
                    break;
            }
            else if (isWhitespace &&
                (remainingContent.includes(match.original) ||
                    match.original.includes(remainingContent))) {
                matches.push(match);
                processedIndices.add(match.index);
                break;
            }
        }
        if (matches.length === 0 && textContent.content.length > 0)
            matches.push(potentialMatches[0]);
        return matches;
    }
    static setDirection(direction) {
        const htmlPage = Readiant.root.querySelector('.rdnt__html-page');
        if (direction === Direction.Rtl) {
            Bar.syntaxElement?.classList.add('rdnt__bottom-bar__syntax--rtl');
            if (htmlPage !== null)
                htmlPage.classList.add('rdnt__html-page--rtl');
        }
        else {
            Bar.syntaxElement?.classList.remove('rdnt__bottom-bar__syntax--rtl');
            if (htmlPage !== null)
                htmlPage.classList.remove('rdnt__html-page--rtl');
        }
        this.direction = direction;
    }
    static setStylesheet(id, fonts, stylesheetText) {
        if (typeof stylesheetText !== 'undefined') {
            const fontNamespace = `rdnt-${Math.random().toString(36).substring(2, 9)}`;
            const fontFamilyMap = new Map();
            let cssText = stylesheetText;
            const fontFaceRegex = /@font-face\s*{([^}]+)}/g;
            cssText = cssText.replace(fontFaceRegex, (match, content) => {
                const familyRegex = /font-family\s*:\s*['"]?([^'";]+)['"]?/;
                const familyMatch = familyRegex.exec(content);
                if (familyMatch === null)
                    return match;
                const fontFamily = familyMatch[1].trim();
                const uniqueFontFamily = `${fontFamily}-${fontNamespace}`;
                fontFamilyMap.set(fontFamily, uniqueFontFamily);
                let updatedMatch = match.replace(/font-family\s*:\s*['"]?[^'";]+['"]?/, `font-family: "${uniqueFontFamily}"`);
                if (typeof fonts[fontFamily] !== 'undefined') {
                    const fontUrls = fonts[fontFamily];
                    const sources = [];
                    if (typeof fontUrls.woff2 === 'string')
                        sources.push(`url("${fontUrls.woff2}") format('woff2')`);
                    if (typeof fontUrls.woff === 'string')
                        sources.push(`url("${fontUrls.woff}") format('woff')`);
                    if (sources.length > 0)
                        updatedMatch = updatedMatch.replace(/src\s*:\s*[^;}]+;?/, `src: ${sources.join(', ')};`);
                }
                return updatedMatch;
            });
            const fontFaceRules = [];
            let match;
            const fontFacePattern = /@font-face\s*\{[^}]+\}/g;
            while ((match = fontFacePattern.exec(cssText)) !== null)
                fontFaceRules.push(match[0]);
            const cssWithoutFontFace = cssText.replace(/@font-face\s*\{[^}]+\}/g, '');
            let updatedCss = cssWithoutFontFace;
            for (const [originalName, uniqueName] of fontFamilyMap) {
                const escapedOriginal = originalName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const fontFamilyRegex = new RegExp(`(font-family\\s*:\\s*(?:[^;]*,\\s*)?)(['"]?)${escapedOriginal}\\2(?=\\s*[,;])`, 'gi');
                updatedCss = updatedCss.replace(fontFamilyRegex, `$1$2${uniqueName}$2`);
                const fontShorthandRegex = new RegExp(`(font\\s*:\\s*[^;]*?)\\b${escapedOriginal}\\b`, 'gi');
                updatedCss = updatedCss.replace(fontShorthandRegex, `$1${uniqueName}`);
            }
            if (fontFaceRules.length > 0) {
                const fontStyleElement = Readiant.documentContext.createElement('style');
                fontStyleElement.textContent = fontFaceRules.join('\n');
                Readiant.documentContext.head.appendChild(fontStyleElement);
            }
            if (updatedCss.trim().length > 0) {
                const stylesheet = new CSSStyleSheet();
                stylesheet.replaceSync(updatedCss);
                Readiant.root.adoptedStyleSheets = [
                    ...Readiant.root.adoptedStyleSheets,
                    stylesheet,
                ];
            }
        }
        else {
            const link = Readiant.documentContext.createElement('link');
            link.setAttribute('href', `/files/stylesheet/${id}`);
            link.setAttribute('rel', 'stylesheet');
            Readiant.documentContext.head.appendChild(link);
        }
    }
    static async elements(payload) {
        const elements = [];
        for (const [id, element] of payload) {
            if (this.wantedElements.size === 0 || this.wantedElements.has(id)) {
                elements.push([id, element]);
                if (this.wantedElements.size > 0)
                    this.wantedElements.delete(id);
            }
            Storage.storeElement(id, element);
        }
        if (elements.length > 0)
            this.addToCache(elements).catch((e) => {
                throw e;
            });
    }
    static filterTextElements(elements, viewBox) {
        if (this.elems === null)
            return [];
        elements = elements.map((element) => `#${element.replace('.', '\\.')}`);
        let textElements = [];
        for (const element of elements) {
            const exists = [
                ...this.elems.querySelectorAll(`text${element}, ${element} text`),
            ].filter((value, index, self) => index === self.findIndex((t) => value.isEqualNode(t)));
            for (const exist of exists) {
                const transform = String(exist.getAttribute('transform'))
                    .replace('matrix(', '')
                    .replace(')', '')
                    .split(',')
                    .map((x) => Number(x));
                const bbox = exist.getBBox();
                const ctm = exist.getCTM();
                const x = (ctm ? bbox.x * ctm.a + bbox.y * ctm.c + ctm.e : bbox.x) - viewBox[0];
                const y = Math.abs(ctm ? bbox.x * ctm.b + bbox.y * ctm.d + ctm.f : bbox.y) -
                    viewBox[1];
                const width = ctm ? bbox.width * Math.abs(ctm.a) : bbox.width;
                const height = ctm ? bbox.height * Math.abs(ctm.d) : bbox.height;
                textElements = [
                    ...textElements,
                    {
                        content: this.direction === Direction.Rtl
                            ? String(exist.getAttribute('data-content'))
                                .split('')
                                .reverse()
                                .join('')
                            : String(exist.getAttribute('data-content')),
                        style: {
                            x,
                            y,
                            width,
                            height,
                            bottom: y + height,
                            left: x,
                            right: x + width,
                            top: y,
                            toJSON: () => ({}),
                        },
                        transform,
                        x: exist.hasAttribute('data-x')
                            ? String(exist.getAttribute('data-x'))
                                .split(',')
                                .map((x) => Number(x))
                            : exist.hasAttribute('x')
                                ? String(exist.getAttribute('x'))
                                    .split(',')
                                    .map((x) => Number(x))
                                : [0],
                    },
                ];
            }
        }
        return textElements;
    }
    static findElementForQuery(query, element) {
        const textContent = element.textContent;
        if (textContent.toLowerCase().includes(query.toLowerCase()))
            return undefined;
        if (element.children.length === 0)
            return element;
        for (const child of Array.from(element.children)) {
            const result = this.findElementForQuery(query, child);
            if (typeof result !== 'undefined')
                return result;
        }
    }
    static font(activeFont, newFont) {
        Readiant.documentBody.classList.remove(activeFont);
        Readiant.documentBody.classList.add(newFont);
        if (Readiant.type === ContentType.SVG)
            this.changeFontForText(activeFont, newFont);
        else {
            this.resize();
            this.scrollToOffset(Math.floor(this.htmlOffset * this.pageCount));
        }
    }
    static fontSize(fontSize) {
        if (Readiant.type === ContentType.HTML) {
            this.htmlPage?.classList.remove(this.activeFontSize);
            this.htmlPage?.classList.add(`rdnt__font-size--${String(fontSize)}`);
            this.resize();
            this.scrollToOffset(Math.floor(this.htmlOffset * this.pageCount));
        }
        else {
            const textElements = this.elems?.getElementsByTagNameNS(NAMESPACE_SVG, 'text');
            for (const textElement of textElements) {
                textElement.classList.remove(this.activeFontSize);
                textElement.classList.add(`rdnt__font-size--${String(fontSize)}`);
            }
        }
        this.activeFontSize = `rdnt__font-size--${String(fontSize)}`;
    }
    static forcePortrait(bool) {
        if (this.forcingPortrait === bool)
            return;
        this.forcingPortrait = bool;
        if (bool)
            this.htmlPage?.classList.remove('rdnt__html-page--landscape');
        else
            this.htmlPage?.classList.add('rdnt__html-page--landscape');
        this.scrollToOffset(Math.floor(this.htmlOffset * this.pageCount));
    }
    static getPage(side) {
        switch (side) {
            case PagePosition.Left:
                return this.left;
            case PagePosition.Right:
                return this.right;
        }
    }
    static hide(side, twoToOne = false) {
        const page = this.getPage(side);
        const layer = side === PagePosition.Left ? this.leftLayer : this.rightLayer;
        if (twoToOne && layer !== null && !this.animationDisabled) {
            layer.classList.add(CLASS_HIDDEN);
            page.classList.add(CLASS_VISUALLY_HIDDEN);
            const animationElement = side === PagePosition.Left ? this.animationLeft : this.animationRight;
            this.waitForAnimation(animationElement)
                .then(() => {
                layer.classList.remove(CLASS_HIDDEN);
                page.classList.remove(CLASS_VISUALLY_HIDDEN);
                page.classList.add(CLASS_HIDDEN);
                this.clear(page);
            })
                .catch((e) => {
                throw e;
            });
        }
        else {
            page.classList.add(CLASS_HIDDEN);
            this.clear(page);
        }
    }
    static hidePlainTextPage() {
        this.plainTextPage?.classList.add(CLASS_HIDDEN);
        if (this.plainTextPageContent !== null)
            for (const child of Array.from(this.plainTextPageContent.childNodes))
                this.plainTextPageContent?.removeChild(child);
        if (this.plainTextPageLines !== null)
            for (const child of Array.from(this.plainTextPageLines.childNodes))
                this.plainTextPageLines?.removeChild(child);
    }
    static async html(section, hrefResolver) {
        if (this.htmlPage === null ||
            this.htmlPageContent === null ||
            this.viewport === null)
            return;
        if (typeof this.styles !== 'undefined')
            this.htmlPage?.classList.remove(...this.styles);
        // this.sentences = section.sentences;
        this.styles = section.styles;
        this.htmlPage?.classList.add(...section.styles);
        this.layout = section.layout;
        section.content = section.content.replace(/<\/br>/g, '');
        this.htmlPageContent.innerHTML = section.content;
        if (section.layout !== Layout.PrePaginated)
            this.htmlPageContent.innerHTML += `<p class="rdnt__last-element"></p>`;
        await this.waitForImages(this.htmlPageContent);
        if (section.layout === Layout.PrePaginated) {
            if (!Array.isArray(section.viewport)) {
                Readiant.errorHandler(new Error('Viewport not defined'));
                return;
            }
            Orientation.disableOrientationChange = true;
            const style = Readiant.windowContext.getComputedStyle(this.viewport, null);
            const scale = Readiant.preview && !Fullscreen.active
                ? (Readiant.windowContext.screen.width -
                    (parseFloat(style.paddingLeft) +
                        parseFloat(style.paddingRight))) /
                    section.viewport[0]
                : Math.min((Readiant.windowContext.screen.width -
                    (parseFloat(style.paddingLeft) +
                        parseFloat(style.paddingRight))) /
                    section.viewport[0], (Readiant.windowContext.innerHeight -
                    (parseFloat(style.paddingTop) +
                        parseFloat(style.paddingBottom))) /
                    section.viewport[1]);
            this.htmlPage.style.width = `${String(section.viewport[0])}px`;
            this.htmlPage.style.height = `${String(section.viewport[1])}px`;
            this.htmlPage.style.transform = `scale(${String(scale)})`;
            this.htmlPage.classList.add('rdnt__html-page--prepaginated');
            this.viewport.classList.add('rdnt__viewport--prepaginated');
            this.pageSizeEvent(section.viewport[0], section.viewport[1]);
        }
        else {
            Orientation.disableOrientationChange = false;
            this.htmlPage.removeAttribute('style');
            this.htmlPage.classList.remove('rdnt__html-page--prepaginated');
            this.viewport.classList.remove('rdnt__viewport--prepaginated');
            // A4 aspect-ratio
            this.pageSizeEvent(1, Math.sqrt(2));
        }
        for (const element of Array.from(this.htmlPageContent.getElementsByTagNameNS('http://www.w3.org/1998/Math/MathML', 'math'))) {
            if (element.parentNode === null)
                continue;
            const svg = MathJax.mathml2svg(element.outerHTML);
            if (svg.firstChild !== null)
                element.parentNode.replaceChild(svg.firstChild, element);
        }
        for (const element of Array.from(this.htmlPageContent.querySelectorAll('code, samp')))
            element.innerHTML = element.innerHTML.replace(/[&<>"']/g, (match) => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;',
            })[match]);
        for (const element of Array.from(this.htmlPageContent.getElementsByTagName('a'))) {
            const href = element.getAttribute('href');
            if (href !== null) {
                element.setAttribute('href', '#');
                element.addEventListener('click', (event) => {
                    event.preventDefault();
                    hrefResolver(href);
                });
            }
        }
        if (typeof this.currentImageQuality !== 'undefined') {
            for (const image of Array.from(this.htmlPageContent.querySelectorAll('img[src*=_]'))) {
                const src = image.getAttribute('src');
                if (src !== null)
                    image.setAttribute('src', src.replace(new RegExp('_(0.5|[0-9]).', 'gi'), `_${this.currentImageQuality}.`));
            }
        }
    }
    static imageQuality(imageQuality) {
        if (Readiant.type === ContentType.HTML)
            this.imageQualityHTML(imageQuality);
        else
            this.imageQualitySVG(imageQuality);
    }
    static imageQualityHTML(imageQuality) {
        if (this.htmlPageContent === null)
            return;
        let size;
        switch (imageQuality) {
            case EffectiveConnectionType.SlowTwoG:
                size = '0.5';
                break;
            default:
            case EffectiveConnectionType.TwoG:
                size = '1';
                break;
        }
        this.currentImageQuality = size;
        for (const image of Array.from(this.htmlPageContent.querySelectorAll('img[src*=_]'))) {
            const src = image.getAttribute('src');
            if (src !== null)
                image.setAttribute('src', src.replace(new RegExp('_(0.5|[0-9]).', 'gi'), `_${size}.`));
        }
    }
    static imageQualitySVG(imageQuality) {
        if (this.defs === null || this.elems === null)
            return;
        let size;
        switch (imageQuality) {
            case EffectiveConnectionType.TwoG:
                size = '1';
                break;
            default:
            case EffectiveConnectionType.FourG:
                size = '4';
                break;
        }
        this.currentImageQuality = size;
        const imagesInDefs = Array.from(this.defs.querySelectorAll('image[*|href*="_"]'));
        const imagesInElements = Array.from(this.elems.querySelectorAll('image[*|href*="_"]'));
        for (const image of [...imagesInDefs, ...imagesInElements]) {
            const href = image.getAttributeNS(NAMESPACE_XLINK, 'href');
            if (href !== null)
                image.setAttributeNS(NAMESPACE_XLINK, 'href', href.replace(new RegExp('_(0.5|[0-9]).', 'gi'), `_${size}.`));
        }
    }
    static isAnimationPage(page) {
        if (this.animationPages.some((current) => current.page === page))
            return this.animationPages.find((cur) => cur.page === page)?.position;
        return undefined;
    }
    static get isFirstPageOfSection() {
        if (this.layout === Layout.PrePaginated)
            return true;
        return Navigation.direction === Direction.Rtl
            ? this.isRightMostPage
            : this.isLeftMostPage;
    }
    static get isLastPageOfSection() {
        if (this.layout === Layout.PrePaginated)
            return true;
        return Navigation.direction === Direction.Rtl
            ? this.isLeftMostPage
            : this.isRightMostPage;
    }
    static get isLeftMostPage() {
        return this.htmlPage === null
            ? false
            : specGetScrollLeft(this.htmlPage) === 0;
    }
    static get isRightMostPage() {
        if (this.htmlPage === null || this.htmlPageContent === null)
            return false;
        const rightMostChild = Math.max(...Array.from(this.htmlPageContent.querySelectorAll('*:not(.rdnt__last-element)')).map((child) => child.getBoundingClientRect().right));
        const right = this.htmlPage.getBoundingClientRect().right;
        return rightMostChild <= right;
    }
    static layer(side) {
        if (this.isAnimating || this.viewport === null)
            return;
        const page = this.getPage(side);
        if (page === null)
            return;
        const computed = page.getBoundingClientRect();
        const viewport = this.viewport.getBoundingClientRect();
        const rootRect = Readiant.documentBody.getBoundingClientRect();
        const adjustedX = computed.x - rootRect.left + Readiant.documentBody.scrollLeft;
        const adjustedY = computed.y - rootRect.top + Readiant.documentBody.scrollTop;
        if (side === PagePosition.Left) {
            if (this.leftLayer !== null) {
                this.leftLayer.style.height = `${String(computed.height)}px`;
                this.leftLayer.style.left = `${String(adjustedX)}px`;
                this.leftLayer.style.top = `${String(adjustedY)}px`;
                this.leftLayer.style.width = `${String(computed.width)}px`;
            }
            if (this.animationLeft !== null) {
                this.animationLeft.style.height = `${String(computed.height)}px`;
                this.animationLeft.style.left = `${String(adjustedX)}px`;
                this.animationLeft.style.top = `${String(adjustedY)}px`;
                this.animationLeft.style.width = `${String(computed.width)}px`;
            }
            if (this.rightLayer !== null) {
                if (computed.height === 0 && computed.width === 0)
                    this.rightLayer.classList.add(CLASS_SINGLE);
                else
                    this.rightLayer.classList.remove(CLASS_SINGLE);
            }
        }
        else {
            if (this.rightLayer !== null) {
                this.rightLayer.style.height = `${String(computed.height)}px`;
                this.rightLayer.style.left = `${String(adjustedX)}px`;
                this.rightLayer.style.top = `${String(adjustedY)}px`;
                this.rightLayer.style.width = `${String(computed.width)}px`;
            }
            if (this.animationRight !== null) {
                this.animationRight.style.height = `${String(computed.height)}px`;
                this.animationRight.style.left = `${String(adjustedX)}px`;
                this.animationRight.style.top = `${String(adjustedY)}px`;
                this.animationRight.style.width = `${String(computed.width)}px`;
            }
            if (this.leftLayer !== null) {
                if (computed.height === 0 && computed.width === 0)
                    this.leftLayer.classList.add(CLASS_SINGLE);
                else
                    this.leftLayer.classList.remove(CLASS_SINGLE);
            }
        }
        if (viewport.height >= Readiant.documentElementContext.clientHeight ||
            viewport.width >= Readiant.documentElementContext.clientWidth) {
            if (this.layers !== null) {
                this.layers.style.height = `${String(viewport.height)}px`;
                this.layers.style.width = `${String(viewport.width)}px`;
            }
        }
        else {
            if (this.layers !== null) {
                this.layers.style.height = '100%';
                this.layers.style.width = '100%';
            }
        }
        Annotations.resize(side, computed.height, computed.width);
    }
    /*private static layerHtml(): void {
      const { height, x, y } = this.htmlPage.getBoundingClientRect();
  
      this.htmlLayer.style.height = `${height}px`;
      this.htmlLayer.style.left = `${x + Readiant.scrollX}px`;
      this.htmlLayer.style.top = `${y + Readiant.scrollY}px`;
      this.htmlLayer.style.width = `${this.pageSizeHTML() * this.pageCount}px`;
  
      this.textLayerHtml();
    }*/
    static letterSpacing(letterSpacing) {
        if (Readiant.type === ContentType.HTML) {
            if (this.htmlPage === null)
                return;
            this.htmlPage.classList.remove(this.activeLetterSpacing);
            this.htmlPage.classList.add(`rdnt__letter-spacing--${String(letterSpacing)}`);
            this.resize();
            this.scrollToOffset(Math.floor(this.htmlOffset * this.pageCount));
        }
        else {
            const textElements = this.elems?.getElementsByTagNameNS(NAMESPACE_SVG, 'text');
            for (const textElement of textElements) {
                textElement.classList.remove(this.activeLetterSpacing);
                textElement.classList.add(`rdnt__letter-spacing--${String(letterSpacing)}`);
            }
        }
        this.activeLetterSpacing = `rdnt__letter-spacing--${String(letterSpacing)}`;
    }
    static lineHeight(lineHeight) {
        if (this.htmlPage === null)
            return;
        this.htmlPage.classList.remove(this.activeLineHeight);
        this.htmlPage.classList.add(`rdnt__html-page--line-height--${String(lineHeight)}`);
        this.activeLineHeight = `rdnt__html-page--line-height--${String(lineHeight)}`;
        this.scrollToOffset(Math.floor(this.htmlOffset * this.pageCount));
    }
    static normalize(string, removeWhitespace = true) {
        if (typeof string === 'undefined')
            return '';
        string = string.replace(/'&amp;/g, '&');
        string = Navigation.unescapeHTMLNamedEntities(string);
        return string
            .replace(/[^(\p{L}|\p{N}|\p{Z})]/gu, '')
            .normalize('NFKD')
            .replace(/\p{Diacritic}/gu, '')
            .replace(/\s+/g, removeWhitespace ? '' : ' ')
            .toLowerCase()
            .trim();
    }
    static notify(page, side) {
        for (const handler of this.handlers)
            handler(page, side);
    }
    static observe() {
        const callback = debounce(() => {
            this.resize();
        }, 100);
        const observer = new ResizeObserver(callback);
        if (Readiant.type === ContentType.SVG &&
            Readiant.windowContext.screen.width <= this.PORTRAIT_WIDTH &&
            Orientation.mode === OrientationMode.Landscape) {
            Orientation.toggle();
            Orientation.disableOrientationChange = true;
        }
        observer.observe(Readiant.documentBody);
    }
    static openLink(event) {
        if (typeof event.clientX !== 'undefined' &&
            typeof event.clientY !== 'undefined') {
            const elements = Readiant.root.elementsFromPoint(event.clientX, event.clientY);
            for (const element of elements) {
                if (element.tagName.toLowerCase() === 'use') {
                    const href = element.getAttributeNS(NAMESPACE_XLINK, 'href');
                    if (href !== null && this.cachedLinks.has(href.substring(1)))
                        Readiant.windowContext.open(String(this.cachedLinks.get(href.substring(1))), '_blank');
                }
            }
        }
    }
    static get pageCount() {
        if (this.htmlPage === null)
            return 1;
        const pageCount = Math.ceil(this.htmlPage.scrollWidth / this.pageSizeHTML()) - 2;
        return pageCount < 1 ? 1 : pageCount;
    }
    static pageGroup(ids) {
        const group = Readiant.documentContext.createElementNS(NAMESPACE_SVG, 'g');
        for (const id of ids) {
            const use = Readiant.documentContext.createElementNS(NAMESPACE_SVG, 'use');
            use.setAttributeNS(NAMESPACE_XLINK, 'xlink:href', `#${id}`);
            group.appendChild(use);
        }
        return group.outerHTML;
    }
    static pageSizeHTML() {
        if (this.htmlPage === null)
            return 0;
        const orientation = this.computeOrientation();
        if (this.layout === Layout.PrePaginated)
            return this.htmlPage.clientWidth;
        return orientation === OrientationMode.Landscape
            ? this.htmlPage.clientWidth / 2
            : this.htmlPage.clientWidth;
    }
    static pageSizeSVG(pageAndViewbox) {
        const aspectRatio = pageAndViewbox.viewBox[3] / pageAndViewbox.viewBox[2];
        const page = this.getPage(pageAndViewbox.side);
        const viewBox = page.getAttribute('viewBox');
        if (viewBox !== pageAndViewbox.viewBox.join(' ') ||
            this.previouslyShownPages !== Navigation.currentPages.length) {
            const screenAspectRatio = this.screenAspectRatio(Navigation.currentPages.length === 1);
            page.classList.remove('rdnt__page--height', 'rdnt__page--width');
            page.classList.add(`rdnt__page--${aspectRatio > screenAspectRatio ? 'height' : 'width'}`);
            page.setAttribute('viewBox', pageAndViewbox.viewBox.join(' '));
            this.pageSizeEvent(pageAndViewbox.viewBox[2], pageAndViewbox.viewBox[3]);
            this.previouslyShownPages = Navigation.currentPages.length;
        }
        // Page needs to be rotated
        if (pageAndViewbox.rotation !== 0)
            page.setAttribute('style', this.computeTransform(pageAndViewbox.rotation));
        else if (page.hasAttribute('style'))
            page.removeAttribute('style');
        this.layer(pageAndViewbox.side);
    }
    static pageSizeEvent(width, height) {
        eventLogger({
            type: LogType.Resize,
            height,
            width,
        });
    }
    static async plainText() {
        if (this.plainTextPage === null || this.plainTextPageContent === null)
            return;
        const content = this.plainTextContent();
        this.plainTextPage.scrollTop = 0;
        this.plainTextPageContent.innerHTML = content;
        const words = [
            ...this.plainTextPageContent.querySelectorAll('.rdnt__plain-text-page__word'),
        ];
        for (const word of words) {
            word.addEventListener('click', (event) => {
                event.preventDefault();
                this.openLink(event);
                this.showSentence(PagePosition.Left, String(word.getAttribute('data-s')), String(word.getAttribute('data-w')));
            });
            word.addEventListener('keydown', (event) => {
                A11y.shortcut(event);
            });
            word.addEventListener('mouseenter', () => {
                this.startHighlightingSentence(PagePosition.Left, String(word.getAttribute('data-s')), String(word.getAttribute('data-w')));
            });
            word.addEventListener('focus', () => {
                this.startHighlightingSentence(PagePosition.Left, String(word.getAttribute('data-s')), String(word.getAttribute('data-w')));
            });
            word.addEventListener('mouseout', () => {
                this.stopHighlighting();
            });
            word.addEventListener('blur', () => {
                this.stopHighlighting();
            });
        }
        await this.plainTextLines();
        const page = this.getPage(PagePosition.Left);
        const currentViewBox = String(page.getAttribute('viewBox')).split(' ');
        const aspectRatio = Number(currentViewBox[3]) / Number(currentViewBox[2]);
        page.classList.remove('rdnt__page--height', 'rdnt__page--width');
        page.classList.add(`rdnt__page--${aspectRatio > 1 ? 'height' : 'width'}`);
    }
    static plainTextContent() {
        if (this.leftTextLayer === null)
            return '';
        const sentenceElements = [
            ...this.leftTextLayer.querySelectorAll(`:not(.${CLASS_HIGHLIGHT_IGNORE})`),
        ].flatMap((element) => [...element.children].map((word) => ({
            content: String(word.getAttribute('data-word')),
            left: parseFloat(element.style.left),
            sentence: String(word.getAttribute('data-s')),
            top: parseFloat(element.style.top),
            word: String(word.getAttribute('data-w')),
        })));
        const grouped = Object.values(groupBy(sentenceElements, (element) => element.sentence)).sort((a, b) => a[0].top === b[0].top ? a[0].left - a[0].left : a[0].top - b[0].top);
        return sentenceElements.length > 0
            ? grouped
                .map((sentence) => `<span class="rdnt__plain-text-page__sentence">${sentence
                .map((word) => `<span class="rdnt__plain-text-page__word" data-s="${sentence[0].sentence}" data-w="${word.word}">${word.content}</span>`)
                .join('')}</span>`)
                .join('')
                .replace(/\s+/g, ' ')
                .trim()
            : '';
    }
    static async plainTextLines() {
        if (this.plainTextPageContent === null || this.plainTextPageLines === null)
            return;
        await this.waitForNextFrame();
        const computedStyle = Readiant.windowContext.getComputedStyle(this.plainTextPageContent, null);
        const lines = Math.round((parseFloat(computedStyle.getPropertyValue('height')) -
            parseFloat(computedStyle.getPropertyValue('padding-bottom')) -
            parseFloat(computedStyle.getPropertyValue('padding-top'))) /
            parseFloat(computedStyle.getPropertyValue('line-height')));
        this.plainTextPageLines.innerHTML = [...Array(lines).keys()]
            .map((_, i) => `<span class="rdnt__plain-text-page__line${(i + 1) % 5 === 0 ? ' rdnt__plain-text-page__line--bold' : ''}">${String(i + 1)}</span>`)
            .join('');
    }
    static resize() {
        const elements = [
            ...Readiant.root.querySelectorAll('.rdnt__menu__buttons-right > .hidden'),
        ];
        if (elements.length === 3)
            Readiant.toggleMenu();
        if (Readiant.type === ContentType.HTML)
            this.resizeHTML();
        else
            this.resizeSVG();
    }
    static resizeHTML() {
        const forcePortrait = Readiant.windowContext.screen.width <= this.PORTRAIT_WIDTH ||
            Readiant.windowContext.matchMedia('(orientation: portrait)').matches;
        if (Orientation.mode === OrientationMode.Landscape && forcePortrait)
            this.forcePortrait(forcePortrait);
        // this.layerHtml();
    }
    static resizeSVG() {
        const screenAspectRatio = this.screenAspectRatio(Navigation.currentPages.length === 1);
        const sides = [
            PagePosition.Left,
            PagePosition.Right,
        ];
        if (Readiant.windowContext.screen.width <= this.PORTRAIT_WIDTH &&
            Orientation.mode === OrientationMode.Landscape) {
            Orientation.toggle();
            Orientation.disableOrientationChange = true;
        }
        else if (Readiant.windowContext.screen.width > this.PORTRAIT_WIDTH &&
            Orientation.disableOrientationChange) {
            Orientation.disableOrientationChange = false;
        }
        for (const side of sides) {
            const page = this.getPage(side);
            const viewBox = page.getAttribute('viewBox');
            if (viewBox === null)
                continue;
            const currentViewBox = viewBox.split(' ');
            const aspectRatio = Number(currentViewBox[3]) / Number(currentViewBox[2]);
            page.classList.remove('rdnt__page--height', 'rdnt__page--width');
            page.classList.add(`rdnt__page--${aspectRatio > screenAspectRatio ? 'height' : 'width'}`);
            this.layer(side);
        }
    }
    static screenAspectRatio(singlePage = false) {
        if (this.viewport !== null) {
            const viewportRect = this.viewport.getBoundingClientRect();
            const viewportStyle = Readiant.windowContext.getComputedStyle(this.viewport);
            const paddingTop = parseFloat(viewportStyle.paddingTop);
            const paddingBottom = parseFloat(viewportStyle.paddingBottom);
            const paddingLeft = parseFloat(viewportStyle.paddingLeft);
            const paddingRight = parseFloat(viewportStyle.paddingRight);
            const availableHeight = viewportRect.height - paddingTop - paddingBottom;
            const availableWidth = viewportRect.width - paddingLeft - paddingRight;
            return (availableHeight /
                (Orientation.mode === OrientationMode.Landscape && !singlePage
                    ? availableWidth / 2
                    : availableWidth));
        }
        return (Readiant.documentElementContext.clientHeight /
            (Orientation.mode === OrientationMode.Landscape && !singlePage
                ? Readiant.documentElementContext.clientWidth / 2
                : Readiant.documentElementContext.clientWidth));
    }
    static screenMode(currentScreenMode, screenModeLevel) {
        Readiant.documentBody.classList.remove(`rdnt__mode-${String(currentScreenMode)}`);
        Readiant.documentBody.classList.add(`rdnt__mode-${String(screenModeLevel)}`);
    }
    static scrollToElement(element) {
        this.scrollToOffset(Math.ceil(element.offsetLeft / this.pageSizeHTML()));
    }
    static scrollToId(id) {
        if (this.htmlPage === null)
            return;
        const element = this.htmlPage.querySelector(`#${id}`);
        if (element === null)
            return;
        this.scrollToElement(element);
    }
    static scrollToOffset(offset) {
        if (this.htmlPage === null)
            return;
        if (Navigation.direction === Direction.Ltr)
            specSetScrollLeft(this.htmlPage, offset * this.pageSizeHTML());
        else
            specSetScrollLeft(this.htmlPage, -offset * this.pageSizeHTML());
        this.htmlOffset = offset / this.pageCount;
        this.textLayerHtml();
        Navigation.htmlProgress();
    }
    static scrollToResult(query) {
        const element = this.findElementForQuery(query, Readiant.documentBody);
        if (typeof element !== 'undefined')
            this.scrollToElement(element);
    }
    static show(page) {
        page.classList.remove(CLASS_HIDDEN);
    }
    static showPlainTextPage() {
        this.plainTextPage?.classList.remove(CLASS_HIDDEN);
    }
    static showSentence(side, sentence, word) {
        const sentences = side === PagePosition.Left
            ? this.leftTextLayer?.querySelectorAll(`:not(.${CLASS_HIGHLIGHT_IGNORE}) > [data-s="${sentence}"]`)
            : side === PagePosition.Right
                ? this.rightTextLayer?.querySelectorAll(`:not(.${CLASS_HIGHLIGHT_IGNORE}) > [data-s="${sentence}"]`)
                : this.htmlTextLayer?.querySelectorAll(`:not(.${CLASS_HIGHLIGHT_IGNORE}) > [data-s="${sentence}"]`);
        const sentenceElements = typeof sentences !== 'undefined'
            ? [...sentences]
            : [];
        const wordElement = side === PagePosition.Left
            ? this.leftTextLayer?.querySelector(`[data-w="${word}"]`)
            : side === PagePosition.Right
                ? this.rightTextLayer?.querySelector(`[data-w="${word}"]`)
                : this.htmlTextLayer?.querySelector(`[data-w="${word}"]`);
        if (wordElement !== null && typeof wordElement !== 'undefined')
            Bar.add(Bar.readStop === 3
                ? String(wordElement.getAttribute('data-word'))
                : sentenceElements
                    .map((w) => String(w.getAttribute('data-w')) === word
                    ? `<span class="rdnt__bottom-bar__word rdnt__bottom-bar__word--highlight">${String(w.getAttribute('data-word'))}</span>`
                    : `<span class="rdnt__bottom-bar__word">${String(w.getAttribute('data-word'))}</span>`)
                    .join(''));
        this.currentSentenceIndex = Number(sentence);
        if (typeof side !== 'undefined')
            this.currentSide = side;
        this.currentWordIndex = Number(word);
    }
    static start(side) {
        const page = this.getPage(side);
        if (page.hasAttribute('viewBox') || page.innerHTML.trim() !== '') {
            if (!this.animationDisabled) {
                const animationElement = side === PagePosition.Left ? this.animationLeft : this.animationRight;
                this.waitForAnimation(animationElement)
                    .then(() => {
                    this.show(page);
                })
                    .catch((e) => {
                    throw e;
                });
            }
            else
                this.show(page);
        }
    }
    static startHighlighting(side, indices) {
        this.stopHighlighting();
        if (this.leftTextLayer === null ||
            this.rightTextLayer === null ||
            indices.length === 0)
            return;
        const query = indices.map((index) => `:not(.${CLASS_HIGHLIGHT_IGNORE}) > [data-i="${String(index)}"]`);
        const sentences = side === PagePosition.Left
            ? this.leftTextLayer.querySelectorAll(query.join())
            : this.rightTextLayer.querySelectorAll(query.join());
        for (const sentence of sentences) {
            for (const word of sentence.children)
                word.classList.add(CLASS_HIGHLIGHT_ACTIVE);
        }
    }
    static startHighlightingBackward(wordOrSentence, last = false) {
        this.stopHighlighting();
        if (this.leftTextLayer === null || this.rightTextLayer === null)
            return;
        const currentPage = Navigation.currentPages.find((page) => page.position === this.currentSide);
        if (typeof currentPage === 'undefined')
            return;
        const elements = this.elementsOnPage.get(currentPage.page);
        if (typeof elements === 'undefined') {
            this.highlightOnLoad = {
                first: false,
                last: true,
                side: Orientation.mode === OrientationMode.Portrait
                    ? PagePosition.Left
                    : this.currentSide === PagePosition.Left
                        ? PagePosition.Right
                        : PagePosition.Left,
                wordOrSentence,
            };
            Navigation.onLeftPressed();
            return;
        }
        if (wordOrSentence === 2)
            Audio.resetEndSentenceTime();
        else
            Audio.resetEndWordTime();
        const index = wordOrSentence === 2
            ? last
                ? elements.sentences - 1
                : this.currentSentenceIndex - 1
            : last
                ? elements.words - 1
                : this.currentWordIndex - 1;
        if (index < 0) {
            const elementsOnPreviousPage = this.elementsOnPage.get(currentPage.page - 1);
            if (Orientation.mode === OrientationMode.Landscape &&
                this.currentSide === PagePosition.Right &&
                typeof elementsOnPreviousPage !== 'undefined') {
                this.currentSide = PagePosition.Left;
                this.startHighlightingBackward(wordOrSentence, true);
            }
            else {
                this.highlightOnLoad = {
                    first: false,
                    last: true,
                    side: Orientation.mode === OrientationMode.Portrait
                        ? PagePosition.Left
                        : this.currentSide === PagePosition.Left
                            ? PagePosition.Right
                            : PagePosition.Left,
                    wordOrSentence,
                };
                Navigation.onLeftPressed();
            }
            return;
        }
        const highlights = this.currentSide === PagePosition.Left
            ? this.leftTextLayer.querySelectorAll(`:not(.${CLASS_HIGHLIGHT_IGNORE}) > [data-${wordOrSentence === 2 ? 's' : 'w'}="${String(index)}"]`)
            : this.rightTextLayer.querySelectorAll(`:not(.${CLASS_HIGHLIGHT_IGNORE}) > [data-${wordOrSentence === 2 ? 's' : 'w'}="${String(index)}"]`);
        if (highlights.length === 0)
            return;
        Bar.add([...highlights]
            .map((word) => `<span class="rdnt__bottom-bar__word">${String(word.getAttribute('data-word'))}</span>`)
            .join(''));
        let i = 0;
        for (const highlight of highlights) {
            if (i === 0) {
                this.currentWordIndex = Number(highlight.getAttribute('data-w'));
                this.currentSentenceIndex = Number(highlight.getAttribute('data-s'));
                if (highlight.getAttribute('data-time') !== null)
                    Audio.setStartTime(currentPage.page, Number(highlight.getAttribute('data-time')));
            }
            highlight.classList.add(CLASS_HIGHLIGHT_ACTIVE);
            i++;
        }
    }
    static startHighlightingForward(wordOrSentence, first = false) {
        this.stopHighlighting();
        if (this.leftTextLayer === null || this.rightTextLayer === null)
            return;
        const currentPage = Navigation.currentPages.find((page) => page.position === this.currentSide);
        if (typeof currentPage === 'undefined')
            return;
        const elements = this.elementsOnPage.get(currentPage.page);
        if (typeof elements === 'undefined') {
            this.highlightOnLoad = {
                first: true,
                last: false,
                side: Orientation.mode === OrientationMode.Portrait
                    ? PagePosition.Left
                    : this.currentSide === PagePosition.Left
                        ? PagePosition.Right
                        : PagePosition.Left,
                wordOrSentence,
            };
            Navigation.onRightPressed();
            return;
        }
        if (wordOrSentence === 2)
            Audio.resetEndSentenceTime();
        else
            Audio.resetEndWordTime();
        const index = first
            ? 0
            : wordOrSentence === 2
                ? this.currentSentenceIndex + 1
                : this.currentWordIndex + 1;
        if ((wordOrSentence === 2 && index >= elements.sentences) ||
            (wordOrSentence === 3 && index >= elements.words)) {
            const elementsOnNextPage = this.elementsOnPage.get(currentPage.page + 1);
            if (Orientation.mode === OrientationMode.Landscape &&
                this.currentSide === PagePosition.Left &&
                typeof elementsOnNextPage !== 'undefined') {
                this.currentSide = PagePosition.Right;
                this.startHighlightingForward(wordOrSentence, true);
            }
            else {
                this.highlightOnLoad = {
                    first: true,
                    last: false,
                    side: Orientation.mode === OrientationMode.Portrait
                        ? PagePosition.Left
                        : this.currentSide === PagePosition.Left
                            ? PagePosition.Right
                            : PagePosition.Left,
                    wordOrSentence,
                };
                Navigation.onRightPressed();
            }
            return;
        }
        const highlights = this.currentSide === PagePosition.Left
            ? this.leftTextLayer.querySelectorAll(`:not(.${CLASS_HIGHLIGHT_IGNORE}) > [data-${wordOrSentence === 2 ? 's' : 'w'}="${String(index)}"]`)
            : this.rightTextLayer.querySelectorAll(`:not(.${CLASS_HIGHLIGHT_IGNORE}) > [data-${wordOrSentence === 2 ? 's' : 'w'}="${String(index)}"]`);
        if (highlights.length === 0)
            return;
        Bar.add([...highlights]
            .map((word) => `<span class="rdnt__bottom-bar__word">${String(word.getAttribute('data-word'))}</span>`)
            .join(''));
        let i = 0;
        for (const highlight of highlights) {
            if (i === 0) {
                this.currentWordIndex = Number(highlight.getAttribute('data-w'));
                this.currentSentenceIndex = Number(highlight.getAttribute('data-s'));
                if (highlight.getAttribute('data-time') !== null)
                    Audio.setStartTime(currentPage.page, Number(highlight.getAttribute('data-time')));
            }
            highlight.classList.add(CLASS_HIGHLIGHT_ACTIVE);
            i++;
        }
    }
    static startHighlightingSentencePlainText(sentence, event) {
        if (this.plainTextPageContent === null)
            return;
        const words = this.plainTextPageContent.querySelectorAll(`:not(.${CLASS_HIGHLIGHT_IGNORE}) > [data-s="${sentence}"]`);
        for (const word of words) {
            const dataWord = word.getAttribute('data-w');
            word.classList.add(CLASS_HIGHLIGHT_ACTIVE);
            if (typeof event !== 'undefined' && dataWord === event)
                word.classList.add(CLASS_HIGHLIGHT_WORD_ACTIVE);
        }
    }
    static startHighlightingSentence(side, sentence, event) {
        const words = side === PagePosition.Left
            ? this.leftTextLayer?.querySelectorAll(`:not(.${CLASS_HIGHLIGHT_IGNORE}) > [data-s="${sentence}"]`)
            : side === PagePosition.Right
                ? this.rightTextLayer?.querySelectorAll(`:not(.${CLASS_HIGHLIGHT_IGNORE}) > [data-s="${sentence}"]`)
                : this.htmlTextLayer?.querySelectorAll(`:not(.${CLASS_HIGHLIGHT_IGNORE}) > [data-s="${sentence}"]`);
        if (typeof words === 'undefined')
            return;
        for (const word of words) {
            const dataWord = word.getAttribute('data-w');
            word.classList.add(CLASS_HIGHLIGHT_ACTIVE);
            if (typeof event !== 'undefined' && dataWord === event)
                word.classList.add(CLASS_HIGHLIGHT_WORD_ACTIVE);
        }
        if (TextMode.level !== 1)
            this.startHighlightingSentencePlainText(sentence, event);
    }
    static startHighlightingSyntax(syntax, lineHighlighter, wordIndexInSyntax, side) {
        if (lineHighlighter === 3)
            return;
        if (this.leftTextLayer === null || this.rightTextLayer === null)
            return;
        const filteredSentences = syntax
            .map((s, index) => ({ ...s, index }))
            .filter((s) => s.type === SpeechMarkType.Sentence && s.index < wordIndexInSyntax);
        const words = side === PagePosition.Left
            ? this.leftTextLayer.querySelectorAll(`:not(.${CLASS_HIGHLIGHT_IGNORE}) > [data-s="${String(filteredSentences.length - 1)}"]`)
            : this.rightTextLayer.querySelectorAll(`:not(.${CLASS_HIGHLIGHT_IGNORE}) > [data-s="${String(filteredSentences.length - 1)}"]`);
        for (const word of words) {
            this.currentSentenceIndex = Number(word.getAttribute('data-s'));
            word.classList.add(CLASS_HIGHLIGHT_SYNTAX_ACTIVE);
            if (lineHighlighter === 1 &&
                word.getAttribute('data-i') === String(wordIndexInSyntax)) {
                this.currentWordIndex = Number(word.getAttribute('data-w'));
                word.classList.add(CLASS_HIGHLIGHT_SYNTAX_WORD_ACTIVE);
            }
        }
    }
    static stopHighlighting(side) {
        if (this.leftTextLayer === null || this.rightTextLayer === null)
            return;
        const words = typeof side !== 'undefined' && TextMode.level === 1
            ? side === PagePosition.Left
                ? this.leftTextLayer.querySelectorAll(`.${CLASS_HIGHLIGHT_ACTIVE}`)
                : this.rightTextLayer.querySelectorAll(`.${CLASS_HIGHLIGHT_ACTIVE}`)
            : Readiant.root.querySelectorAll(`.${CLASS_HIGHLIGHT_ACTIVE}`);
        for (const word of words) {
            word.classList.remove(CLASS_HIGHLIGHT_ACTIVE);
            word.classList.remove(CLASS_HIGHLIGHT_WORD_ACTIVE);
        }
        this.highlightOnLoad = undefined;
    }
    static stopHighlightingSyntax(side) {
        if (this.leftTextLayer === null || this.rightTextLayer === null)
            return;
        const words = typeof side !== 'undefined'
            ? side === PagePosition.Left
                ? this.leftTextLayer.querySelectorAll(`.${CLASS_HIGHLIGHT_SYNTAX_ACTIVE}`)
                : this.rightTextLayer.querySelectorAll(`.${CLASS_HIGHLIGHT_SYNTAX_ACTIVE}`)
            : Readiant.root.querySelectorAll(`.${CLASS_HIGHLIGHT_SYNTAX_ACTIVE}`);
        for (const word of words) {
            word.classList.remove(CLASS_HIGHLIGHT_SYNTAX_ACTIVE);
            word.classList.remove(CLASS_HIGHLIGHT_SYNTAX_WORD_ACTIVE);
        }
    }
    static async svg(pageNumber, side) {
        if (typeof this.isAnimationPage(pageNumber) !== 'undefined')
            await this.waitForAnimation(side === PagePosition.Left ? this.animationRight : this.animationLeft);
        const { blueprint, elements, rotation, viewBox } = Storage.getPage(pageNumber);
        const page = this.getPage(side);
        this.hide(side);
        if (side === PagePosition.Left)
            this.clear(this.leftTextLayer);
        else
            this.clear(this.rightTextLayer);
        await this.waitForElements(elements);
        page.innerHTML = blueprint;
        if (TextMode.level !== 3) {
            this.show(page);
            await this.waitForNextFrame();
        }
        this.pageSizeSVG({ rotation, side, viewBox });
        this.notify(pageNumber, side);
    }
    static textElement(textElement, content, index, viewBox, ignore) {
        const div = Readiant.documentContext.createElement('div');
        div.setAttribute('class', `rdnt__highlight${ignore === true ? ' ' + CLASS_HIGHLIGHT_IGNORE : ''}`);
        div.setAttribute('data-i', String(index));
        div.style.height = `${((textElement.style.height / viewBox[3]) *
            100).toFixed(2)}%`;
        div.style.left = `${((textElement.style.x / viewBox[2]) * 100).toFixed(2)}%`;
        div.style.top = `${(100 - (textElement.style.y / viewBox[3]) * 100).toFixed(2)}%`;
        div.style.width = `${((textElement.style.width / viewBox[2]) * 100).toFixed(2)}%`;
        div.style.transform = `matrix(${textElement.transform[0] !== 0
            ? `${String(textElement.transform[0])}%`
            : '0'},${textElement.transform[1] !== 0 ? `${String(textElement.transform[1])}%` : '0'},${textElement.transform[2] !== 0
            ? `${String(textElement.transform[2])}%`
            : '0'},${textElement.transform[3] !== 0
            ? `${String(textElement.transform[3])}%`
            : '0'},0,0)`;
        let i = 0;
        let j = 0;
        let offset = 0;
        let previousWidth = 0;
        let spans = [];
        let mapped = [];
        const spaceAtEnd = textElement.content.length !== textElement.content.trim().length;
        const hasSpacesInX = textElement.content.length - (spaceAtEnd ? 1 : 0) <= textElement.x.length;
        const characters = hasSpacesInX
            ? textElement.content.toLowerCase().split('')
            : textElement.content.toLowerCase().replace(/\s+/g, '').split('');
        const contentLength = content.length;
        for (const [i, character] of characters.entries()) {
            if (characters.length === contentLength) {
                mapped = [...mapped, { content: content.substring(0, 1), i: i + 1 }];
                content = content.substring(1);
            }
            else {
                const index = content.toLowerCase().indexOf(character);
                if (index === -1 ||
                    (characters.length > contentLength &&
                        index > characters.length - i - content.length))
                    continue;
                mapped = [
                    ...mapped,
                    { content: content.substring(0, index + 1), i: i + 1 },
                ];
                content = content.substring(index + 1);
            }
        }
        mapped = mapped.reduce((previous, current) => {
            const contents = current.content.trim() === '' ? [''] : current.content.split(/\s+/);
            for (const content of contents) {
                const last = previous.length - 1;
                if (content.trim() === '') {
                    previous = [...previous, { content: '', i: current.i }];
                }
                else
                    previous[last] = {
                        content: `${previous[last].content}${current.content}`.trim(),
                        i: current.i,
                    };
            }
            return previous;
        }, [{ content: '', i: 0 }]);
        for (const map of mapped) {
            let left = (textElement.x[i] / textElement.style.width) *
                100 *
                textElement.transform[0];
            if (map.content === '')
                continue;
            if (isNaN(left))
                left = 0;
            if (j === 0 && left > 0) {
                offset = left;
                left = 0;
            }
            else if (j > 0 && offset > 0)
                left = left - offset;
            i = map.i + (hasSpacesInX ? 1 : 0);
            const spanWidth = typeof textElement.x[i] !== 'undefined'
                ? (textElement.x[i] / textElement.style.width) *
                    100 *
                    textElement.transform[0] -
                    previousWidth -
                    offset
                : 100 - left;
            spans = [
                ...spans,
                `<span
        aria-label="${this.wordLabel.replace('%s', map.content)}"
        class="${CLASS_HIGHLIGHT_WORD}"
        data-word="${map.content}"
        style="${this.direction === Direction.Rtl ? 'right' : 'left'}:${left === 0 || mapped.length === 1 ? String(0) : left.toFixed(2) + '%'};width:${spanWidth === 100 || mapped.length === 1
                    ? String(100)
                    : spanWidth.toFixed(2)}%;"
        tabindex="0"
        ></span>`,
            ];
            j = j + 1;
            previousWidth = previousWidth + spanWidth;
        }
        div.innerHTML = spans.join(' ');
        return [content, div];
    }
    static textLayer(elements, textContent, side, viewBox) {
        if (textContent.content.length === 0)
            return;
        const fragment = Readiant.documentContext.createDocumentFragment();
        const textElements = this.filterTextElements(elements, viewBox);
        const textElementsAndContent = new Map();
        for (const textElement of textElements)
            if (textElement.content.trim() !== '')
                this.processTextElementContent(textElement, textContent, textElementsAndContent);
        let content = '';
        let remaining = '';
        for (const textElementAndContent of textElementsAndContent.values()) {
            if (textElementAndContent.ignore !== true) {
                content = `${content}${textElementAndContent.content}`;
                if (remaining.length > 0 &&
                    remaining.trim().length > 0 &&
                    textElementAndContent.elements.length === 1) {
                    content = remaining;
                    textElementAndContent.elements[0].content = remaining;
                }
            }
            for (const textElement of textElementAndContent.elements) {
                const [returnedContent, div] = this.textElement(textElement, content, textElementAndContent.index, viewBox, textElementAndContent.ignore);
                if (div.children.length > 0) {
                    const newRemaining = this.normalize(textElement.content).replace(this.normalize(content), '');
                    if (newRemaining !== textElement.content && newRemaining.length > 0)
                        remaining = newRemaining;
                    else if (this.normalize(textElement.content) !== this.normalize(content))
                        remaining = content.replace(textElement.content, '');
                    else
                        remaining = '';
                    if (textElement.x.length === content.length &&
                        textElement.x.length !== textContent.content.length)
                        remaining = '';
                    content =
                        this.normalize(returnedContent).trim() === ''
                            ? ''
                            : returnedContent;
                    fragment.appendChild(div);
                }
            }
        }
        if (side === PagePosition.Left) {
            if (this.leftTextLayer !== null)
                this.leftTextLayer.appendChild(fragment);
        }
        else {
            if (this.rightTextLayer !== null)
                this.rightTextLayer.appendChild(fragment);
        }
    }
    static textLayerHtml() {
        /*
        this.clear(this.htmlTextLayer);
    
        if (typeof this.sentences === 'undefined' || this.sentences.length === 0)
          return;
    
        const pageSize =
          Orientation.mode === OrientationMode.Landscape
            ? this.pageSizeHTML() * 2
            : this.pageSizeHTML();
    
        let index = 0;
        let rest = '';
        let sentenceIndex = 0;
        let sentenceWordsIndex = 0;
        let sentence = this.sentences[sentenceIndex].toLowerCase();
        let sentenceWords = sentence
          .split(' ')
          .filter((word) => word.trim() !== '')
          .map((word) => word.toLowerCase());
        let y = 0;
    
        let div = Readiant.documentContext.createElement('div');
        div.setAttribute('class', `rdnt__highlight`);
        div.setAttribute('data-i', String(index));
    
        const fragment = Readiant.documentContext.createDocumentFragment();
        const range = Readiant.documentContext.createRange();
    
        let nodes: Node[] = [];
        const getTextNode = (node: ChildNode): void => {
          if (node.nodeType === 3) {
            if (node.textContent !== null && node.textContent.trim() !== '')
              nodes = [...nodes, node];
          } else {
            for (const child of node.childNodes) getTextNode(child);
          }
        };
    
        getTextNode(this.htmlPageContent);
    
        for (const node of nodes) {
          if (node.textContent === null) continue;
    
          const words = node.textContent.replace(/\s+/g, ' ').split(' ');
          let start = 0;
          let end = 0;
    
          for (const originalWord of words) {
            if (originalWord.trim() === '') continue;
    
            let word = originalWord.toLowerCase();
            end = start + word.length;
    
            range.setStart(node, start);
            range.setEnd(node, end);
    
            const rect = range.getClientRects()[0];
            const outOfView =
              rect.x - parseFloat(this.htmlLayer.style.left) > pageSize;
    
            if (sentence.trim() === '') {
              sentenceIndex++;
              sentenceWordsIndex++;
              if (typeof this.sentences[sentenceIndex] === 'undefined') return;
    
              sentence = this.sentences[sentenceIndex].toLowerCase();
    
              if (rest.length > 0) {
                sentence = sentence.replace(rest, '');
                rest = '';
              }
    
              sentenceWords = sentence
                .split(' ')
                .filter((word) => word.trim() !== '');
            }
    
            const dataSentence = String(sentenceIndex);
            const dataWord = String(sentenceWordsIndex);
    
            if (word.length > sentence.trim().length) {
              rest = word.substring(sentence.trim().length);
              word = word.substring(0, sentence.trim().length);
            }
    
            if (sentenceWords.length > 0 && word.length > sentenceWords[0].length)
              word = `${word.substring(
                0,
                sentenceWords[0].length,
              )} ${word.substring(sentenceWords[0].length)}`.replace(/\s+/g, ' ');
    
            const wordIndex = sentence.indexOf(word);
            if (wordIndex > -1)
              sentence = sentence.substring(wordIndex + word.length);
    
            if (sentenceWords.length > 0) {
              const splitWords = word.split(' ');
              for (const splitWord of splitWords) {
                const splitIndex = sentenceWords[0].indexOf(splitWord);
                if (splitIndex > -1)
                  sentenceWords[0] = sentenceWords[0].substring(
                    splitIndex + splitWord.length,
                  );
    
                if (sentenceWords[0].trim() === '') {
                  sentenceWords.shift();
                  sentenceWordsIndex++;
                }
              }
            }
    
            if (rect.x > 0 && !outOfView) {
              if (typeof y !== 'undefined' && y !== rect.y) {
                fragment.appendChild(div);
    
                div = Readiant.documentContext.createElement('div');
                div.setAttribute('class', `rdnt__highlight`);
              }
    
              if (
                div.style.height === '' ||
                rect.height > parseFloat(div.style.height)
              )
                div.style.height = `${rect.height.toFixed(2)}px`;
    
              if (div.style.left === '')
                div.style.left = `${(
                  rect.x - parseFloat(this.htmlLayer.style.left)
                ).toFixed(2)}px`;
    
              if (div.style.top === '')
                div.style.top = `${(
                  rect.y - parseFloat(this.htmlLayer.style.top)
                ).toFixed(2)}px`;
    
              if (div.style.width === '')
                div.style.width = `${(
                  rect.width - parseFloat(this.htmlLayer.style.left)
                ).toFixed(2)}px`;
              else
                div.style.width = `${(
                  parseFloat(div.style.width) +
                  rect.width +
                  (rect.x -
                    (parseFloat(div.style.left) + parseFloat(div.style.width)))
                ).toFixed(2)}px`;
    
              const span = Readiant.documentContext.createElement('span');
              span.setAttribute('class', CLASS_HIGHLIGHT_WORD);
    
              span.style.left = `${(
                rect.x - parseFloat(this.htmlLayer.style.left)
              ).toFixed(2)}px`;
              span.style.width = `${rect.width.toFixed(2)}px`;
    
              span.setAttribute('data-i', String(index));
              span.setAttribute('data-s', dataSentence);
              span.setAttribute('data-w', dataWord);
              span.setAttribute('data-word', originalWord);
    
              span.addEventListener('click', (event) => {
                event.preventDefault();
                this.showSentence(undefined, dataSentence, dataWord);
              });
              span.addEventListener('keydown', (event) => {
                A11y.shortcut(event);
              });
    
              span.addEventListener('mouseenter', () => {
                this.startHighlightingSentence(undefined, dataSentence, dataWord);
              });
              span.addEventListener('focus', () => {
                this.startHighlightingSentence(undefined, dataSentence, dataWord);
              });
              span.addEventListener('mouseout', () => {
                this.stopHighlighting();
              });
              span.addEventListener('blur', () => {
                this.stopHighlighting();
              });
    
              div.appendChild(span);
            }
    
            start = end + 1;
            y = rect.y;
            index++;
          }
        }
    
        fragment.appendChild(div);
    
        const fragmentChildren =
          fragment.children as HTMLCollectionOf<HTMLDivElement>;
        for (const div of fragmentChildren) {
          const children = div.children as HTMLCollectionOf<HTMLSpanElement>;
    
          let i = 0;
          for (const child of children) {
            const nextChild = children[i + 1];
            if (parseFloat(child.style.left) === parseFloat(div.style.left))
              child.style.left = '0';
            else
              child.style.left = `${(
                parseFloat(child.style.left) - parseFloat(div.style.left)
              ).toFixed(2)}px`;
    
            if (child.style.width === div.style.width) child.style.width = '100%';
            else if (typeof nextChild !== 'undefined')
              child.style.width = `${(
                Number(
                  (
                    parseFloat(nextChild.style.left) - parseFloat(div.style.left)
                  ).toFixed(2),
                ) - parseFloat(child.style.left)
              ).toFixed(2)}px`;
    
            i++;
          }
        }
    
        this.htmlTextLayer.appendChild(fragment);
        */
    }
    static async textPosition() {
        if (this.viewport === null)
            return [0, 0];
        await this.waitForNextFrame();
        const isLeftVisible = !this.getPage(PagePosition.Left).classList.contains(CLASS_HIDDEN);
        const page = !isLeftVisible || this.leftTextLayer?.children.length === 0
            ? this.rightTextLayer
            : this.leftTextLayer;
        const offset = Readiant.windowContext.getComputedStyle(this.viewport);
        const parent = page?.parentElement;
        const height = parseFloat(parent.style.height);
        const width = parseFloat(parent.style.width);
        const position = [0, 0];
        for (const element of Array.from(page?.children ?? [])) {
            const left = (parseFloat(element.style.left) / 100) * width;
            const top = (parseFloat(element.style.top) / 100) * height;
            if (position[0] === 0 || left < position[0])
                position[0] = left;
            if (position[1] === 0 || top < position[1])
                position[1] = top;
        }
        position[0] += parseFloat(parent.style.left);
        position[1] += parseFloat(parent.style.top) - parseFloat(offset.paddingTop);
        return position;
    }
    static textSentences(sentences, side, syntax) {
        const currentPage = Navigation.currentPages.find((page) => page.position === side);
        if (typeof currentPage === 'undefined')
            return;
        const wordSyntax = typeof syntax !== 'undefined'
            ? syntax.filter((s) => s.type === SpeechMarkType.Word)
            : [];
        sentences = sentences.filter((sentence) => sentence.trim() !== '');
        let rest = '';
        let sentenceIndex = 0;
        let sentenceWordsIndex = 0;
        let sentence = this.normalize(sentences[sentenceIndex], false);
        let sentenceWords = sentence
            .split(' ')
            .filter((word) => word.trim() !== '')
            .map((word) => word.toLowerCase());
        let wordIndex = 0;
        let syntaxWord = typeof syntax !== 'undefined' &&
            typeof wordSyntax[wordIndex] !== 'undefined'
            ? this.normalize(wordSyntax[wordIndex].value, false)
            : '';
        const words = [
            ...(side === PagePosition.Left
                ? this.leftTextLayer.querySelectorAll(`:not(.${CLASS_HIGHLIGHT_IGNORE}) > .${CLASS_HIGHLIGHT_WORD}`)
                : this.rightTextLayer.querySelectorAll(`:not(.${CLASS_HIGHLIGHT_IGNORE}) > .${CLASS_HIGHLIGHT_WORD}`)),
        ].sort((a, b) => Number(a.parentElement.getAttribute('data-i')) -
            Number(b.parentElement.getAttribute('data-i')));
        for (let word of words) {
            if (typeof syntax !== 'undefined' && syntaxWord.trim() === '') {
                wordIndex++;
                syntaxWord =
                    typeof wordSyntax[wordIndex] !== 'undefined'
                        ? this.normalize(wordSyntax[wordIndex].value)
                        : '';
            }
            if (sentence.trim() === '') {
                sentenceIndex++;
                sentenceWordsIndex++;
                sentence = this.normalize(sentences[sentenceIndex], false);
                if (rest.length > 0) {
                    sentence = sentence.replace(rest, '');
                    rest = '';
                }
                sentenceWords = sentence
                    .split(' ')
                    .filter((word) => word.trim() !== '');
            }
            const dataSentence = String(sentenceIndex);
            const dataWord = String(sentenceWordsIndex);
            let normalizedWord = this.normalize(String(word.getAttribute('data-word')), false);
            if (normalizedWord.length > sentence.trim().length) {
                rest = normalizedWord.substring(sentence.trim().length);
                normalizedWord = normalizedWord.substring(0, sentence.trim().length);
            }
            if (sentenceWords.length > 0 &&
                normalizedWord.length > sentenceWords[0].length)
                normalizedWord = `${normalizedWord.substring(0, sentenceWords[0].length)} ${normalizedWord.substring(sentenceWords[0].length)}`.replace(/\s+/g, ' ');
            const syntaxWordIndex = syntaxWord.indexOf(normalizedWord);
            if (syntaxWordIndex > -1)
                syntaxWord = syntaxWord.substring(syntaxWordIndex + normalizedWord.length);
            if (word.hasAttribute('data-s')) {
                const cloned = word.cloneNode(true);
                word.replaceWith(cloned);
                word = cloned;
            }
            word.setAttribute('data-s', dataSentence);
            word.setAttribute('data-w', dataWord);
            const normalizedWordIndex = sentence.indexOf(normalizedWord);
            if (normalizedWordIndex > -1)
                sentence = sentence.substring(normalizedWordIndex + normalizedWord.length);
            if (sentenceWords.length > 0) {
                const normalizedWords = normalizedWord.split(' ');
                for (const normalizedSplit of normalizedWords) {
                    if (typeof sentenceWords[0] === 'undefined')
                        continue;
                    const normalizedSplitIndex = sentenceWords[0].indexOf(normalizedSplit);
                    if (normalizedSplitIndex > -1)
                        sentenceWords[0] = sentenceWords[0].substring(normalizedSplitIndex + normalizedSplit.length);
                    if (sentenceWords[0].trim() === '') {
                        sentenceWords.shift();
                        sentenceWordsIndex++;
                    }
                }
            }
            if (typeof syntax !== 'undefined') {
                let time;
                if (typeof wordSyntax[wordIndex] !== 'undefined') {
                    time = wordSyntax[wordIndex].time;
                    word.setAttribute('data-i', String(wordSyntax[wordIndex].index));
                    word.setAttribute('data-time', String(time));
                }
                word.addEventListener('click', (event) => {
                    event.preventDefault();
                    if (typeof time !== 'undefined')
                        Audio.setStartTime(currentPage.page, time);
                    if (Audio.playingState !== AudioPlayingState.Playing) {
                        this.openLink(event);
                        this.showSentence(side, dataSentence, dataWord);
                    }
                });
            }
            else
                word.addEventListener('click', (event) => {
                    event.preventDefault();
                    this.openLink(event);
                    this.showSentence(side, dataSentence, dataWord);
                });
            word.addEventListener('keydown', (event) => {
                A11y.shortcut(event);
            });
            word.addEventListener('mouseenter', () => {
                this.startHighlightingSentence(side, dataSentence, dataWord);
            });
            word.addEventListener('focus', () => {
                this.startHighlightingSentence(side, dataSentence, dataWord);
            });
            word.addEventListener('mouseout', () => {
                this.stopHighlighting(side);
            });
            word.addEventListener('blur', () => {
                this.stopHighlighting(side);
            });
        }
        this.elementsOnPage.set(currentPage.page, {
            sentences: sentences.length,
            words: words.length,
        });
    }
    static transform(m1, m2) {
        if (!(Array.isArray(m1) &&
            m1.every((w) => typeof w === 'number') &&
            m1.length === 6) ||
            !(Array.isArray(m2) &&
                m2.every((w) => typeof w === 'number') &&
                m2.length === 6)) {
            Readiant.errorHandler(new Error('Invalid transformation matrix'));
            return [];
        }
        return [
            m1[0] * m2[0] + m1[2] * m2[1],
            m1[1] * m2[0] + m1[3] * m2[1],
            m1[0] * m2[2] + m1[2] * m2[3],
            m1[1] * m2[2] + m1[3] * m2[3],
            m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
            m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
        ];
    }
    static async waitForAnimation(element) {
        if (element === null || !this.isAnimating || this.animationDisabled)
            return Promise.resolve();
        if (element.classList.contains(CLASS_ACTIVE))
            return new Promise((resolve) => {
                new MutationObserver((_records, observer) => {
                    if (!element.classList.contains(CLASS_ACTIVE)) {
                        observer.disconnect();
                        resolve();
                    }
                }).observe(element, {
                    attributeFilter: ['class'],
                });
            });
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (element.classList.contains(CLASS_ACTIVE)) {
                    clearInterval(checkInterval);
                    new MutationObserver((_records, observer) => {
                        if (!element.classList.contains(CLASS_ACTIVE)) {
                            observer.disconnect();
                            resolve();
                        }
                    }).observe(element, {
                        attributeFilter: ['class'],
                    });
                }
                else if (!this.isAnimating) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 10);
        });
    }
    static waitForElements(elements) {
        elements = elements.map((element) => `#${element.replace('.', '\\.')}`);
        return new Promise((resolve) => {
            for (const element of elements) {
                const exists = this.elems?.querySelector(element);
                if (exists !== null)
                    elements = elements.filter((el) => el !== element);
            }
            if (elements.length === 0)
                resolve(true);
            if (this.elems !== null)
                new MutationObserver((_records, observer) => {
                    for (const element of elements) {
                        const exists = this.elems?.querySelector(element);
                        if (exists !== null)
                            elements = elements.filter((el) => el !== element);
                    }
                    if (elements.length === 0) {
                        observer.disconnect();
                        resolve(true);
                    }
                }).observe(this.elems, {
                    childList: true,
                });
        });
    }
    static async waitForImages(element) {
        return Promise.all(Array.from(element.querySelectorAll('img')).map((img) => new Promise((resolve, reject) => {
            img.onload = () => {
                resolve(img);
            };
            img.onerror = reject;
        })));
    }
    static async waitForNextFrame() {
        return new Promise((resolve) => {
            Readiant.windowContext.requestAnimationFrame(resolve);
        });
    }
    static wordSpacing(wordSpacing) {
        const textElements = this.elems?.getElementsByTagNameNS(NAMESPACE_SVG, 'text');
        for (const textElement of textElements) {
            textElement.classList.remove(this.activeWordSpacing);
            textElement.classList.add(`rdnt__word-spacing--${String(wordSpacing)}`);
        }
        this.activeWordSpacing = `rdnt__word-spacing--${String(wordSpacing)}`;
    }
    static zoom(currentZoom, zoomLevel) {
        if (Readiant.type === ContentType.HTML)
            this.zoomHTML(currentZoom, zoomLevel);
        else
            this.zoomSVG(currentZoom, zoomLevel);
    }
    static zoomHTML(currentZoom, zoomLevel) {
        if (this.layout === Layout.PrePaginated) {
            this.viewport?.classList.remove(`rdnt__viewport--scale-${String(currentZoom)}`);
            this.viewport?.classList.add(`rdnt__viewport--scale-${String(zoomLevel)}`);
            this.resize();
        }
        else {
            this.viewport?.classList.remove(`rdnt__viewport--scale-${String(currentZoom)}`);
            this.viewport?.classList.add(`rdnt__viewport--scale-${String(zoomLevel)}`);
        }
    }
    static zoomSVG(currentZoom, zoomLevel) {
        if (TextMode.level === 1) {
            this.viewport?.classList.remove(`rdnt__viewport--scale-${String(currentZoom)}`);
            this.viewport?.classList.add(`rdnt__viewport--scale-${String(zoomLevel)}`);
            this.resize();
        }
        else {
            this.viewport?.classList.remove(`rdnt__viewport--scale-${String(currentZoom)}`);
            this.viewport?.classList.add(`rdnt__viewport--scale-${String(zoomLevel)}`);
            this.plainTextLines().catch((e) => {
                throw e;
            });
        }
    }
}
_a = Builder;
Builder.ORIGINAL_FONT = 'rdnt__font--original';
Builder.ORIGINAL_FONTSIZE = 'rdnt__font-size--8';
Builder.ORIGINAL_LETTERSPACING = 'rdnt__letter-spacing--3';
Builder.ORIGINAL_LINEHEIGHT = 'rdnt__html-page--line-height--2';
Builder.ORIGINAL_WORDSPACING = 'rdnt__word-spacing--3';
Builder.PORTRAIT_WIDTH = 768;
Builder.activeFont = _a.ORIGINAL_FONT;
Builder.activeFontSize = _a.ORIGINAL_FONTSIZE;
Builder.activeLetterSpacing = _a.ORIGINAL_LETTERSPACING;
Builder.activeLineHeight = _a.ORIGINAL_LINEHEIGHT;
Builder.activeWordSpacing = _a.ORIGINAL_WORDSPACING;
Builder.animationDisabled = false;
Builder.animationPages = [];
Builder.cachedElements = new Set();
Builder.cachedLinks = new Map();
Builder.currentSentenceIndex = 0;
Builder.currentSide = PagePosition.Left;
Builder.currentWordIndex = 0;
Builder.direction = Direction.Ltr;
Builder.forcingPortrait = false;
Builder.hasFontChanged = false;
Builder.isAnimating = false;
Builder.previouslyShownPages = 0;
Builder.htmlOffset = 0;
Builder.wantedElements = new Set();
Builder.elementsOnPage = new Map();
Builder.handlers = new Set();
