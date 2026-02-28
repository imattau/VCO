import { pushable } from "it-pushable";
import { decodeFramedPacketSet, encodeFramedPacketSet } from "./packetset-wire.js";
import { TransportSession } from "./session.js";
function toUint8Array(value) {
    return value instanceof Uint8Array ? value : value.slice();
}
export class Libp2pSessionChannel {
    stream;
    streamIterator;
    outbound = pushable();
    sinkPromise;
    sinkError;
    session;
    constructor(stream, options = {}) {
        this.stream = stream;
        this.streamIterator = stream.source[Symbol.asyncIterator]();
        this.session = options.session ?? new TransportSession(options);
        this.sinkPromise = stream.sink(this.outbound).catch((error) => {
            this.sinkError = error instanceof Error ? error : new Error(String(error));
        });
    }
    async send(payload) {
        if (this.sinkError) {
            throw this.sinkError;
        }
        const packetSet = this.session.encapsulatePayload(payload);
        const encoded = encodeFramedPacketSet(packetSet);
        this.outbound.push(encoded);
    }
    async receive() {
        const chunk = await this.streamIterator.next();
        if (chunk.done) {
            throw new Error("Stream ended before receiving a transport payload.");
        }
        const encoded = toUint8Array(chunk.value);
        const packetSet = decodeFramedPacketSet(encoded);
        return this.session.decapsulatePayload(packetSet);
    }
    async close() {
        this.outbound.end();
        await this.sinkPromise;
        await this.stream.close();
    }
}
//# sourceMappingURL=channel.js.map