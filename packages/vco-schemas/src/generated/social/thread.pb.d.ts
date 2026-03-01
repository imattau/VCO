import $protobuf from "protobufjs/minimal.js";
/** Namespace vco. */
export namespace vco {

    /** Namespace schemas. */
    namespace schemas {

        /** Properties of a ThreadEntry. */
        interface IThreadEntry {

            /** ThreadEntry cid */
            cid?: (Uint8Array|null);

            /** ThreadEntry schemaUri */
            schemaUri?: (string|null);
        }

        /** Represents a ThreadEntry. */
        class ThreadEntry implements IThreadEntry {

            /**
             * Constructs a new ThreadEntry.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.schemas.IThreadEntry);

            /** ThreadEntry cid. */
            public cid: Uint8Array;

            /** ThreadEntry schemaUri. */
            public schemaUri: string;

            /**
             * Creates a new ThreadEntry instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ThreadEntry instance
             */
            public static create(properties?: vco.schemas.IThreadEntry): vco.schemas.ThreadEntry;

            /**
             * Encodes the specified ThreadEntry message. Does not implicitly {@link vco.schemas.ThreadEntry.verify|verify} messages.
             * @param message ThreadEntry message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.schemas.IThreadEntry, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ThreadEntry message, length delimited. Does not implicitly {@link vco.schemas.ThreadEntry.verify|verify} messages.
             * @param message ThreadEntry message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.schemas.IThreadEntry, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ThreadEntry message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ThreadEntry
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.schemas.ThreadEntry;

            /**
             * Decodes a ThreadEntry message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ThreadEntry
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.schemas.ThreadEntry;

            /**
             * Verifies a ThreadEntry message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ThreadEntry message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ThreadEntry
             */
            public static fromObject(object: { [k: string]: any }): vco.schemas.ThreadEntry;

            /**
             * Creates a plain object from a ThreadEntry message. Also converts values to other types if specified.
             * @param message ThreadEntry
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.schemas.ThreadEntry, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ThreadEntry to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ThreadEntry
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a Thread. */
        interface IThread {

            /** Thread schema */
            schema?: (string|null);

            /** Thread title */
            title?: (string|null);

            /** Thread entries */
            entries?: (vco.schemas.IThreadEntry[]|null);

            /** Thread timestampMs */
            timestampMs?: (number|Long|null);
        }

        /** Represents a Thread. */
        class Thread implements IThread {

            /**
             * Constructs a new Thread.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.schemas.IThread);

            /** Thread schema. */
            public schema: string;

            /** Thread title. */
            public title: string;

            /** Thread entries. */
            public entries: vco.schemas.IThreadEntry[];

            /** Thread timestampMs. */
            public timestampMs: (number|Long);

            /**
             * Creates a new Thread instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Thread instance
             */
            public static create(properties?: vco.schemas.IThread): vco.schemas.Thread;

            /**
             * Encodes the specified Thread message. Does not implicitly {@link vco.schemas.Thread.verify|verify} messages.
             * @param message Thread message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.schemas.IThread, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Thread message, length delimited. Does not implicitly {@link vco.schemas.Thread.verify|verify} messages.
             * @param message Thread message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.schemas.IThread, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Thread message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Thread
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.schemas.Thread;

            /**
             * Decodes a Thread message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Thread
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.schemas.Thread;

            /**
             * Verifies a Thread message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Thread message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Thread
             */
            public static fromObject(object: { [k: string]: any }): vco.schemas.Thread;

            /**
             * Creates a plain object from a Thread message. Also converts values to other types if specified.
             * @param message Thread
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.schemas.Thread, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Thread to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Thread
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}

export const ThreadEntry: typeof vco.schemas.ThreadEntry;
export const Thread: typeof vco.schemas.Thread;
