import type { Stream } from '@libp2p/interface';

declare const stream: Stream;
stream.send(new Uint8Array());
stream.onDrain();
const iterator = stream[Symbol.asyncIterator]();
