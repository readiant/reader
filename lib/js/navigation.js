import { Audio } from './audio.js';
import { Bar } from './bar.js';
import { Builder } from './builder.js';
import { CLASS_ACTIVE, CLASS_HIDDEN, AudioPlayingState, ContentType, Direction, NavigationActionType, OrientationMode, PageChangeType, PagePosition, TouchDirection, TouchHandlerAction, } from './consts.js';
import { eventLogger } from './eventLogger.js';
import { isOffline } from './env.js';
import { LogType } from './log.js';
import { Orientation } from './orientation.js';
import { Readiant } from './readiant.js';
import { Storage } from './storage.js';
import { Stream } from './stream.js';
import { TextMode } from './textMode.js';
import { ClientActionType, ServerActionType, } from './consts.js';
export class Navigation {
    static get nextButton() {
        return document.getElementsByClassName('rdnt__navigation--next')[0];
    }
    static get pageNumber() {
        return document.getElementsByClassName('rdnt__page-number')[0];
    }
    static get pageNumberInput() {
        return document.getElementsByClassName('rdnt__page-number__input')[0];
    }
    static get pageNumberProgress() {
        return document.getElementsByClassName('rdnt__page-number__progress')[0];
    }
    static get pageNumberProgressValue() {
        return document.getElementsByClassName('rdnt__page-number__progress-value')[0];
    }
    static get pageNumberTotal() {
        return document.getElementsByClassName('rdnt__page-number__total')[0];
    }
    static get previousButton() {
        return document.getElementsByClassName('rdnt__navigation--prev')[0];
    }
    static get globalPage() {
        const pageCountIndex = this.pageCounts.findIndex((pageCount) => pageCount.index === this.chapterIndex);
        if (pageCountIndex === -1)
            return 1;
        const globalPageNumber = this.pageCounts[pageCountIndex].pages[0] +
            Math.floor(this.pageCounts[pageCountIndex].pages.length *
                (Builder.currentPage / Builder.pageCount));
        return Number.isNaN(globalPageNumber) ? 1 : globalPageNumber;
    }
    static get numPages() {
        return Math.max(...this.pages);
    }
    static register(page, pages, pageCounts, indexes, direction, offset, spread) {
        if (Readiant.type === ContentType.HTML)
            this.registerHTML(page, pageCounts, indexes, direction);
        else
            this.registerSVG(page, pages, pageCounts, direction, offset, spread);
        this.nextButton.addEventListener('click', () => {
            this.onRightPressed();
        });
        this.pageNumberInput.addEventListener('change', (event) => {
            this.gotoPageDirectly(event);
        });
        this.previousButton.addEventListener('click', () => {
            this.onLeftPressed();
        });
        if (Storage.data.touch || Storage.data.pointer) {
            if (!Storage.data.hover) {
                this.nextButton.classList.add(CLASS_HIDDEN);
                this.previousButton.classList.add(CLASS_HIDDEN);
            }
            if (Storage.data.pointer) {
                document.addEventListener('pointerdown', (event) => {
                    this.touchHandler(TouchHandlerAction.Start, event);
                }, { passive: true });
                document.addEventListener('pointermove', (event) => {
                    this.touchHandler(TouchHandlerAction.Move, event);
                }, { passive: true });
                document.addEventListener('pointerup', (event) => {
                    this.touchHandler(TouchHandlerAction.End, event);
                }, { passive: true });
            }
            if (Storage.data.touch) {
                document.addEventListener('touchcancel', (event) => {
                    this.touchHandler(TouchHandlerAction.End, event);
                }, { passive: true });
                document.addEventListener('touchend', (event) => {
                    this.touchHandler(TouchHandlerAction.End, event);
                }, { passive: true });
                document.addEventListener('touchmove', (event) => {
                    this.touchHandler(TouchHandlerAction.Move, event);
                }, { passive: true });
                document.addEventListener('touchstart', (event) => {
                    this.touchHandler(TouchHandlerAction.Start, event);
                }, { passive: true });
            }
        }
        else
            document.addEventListener('keydown', (event) => {
                this.shortcut(event);
            });
        this.hasRegistered = true;
    }
    static registerHTML(page, pageCounts, indexes, direction) {
        this.direction = direction;
        this.pageCounts = pageCounts
            .map((pages, index) => ({ index, pages }))
            .filter((pageCount) => pageCount.pages.length > 0 &&
            (indexes.length > 0 ? indexes.includes(pageCount.index) : true));
        this.timestamp = new Date();
        let currentGlobalPage = parseFloat(String(page));
        const minPage = this.pageCounts[0].pages[0];
        const lastPageCount = this.pageCounts.slice(-1)[0];
        this.maxPage = lastPageCount.pages[lastPageCount.pages.length - 1];
        if (!this.isInRangeHTML(currentGlobalPage))
            currentGlobalPage = minPage;
        const usedPage = Orientation.mode === OrientationMode.Landscape &&
            Math.floor(currentGlobalPage) % 2 > 0
            ? Math.floor(currentGlobalPage) - 1
            : Math.floor(currentGlobalPage);
        let pageCountIndex = this.pageCounts.findIndex((pageCount) => pageCount.pages.includes(usedPage));
        if (pageCountIndex > -1) {
            this.chapterIndex = this.pageCounts[pageCountIndex].index;
            this.currentPage = usedPage;
        }
        else {
            pageCountIndex = this.pageCounts.findIndex((pageCount) => pageCount.pages.includes(minPage));
            this.chapterIndex = this.pageCounts[pageCountIndex].index;
            this.currentPage = minPage;
        }
        Stream.setMessageHandler(ServerActionType.EPUBChapter, (chapter) => this.onSection(chapter));
        this.previousAction = {
            type: NavigationActionType.FirstLoad,
            chapterIndex: this.chapterIndex,
        };
        Stream.send({
            type: ClientActionType.ChapterRequest,
            chapterIndex: this.chapterIndex,
        });
        this.pageNumberInput.setAttribute('max', String(this.maxPage));
        this.pageNumberTotal.innerHTML = `/ ${String(this.maxPage)}`;
        this.pageNumberProgress.classList.remove(CLASS_HIDDEN);
        this.htmlProgress();
        window.addEventListener('beforeunload', () => {
            eventLogger({
                type: LogType.ClosingPage,
                pages: [this.globalPage],
            });
        });
    }
    static registerSVG(page, pages, pageCounts, direction, offset, spread) {
        const key = pages.indexOf(page);
        const inverse = [...pages].reverse();
        this.direction = direction;
        this.currentPage = direction === Direction.Rtl ? inverse[key] : page;
        this.pages = direction === Direction.Rtl ? inverse : pages;
        this.pageCounts = pageCounts.map((pages, index) => ({ index, pages }));
        this.pageOffset = typeof offset !== 'undefined' ? offset : 0;
        this.spread = spread;
        this.timestamp = new Date();
        if (!this.isInRangeSVG(this.currentPage))
            this.currentPage = this.pages[0];
        Stream.setMessageHandler(ServerActionType.Blueprint, (data) => {
            this.onBlueprint(data);
        });
        Stream.setMessageHandler(ServerActionType.Definitions, (data) => Builder.definitions(data.payload));
        Stream.setMessageHandler(ServerActionType.Elements, (data) => {
            this.onElements(data);
        });
        Stream.setMessageHandler(ServerActionType.TextContent, (data) => {
            this.onTextContent(data);
        });
        if (!isOffline)
            Stream.send({
                preferredPage: this.currentPage,
                type: ClientActionType.DefinitionRequest,
            });
        this.currentPages = this.generatePagesToRender();
        if (this.currentPages.length === 0) {
            Readiant.errorHandler(new Error('Empty payload; pages out of range'));
            return;
        }
        if (this.currentPages.length === 2)
            this.currentPage = this.currentPages[0].page;
        this.cacheSize = this.currentPages.length === 2 ? 8 : 4;
        this.initialPages(this.currentPages);
        this.logInitialPage(this.currentPage);
        const max = this.numPages;
        if (max !== this.pages.length)
            this.pageNumber.classList.add(CLASS_HIDDEN);
        else {
            let currentPage = this.currentPage;
            if (this.direction === Direction.Rtl) {
                const key = this.pages.indexOf(this.currentPage);
                const pages = [...this.pages].reverse();
                currentPage = pages[key];
            }
            this.pageNumberTotal.innerHTML = `/ ${String(max + this.pageOffset)}`;
            this.pageNumberInput.setAttribute('max', String(max + this.pageOffset));
            this.pageNumberInput.value =
                currentPage + this.pageOffset >= 1
                    ? String(currentPage + this.pageOffset)
                    : '';
        }
        window.addEventListener('beforeunload', () => {
            this.logPageChange(PageChangeType.Close);
        });
    }
    static addHandler(handler) {
        this.handlers.add(handler);
    }
    static addTextHandler(page, handler) {
        this.textHandlers.set(page, handler);
    }
    static computePercentage() {
        return Math.round((this.currentPage / this.numPages) * 100);
    }
    static countSetOfTwo(page) {
        return Math.floor(page / 2);
    }
    static isActivePage(page) {
        if (this.currentPages.some((current) => current.page === page))
            return this.currentPages.find((cur) => cur.page === page)?.position;
        return undefined;
    }
    static isAnimationPage(page) {
        if (this.animationPages.some((current) => current.page === page))
            return this.animationPages.find((cur) => cur.page === page)?.position;
        return undefined;
    }
    static isAtLastPage() {
        return Readiant.type === ContentType.SVG
            ? this.numPages === this.currentPage
            : false;
    }
    static isInRangeHTML(pages) {
        const minPage = this.pageCounts[0].pages[0];
        const lastPageCount = this.pageCounts.slice(-1)[0];
        const maxPage = lastPageCount.pages[lastPageCount.pages.length - 1];
        if (Array.isArray(pages)) {
            const set = this.countSetOfTwo(pages[0]);
            if (this.countSetOfTwo(pages[0]) !== this.countSetOfTwo(pages[1])) {
                Readiant.errorHandler(new Error('Set of two failed sanity check.'));
                return false;
            }
            return set >= minPage && set <= Math.floor(maxPage / 2);
        }
        else
            return pages >= minPage && pages <= maxPage;
    }
    static isInRangeSVG(pages) {
        if (Array.isArray(pages)) {
            const set = this.countSetOfTwo(pages[0]);
            if (this.countSetOfTwo(pages[0]) !== this.countSetOfTwo(pages[1])) {
                Readiant.errorHandler(new Error('Set of two failed sanity check.'));
                return false;
            }
            return set >= 0 && set <= Math.floor(this.numPages / 2);
        }
        else
            return this.pages.includes(pages);
    }
    static isPageVisible(page) {
        if (Orientation.mode === OrientationMode.Landscape)
            if (this.currentPage % 2 === 0 || this.spread === true)
                return page === this.currentPage || page === this.currentPage + 1;
            else
                return page === this.currentPage - 1 || page === this.currentPage;
        else
            return this.currentPage === page;
    }
    static finishNavigationAction(chapterChanged) {
        if (typeof this.previousAction === 'undefined')
            return;
        const start = this.timestamp;
        const end = (this.timestamp = new Date());
        const previousPage = this.globalPage;
        let log;
        switch (this.previousAction.type) {
            case NavigationActionType.PreviousChapter:
                Builder.scrollToOffset(Builder.pageCount % 2 === 0
                    ? Orientation.mode === OrientationMode.Portrait
                        ? Builder.pageCount - 1
                        : Builder.pageCount - 2
                    : Builder.pageCount - 1);
                log = {
                    type: LogType.PreviousPage,
                    pages: [this.globalPage],
                };
                break;
            case NavigationActionType.NextChapter:
                Builder.scrollToOffset(0);
                log = {
                    type: LogType.NextPage,
                    pages: [this.globalPage],
                };
                break;
            case NavigationActionType.Directly:
            case NavigationActionType.FirstLoad: {
                const pageCountIndex = this.pageCounts.findIndex((pageCount) => pageCount.index === this.chapterIndex);
                const builderPage = Math.floor(((this.currentPage - this.pageCounts[pageCountIndex].pages[0]) /
                    this.pageCounts[pageCountIndex].pages.length) *
                    Builder.pageCount);
                Builder.scrollToOffset(builderPage);
                log = {
                    type: LogType.GotoPage,
                    pages: [this.globalPage],
                };
                break;
            }
            case NavigationActionType.Href: {
                Builder.scrollToId(this.previousAction.id);
                if (chapterChanged)
                    Builder.scrollToOffset(0);
                log = {
                    type: LogType.GotoPage,
                    pages: [this.globalPage],
                };
                break;
            }
            case NavigationActionType.SearchResult:
                Builder.scrollToResult(this.previousAction.query);
                log = {
                    type: LogType.GotoPage,
                    pages: [this.globalPage],
                };
                break;
        }
        this.htmlProgress();
        if (typeof this.previousLog !== 'undefined')
            log.previous = {
                duration: end.getTime() - start.getTime(),
                pages: this.previousLog.pages.map((page) => {
                    const highest = Audio.playback.get(page);
                    return {
                        ...(Audio.playback.has(page)
                            ? {
                                audio: {
                                    playbackPercentage: typeof highest !== 'undefined'
                                        ? Number(highest.toFixed(2))
                                        : 0,
                                },
                            }
                            : {}),
                        page,
                    };
                }),
            };
        this.notify(this.globalPage, previousPage);
        this.previousAction = undefined;
        this.previousLog = log;
        eventLogger(log);
    }
    static generateCache(exclude) {
        const all = [...this.pages];
        this.cacheSize = this.currentPages.length === 2 ? 8 : 4;
        all.sort((a, b) => Math.abs(this.currentPage - a) - Math.abs(this.currentPage - b));
        const pages = all.slice(0, this.cacheSize);
        this.cachedPages = new Set(pages.filter((page) => Storage.hasPage(page)));
        this.missingPages = new Set(pages.filter((page) => !Storage.hasPage(page)));
        if (this.missingPages.size > 0)
            this.requestPages(typeof exclude === 'undefined'
                ? [...this.missingPages]
                : [...this.missingPages].filter((page) => !exclude.includes(page)));
        for (const page of [...this.animationPages, ...this.currentPages]) {
            if (Storage.hasPage(page.page)) {
                const { blueprint, viewBox } = Storage.getPage(page.page);
                Builder.animation(page.position, blueprint, viewBox, typeof this.isAnimationPage(page.page) !== 'undefined').catch((e) => {
                    throw e;
                });
            }
        }
        Builder.cache(pages).catch((e) => {
            throw e;
        });
    }
    static generatePagesToRender() {
        const animationPayload = [];
        const payload = [];
        if (Orientation.mode === OrientationMode.Landscape) {
            let left;
            let right;
            const index = this.pages.indexOf(this.currentPage);
            if (this.direction === Direction.Ltr) {
                if (this.currentPage % 2 === 0 || this.spread === true) {
                    left = this.currentPage;
                    right = this.pages[index + 1];
                }
                else {
                    left = this.pages[index - 1];
                    right = this.currentPage;
                }
            }
            else {
                if (this.currentPage % 2 === 0 || this.spread === true) {
                    left = this.currentPage;
                    right = this.pages[index - 1];
                }
                else {
                    left = this.pages[index + 1];
                    right = this.currentPage;
                }
            }
            const leftInRange = this.isInRangeSVG(left);
            const rightInRange = this.isInRangeSVG(right);
            if (!leftInRange && rightInRange) {
                payload.push({ page: right, position: PagePosition.Right });
                if (this.isInRangeSVG(right + 1))
                    animationPayload.push({
                        page: right + 1,
                        position: PagePosition.Right,
                    });
            }
            else if (leftInRange && !rightInRange) {
                payload.push({ page: left, position: PagePosition.Left });
                if (this.isInRangeSVG(left - 1))
                    animationPayload.push({
                        page: left - 1,
                        position: PagePosition.Left,
                    });
            }
            else if (leftInRange && rightInRange) {
                payload.push({ page: left, position: PagePosition.Left });
                payload.push({ page: right, position: PagePosition.Right });
                if (this.isInRangeSVG(left - 1))
                    animationPayload.push({
                        page: left - 1,
                        position: PagePosition.Left,
                    });
                if (this.isInRangeSVG(right + 1))
                    animationPayload.push({
                        page: right + 1,
                        position: PagePosition.Right,
                    });
            }
        }
        else if (this.isInRangeSVG(this.currentPage)) {
            payload.push({
                page: this.currentPage,
                position: PagePosition.Left,
            });
            if (this.isInRangeSVG(this.currentPage - 1))
                animationPayload.push({
                    page: this.currentPage - 1,
                    position: PagePosition.Left,
                });
            if (this.isInRangeSVG(this.currentPage + 1))
                animationPayload.push({
                    page: this.currentPage + 1,
                    position: PagePosition.Right,
                });
        }
        this.animationPages = animationPayload;
        return payload;
    }
    static async gotoChapter(chapter) {
        if (Readiant.type === ContentType.HTML &&
            'href' in chapter &&
            typeof chapter.href !== 'undefined')
            this.resolveHref(chapter.href);
        else if (Readiant.type === ContentType.SVG &&
            'startPage' in chapter &&
            typeof chapter.startPage !== 'undefined') {
            let page = chapter.startPage;
            if (this.direction === Direction.Rtl) {
                const pages = [...this.pages].reverse();
                const key = pages.indexOf(page);
                page = this.pages[key];
            }
            this.gotoPageSVG(page, PageChangeType.Other);
        }
    }
    static gotoPage(page, type = PageChangeType.Other) {
        if (Readiant.type === ContentType.HTML)
            this.gotoPageHTML(page, type);
        else
            this.gotoPageSVG(page, type);
    }
    static gotoPageDirectly(event) {
        if (Readiant.type === ContentType.HTML)
            this.gotoPageDirectlyHTML(event);
        else
            this.gotoPageDirectlySVG(event);
    }
    static gotoPageDirectlyHTML(event) {
        const globalPage = typeof event === 'number'
            ? event
            : Number(event.currentTarget.value);
        const usedPage = Orientation.mode === OrientationMode.Landscape &&
            Math.floor(globalPage) % 2 > 0
            ? Math.floor(globalPage) - 1
            : Math.floor(globalPage);
        const pageCountIndex = this.pageCounts.findIndex((pageCount) => pageCount.pages.includes(usedPage));
        const builderPage = Math.floor(((usedPage - this.pageCounts[pageCountIndex].pages[0]) /
            this.pageCounts[pageCountIndex].pages.length) *
            Builder.pageCount);
        if (pageCountIndex > -1 &&
            this.pageCounts[pageCountIndex].index !== this.chapterIndex) {
            Stream.send({
                type: ClientActionType.ChapterRequest,
                chapterIndex: this.pageCounts[pageCountIndex].index,
            });
            this.currentPage = usedPage;
            this.previousAction = {
                type: NavigationActionType.Directly,
                chapterIndex: this.pageCounts[pageCountIndex].index,
            };
        }
        else
            this.gotoPageHTML(builderPage, PageChangeType.Other);
    }
    static gotoPageDirectlySVG(event) {
        let page = typeof event === 'number'
            ? event - this.pageOffset
            : Number(event.currentTarget.value) -
                this.pageOffset;
        if (this.direction === Direction.Rtl) {
            const pages = [...this.pages].reverse();
            const key = pages.indexOf(page);
            page = this.pages[key];
        }
        this.gotoPage(page, PageChangeType.Other);
    }
    static gotoPageHTML(page, type) {
        this.previousAction = undefined;
        const previousPage = this.globalPage;
        if (page > Builder.currentPage && Builder.isLastPageOfSection) {
            const pageCountIndex = this.pageCounts.findIndex((pageCount) => pageCount.index === this.chapterIndex);
            if (pageCountIndex === -1)
                return;
            const newChapter = this.pageCounts[pageCountIndex + 1 >= this.pageCounts.length
                ? this.pageCounts.length - 1
                : pageCountIndex + 1].index;
            this.previousAction = {
                type: NavigationActionType.NextChapter,
                chapterIndex: newChapter,
            };
            if (Storage.hasChapter(newChapter)) {
                const chapter = Storage.getChapter(newChapter);
                if (typeof chapter !== 'undefined')
                    this.onSection(chapter).catch((e) => {
                        throw e;
                    });
            }
            else
                Stream.send({
                    type: ClientActionType.ChapterRequest,
                    chapterIndex: newChapter,
                });
        }
        else if (page < Builder.currentPage && Builder.isFirstPageOfSection) {
            const pageCountIndex = this.pageCounts.findIndex((pageCount) => pageCount.index === this.chapterIndex);
            if (pageCountIndex === -1)
                return;
            const newChapter = this.pageCounts[pageCountIndex - 1 < 0 ? 0 : pageCountIndex - 1].index;
            this.previousAction = {
                type: NavigationActionType.PreviousChapter,
                chapterIndex: newChapter,
            };
            if (Storage.hasChapter(newChapter)) {
                const chapter = Storage.getChapter(newChapter);
                if (typeof chapter !== 'undefined')
                    this.onSection(chapter).catch((e) => {
                        throw e;
                    });
            }
            else
                Stream.send({
                    type: ClientActionType.ChapterRequest,
                    chapterIndex: newChapter,
                });
        }
        else {
            Builder.scrollToOffset(page);
            if (!this.isInRangeHTML(this.globalPage))
                return;
            switch (type) {
                case PageChangeType.Next:
                    eventLogger({
                        type: LogType.NextPage,
                        pages: [this.globalPage],
                    });
                    break;
                case PageChangeType.Previous:
                    eventLogger({
                        type: LogType.PreviousPage,
                        pages: [this.globalPage],
                    });
                    break;
                case PageChangeType.Other:
                    eventLogger({
                        type: LogType.GotoPage,
                        pages: [this.globalPage],
                    });
                    break;
            }
        }
        this.htmlProgress();
        this.notify(this.globalPage, previousPage);
    }
    static gotoPageSVG(page, type = PageChangeType.Other) {
        if (!this.isInRangeSVG(page))
            return;
        const previousPage = this.currentPage;
        if (this.isPageVisible(page)) {
            this.currentPage = page;
            this.notify(this.currentPage, previousPage);
        }
        else {
            this.currentPage = page;
            this.currentPages = this.generatePagesToRender();
            if (this.currentPages.length === 0)
                this.currentPage = previousPage;
            else {
                this.logPageChange(type);
                this.notify(this.currentPage, previousPage);
                this.preparePages(this.currentPages);
            }
        }
        let currentPage = this.currentPage;
        if (this.direction === Direction.Rtl) {
            const key = this.pages.indexOf(this.currentPage);
            const pages = [...this.pages].reverse();
            currentPage = pages[key];
        }
        this.pageNumberInput.value =
            currentPage + this.pageOffset >= 1
                ? String(currentPage + this.pageOffset)
                : '';
    }
    static gotoSearchResult(chapterIndex, query) {
        Stream.send({ type: ClientActionType.ChapterRequest, chapterIndex });
        this.previousAction = {
            type: NavigationActionType.SearchResult,
            query,
            chapterIndex,
        };
    }
    static htmlProgress() {
        const globalPage = this.globalPage;
        this.pageNumberInput.value = String(Math.floor(globalPage));
        this.pageNumberProgressValue.style.width = `${String((globalPage - Math.floor(globalPage)) * 100)}%`;
        Builder.changeProgress((Math.ceil(globalPage) / this.maxPage) * 100).catch((e) => {
            throw e;
        });
    }
    static initialPages(requests) {
        if (TextMode.level !== 3) {
            if (requests.some((val) => val.position === PagePosition.Left))
                Builder.start(PagePosition.Left);
            else
                Builder.hide(PagePosition.Left);
            if (requests.some((val) => val.position === PagePosition.Right))
                Builder.start(PagePosition.Right);
            else
                Builder.hide(PagePosition.Right);
        }
        const pages = requests.map((request) => request.page);
        this.requestPages(pages);
        this.generateCache(pages);
    }
    static logInitialPage(currentPage) {
        const pages = [currentPage];
        if (this.isInRangeSVG(currentPage + 1) &&
            this.isPageVisible(currentPage + 1))
            pages.push(currentPage + 1);
        if (this.direction === Direction.Rtl) {
            const inverted = [...this.pages].reverse();
            for (const [key, page] of pages.entries()) {
                const index = this.pages.indexOf(page);
                pages[key] = inverted[index];
            }
        }
        this.previousLog = {
            type: LogType.PreviousPage,
            pages,
        };
        eventLogger({
            type: LogType.InitialPage,
            pages,
        });
    }
    static logPageChange(type) {
        const pages = this.currentPages.map((req) => req.page);
        const begin = this.timestamp;
        const end = (this.timestamp = new Date());
        if (this.direction === Direction.Rtl) {
            const inverted = [...this.pages].reverse();
            for (const [key, page] of pages.entries()) {
                const index = this.pages.indexOf(page);
                pages[key] = inverted[index];
            }
        }
        let log;
        switch (type) {
            case PageChangeType.Close:
                log = {
                    type: LogType.ClosingPage,
                    pages,
                };
                break;
            case PageChangeType.Other:
                log = {
                    type: LogType.GotoPage,
                    pages,
                };
                break;
            case PageChangeType.Next:
                log = {
                    type: LogType.NextPage,
                    pages,
                };
                break;
            case PageChangeType.Previous:
                log = {
                    type: LogType.PreviousPage,
                    pages,
                };
                break;
            default:
                Readiant.errorHandler(new Error('Unknown page type detected.'));
                return;
        }
        if (typeof this.previousLog !== 'undefined')
            log.previous = {
                duration: end.getTime() - begin.getTime(),
                pages: this.previousLog.pages.map((page) => {
                    const highest = Audio.playback.get(page);
                    return {
                        ...(Audio.playback.has(page)
                            ? {
                                audio: {
                                    playbackPercentage: typeof highest !== 'undefined'
                                        ? Number(highest.toFixed(2))
                                        : 0,
                                },
                            }
                            : {}),
                        page,
                    };
                }),
            };
        this.previousLog = log;
        eventLogger(log);
    }
    static nextPage() {
        const navigationTime = new Date().getTime();
        if (Audio.playingState !== AudioPlayingState.Playing &&
            navigationTime - this.timestamp.getTime() < 250)
            return;
        if (Readiant.type === ContentType.HTML)
            this.nextPageHTML();
        else
            this.nextPageSVG();
    }
    static nextPageHTML() {
        this.gotoPage(Orientation.mode === OrientationMode.Portrait
            ? Builder.currentPage + 1
            : Builder.currentPage + 2, PageChangeType.Next);
    }
    static nextPageSVG() {
        let page = this.currentPage;
        const lastPage = this.pages[this.pages.length - 1];
        const index = this.pages.indexOf(page);
        if (Audio.playingState === AudioPlayingState.Paused ||
            Audio.playingState === AudioPlayingState.Playing ||
            Orientation.mode === OrientationMode.Portrait)
            page = this.pages[index + 1];
        else
            page =
                this.pages[index + (this.currentPage % 2 === 0 || this.spread === true ? 2 : 1)];
        if (Orientation.mode !== OrientationMode.Portrait)
            Builder.animateRight();
        page = Math.min(this.numPages, typeof page !== 'undefined' ? page : lastPage);
        if (page !== this.currentPage)
            this.gotoPage(page, PageChangeType.Next);
    }
    static notify(newPage, currentPage) {
        for (const handler of this.handlers) {
            const returned = handler(newPage, currentPage);
            if (typeof returned !== 'undefined')
                returned.catch((e) => {
                    throw e;
                });
        }
    }
    static notifyText(page) {
        for (const [pageNumber, handler] of this.textHandlers) {
            if (page.page === pageNumber) {
                handler(page);
                this.textHandlers.delete(pageNumber);
            }
        }
    }
    static onBlueprint(data) {
        const isActivePage = this.isActivePage(data.pageId);
        const isAnimationPage = this.isAnimationPage(data.pageId);
        Storage.storePage(data.pageId, {
            blueprint: Builder.pageGroup(data.payload.blueprint),
            elements: data.payload.blueprint,
            rotation: typeof data.payload.rotation !== 'undefined'
                ? data.payload.rotation
                : 0,
            viewBox: data.payload.viewBox,
        });
        if (this.missingPages.has(data.pageId)) {
            this.cachedPages.add(data.pageId);
            this.missingPages.delete(data.pageId);
        }
        if (typeof isActivePage !== 'undefined' &&
            this.isPageVisible(data.pageId)) {
            Builder.svg(data.pageId, isActivePage).catch((e) => {
                throw e;
            });
            Builder.animation(isActivePage, Builder.pageGroup(data.payload.blueprint), data.payload.viewBox, false).catch((e) => {
                throw e;
            });
        }
        else if (typeof isAnimationPage !== 'undefined')
            Builder.animation(isAnimationPage, Builder.pageGroup(data.payload.blueprint), data.payload.viewBox, true).catch((e) => {
                throw e;
            });
    }
    static onElements(data) {
        Builder.elements(data.payload).catch((e) => {
            throw e;
        });
    }
    static onLeftPressed() {
        if (this.direction === Direction.Rtl)
            this.nextPage();
        else
            this.previousPage();
    }
    static onRightPressed() {
        if (this.direction === Direction.Rtl)
            this.previousPage();
        else
            this.nextPage();
    }
    static async onSection(htmlSection) {
        let index = htmlSection.index;
        if (typeof index === 'undefined')
            index = htmlSection.id;
        const pageCountIndex = this.pageCounts.findIndex((pageCount) => pageCount.index === index);
        if (pageCountIndex === -1 ||
            (typeof this.previousAction !== 'undefined' &&
                typeof this.previousAction.chapterIndex === 'number' &&
                this.previousAction.chapterIndex !== index))
            return;
        if (this.pageCounts[pageCountIndex].index !== this.chapterIndex ||
            (typeof this.previousAction !== 'undefined' &&
                this.previousAction.type === NavigationActionType.FirstLoad)) {
            if (!Storage.hasChapter(index))
                Storage.storeChapter(htmlSection);
            await Builder.html(htmlSection.chapter, (s) => {
                this.resolveHref(s);
            });
            this.chapterIndex = index;
            this.finishNavigationAction(true);
        }
        else
            this.finishNavigationAction(false);
    }
    static onTextContent(data) {
        const textContent = data.contents.map((a) => ({
            ...a,
            content: this.unescapeHTMLNamedEntities(a.content),
        }));
        Storage.storeText(data.page, {
            content: textContent,
            sentences: data.sentences,
        });
        if (TextMode.level !== 1 &&
            Orientation.mode === OrientationMode.Portrait &&
            data.page === this.currentPage)
            Builder.plainText().catch((e) => {
                throw e;
            });
        const currentPage = this.currentPages.find((currentPage) => currentPage.page === data.page);
        if (typeof currentPage !== 'undefined')
            this.notifyText(currentPage);
    }
    static preparePages(requests, orientationChange) {
        if (typeof orientationChange !== 'undefined' &&
            orientationChange === OrientationMode.Portrait) {
            Builder.hide(PagePosition.Right);
            return;
        }
        if (TextMode.level !== 3) {
            if (requests.some((val) => val.position === PagePosition.Left))
                Builder.start(PagePosition.Left);
            else
                Builder.hide(PagePosition.Left);
            if (requests.some((val) => val.position === PagePosition.Right))
                Builder.start(PagePosition.Right);
            else
                Builder.hide(PagePosition.Right);
        }
        Builder.changeProgress(this.computePercentage()).catch((e) => {
            throw e;
        });
        for (const request of requests) {
            const cached = this.cachedPages.has(request.page);
            const stored = Storage.hasPage(request.page);
            if ((cached && stored) || stored)
                Builder.svg(request.page, request.position).catch((e) => {
                    throw e;
                });
        }
        this.generateCache();
    }
    static previousPage() {
        const navigationTime = new Date().getTime();
        if (Audio.playingState !== AudioPlayingState.Playing &&
            navigationTime - this.timestamp.getTime() < 250)
            return;
        if (Readiant.type === ContentType.HTML)
            this.previousPageHTML();
        else
            this.previousPageSVG();
    }
    static previousPageHTML() {
        this.gotoPage(Orientation.mode === OrientationMode.Portrait
            ? Builder.currentPage - 1
            : Builder.currentPage - 2, PageChangeType.Previous);
    }
    static previousPageSVG() {
        const firstPage = Math.min(...this.pages);
        let page = this.currentPage;
        const index = this.pages.indexOf(page);
        if (Orientation.mode === OrientationMode.Portrait)
            page = this.pages[index - 1];
        else {
            Builder.animateLeft();
            page =
                this.pages[index - (this.currentPage % 2 === 0 || this.spread === true ? 2 : 3)];
        }
        page = Math.max(firstPage, typeof page !== 'undefined' ? page : this.pages[0]);
        if (page !== this.currentPage)
            this.gotoPage(page, PageChangeType.Previous);
    }
    static requestPages(pages) {
        Stream.send({
            type: ClientActionType.BlueprintRequest,
            pages,
        });
        Stream.send({
            type: ClientActionType.CacheRequest,
            pages,
        });
        pages = pages.filter((page) => !Storage.hasText(page));
        if (pages.length > 0)
            Stream.send({
                type: ClientActionType.TextContentRequest,
                pages,
            });
    }
    static resolveHref(href) {
        if (typeof this.previousAction !== 'undefined')
            return;
        Stream.send({
            type: ClientActionType.HTMLHrefRequest,
            href,
        });
        this.previousAction = {
            type: NavigationActionType.Href,
            id: href.split('#')[1],
        };
    }
    static shortcut(event) {
        if (event.target !== null &&
            (event.target.nodeName ===
                'INPUT' ||
                event.target.nodeName ===
                    'TEXTAREA'))
            return;
        let code;
        if (typeof event.key !== 'undefined')
            code = event.key;
        else if (event.keyIdentifier !==
            undefined)
            code = event.keyIdentifier;
        else if (typeof event.code !== 'undefined')
            code = event.code;
        else
            return;
        switch (code) {
            case 'ArrowLeft':
            case 'Left':
                event.preventDefault();
                if (Bar.showing && Bar.readStop !== 1)
                    Bar.backward();
                else
                    this.onLeftPressed();
                break;
            case 'ArrowRight':
            case 'Right':
                event.preventDefault();
                if (Bar.showing && Bar.readStop !== 1)
                    Bar.forward();
                else
                    this.onRightPressed();
                break;
        }
    }
    static touchHandler(action, event) {
        const isAnnotationsActive = typeof document.getElementsByClassName('rdnt__markings')[0] !==
            'undefined'
            ? document
                .getElementsByClassName('rdnt__markings')[0]
                .classList.contains(CLASS_ACTIVE)
            : false;
        if (('pointerType' in event && event.pointerType === 'mouse') ||
            isAnnotationsActive)
            return;
        switch (action) {
            case TouchHandlerAction.Start:
                this.touchStart(event);
                break;
            case TouchHandlerAction.Move:
                this.touchMove(event);
                break;
            case TouchHandlerAction.End:
                this.touchEnd();
                break;
        }
    }
    static touchStart(event) {
        this.touch = {
            active: true,
            currentX: 'changedTouches' in event
                ? event.changedTouches[0].pageX
                : event.clientX,
            currentY: 'changedTouches' in event
                ? event.changedTouches[0].pageY
                : event.clientY,
            length: 0,
            startX: 'changedTouches' in event
                ? event.changedTouches[0].pageX
                : event.clientX,
            startY: 'changedTouches' in event
                ? event.changedTouches[0].pageY
                : event.clientY,
            touches: 'changedTouches' in event ? event.changedTouches.length : 1,
        };
    }
    static touchMove(event) {
        if (typeof this.touch === 'undefined')
            return;
        this.touch.currentX =
            'changedTouches' in event ? event.changedTouches[0].pageX : event.clientX;
        this.touch.currentY =
            'changedTouches' in event ? event.changedTouches[0].pageY : event.clientY;
        this.touch.length = Math.round(Math.sqrt(Math.pow(this.touch.currentX - this.touch.startX, 2)));
    }
    static touchDirection() {
        if (typeof this.touch === 'undefined')
            return undefined;
        const xDistance = this.touch.startX - this.touch.currentX;
        const yDistance = this.touch.startY - this.touch.currentY;
        const r = Math.atan2(yDistance, xDistance);
        let swipeAngle = Math.round((r * 180) / Math.PI);
        if (swipeAngle < 0)
            swipeAngle = 360 - Math.abs(swipeAngle);
        if (swipeAngle >= 135 && swipeAngle <= 225)
            return TouchDirection.Left;
        if ((swipeAngle <= 45 && swipeAngle >= 0) ||
            (swipeAngle <= 360 && swipeAngle >= 315))
            return TouchDirection.Right;
        if (swipeAngle > 45 && swipeAngle < 135)
            return TouchDirection.Up;
        if (swipeAngle > 225 && swipeAngle < 315)
            return TouchDirection.Down;
    }
    static touchEnd() {
        if (typeof this.touch === 'undefined')
            return;
        this.touch.active = false;
        if (this.touch.length >= this.TOUCH_THRESHOLD)
            switch (this.touchDirection()) {
                case TouchDirection.Left:
                    this.onLeftPressed();
                    break;
                case TouchDirection.Right:
                    this.onRightPressed();
                    break;
            }
        this.touch = undefined;
    }
    static unescapeHTMLNamedEntities(s) {
        const elt = document.createElement('span');
        elt.innerHTML = s;
        return elt.innerText;
    }
}
Navigation.TOUCH_THRESHOLD = 50;
Navigation.cachedPages = new Set();
Navigation.maxPage = 0;
Navigation.missingPages = new Set();
Navigation.handlers = new Set();
Navigation.textHandlers = new Map();
Navigation.animationPages = [
    { page: 2, position: PagePosition.Right },
];
Navigation.chapterIndex = 0;
Navigation.currentPage = 1;
Navigation.currentPages = [
    { page: 1, position: PagePosition.Right },
];
Navigation.direction = Direction.Ltr;
Navigation.hasRegistered = false;
