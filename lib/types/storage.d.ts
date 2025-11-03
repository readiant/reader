import { openDB } from 'idb';
import { NAMESPACE_SVG, } from './consts.js';
import { hoverEvents, pointerEvents, touchEvents } from './detection.js';
export class Storage {
    static convertStringToElement(element) {
        const placeholder = document.createElementNS(NAMESPACE_SVG, 'svg');
        placeholder.innerHTML = element;
        return placeholder.firstChild;
    }
    static upgradeStorage(db) {
        if (typeof this.data.code === 'undefined')
            return;
        for (const storeName of db.objectStoreNames)
            if (storeName !== this.data.code)
                db.deleteObjectStore(storeName);
        if (!db.objectStoreNames.contains(this.data.code))
            db.createObjectStore(this.data.code, { keyPath: 'id' });
    }
    static deleteAudio(src) {
        return this.cache.delete(`${this.AUDIO_KEY}${src}`);
    }
    static getAudio(src) {
        return this.cache.get(`${this.AUDIO_KEY}${src}`);
    }
    static getBlueprints(pages) {
        let elements = new Set();
        for (const page of pages) {
            const blueprint = this.getPage(page);
            if (typeof blueprint !== 'undefined')
                elements = new Set([...elements, ...blueprint.elements]);
        }
        return elements;
    }
    static getChapter(chapter) {
        return this.cache.get(`${this.CHAPTER_KEY}${String(chapter)}`);
    }
    static getElements(blueprint) {
        const elements = document.createDocumentFragment();
        const missing = new Set();
        for (const id of blueprint) {
            const key = `${this.ELEMENT_KEY}${id}`;
            if (this.cache.has(key))
                elements.appendChild(this.convertStringToElement(this.cache.get(key)));
            else
                missing.add(id);
        }
        return {
            elements,
            missing,
        };
    }
    static getPage(page) {
        return this.cache.get(`${this.PAGE_KEY}${String(page)}`);
    }
    static getSyntax(src) {
        return this.cache.get(`${this.SYNTAX_KEY}${src}`);
    }
    static getText(page) {
        return this.cache.get(`${this.TEXT_KEY}${String(page)}`);
    }
    static hasAudio(src) {
        return this.cache.has(`${this.AUDIO_KEY}${src}`);
    }
    static hasChapter(chapter) {
        return this.cache.has(`${this.CHAPTER_KEY}${String(chapter)}`);
    }
    static hasPage(page) {
        return this.cache.has(`${this.PAGE_KEY}${String(page)}`);
    }
    static hasSyntax(src) {
        return this.cache.has(`${this.SYNTAX_KEY}${src}`);
    }
    static hasText(page) {
        return this.cache.has(`${this.TEXT_KEY}${String(page)}`);
    }
    static async cacheToOffline() {
        if (typeof this.data.code === 'undefined')
            return;
        this.data.version =
            typeof this.data.version !== 'undefined' ? this.data.version++ : 1;
        const db = await openDB(this.STORAGE_KEY, this.data.version, {
            upgrade: this.upgradeStorage.bind(this),
        });
        const transaction = db.transaction(this.data.code, this.READWRITE);
        for (const [key, value] of this.cache.entries())
            await transaction.store.add(value, key);
        await transaction.done;
        db.close();
        this.data.stored = this.data.code;
    }
    static async offlineToCache() {
        if (typeof this.data.code === 'undefined' ||
            this.data.stored !== this.data.code ||
            typeof this.data.version === 'undefined')
            return;
        const db = await openDB(this.STORAGE_KEY, this.data.version);
        let cursor = await db.transaction(this.data.code).store.openCursor();
        while (cursor !== null) {
            const key = String(cursor.key);
            if (key.startsWith(this.CHAPTER_KEY) || key.startsWith(this.PAGE_KEY))
                this.stored.add(key);
            this.cache.set(key, cursor.value);
            cursor = await cursor.continue();
        }
        db.close();
    }
    static storeAudio(src, audio) {
        this.cache.set(`${this.AUDIO_KEY}${src}`, audio);
    }
    static storeChapter(chapter) {
        const key = `${this.CHAPTER_KEY}${String(chapter.index)}`;
        this.stored.add(key);
        this.cache.set(key, chapter);
    }
    static storeElement(id, element) {
        this.cache.set(`${this.ELEMENT_KEY}${id}`, element);
    }
    static storePage(page, content) {
        const key = `${this.PAGE_KEY}${String(page)}`;
        this.stored.add(key);
        this.cache.set(key, content);
    }
    static storeSyntax(src, syntax) {
        this.cache.set(`${this.SYNTAX_KEY}${src}`, syntax);
    }
    static storeText(index, text) {
        this.cache.set(`${this.TEXT_KEY}${String(index)}`, text);
    }
}
Storage.cache = new Map();
Storage.AUDIO_KEY = 'au-';
Storage.CHAPTER_KEY = 'chptr-';
Storage.ELEMENT_KEY = 'ele-';
Storage.PAGE_KEY = 'pg-';
Storage.READWRITE = 'readwrite';
Storage.STORAGE_KEY = 'rdnt';
Storage.SYNTAX_KEY = 'syn-';
Storage.TEXT_KEY = 'txt-';
Storage.stored = new Set();
Storage.data = {
    code: window.location.pathname.split('/').pop(),
    get hover() {
        return hoverEvents;
    },
    get pointer() {
        return pointerEvents;
    },
    get touch() {
        return touchEvents();
    },
};
