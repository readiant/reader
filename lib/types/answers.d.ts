import { CLASS_BLOCK_ACTIVE, CLASS_HIDDEN } from './consts.js';
import { Readiant } from './readiant.js';
export class Answers {
    static get blocks() {
        return Readiant.root.querySelectorAll('.rdnt__answer-settings');
    }
    static get buttons() {
        return Readiant.root.querySelectorAll('.rdnt__answer-visibility');
    }
    static get currents() {
        return Readiant.root.querySelectorAll('.rdnt__current-selection--answers');
    }
    static get state() {
        return Readiant.getInstance(Readiant.root)?.answersState;
    }
    static get visible() {
        return this.state?.visible ?? false;
    }
    static set visible(value) {
        if (this.state)
            this.state.visible = value;
    }
    static register(initiallyVisible = false) {
        for (const button of this.buttons)
            button.addEventListener('click', (event) => {
                event.preventDefault();
                this.setVisible(!this.visible);
            });
        this.setVisible(initiallyVisible);
    }
    static setAvailable() {
        for (const block of this.blocks)
            block.classList.remove(CLASS_HIDDEN);
    }
    static setVisible(visible) {
        this.visible = visible;
        Readiant.documentBody.style.setProperty('--rdnt-answer-visibility', visible ? 'visible' : 'hidden');
        for (const button of this.buttons) {
            button.classList.toggle(CLASS_BLOCK_ACTIVE, visible);
            button.setAttribute('aria-pressed', String(visible));
            const label = visible
                ? button.dataset.labelHide
                : button.dataset.labelShow;
            if (typeof label !== 'undefined')
                button.setAttribute('aria-label', label);
        }
        for (const current of this.currents)
            current.textContent = visible
                ? String(current.dataset.visible)
                : String(current.dataset.hidden);
    }
}
