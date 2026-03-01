import $protobuf from "protobufjs/minimal.js";
/** Namespace vco. */
export namespace vco {

    /** Namespace schemas. */
    namespace schemas {

        /** Properties of a KeywordIndex. */
        interface IKeywordIndex {

            /** KeywordIndex schema */
            schema?: (string|null);

            /** KeywordIndex keyword */
            keyword?: (string|null);

            /** KeywordIndex entries */
            entries?: (vco.schemas.KeywordIndex.IEntry[]|null);

            /** KeywordIndex nextPageCid */
            nextPageCid?: (Uint8Array|null);
        }

        /** Represents a KeywordIndex. */
        class KeywordIndex implements IKeywordIndex {

            /**
             * Constructs a new KeywordIndex.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.schemas.IKeywordIndex);

            /** KeywordIndex schema. */
            public schema: string;

            /** KeywordIndex keyword. */
            public keyword: string;

            /** KeywordIndex entries. */
            public entries: vco.schemas.KeywordIndex.IEntry[];

            /** KeywordIndex nextPageCid. */
            public nextPageCid: Uint8Array;

            /**
             * Creates a new KeywordIndex instance using the specified properties.
             * @param [properties] Properties to set
             * @returns KeywordIndex instance
             */
            public static create(properties?: vco.schemas.IKeywordIndex): vco.schemas.KeywordIndex;

            /**
             * Encodes the specified KeywordIndex message. Does not implicitly {@link vco.schemas.KeywordIndex.verify|verify} messages.
             * @param message KeywordIndex message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.schemas.IKeywordIndex, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified KeywordIndex message, length delimited. Does not implicitly {@link vco.schemas.KeywordIndex.verify|verify} messages.
             * @param message KeywordIndex message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.schemas.IKeywordIndex, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a KeywordIndex message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns KeywordIndex
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.schemas.KeywordIndex;

            /**
             * Decodes a KeywordIndex message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns KeywordIndex
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.schemas.KeywordIndex;

            /**
             * Verifies a KeywordIndex message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a KeywordIndex message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns KeywordIndex
             */
            public static fromObject(object: { [k: string]: any }): vco.schemas.KeywordIndex;

            /**
             * Creates a plain object from a KeywordIndex message. Also converts values to other types if specified.
             * @param message KeywordIndex
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.schemas.KeywordIndex, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this KeywordIndex to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for KeywordIndex
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace KeywordIndex {

            /** Properties of an Entry. */
            interface IEntry {

                /** Entry cid */
                cid?: (Uint8Array|null);

                /** Entry weight */
                weight?: (number|null);

                /** Entry indexedAtMs */
                indexedAtMs?: (number|Long|null);
            }

            /** Represents an Entry. */
            class Entry implements IEntry {

                /**
                 * Constructs a new Entry.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: vco.schemas.KeywordIndex.IEntry);

                /** Entry cid. */
                public cid: Uint8Array;

                /** Entry weight. */
                public weight: number;

                /** Entry indexedAtMs. */
                public indexedAtMs: (number|Long);

                /**
                 * Creates a new Entry instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Entry instance
                 */
                public static create(properties?: vco.schemas.KeywordIndex.IEntry): vco.schemas.KeywordIndex.Entry;

                /**
                 * Encodes the specified Entry message. Does not implicitly {@link vco.schemas.KeywordIndex.Entry.verify|verify} messages.
                 * @param message Entry message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: vco.schemas.KeywordIndex.IEntry, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Entry message, length delimited. Does not implicitly {@link vco.schemas.KeywordIndex.Entry.verify|verify} messages.
                 * @param message Entry message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: vco.schemas.KeywordIndex.IEntry, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an Entry message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Entry
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.schemas.KeywordIndex.Entry;

                /**
                 * Decodes an Entry message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Entry
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.schemas.KeywordIndex.Entry;

                /**
                 * Verifies an Entry message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an Entry message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Entry
                 */
                public static fromObject(object: { [k: string]: any }): vco.schemas.KeywordIndex.Entry;

                /**
                 * Creates a plain object from an Entry message. Also converts values to other types if specified.
                 * @param message Entry
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: vco.schemas.KeywordIndex.Entry, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Entry to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for Entry
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }
        }
    }
}

export const KeywordIndex: typeof vco.schemas.KeywordIndex;
