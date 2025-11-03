import { debounce } from './debounce.js';
import { CLASS_HIDDEN, Container, ContentType } from './consts.js';
import { Navigation } from './navigation.js';
import { Readiant } from './readiant.js';
import { Stream } from './stream.js';
import { ClientActionType, ServerActionType, } from './consts.js';
export class Search {
    static get button() {
        return document.getElementsByClassName('rdnt__search-button')[0];
    }
    static get closeButton() {
        return document.getElementsByClassName('rdnt__close-search')[0];
    }
    static get input() {
        return document.getElementsByClassName('rdnt__input')[0];
    }
    static get nResults() {
        return String(document.getElementsByClassName('rdnt__i18n')[0].getAttribute('data-n-results'));
    }
    static get noResults() {
        return String(document.getElementsByClassName('rdnt__i18n')[0].getAttribute('data-no-results'));
    }
    static get oneResult() {
        return String(document.getElementsByClassName('rdnt__i18n')[0].getAttribute('data-one-result'));
    }
    static get page() {
        return String(document.getElementsByClassName('rdnt__i18n')[0].getAttribute('data-page'));
    }
    static get results() {
        return document.getElementsByClassName('rdnt__search-results')[0];
    }
    static get summary() {
        return document.getElementsByClassName('rdnt__search-summary')[0];
    }
    static register() {
        this.button.addEventListener('click', () => {
            Readiant.toggle(Container.Search);
        });
        this.closeButton.addEventListener('click', () => {
            Readiant.close([Container.Search]);
        });
        this.input.addEventListener('input', debounce(() => {
            this.search();
        }, 200));
        this.button.classList.remove(CLASS_HIDDEN);
    }
    static empty() {
        while (this.results.hasChildNodes())
            this.results.removeChild(this.results.firstChild);
    }
    static onResult(data) {
        this.empty();
        const fragment = document.createDocumentFragment();
        if (data.result.length === 0)
            this.summary.innerHTML = this.noResults;
        else if (data.result.length === 1)
            this.summary.innerHTML = this.oneResult;
        else
            this.summary.innerHTML = this.nResults.replace('%s', String(data.result.length));
        for (const result of data.result) {
            const li = document.createElement('li');
            li.setAttribute('class', 'rdnt__search-result');
            if (Readiant.type === ContentType.SVG) {
                li.innerHTML = `<span class="rdnt__search-result__page">${this.page} ${String(result.page)}</span>${this.summarizeMatches(result.match, data.query)}`;
                li.addEventListener('click', () => {
                    Navigation.gotoPage(result.page);
                });
            }
            else {
                li.innerHTML = this.summarizeMatches(result.match, data.query);
                li.addEventListener('click', () => {
                    Navigation.gotoSearchResult(result.chapterIndex, data.query);
                });
            }
            fragment.appendChild(li);
        }
        this.results.appendChild(fragment);
    }
    static remove() {
        const element = document.getElementsByClassName(Container.Search)[0];
        this.button.remove();
        element.remove();
    }
    static search() {
        const query = this.input.value;
        if (query.length === 0) {
            this.empty();
            this.summary.innerHTML = '';
        }
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
    static summarizeMatches(match, query) {
        const queryLength = query.length;
        const padding = 10;
        const spans = [];
        const lowerCase = match.toLowerCase();
        let lastIndex = -1;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
