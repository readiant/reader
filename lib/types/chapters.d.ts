import { A11y } from './a11y.js';
import { CLASS_HIDDEN, Container } from './consts.js';
import { Navigation } from './navigation.js';
import { Readiant } from './readiant.js';
export class Chapters {
    static get button() {
        return document.getElementsByClassName('rdnt__chapters-button')[0];
    }
    static get closeButton() {
        return document.getElementsByClassName('rdnt__close-chapters')[0];
    }
    static get list() {
        return document.getElementsByClassName('rdnt__chapters-list')[0];
    }
    static register(chapters) {
        this.chapters = chapters;
        this.button.addEventListener('click', () => {
            Readiant.toggle(Container.Chapters);
        });
        this.closeButton.addEventListener('click', () => {
            Readiant.close([Container.Chapters]);
        });
        for (const chapter of this.chapters) {
            const label = document.createElement('label');
            label.setAttribute('class', 'rdnt__radio');
            label.setAttribute('role', 'button');
            label.setAttribute('tabindex', '0');
            const input = document.createElement('input');
            input.setAttribute('class', 'rdnt__chapter');
            input.setAttribute('name', 'chapters');
            input.setAttribute('type', 'radio');
            const span = document.createElement('span');
            span.setAttribute('class', 'rdnt__radio-title');
            span.innerText = chapter.title;
            label.appendChild(input);
            label.appendChild(span);
            label.addEventListener('click', () => Navigation.gotoChapter(chapter));
            label.addEventListener('keydown', (event) => {
                A11y.shortcut(event);
            });
            this.list.appendChild(label);
        }
        this.active(Navigation.currentPage);
        this.button.classList.remove(CLASS_HIDDEN);
        Navigation.addHandler((newPage) => {
            Chapters.active(newPage);
        });
    }
    static active(page) {
        let index;
        for (let i = 0; i < this.chapters.length; i++) {
            const chapter = this.chapters[i];
            const next = this.chapters[i + 1];
            if ('startPage' in chapter &&
                typeof chapter.startPage === 'number' &&
                page >= chapter.startPage &&
                (typeof next === 'undefined' ||
                    ('startPage' in next &&
                        typeof next.startPage === 'number' &&
                        page < next.startPage))) {
                index = i;
                break;
            }
        }
        if (typeof index === 'undefined')
            return;
        document.getElementsByClassName('rdnt__chapter')[index].checked = true;
    }
    static remove() {
        const element = document.getElementsByClassName(Container.Chapters)[0];
        this.button.remove();
        element.remove();
    }
}
