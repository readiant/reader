import { debounce } from './debounce.js';
import { CLASS_HIDDEN, Container, ContentType } from './consts.js';
import { Navigation } from './navigation.js';
import { Readiant } from './readiant.js';
import { Storage } from './storage.js';
import { Stream } from './stream.js';
import { isOffline } from './env.js';
import { ClientActionType, ServerActionType, } from './consts.js';
export class Search {
    static get button() {
        return Readiant.root.querySelector('.rdnt__search-button');
    }
    static get closeButton() {
        return Readiant.root.querySelector('.rdnt__close-search');
    }
    static get input() {
        return Readiant.root.querySelector('.rdnt__input');
    }
    static get nResults() {
        return String(Readiant.root
            .querySelector('.rdnt__i18n')
            ?.getAttribute('data-n-results'));
    }
    static get noResults() {
        return String(Readiant.root
            .querySelector('.rdnt__i18n')
            ?.getAttribute('data-no-results'));
    }
    static get oneResult() {
        return String(Readiant.root
            .querySelector('.rdnt__i18n')
            ?.getAttribute('data-one-result'));
    }
    static get page() {
        return String(Readiant.root.querySelector('.rdnt__i18n')?.getAttribute('data-page'));
    }
    static get results() {
        return Readiant.root.querySelector('.rdnt__search-results');
    }
    static get summary() {
        return Readiant.root.querySelector('.rdnt__search-summary');
    }
    static register() {
        this.button?.addEventListener('click', (event) => {
            event.preventDefault();
            Readiant.toggle(Container.Search);
        });
        this.closeButton?.addEventListener('click', (event) => {
            event.preventDefault();
            Readiant.close([Container.Search]);
        });
        this.input?.addEventListener('input', debounce(() => {
            this.search();
        }, 200));
        this.button?.classList.remove(CLASS_HIDDEN);
    }
    static empty() {
        if (this.results === null)
            return;
        while (this.results.hasChildNodes())
            this.results.removeChild(this.results.firstChild);
    }
    static onResult(data) {
        if (this.results === null || this.summary === null)
            return;
        this.empty();
        const fragment = Readiant.documentContext.createDocumentFragment();
        if (data.result.length === 0)
            this.summary.innerHTML = this.noResults;
        else if (data.result.length === 1)
            this.summary.innerHTML = this.oneResult;
        else
            this.summary.innerHTML = this.nResults.replace('%s', String(data.result.length));
        for (const result of data.result) {
            const li = Readiant.documentContext.createElement('li');
            li.setAttribute('class', 'rdnt__search-result');
            if (Readiant.type === ContentType.SVG) {
                li.innerHTML = `<span class="rdnt__search-result__page">${this.page} ${String(result.page)}</span>${this.summarizeMatches(result.match, data.query)}`;
                li.addEventListener('click', (event) => {
                    event.preventDefault();
                    Navigation.gotoPage(result.page);
                });
            }
            else {
                li.innerHTML = this.summarizeMatches(result.match, data.query);
                li.addEventListener('click', (event) => {
                    event.preventDefault();
                    Navigation.gotoSearchResult(result.chapterIndex, data.query);
                });
            }
            fragment.appendChild(li);
        }
        this.results.appendChild(fragment);
    }
    static remove() {
        const element = Readiant.root.querySelector(`.${Container.Search}`);
        this.button?.remove();
        element?.remove();
    }
    static search() {
        const query = this.input?.value;
        if (typeof query === 'undefined' || query.length === 0) {
            this.empty();
            if (this.summary !== null)
                this.summary.innerHTML = '';
        }
        else {
            if (isOffline)
                this.searchLocal(query);
            else {
                if (!Stream.hasMessageHandler(ServerActionType.SearchResult))
                    Stream.setMessageHandler(ServerActionType.SearchResult, (data) => {
                        this.onResult(data);
                    });
                Stream.send({
                    type: ClientActionType.Search,
                    query,
                });
            }
        }
    }
    static searchLocal(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();
        for (const page of Navigation.pages) {
            if (!Storage.hasText(page))
                continue;
            const text = Storage.getText(page);
            for (const sentence of text.sentences) {
                if (sentence.toLowerCase().includes(lowerQuery)) {
                    results.push({
                        page,
                        match: sentence,
                    });
                    break;
                }
            }
        }
        this.onResult({
            query,
            result: results,
            type: ServerActionType.SearchResult,
        });
    }
    static summarizeMatches(match, query) {
        const queryLength = query.length;
        const padding = 10;
        const spans = [];
        const lowerCase = match.toLowerCase();
        let lastIndex = -1;
        while (true) {
            lastIndex = lowerCase.indexOf(query.toLowerCase(), lastIndex + 1);
            if (lastIndex !== -1) {
                const start = Math.max(lastIndex - padding, 0);
                const end = Math.min(lastIndex + queryLength + padding * 1.5, match.length);
                if (spans.length > 0 && spans[spans.length - 1][1] >= start)
                    spans[spans.length - 1][1] = end;
                else
                    spans.push([start, end]);
            }
            else
                break;
        }
        return spans
            .map(([start, end]) => `<span class="rdnt__sentence">${match.substring(start, end)}</span>`)
            .join('')
            .replace(new RegExp(query, 'gi'), `<span class="rdnt__match">$&</span>`);
    }
}
