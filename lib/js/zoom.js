import { Builder } from './builder.js';
import { eventLogger } from './eventLogger.js';
import { LogType } from './log.js';
import { Navigation } from './navigation.js';
export class Zoom {
    static add(handler) {
        this.handlers.add(handler);
    }
    static register() {
        this.range.addEventListener('change', (event) => {
            this.change(event);
        });
    }
    static change(event) {
        let value;
        if (typeof event === 'number') {
            event = Math.abs(event);
            if (event < 1)
                event = 1;
            if (event > 5)
                event = 5;
            this.range.setAttribute('aria-valuenow', String(event));
            this.range.value = String(event);
            value = event;
        }
        else {
            const input = event.currentTarget;
            input.setAttribute('aria-valuenow', input.value);
            value = Number(input.value);
        }
        this.current.textContent = `${String(this.modes[value - 1])}%`;
        Builder.zoom(this.level, value);
        this.level = value;
        this.notify();
        this.scroll().catch((e) => {
            throw e;
        });
        Builder.layers.addEventListener('mousedown', this.handleMouseDown.bind(this));
        Builder.layers.addEventListener('mousemove', this.handleMouseMove.bind(this));
        Builder.layers.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        Builder.layers.addEventListener('mouseup', this.handleMouseUp.bind(this));
        eventLogger({
            type: LogType.ChangeZoomLevel,
            zoomLevel: value,
        });
    }
    static handleMouseDown(event) {
        if (this.level <= 2)
            return;
        event.preventDefault();
        this.isGrabbing = true;
        Builder.layers.style.cursor = 'grabbing';
        this.startX = event.pageX;
        this.startY = event.pageY;
        this.scrollLeft = window.scrollX;
        this.scrollTop = window.scrollY;
    }
    static handleMouseLeave() {
        if (this.isGrabbing)
            this.handleMouseUp();
    }
    static handleMouseMove(event) {
        if (this.level <= 2 || !this.isGrabbing)
            return;
        event.preventDefault();
        this.lastKnownMouseX = event.pageX;
        this.lastKnownMouseY = event.pageY;
        if (typeof this.animationFrameId === 'undefined')
            this.animationFrameId = window.requestAnimationFrame(this.updateScrollPosition.bind(this));
    }
    static handleMouseUp() {
        if (this.level <= 2)
            return;
        this.isGrabbing = false;
        Builder.layers.style.cursor = 'grab';
        if (typeof this.animationFrameId !== 'undefined') {
            window.cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = undefined;
        }
    }
    static notify() {
        for (const handler of this.handlers)
            handler();
    }
    static async scroll() {
        const actualZoom = [0.5, 1, 1.5, 2, 2.5];
        let scrollX = 0;
        let scrollY = 0;
        if (Zoom.level === 1 || Zoom.level === 2)
            scrollX =
                (Builder.viewport.offsetWidth * actualZoom[Zoom.level - 1] -
                    Builder.viewport.offsetWidth) /
                    2;
        else {
            const position = await Builder.textPosition();
            scrollX =
                Navigation.currentPages.length === 2 || position[0] === 0
                    ? position[0]
                    : (Builder.viewport.offsetWidth * actualZoom[Zoom.level - 1] -
                        Builder.viewport.offsetWidth) /
                        2;
            scrollY = position[1];
        }
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        window.scroll(scrollX, scrollY);
    }
    static updateScrollPosition() {
        const deltaX = this.lastKnownMouseX - this.startX;
        const deltaY = this.lastKnownMouseY - this.startY;
        const newScrollX = this.scrollLeft - deltaX;
        const newScrollY = this.scrollTop - deltaY;
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        window.scrollTo(newScrollX, newScrollY);
        this.animationFrameId = undefined;
    }
}
Zoom.current = document.getElementsByClassName('rdnt__current-selection--zoom')[0];
Zoom.range = document.getElementsByClassName('rdnt__zoom')[0];
Zoom.modes = [60, 100, 150, 200, 250];
Zoom.handlers = new Set();
Zoom.isGrabbing = false;
Zoom.startX = 0;
Zoom.startY = 0;
Zoom.scrollLeft = 0;
Zoom.scrollTop = 0;
Zoom.lastKnownMouseX = 0;
Zoom.lastKnownMouseY = 0;
Zoom.level = 2;
