import { ResizeObserver as ResizeObserverPolyfill } from '@juggle/resize-observer';
import { Direction, OrientationMode } from './consts.js';
import { Navigation } from './navigation.js';
export function base64Decode(string) {
    return decodeURIComponent(Array.prototype.map
        .call(window.atob(string), (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''));
}
export function base64Encode(string) {
    return window.btoa(encodeURIComponent(string).replace(/%([0-9A-F]{2})/g, (_match, p1) => String.fromCharCode(parseInt(p1, 16))));
}
export function connectionInfo() {
    if ('connection' in navigator) {
        let download = navigator.connection.downlink;
        if (typeof download === 'undefined')
            download = navigator.connection.downlinkMax;
        let connection;
        if ('effectiveType' in
            navigator
                .connection)
            connection = navigator.connection.effectiveType;
        return { download, connection };
    }
    else
        return {};
}
export const fullscreen = typeof document.exitFullscreen !==
    'undefined' ||
    typeof document
        .msExitFullscreen !== 'undefined' ||
    typeof document
        .mozCancelFullScreen !== 'undefined' ||
    typeof document
        .webkitExitFullscreen !== 'undefined';
export const hoverEvents = window.matchMedia('(any-hover: hover) and (pointer: fine)').matches;
export const orientation = window.matchMedia('(orientation: portrait)').matches
    ? OrientationMode.Portrait
    : OrientationMode.Landscape;
export const pointerEvents = ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 0) ||
    'pointerdown' in window;
export const ResizeObserver = typeof window.ResizeObserver !== 'undefined'
    ? window.ResizeObserver
    : ResizeObserverPolyfill;
let negativeScroll;
export const specGetScrollLeft = (element) => {
    if (typeof negativeScroll === 'undefined') {
        element.scrollLeft = -1000;
        negativeScroll = element.scrollLeft < 0;
    }
    return Navigation.direction === Direction.Rtl && !negativeScroll
        ? element.scrollWidth - element.scrollLeft - element.clientWidth
        : element.scrollLeft;
};
export const specSetScrollLeft = (element, scroll) => {
    if (typeof negativeScroll === 'undefined') {
        element.scrollLeft = -1000;
        negativeScroll = element.scrollLeft < 0;
    }
    if (Navigation.direction === Direction.Rtl && !negativeScroll)
        element.scrollLeft = element.scrollWidth - scroll - element.clientWidth;
    else
        element.scrollLeft = scroll;
};
export function touchEvents() {
    if ('ontouchstart' in window)
        return true;
    const detect = document.createElement('div');
    detect.setAttribute('class', 'rdnt__detect');
    return detect.offsetTop === 9;
}
export const webP = async () => {
    return new Promise((resolve) => {
        const image = new Image();
        const source = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
        image.onload = () => {
            resolve(image.width === 1);
        };
        image.onerror = () => {
            resolve(false);
        };
        image.src = source;
    });
};
