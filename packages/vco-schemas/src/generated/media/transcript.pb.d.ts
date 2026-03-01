import $protobuf from "protobufjs/minimal.js";
/** Namespace vco. */
export namespace vco {

    /** Namespace schemas. */
    namespace schemas {

        /** Properties of a TranscriptEntry. */
        interface ITranscriptEntry {

            /** TranscriptEntry startMs */
            startMs?: (number|Long|null);

            /** TranscriptEntry endMs */
            endMs?: (number|Long|null);

            /** TranscriptEntry text */
            text?: (string|null);

            /** TranscriptEntry speaker */
            speaker?: (string|null);
        }

        /** Represents a TranscriptEntry. */
        class TranscriptEntry implements ITranscriptEntry {

            /**
             * Constructs a new TranscriptEntry.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.schemas.ITranscriptEntry);

            /** TranscriptEntry startMs. */
            public startMs: (number|Long);

            /** TranscriptEntry endMs. */
            public endMs: (number|Long);

            /** TranscriptEntry text. */
            public text: string;

            /** TranscriptEntry speaker. */
            public speaker: string;

            /**
             * Creates a new TranscriptEntry instance using the specified properties.
             * @param [properties] Properties to set
             * @returns TranscriptEntry instance
             */
            public static create(properties?: vco.schemas.ITranscriptEntry): vco.schemas.TranscriptEntry;

            /**
             * Encodes the specified TranscriptEntry message. Does not implicitly {@link vco.schemas.TranscriptEntry.verify|verify} messages.
             * @param message TranscriptEntry message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.schemas.ITranscriptEntry, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified TranscriptEntry message, length delimited. Does not implicitly {@link vco.schemas.TranscriptEntry.verify|verify} messages.
             * @param message TranscriptEntry message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.schemas.ITranscriptEntry, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a TranscriptEntry message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns TranscriptEntry
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.schemas.TranscriptEntry;

            /**
             * Decodes a TranscriptEntry message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns TranscriptEntry
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.schemas.TranscriptEntry;

            /**
             * Verifies a TranscriptEntry message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a TranscriptEntry message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns TranscriptEntry
             */
            public static fromObject(object: { [k: string]: any }): vco.schemas.TranscriptEntry;

            /**
             * Creates a plain object from a TranscriptEntry message. Also converts values to other types if specified.
             * @param message TranscriptEntry
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.schemas.TranscriptEntry, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this TranscriptEntry to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for TranscriptEntry
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a Transcript. */
        interface ITranscript {

            /** Transcript schema */
            schema?: (string|null);

            /** Transcript mediaManifestCid */
            mediaManifestCid?: (Uint8Array|null);

            /** Transcript entries */
            entries?: (vco.schemas.ITranscriptEntry[]|null);

            /** Transcript language */
            language?: (string|null);
        }

        /** Represents a Transcript. */
        class Transcript implements ITranscript {

            /**
             * Constructs a new Transcript.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.schemas.ITranscript);

            /** Transcript schema. */
            public schema: string;

            /** Transcript mediaManifestCid. */
            public mediaManifestCid: Uint8Array;

            /** Transcript entries. */
            public entries: vco.schemas.ITranscriptEntry[];

            /** Transcript language. */
            public language: string;

            /**
             * Creates a new Transcript instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Transcript instance
             */
            public static create(properties?: vco.schemas.ITranscript): vco.schemas.Transcript;

            /**
             * Encodes the specified Transcript message. Does not implicitly {@link vco.schemas.Transcript.verify|verify} messages.
             * @param message Transcript message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.schemas.ITranscript, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Transcript message, length delimited. Does not implicitly {@link vco.schemas.Transcript.verify|verify} messages.
             * @param message Transcript message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.schemas.ITranscript, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Transcript message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Transcript
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.schemas.Transcript;

            /**
             * Decodes a Transcript message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Transcript
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.schemas.Transcript;

            /**
             * Verifies a Transcript message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Transcript message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Transcript
             */
            public static fromObject(object: { [k: string]: any }): vco.schemas.Transcript;

            /**
             * Creates a plain object from a Transcript message. Also converts values to other types if specified.
             * @param message Transcript
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.schemas.Transcript, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Transcript to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Transcript
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}

export const TranscriptEntry: typeof vco.schemas.TranscriptEntry;
export const Transcript: typeof vco.schemas.Transcript;
