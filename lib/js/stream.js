var _a;
import { ServerActionType, } from '../../../backend/src/api/communication/Actions.js';
import { Readiant } from './readiant.js';
export class Stream {
    static hasMessageHandler(messageType) {
        return this.handlers.has(messageType);
    }
    static setMessageHandler(messageType, handler) {
        this.handlers.set(messageType, handler);
    }
    static send(params) {
        if (VARIANT === 'OFFLINE')
            return;
        if (typeof this.ws === 'undefined') {
            this.setup()
                .then(() => {
                if (typeof this.ws !== 'undefined')
                    this.ws.send(JSON.stringify(params));
            })
                .catch((e) => {
                Readiant.errorHandler(e);
            });
        }
        else
            this.ws.send(JSON.stringify(params));
    }
    static async setup() {
        if (VARIANT === 'OFFLINE')
            return;
        return new Promise((resolve, reject) => {
            if (this.backoff.length === 0)
                reject(new Error());
            this.ws = new WebSocket(this.url);
            this.ws.addEventListener('message', (event) => {
                if (typeof event.data !== 'string') {
                    const transferId = Object.keys(this.transfers)[0];
                    if (typeof transferId !== 'undefined') {
                        this.transfers[transferId].chunks.push(event.data);
                        this.transfers[transferId].receivedBytes += event.data.byteLength;
                    }
                }
                else {
                    const data = JSON.parse(event.data);
                    if (data.type === ServerActionType.StreamFile)
                        this.transfers[data.id] = {
                            chunks: [],
                            receivedBytes: 0,
                        };
                    else {
                        const handler = this.handlers.get(data.type);
                        if (typeof handler !== 'undefined') {
                            const result = handler(data);
                            if (typeof result !== 'undefined') {
                                result.catch((e) => {
                                    throw e;
                                });
                            }
                        }
                    }
                }
            });
            this.ws.addEventListener('close', () => {
                if (typeof this.ws !== 'undefined')
                    this.ws.close();
                if (this.backoff.length > 0)
                    setTimeout(() => this.setup(), this.backoff.shift());
            });
            this.ws.addEventListener('error', () => {
                reject(new Error());
            });
            this.ws.addEventListener('open', () => {
                resolve();
            });
        });
    }
}
_a = Stream;
Stream.backoff = [1000, 2500, 5000, 10000];
Stream.handlers = new Map();
Stream.transfers = {};
Stream.verificationCode = String(document.body.dataset.verify);
Stream.url = `ws://localhost:8008/d/${_a.verificationCode}`;
