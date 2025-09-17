import { Readiant } from './readiant.js';
import { Stream } from './stream.js';
const targetOrigin = '*';
export function eventLogger(toLog) {
    if (VARIANT === 'OFFLINE') {
        window.dispatchEvent(new CustomEvent('log', {
            detail: toLog,
        }));
    }
    else
        window.parent.postMessage(toLog, targetOrigin);
    if (!Readiant.preview)
        Stream.send({
            type: string.Log,
            logData: toLog,
        });
}
