import { EffectiveConnectionType } from './consts.js';
import { Builder } from './builder.js';
import { CLASS_BLOCK_ACTIVE, ContentType } from './consts.js';
import { connectionInfo } from './detection.js';
import { eventLogger } from './eventLogger.js';
import { LogType } from './log.js';
import { Readiant } from './readiant.js';
export class ImageQuality {
    static get buttons() {
        return Readiant.root.querySelectorAll('.rdnt__image-quality');
    }
    static get current() {
        return Readiant.root.querySelector('.rdnt__current-selection--image-quality');
    }
    static register() {
        for (const button of this.buttons)
            button.addEventListener('click', (event) => {
                this.change(event);
            });
    }
    static change(event) {
        let title;
        let value;
        if (typeof event === 'number') {
            event = Math.abs(event);
            if (event < 1)
                event = 1;
            if (event > 3)
                event = 3;
            const element = Readiant.root.querySelector(`[data-image-quality="${String(event)}"]`);
            if (element === null)
                return;
            element.click();
            title = String(element.getAttribute('data-title'));
            value = event;
        }
        else {
            const element = event.currentTarget;
            title = String(element.getAttribute('data-title'));
            value = Number(String(element.getAttribute('data-image-quality')));
        }
        for (const button of this.buttons) {
            button.classList.remove(CLASS_BLOCK_ACTIVE);
            if (button.getAttribute('data-image-quality') === String(value))
                button.classList.add(CLASS_BLOCK_ACTIVE);
        }
        let connection;
        switch (value) {
            case 1: {
                const info = connectionInfo().connection;
                connection =
                    typeof info !== 'undefined'
                        ? info
                        : Readiant.type === ContentType.SVG
                            ? EffectiveConnectionType.FourG
                            : EffectiveConnectionType.TwoG;
                break;
            }
            case 2:
                connection =
                    Readiant.type === ContentType.SVG
                        ? EffectiveConnectionType.TwoG
                        : EffectiveConnectionType.SlowTwoG;
                break;
            default:
            case 3:
                connection =
                    Readiant.type === ContentType.SVG
                        ? EffectiveConnectionType.FourG
                        : EffectiveConnectionType.TwoG;
                break;
        }
        Builder.imageQuality(connection);
        if (this.current !== null)
            this.current.textContent = title;
        eventLogger({
            type: LogType.ChangeImageQuality,
            imageQuality: connection,
            imageQualityLevel: value,
        });
    }
}
