import { Readiant } from './readiant.js';
export class A11y {
    static get elements() {
        return Readiant.root.querySelectorAll('h5[role="button"], label[role="button"]');
    }
    static get icons() {
        return Readiant.root.querySelectorAll('svg');
    }
    static register() {
        for (const h5 of Readiant.root.querySelectorAll('h5.rdnt__block-title')) {
            h5.setAttribute('role', 'button');
            const view = h5.nextElementSibling;
            h5.setAttribute('aria-expanded', view?.classList.contains('rdnt__block-view--active') === true
                ? 'true'
                : 'false');
        }
        for (const button of Readiant.root.querySelectorAll('.rdnt__block-button')) {
            if (!button.hasAttribute('aria-pressed') &&
                !button.classList.contains('rdnt__undo') &&
                !button.classList.contains('rdnt__issue'))
                button.setAttribute('aria-pressed', button.classList.contains('rdnt__block-button--active')
                    ? 'true'
                    : 'false');
        }
        for (const button of Readiant.root.querySelectorAll('.rdnt__block-round-button[data-color]')) {
            if (!button.hasAttribute('aria-pressed'))
                button.setAttribute('aria-pressed', button.classList.contains('rdnt__block-round-button--active')
                    ? 'true'
                    : 'false');
        }
        for (const button of Readiant.root.querySelectorAll('.rdnt__line-highlight-button:not(.rdnt__block-button)')) {
            if (!button.hasAttribute('aria-pressed'))
                button.setAttribute('aria-pressed', 'false');
        }
        for (const element of this.elements)
            element.addEventListener('keydown', (event) => {
                this.shortcut(event);
            });
        for (const icon of this.icons)
            icon.setAttribute('aria-hidden', 'true');
    }
    static shortcut(event) {
        const element = event.currentTarget;
        const click = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
        });
        let code;
        if (typeof event.key !== 'undefined')
            code = event.key;
        else if (event.keyIdentifier !==
            undefined)
            code = event.keyIdentifier;
        else
            return;
        switch (code) {
            case 'Enter':
            case ' ':
                event.preventDefault();
                if (element !== null)
                    element.dispatchEvent(click);
                break;
        }
    }
}
