import { ClientActionType } from './consts.js';
import { isOffline } from './env.js';
import { Readiant } from './readiant.js';
import { Stream } from './stream.js';
const targetOrigin = '*';
export function eventLogger(toLog) {
    if (isOffline) {
        window.dispatchEvent(new CustomEvent('log', {
            detail: toLog,
        }));
    }
    else
        window.parent.postMessage(toLog, targetOrigin);
    if (!Readiant.preview)
        Stream.send({
            type: ClientActionType.Log,
            logData: toLog,
        });
}
