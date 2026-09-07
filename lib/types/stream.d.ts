var _a;
import { ServerActionType } from './consts.js';
import { isOffline, ENV_VALUE } from './env.js';
import { Readiant } from './readiant.js';
export class Stream {
    static get state() {
        return Readiant.getInstance(Readiant.root)?.streamState;
    }
    static get ws() {
        return this.state?.ws;
    }
    static set ws(val) {
        if (this.state)
            this.state.ws = val;
    }
    static get backoff() {
        return this.state?.backoff ?? [];
    }
    static set backoff(val) {
        if (this.state)
            this.state.backoff = val;
    }
    static get handlers() {
        return this.state?.handlers ?? new Map();
    }
    static get transfers() {
        return this.state?.transfers ?? {};
    }
    static hasMessageHandler(messageType) {
        return this.handlers.has(messageType);
    }
    static setMessageHandler(messageType, handler) {
        this.handlers.set(messageType, handler);
    }
    static send(params) {
        if (isOffline)
            return;
        if (typeof this.ws === 'undefined') {
            const originalRoot = Readiant.root;
            this.setup()
                .then(() => {
                Readiant.root = originalRoot;
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
        if (isOffline)
            return;
        const originalRoot = Readiant.root;
        return new Promise((resolve, reject) => {
            if (this.backoff.length === 0)
                reject(new Error());
            this.ws = new WebSocket(this.url);
            this.ws.addEventListener('message', (event) => {
                Readiant.root = originalRoot;
                if (typeof event.data !== 'string') {
                    const transferId = Object.keys(this.transfers)[0];
                    if (typeof transferId !== 'undefined') {
                        this.transfers[transferId].chunks.push(event.data);
                        this.transfers[transferId].receivedBytes += event.data.byteLength;
                    }
                }
                else {
                    const data = JSON.parse(event.data);
                    if (data.type === ServerActionType.StreamFile &&
                        typeof data.id === 'string')
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
                Readiant.root = originalRoot;
                if (typeof this.ws !== 'undefined')
                    this.ws.close();
                if (this.backoff.length > 0)
                    setTimeout(() => {
                        Readiant.root = originalRoot;
                        this.setup().catch((e) => {
                            Readiant.errorHandler(e);
                        });
                    }, this.backoff.shift());
            });
            this.ws.addEventListener('error', () => {
                Readiant.root = originalRoot;
                reject(new Error());
            });
            this.ws.addEventListener('open', () => {
                Readiant.root = originalRoot;
                resolve();
            });
        });
    }
}
_a = Stream;
Stream.verificationCode = String(document.body.dataset.verify);
Stream.url = `${ENV_VALUE === 'LOCAL'
    ? 'ws://localhost:8008'
    : `wss://wss.readiant.${ENV_VALUE === 'PROD' ? 'app' : 'dev'}`}/d/${_a.verificationCode}`;
