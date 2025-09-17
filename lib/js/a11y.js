export class A11y {
    static register() {
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
                event.preventDefault();
                if (element !== null)
                    element.dispatchEvent(click);
                break;
        }
    }
}
A11y.elements = document.querySelectorAll('h5[role="button"], label[role="button"]');
A11y.icons = document.querySelectorAll('svg');
