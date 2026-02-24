import type { Stream } from "@libp2p/interface";
import { pushable } from "it-pushable";
import type { Uint8ArrayList } from "uint8arraylist";
import { decodeFramedPacketSet, encodeFramedPacketSet } from "./packetset-wire.js";
import { TransportSession, type TransportSessionOptions } from "./session.js";

export interface BinaryMessageChannel {
  send(payload: Uint8Array): Promise<void>;
  receive(): Promise<Uint8Array>;
  close(): Promise<void>;
}

export interface Libp2pSessionChannelOptions extends TransportSessionOptions {
  session?: TransportSession;
}

function toUint8Array(value: Uint8Array | Uint8ArrayList): Uint8Array {
  return value instanceof Uint8Array ? value : value.slice();
}

export class Libp2pSessionChannel implements BinaryMessageChannel {
  private readonly streamIterator: AsyncIterator<Uint8Array | Uint8ArrayList>;
  private readonly outbound = pushable<Uint8Array>();
  private readonly sinkPromise: Promise<void>;
  private sinkError?: Error;
  private readonly session: TransportSession;

  constructor(
    private readonly stream: Stream,
    options: Libp2pSessionChannelOptions = {},
  ) {
    this.streamIterator = stream.source[Symbol.asyncIterator]();
    this.session = options.session ?? new TransportSession(options);
    this.sinkPromise = stream.sink(this.outbound).catch((error: unknown) => {
      this.sinkError = error instanceof Error ? error : new Error(String(error));
    });
  }

  async send(payload: Uint8Array): Promise<void> {
    if (this.sinkError) {
      throw this.sinkError;
    }

    const packetSet = this.session.encapsulatePayload(payload);
    const encoded = encodeFramedPacketSet(packetSet);
    this.outbound.push(encoded);
  }

  async receive(): Promise<Uint8Array> {
    const chunk = await this.streamIterator.next();
    if (chunk.done) {
      throw new Error("Stream ended before receiving a transport payload.");
    }

    const encoded = toUint8Array(chunk.value);
    const packetSet = decodeFramedPacketSet(encoded);
    return this.session.decapsulatePayload(packetSet);
  }

  async close(): Promise<void> {
    this.outbound.end();
    await this.sinkPromise;
    await this.stream.close();
  }
}
