import { CLASS_ACTIVE, CLASS_BLOCK_ACTIVE, CLASS_HIDDEN, CLASS_ROUND_BUTTON_ACTIVE, CLASS_TOOLTIP, AnnotationPosition, Container, ContentType, OrientationMode, PagePosition, } from './consts.js';
import { base64Decode, base64Encode } from './detection.js';
import { eventLogger } from './eventLogger.js';
import { LogType } from './log.js';
import { Navigation } from './navigation.js';
import { Orientation } from './orientation.js';
import { Readiant } from './readiant.js';
import { Storage } from './storage.js';
import { Zoom } from './zoom.js';
export class Annotations {
    static isAnnotation(v) {
        return (typeof v === 'object' &&
            ((typeof v.content === 'string' &&
                typeof v.coordinates === 'object' &&
                typeof v.id === 'string' &&
                (typeof v.firstTime === 'undefined' ||
                    typeof v.firstTime === 'boolean')) ||
                (typeof v.color === 'string' &&
                    typeof v.coordinates === 'object' &&
                    typeof v.size === 'number')));
    }
    static get annotationSettings() {
        return Readiant.root.querySelector('.rdnt__annotation-settings');
    }
    static get markerSettings() {
        return Readiant.root.querySelector('.rdnt__marker-settings');
    }
    static get markerColorSettings() {
        return Readiant.root.querySelector('.rdnt__marker-color-settings');
    }
    static get annotationLeftContainer() {
        return Readiant.root.querySelector('.rdnt__annotations-surface--left');
    }
    static get annotationLeftCanvas() {
        return Readiant.root.querySelector('.rdnt__markings--left');
    }
    static get annotationLeftContext() {
        return this.annotationLeftCanvas?.getContext('2d');
    }
    static get annotationLeftComments() {
        return Readiant.root.querySelector('.rdnt__comments--left');
    }
    static get annotationRightContainer() {
        return Readiant.root.querySelector('.rdnt__annotations-surface--right');
    }
    static get annotationRightCanvas() {
        return Readiant.root.querySelector('.rdnt__markings--right');
    }
    static get annotationRightContext() {
        return this.annotationRightCanvas?.getContext('2d');
    }
    static get annotationRightComments() {
        return Readiant.root.querySelector('.rdnt__comments--right');
    }
    static get current() {
        return Readiant.root.querySelector('.rdnt__current-selection--annotations');
    }
    static get off() {
        return String(Readiant.root.querySelector('.rdnt__i18n')?.getAttribute('data-off'));
    }
    static get on() {
        return String(Readiant.root.querySelector('.rdnt__i18n')?.getAttribute('data-on'));
    }
    static get page() {
        return String(Readiant.root.querySelector('.rdnt__i18n')?.getAttribute('data-page'));
    }
    static get button() {
        return Readiant.root.querySelector('.rdnt__annotations-button');
    }
    static get closeButton() {
        return Readiant.root.querySelector('.rdnt__close-annotations');
    }
    static get showButton() {
        return Readiant.root.querySelector('.rdnt__show-annotations');
    }
    static get markerButton() {
        return Readiant.root.querySelector('.rdnt__marker');
    }
    static get commentButton() {
        return Readiant.root.querySelector('.rdnt__comment');
    }
    static get commentsList() {
        return Readiant.root.querySelector('.rdnt__comments-list');
    }
    static get undoButton() {
        return Readiant.root.querySelector('.rdnt__undo');
    }
    static get markerSizeRange() {
        return Readiant.root.querySelector('.rdnt__marker-size');
    }
    static get markerColorButtons() {
        return Readiant.root.querySelectorAll('.rdnt__marker-color');
    }
    static get markingsList() {
        return Readiant.root.querySelector('.rdnt__markings-list');
    }
    static get eraserButton() {
        return Readiant.root.querySelector('.rdnt__eraser');
    }
    static get editCommentTooltip() {
        return String(this.commentButton?.getAttribute('data-edit-comment'));
    }
    static get removeCommentTooltip() {
        return String(this.commentButton?.getAttribute('data-remove-comment'));
    }
    static add(annotations) {
        for (const annotation of annotations) {
            const importedAnnotations = JSON.parse(base64Decode(annotation.annotations));
            if (importedAnnotations.every((importedAnnotation) => Annotations.isAnnotation(importedAnnotation)))
                this.annotations[annotation.page] =
                    typeof this.annotations[annotation.page] !== 'undefined'
                        ? [...this.annotations[annotation.page], ...importedAnnotations]
                        : importedAnnotations;
        }
        this.toggle();
    }
    static register() {
        const endEvent = (event) => {
            Readiant.windowContext.removeEventListener('mouseup', endEvent);
            Readiant.windowContext.removeEventListener('pointerup', endEvent);
            Readiant.windowContext.removeEventListener('touchcancel', endEvent);
            Readiant.windowContext.removeEventListener('touchend', endEvent);
            this.annotationHandler('end', event);
        };
        this.button?.addEventListener('click', () => {
            Readiant.toggle(Container.Annotations);
        });
        this.closeButton?.addEventListener('click', () => {
            Readiant.close([Container.Annotations]);
        });
        this.commentButton?.addEventListener('click', () => {
            this.toggleComments();
        });
        this.markerButton?.addEventListener('click', () => {
            this.toggleMarker();
        });
        this.showButton?.addEventListener('click', () => {
            this.toggle();
        });
        this.eraserButton?.addEventListener('click', () => {
            this.toggleEraser();
        });
        this.undoButton?.addEventListener('click', () => {
            this.undo();
        });
        Navigation.addHandler((newPage, currentPage) => {
            this.save(currentPage);
            this.load(newPage);
        });
        Zoom.add(() => {
            this.draw();
        });
        this.markerSizeRange?.addEventListener('change', (event) => {
            this.changeMarkerSize(event);
        });
        for (const markerColorButton of this.markerColorButtons)
            markerColorButton.addEventListener('click', (event) => {
                this.changeMarkerColor(event);
            });
        this.button?.classList.remove(CLASS_HIDDEN);
        if (Storage.data.pointer) {
            this.annotationLeftCanvas?.addEventListener('pointerdown', (event) => {
                this.annotationHandler('start', event);
                Readiant.windowContext.addEventListener('pointerup', endEvent);
            });
            this.annotationLeftCanvas?.addEventListener('pointermove', (event) => {
                this.annotationHandler('move', event);
            }, { passive: true });
            this.annotationRightCanvas?.addEventListener('pointerdown', (event) => {
                this.annotationHandler('start', event);
                Readiant.windowContext.addEventListener('pointerup', endEvent);
            });
            this.annotationRightCanvas?.addEventListener('pointermove', (event) => {
                this.annotationHandler('move', event);
            }, { passive: true });
        }
        else if (Storage.data.touch) {
            this.annotationLeftCanvas?.addEventListener('touchstart', (event) => {
                this.annotationHandler('start', event);
                Readiant.windowContext.addEventListener('touchcancel', endEvent);
                Readiant.windowContext.addEventListener('touchend', endEvent);
            }, { passive: true });
            this.annotationLeftCanvas?.addEventListener('touchmove', (event) => {
                this.annotationHandler('move', event);
            }, { passive: true });
            this.annotationRightCanvas?.addEventListener('touchstart', (event) => {
                this.annotationHandler('start', event);
                Readiant.windowContext.addEventListener('touchcancel', endEvent);
                Readiant.windowContext.addEventListener('touchend', endEvent);
            }, { passive: true });
            this.annotationRightCanvas?.addEventListener('touchmove', (event) => {
                this.annotationHandler('move', event);
            }, { passive: true });
        }
        else {
            this.annotationLeftCanvas?.addEventListener('mousedown', (event) => {
                this.annotationHandler('start', event);
                Readiant.windowContext.addEventListener('mouseup', endEvent);
            });
            this.annotationLeftCanvas?.addEventListener('mousemove', (event) => {
                this.annotationHandler('move', event);
            }, { passive: true });
            this.annotationRightCanvas?.addEventListener('mousedown', (event) => {
                this.annotationHandler('start', event);
                Readiant.windowContext.addEventListener('mouseup', endEvent);
            });
            this.annotationRightCanvas?.addEventListener('mousemove', (event) => {
                this.annotationHandler('move', event);
            }, { passive: true });
        }
        this.annotationLeftComments?.addEventListener('click', (event) => {
            this.commentHandler(event);
        });
        this.annotationRightComments?.addEventListener('click', (event) => {
            this.commentHandler(event);
        });
        Readiant.windowContext.addEventListener('beforeunload', () => {
            this.save(Navigation.currentPage);
        });
    }
    static annotateEnd() {
        let addToHistory = 0;
        const leftMarkerEvent = this.markerEvent.filter((event) => event.position === AnnotationPosition.Left);
        const rightMarkerEvent = this.markerEvent.filter((event) => event.position === AnnotationPosition.Right);
        if (leftMarkerEvent.length > 0) {
            const currentPage = Navigation.currentPages.find((page) => page.position === PagePosition.Left);
            if (typeof currentPage === 'undefined')
                return;
            if (!(currentPage.page in this.annotations))
                this.annotations[currentPage.page] = [];
            this.annotations[currentPage.page].push({
                color: this.color,
                coordinates: leftMarkerEvent.map((event) => ({
                    x: event.x,
                    y: event.y,
                })),
                ...(this.isErasing ? { eraser: true } : {}),
                size: this.size,
            });
            if (rightMarkerEvent.length === 0 ||
                this.markerEvent[0].position === AnnotationPosition.Left)
                this.annotationHistory = [...this.annotationHistory, currentPage.page];
            else
                addToHistory = currentPage.page;
        }
        if (rightMarkerEvent.length > 0) {
            const currentPage = Navigation.currentPages.find((page) => page.position === PagePosition.Right);
            if (typeof currentPage === 'undefined')
                return;
            if (!(currentPage.page in this.annotations))
                this.annotations[currentPage.page] = [];
            this.annotations[currentPage.page].push({
                color: this.color,
                coordinates: rightMarkerEvent.map((event) => ({
                    x: event.x,
                    y: event.y,
                })),
                ...(this.isErasing ? { eraser: true } : {}),
                size: this.size,
            });
            if (leftMarkerEvent.length === 0 ||
                this.markerEvent[0].position === AnnotationPosition.Right)
                this.annotationHistory = [...this.annotationHistory, currentPage.page];
            else
                addToHistory = currentPage.page;
        }
        if (addToHistory > 0)
            this.annotationHistory = [...this.annotationHistory, addToHistory];
        this.draw();
    }
    static annotationHandler(action, event) {
        switch (action) {
            case 'start':
                this.annotateStart(event);
                break;
            case 'move':
                this.annotateMove(event);
                break;
            case 'end':
                this.annotateEnd();
                break;
        }
    }
    static annotateStart(event) {
        this.markerEvent = [];
        const clientX = 'changedTouches' in event
            ? event.changedTouches[0].clientX
            : event.clientX;
        const clientY = 'changedTouches' in event
            ? event.changedTouches[0].clientY
            : event.clientY;
        const isLeft = [...Readiant.root.elementsFromPoint(clientX, clientY)].some((element) => element.classList.contains('rdnt__markings--left'));
        const container = isLeft
            ? this.annotationLeftContainer
            : this.annotationRightContainer;
        if (container === null)
            return;
        const rect = container.getBoundingClientRect();
        const coordinates = {
            position: isLeft ? AnnotationPosition.Left : AnnotationPosition.Right,
            x: (clientX - rect.left) / container.offsetWidth,
            y: (clientY - rect.top) / container.offsetHeight,
        };
        this.markerEvent.push(coordinates);
    }
    static annotateMove(event) {
        if ('buttons' in event && event.buttons !== 1)
            return;
        const clientX = 'changedTouches' in event
            ? event.changedTouches[0].clientX
            : event.clientX;
        const clientY = 'changedTouches' in event
            ? event.changedTouches[0].clientY
            : event.clientY;
        const isLeft = [...Readiant.root.elementsFromPoint(clientX, clientY)].some((element) => element.classList.contains('rdnt__markings--left'));
        const container = isLeft
            ? this.annotationLeftContainer
            : this.annotationRightContainer;
        if (container === null)
            return;
        const rect = container.getBoundingClientRect();
        const coordinates = {
            position: isLeft ? AnnotationPosition.Left : AnnotationPosition.Right,
            x: (clientX - rect.left) / container.offsetWidth,
            y: (clientY - rect.top) / container.offsetHeight,
        };
        this.markerEvent.push(coordinates);
    }
    static clear() {
        if (this.annotationLeftContext !== null &&
            typeof this.annotationLeftContext !== 'undefined' &&
            this.annotationLeftCanvas !== null)
            this.annotationLeftContext.clearRect(0, 0, this.annotationLeftCanvas.width, this.annotationLeftCanvas.height);
        if (this.annotationLeftComments !== null)
            this.annotationLeftComments.innerHTML = '';
        if (this.annotationRightContext !== null &&
            typeof this.annotationRightContext !== 'undefined' &&
            this.annotationRightCanvas !== null)
            this.annotationRightContext.clearRect(0, 0, this.annotationRightCanvas.width, this.annotationRightCanvas.height);
        if (this.annotationRightComments !== null)
            this.annotationRightComments.innerHTML = '';
    }
    static commentHandler(event) {
        if (!this.editComments || event.currentTarget !== event.target)
            return;
        const clientX = 'changedTouches' in event
            ? event.changedTouches[0].clientX
            : event.clientX;
        const clientY = 'changedTouches' in event
            ? event.changedTouches[0].clientY
            : event.clientY;
        const isLeft = [...Readiant.root.elementsFromPoint(clientX, clientY)].some((element) => element.classList.contains('rdnt__comments--left'));
        const container = isLeft
            ? this.annotationLeftContainer
            : this.annotationRightContainer;
        if (container === null)
            return;
        const rect = container.getBoundingClientRect();
        const coordinates = {
            x: (clientX - rect.left + Readiant.scrollX) / container.offsetWidth,
            y: (clientY - rect.top + Readiant.scrollY) / container.offsetHeight,
        };
        const currentPage = Navigation.currentPages.find((page) => page.position === (isLeft ? PagePosition.Left : PagePosition.Right));
        if (typeof currentPage === 'undefined')
            return;
        if (!(currentPage.page in this.annotations))
            this.annotations[currentPage.page] = [];
        this.annotations[currentPage.page].filter((annotation) => ('content' in annotation && annotation.content !== '') ||
            !('content' in annotation));
        this.annotations[currentPage.page].push({
            content: '',
            coordinates,
            firstTime: true,
            id: `_${Math.random().toString(36).substring(2, 9)}`,
        });
        this.annotationHistory = [...this.annotationHistory, currentPage.page];
        this.draw();
    }
    static changeMarkerColor(event) {
        const input = event.currentTarget;
        this.color = String(input.getAttribute('data-color'));
        for (const markerSizeButton of this.markerColorButtons) {
            markerSizeButton.classList.remove(CLASS_ROUND_BUTTON_ACTIVE);
            if (markerSizeButton.getAttribute('data-color') === this.color)
                markerSizeButton.classList.add(CLASS_ROUND_BUTTON_ACTIVE);
        }
    }
    static changeMarkerSize(event) {
        const input = event.currentTarget;
        this.size = Number(input.value);
    }
    static disableComments() {
        this.annotationLeftComments?.classList.remove(CLASS_ACTIVE);
        this.annotationRightComments?.classList.remove(CLASS_ACTIVE);
        this.commentButton?.classList.remove(CLASS_BLOCK_ACTIVE);
        this.editComments = false;
    }
    static draw() {
        this.clear();
        this.list();
        const actualZoom = [0.5, 1, 1.5, 2, 2.5];
        for (const currentPage of Navigation.currentPages) {
            if (!(currentPage.page in this.annotations))
                continue;
            let i = 0;
            for (const event of this.annotations[currentPage.page]) {
                if ('color' in event) {
                    const context = currentPage.position === PagePosition.Left
                        ? this.annotationLeftContext
                        : this.annotationRightContext;
                    if (context === null || typeof context === 'undefined')
                        continue;
                    context.globalCompositeOperation = event.eraser
                        ? 'destination-out'
                        : 'source-over';
                    context.strokeStyle = event.eraser ? 'rgba(0,0,0,1)' : event.color;
                    context.lineWidth =
                        Readiant.type === ContentType.SVG
                            ? event.size * actualZoom[Zoom.level - 1]
                            : event.size;
                    context.beginPath();
                    context.moveTo(event.coordinates[0].x * context.canvas.width, event.coordinates[0].y * context.canvas.height);
                    let i = 1;
                    for (i; i < event.coordinates.length - 2; i++) {
                        const xc = (event.coordinates[i].x * context.canvas.width +
                            event.coordinates[i + 1].x * context.canvas.width) /
                            2;
                        const yc = (event.coordinates[i].y * context.canvas.height +
                            event.coordinates[i + 1].y * context.canvas.height) /
                            2;
                        context.quadraticCurveTo(Math.abs(event.coordinates[i].x) * context.canvas.width, event.coordinates[i].y * context.canvas.height, xc, yc);
                    }
                    if (event.coordinates.length > 2)
                        context.quadraticCurveTo(event.coordinates[i].x * context.canvas.width, event.coordinates[i].y * context.canvas.height, event.coordinates[i + 1].x * context.canvas.width, event.coordinates[i + 1].y * context.canvas.height);
                    context.stroke();
                }
                else {
                    const comments = currentPage.position === PagePosition.Left
                        ? this.annotationLeftComments
                        : this.annotationRightComments;
                    if (comments === null)
                        continue;
                    const icon = (this.commentButton?.firstChild).cloneNode(true);
                    const comment = Readiant.documentContext.createElement('div');
                    comment.setAttribute('class', `rdnt__comment-item rdnt__tooltip top ${event.coordinates.x > 0.5 ? 'left' : 'right'}`);
                    comment.setAttribute('aria-label', this.editCommentTooltip);
                    comment.setAttribute('data-title', this.editCommentTooltip);
                    comment.setAttribute('id', event.id);
                    const remove = Readiant.documentContext.createElement('span');
                    remove.setAttribute('class', `rdnt__comment-remove rdnt__tooltip bottom ${event.coordinates.x > 0.5 ? 'left' : 'right'}`);
                    remove.setAttribute('data-id', event.id);
                    remove.setAttribute('aria-label', this.removeCommentTooltip);
                    remove.setAttribute('data-title', this.removeCommentTooltip);
                    remove.innerHTML = '&times;';
                    const input = Readiant.documentContext.createElement('textarea');
                    input.setAttribute('class', `rdnt__comment-input ${event.coordinates.x > 0.5
                        ? 'rdnt__comment-input--left'
                        : 'rdnt__comment-input--right'}`);
                    input.value = event.content;
                    comment.style.left = `${String(event.coordinates.x * comments.offsetWidth)}px`;
                    comment.style.top = `${String(event.coordinates.y * comments.offsetHeight)}px`;
                    comment.appendChild(icon);
                    comment.appendChild(remove);
                    comment.appendChild(input);
                    comments.appendChild(comment);
                    if (typeof event.firstTime !== 'undefined') {
                        delete this.annotations[currentPage.page][i].firstTime;
                        comment.classList.remove(CLASS_TOOLTIP);
                        input.classList.add(CLASS_ACTIVE);
                        input.focus();
                    }
                    icon.addEventListener('click', (event) => {
                        this.toggleComment(event);
                    });
                    input.addEventListener('blur', (event) => {
                        this.saveComment(event);
                    });
                    remove.addEventListener('click', (event) => {
                        this.removeComment(event);
                    });
                }
                i++;
            }
        }
    }
    static list() {
        if (this.commentsList !== null)
            while (this.commentsList.hasChildNodes())
                this.commentsList.removeChild(this.commentsList.firstChild);
        if (this.markingsList !== null)
            while (this.markingsList.hasChildNodes())
                this.markingsList.removeChild(this.markingsList.firstChild);
        const comments = Readiant.documentContext.createDocumentFragment();
        const markings = Readiant.documentContext.createDocumentFragment();
        const all = Object.keys(this.annotations).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
        const commentObject = {};
        const markingObject = {};
        for (const page of all) {
            const pageComments = this.annotations[Number(page)].filter((annotation) => !('color' in annotation));
            const pageMarkings = this.annotations[Number(page)].filter((annotation) => 'color' in annotation && !('eraser' in annotation));
            if (pageComments.length > 0)
                commentObject[Number(page)] = pageComments.map((comment) => comment.content);
            if (pageMarkings.length > 0)
                markingObject[Number(page)] = new Set([
                    ...pageMarkings.map((comment) => comment.color),
                ]);
        }
        for (const [page, annotations] of Object.entries(commentObject)) {
            for (const annotation of annotations) {
                const li = Readiant.documentContext.createElement('li');
                li.setAttribute('class', 'rdnt__comments-list-item');
                li.innerHTML = `<span class="rdnt__comments-list-item__page">${this.page} ${page}</span><span class="rdnt__sentence--comment">${annotation}</span>`;
                li.addEventListener('click', () => {
                    Navigation.gotoPage(Number(page));
                });
                comments.appendChild(li);
            }
        }
        for (const [page, annotations] of Object.entries(markingObject)) {
            const li = Readiant.documentContext.createElement('li');
            li.setAttribute('class', 'rdnt__markings-list-item');
            li.innerHTML = `<span class="rdnt__markings-list-item__page">${this.page} ${page}</span>${[...annotations]
                .map((annotation) => `<span class="rdnt__sentence--marking" style="background-color:${annotation}"></span>`)
                .join()}`;
            li.addEventListener('click', () => {
                Navigation.gotoPage(Number(page));
            });
            markings.appendChild(li);
        }
        if (this.commentsList)
            this.commentsList.appendChild(comments);
        if (this.markingsList)
            this.markingsList.appendChild(markings);
    }
    static load(page) {
        if (page in this.annotations)
            this.draw();
    }
    static remove() {
        if (this.annotationLeftContainer !== null)
            this.annotationLeftContainer.remove();
        if (this.annotationRightContainer !== null)
            this.annotationRightContainer.remove();
        if (this.annotationSettings !== null)
            this.annotationSettings.remove();
    }
    static removeComment(event) {
        const element = event.currentTarget;
        const parent = element.parentNode;
        const comment = parent.parentNode;
        const id = element.getAttribute('data-id');
        const isLeft = comment.classList.contains('rdnt__comments--left');
        const currentPage = Navigation.currentPages.find((page) => page.position === (isLeft ? PagePosition.Left : PagePosition.Right));
        if (typeof currentPage === 'undefined')
            return;
        if (typeof id === 'string')
            this.annotations[currentPage.page] = this.annotations[currentPage.page].filter((annotation) => ('id' in annotation && annotation.id !== id) || !('id' in annotation));
        this.draw();
    }
    static resize(side, height, width) {
        const canvas = side === PagePosition.Left
            ? this.annotationLeftCanvas
            : this.annotationRightCanvas;
        if (canvas !== null) {
            canvas.height = height;
            canvas.width = width;
            this.draw();
        }
    }
    static save(page) {
        this.clear();
        if (typeof this.annotations[page] !== 'undefined')
            eventLogger({
                annotations: base64Encode(JSON.stringify(this.annotations[page])),
                page,
                type: LogType.Annotation,
            });
        if (Orientation.mode === OrientationMode.Landscape &&
            page % 2 === 0 &&
            typeof this.annotations[page + 1] !== 'undefined')
            eventLogger({
                annotations: base64Encode(JSON.stringify(this.annotations[page + 1])),
                page: page + 1,
                type: LogType.Annotation,
            });
    }
    static saveComment(event) {
        const element = event.target;
        const parent = element.parentNode;
        const comment = parent.parentNode;
        const isLeft = comment.classList.contains('rdnt__comments--left');
        const currentPage = Navigation.currentPages.find((page) => page.position === (isLeft ? PagePosition.Left : PagePosition.Right));
        if (typeof currentPage === 'undefined')
            return;
        const id = parent.getAttribute('id');
        if (element.value !== '')
            this.disableComments();
        this.annotations[currentPage.page] =
            element.value === ''
                ? this.annotations[currentPage.page].filter((annotation) => ('id' in annotation && annotation.id !== id) ||
                    !('id' in annotation))
                : this.annotations[currentPage.page].map((annotation) => {
                    if ('id' in annotation && annotation.id === id)
                        annotation.content = element.value;
                    return annotation;
                });
        this.draw();
    }
    static toggle() {
        if (this.showAnnotations && this.editComments)
            this.toggleComments();
        if (this.showAnnotations && this.editMarkings)
            this.toggleMarker();
        this.annotationLeftContainer?.classList.toggle(CLASS_HIDDEN);
        this.annotationRightContainer?.classList.toggle(CLASS_HIDDEN);
        this.showButton?.classList.toggle(CLASS_BLOCK_ACTIVE);
        this.showAnnotations = !this.showAnnotations;
        if (this.current !== null)
            this.current.textContent = this.showAnnotations ? this.on : this.off;
        this.draw();
    }
    static toggleComment(event) {
        const element = event.currentTarget;
        const parent = element.parentElement;
        const remove = element.nextElementSibling;
        const input = remove.nextElementSibling;
        const comments = Readiant.root.querySelectorAll('.rdnt__comment-item');
        for (const comment of comments) {
            const firstChild = comment.firstChild;
            if (firstChild.isEqualNode(element))
                continue;
            comment.classList.toggle(CLASS_ACTIVE);
            for (const child of comment.children)
                child.classList.remove(CLASS_ACTIVE);
        }
        parent.classList.toggle(CLASS_ACTIVE);
        element.classList.toggle(CLASS_ACTIVE);
        input.classList.toggle(CLASS_ACTIVE);
        remove.classList.toggle(CLASS_ACTIVE);
        if (this.editComments && input.classList.contains(CLASS_ACTIVE))
            input.focus();
    }
    static toggleComments() {
        if (!this.showAnnotations)
            this.toggle();
        if (this.editMarkings) {
            this.annotationLeftCanvas?.classList.remove(CLASS_ACTIVE);
            this.annotationRightCanvas?.classList.remove(CLASS_ACTIVE);
            this.editMarkings = false;
            this.markerButton?.classList.remove(CLASS_BLOCK_ACTIVE);
            if (this.markerSettings !== null &&
                !this.markerSettings.classList.contains(CLASS_HIDDEN))
                this.markerSettings.classList.add(CLASS_HIDDEN);
            if (this.markerColorSettings !== null &&
                !this.markerColorSettings.classList.contains(CLASS_HIDDEN))
                this.markerColorSettings.classList.add(CLASS_HIDDEN);
        }
        if (this.isErasing) {
            this.annotationLeftCanvas?.classList.remove(CLASS_ACTIVE);
            this.annotationRightCanvas?.classList.remove(CLASS_ACTIVE);
            this.isErasing = false;
            this.eraserButton?.classList.remove(CLASS_BLOCK_ACTIVE);
            if (this.markerSettings !== null &&
                !this.markerSettings.classList.contains(CLASS_HIDDEN))
                this.markerSettings.classList.add(CLASS_HIDDEN);
            if (this.markerColorSettings !== null &&
                !this.markerColorSettings.classList.contains(CLASS_HIDDEN))
                this.markerColorSettings.classList.add(CLASS_HIDDEN);
        }
        this.annotationLeftComments?.classList.toggle(CLASS_ACTIVE);
        this.annotationRightComments?.classList.toggle(CLASS_ACTIVE);
        this.editComments = !this.editComments;
        this.commentButton?.classList.toggle(CLASS_BLOCK_ACTIVE);
    }
    static toggleEraser() {
        if (!this.showAnnotations)
            this.toggle();
        if (this.editComments) {
            this.annotationLeftComments?.classList.remove(CLASS_ACTIVE);
            this.annotationRightComments?.classList.remove(CLASS_ACTIVE);
            this.editComments = false;
            this.commentButton?.classList.remove(CLASS_BLOCK_ACTIVE);
        }
        if (this.editMarkings) {
            this.annotationLeftCanvas?.classList.remove(CLASS_ACTIVE);
            this.annotationRightCanvas?.classList.remove(CLASS_ACTIVE);
            this.editMarkings = false;
            this.markerButton?.classList.remove(CLASS_BLOCK_ACTIVE);
            if (this.markerSettings !== null &&
                !this.markerSettings.classList.contains(CLASS_HIDDEN))
                this.markerSettings.classList.add(CLASS_HIDDEN);
            if (this.markerColorSettings !== null &&
                !this.markerColorSettings.classList.contains(CLASS_HIDDEN))
                this.markerColorSettings.classList.add(CLASS_HIDDEN);
        }
        this.annotationLeftCanvas?.classList.toggle(CLASS_ACTIVE);
        this.annotationRightCanvas?.classList.toggle(CLASS_ACTIVE);
        this.isErasing = !this.isErasing;
        this.eraserButton?.classList.toggle(CLASS_BLOCK_ACTIVE);
        if (this.isErasing) {
            if (this.markerSettings !== null &&
                this.markerSettings.classList.contains(CLASS_HIDDEN))
                this.markerSettings.classList.remove(CLASS_HIDDEN);
            if (this.markerColorSettings !== null &&
                !this.markerColorSettings.classList.contains(CLASS_HIDDEN))
                this.markerColorSettings.classList.add(CLASS_HIDDEN);
        }
        else {
            if (this.markerSettings !== null &&
                !this.markerSettings.classList.contains(CLASS_HIDDEN))
                this.markerSettings.classList.add(CLASS_HIDDEN);
            if (this.markerColorSettings !== null &&
                !this.markerColorSettings.classList.contains(CLASS_HIDDEN))
                this.markerColorSettings.classList.add(CLASS_HIDDEN);
        }
    }
    static toggleMarker() {
        if (!this.showAnnotations)
            this.toggle();
        if (this.editComments) {
            this.annotationLeftComments?.classList.remove(CLASS_ACTIVE);
            this.annotationRightComments?.classList.remove(CLASS_ACTIVE);
            this.editComments = false;
            this.commentButton?.classList.remove(CLASS_BLOCK_ACTIVE);
        }
        if (this.isErasing) {
            this.annotationLeftCanvas?.classList.remove(CLASS_ACTIVE);
            this.annotationRightCanvas?.classList.remove(CLASS_ACTIVE);
            this.isErasing = false;
            this.eraserButton?.classList.remove(CLASS_BLOCK_ACTIVE);
            if (this.markerSettings !== null &&
                !this.markerSettings.classList.contains(CLASS_HIDDEN))
                this.markerSettings.classList.add(CLASS_HIDDEN);
            if (this.markerColorSettings !== null &&
                !this.markerColorSettings.classList.contains(CLASS_HIDDEN))
                this.markerColorSettings.classList.add(CLASS_HIDDEN);
        }
        this.annotationLeftCanvas?.classList.toggle(CLASS_ACTIVE);
        this.annotationRightCanvas?.classList.toggle(CLASS_ACTIVE);
        this.editMarkings = !this.editMarkings;
        this.markerButton?.classList.toggle(CLASS_BLOCK_ACTIVE);
        if (this.editMarkings) {
            if (this.markerSettings !== null &&
                this.markerSettings.classList.contains(CLASS_HIDDEN))
                this.markerSettings.classList.remove(CLASS_HIDDEN);
            if (this.markerColorSettings !== null &&
                this.markerColorSettings.classList.contains(CLASS_HIDDEN))
                this.markerColorSettings.classList.remove(CLASS_HIDDEN);
        }
        else {
            if (this.markerSettings !== null &&
                !this.markerSettings.classList.contains(CLASS_HIDDEN))
                this.markerSettings.classList.add(CLASS_HIDDEN);
            if (this.markerColorSettings !== null &&
                !this.markerColorSettings.classList.contains(CLASS_HIDDEN))
                this.markerColorSettings.classList.add(CLASS_HIDDEN);
        }
    }
    static undo() {
        if (!this.showAnnotations)
            return;
        const lastPage = this.annotationHistory.pop();
        if (typeof lastPage !== 'undefined' &&
            typeof this.annotations[lastPage] !== 'undefined' &&
            this.annotations[lastPage].length > 0) {
            this.annotations[lastPage].pop();
            this.draw();
        }
    }
}
Annotations.annotations = {};
Annotations.color = 'rgba(204,213,99,.3)';
Annotations.size = 20;
Annotations.markerEvent = [];
Annotations.annotationHistory = [];
Annotations.editComments = false;
Annotations.editMarkings = false;
Annotations.isErasing = false;
Annotations.showAnnotations = false;
