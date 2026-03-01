import $protobuf from "protobufjs/minimal.js";
/** Namespace vco. */
export namespace vco {

    /** Namespace schemas. */
    namespace schemas {

        /** Properties of a MediaManifest. */
        interface IMediaManifest {

            /** MediaManifest schema */
            schema?: (string|null);

            /** MediaManifest title */
            title?: (string|null);

            /** MediaManifest summary */
            summary?: (string|null);

            /** MediaManifest showNotes */
            showNotes?: (string|null);

            /** MediaManifest contentCid */
            contentCid?: (Uint8Array|null);

            /** MediaManifest thumbnailCid */
            thumbnailCid?: (Uint8Array|null);

            /** MediaManifest transcriptCid */
            transcriptCid?: (Uint8Array|null);

            /** MediaManifest durationMs */
            durationMs?: (number|Long|null);

            /** MediaManifest publishedAtMs */
            publishedAtMs?: (number|Long|null);

            /** MediaManifest previousItemCid */
            previousItemCid?: (Uint8Array|null);

            /** MediaManifest contentType */
            contentType?: (string|null);
        }

        /** Represents a MediaManifest. */
        class MediaManifest implements IMediaManifest {

            /**
             * Constructs a new MediaManifest.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.schemas.IMediaManifest);

            /** MediaManifest schema. */
            public schema: string;

            /** MediaManifest title. */
            public title: string;

            /** MediaManifest summary. */
            public summary: string;

            /** MediaManifest showNotes. */
            public showNotes: string;

            /** MediaManifest contentCid. */
            public contentCid: Uint8Array;

            /** MediaManifest thumbnailCid. */
            public thumbnailCid: Uint8Array;

            /** MediaManifest transcriptCid. */
            public transcriptCid: Uint8Array;

            /** MediaManifest durationMs. */
            public durationMs: (number|Long);

            /** MediaManifest publishedAtMs. */
            public publishedAtMs: (number|Long);

            /** MediaManifest previousItemCid. */
            public previousItemCid: Uint8Array;

            /** MediaManifest contentType. */
            public contentType: string;

            /**
             * Creates a new MediaManifest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns MediaManifest instance
             */
            public static create(properties?: vco.schemas.IMediaManifest): vco.schemas.MediaManifest;

            /**
             * Encodes the specified MediaManifest message. Does not implicitly {@link vco.schemas.MediaManifest.verify|verify} messages.
             * @param message MediaManifest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.schemas.IMediaManifest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified MediaManifest message, length delimited. Does not implicitly {@link vco.schemas.MediaManifest.verify|verify} messages.
             * @param message MediaManifest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.schemas.IMediaManifest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a MediaManifest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns MediaManifest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.schemas.MediaManifest;

            /**
             * Decodes a MediaManifest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns MediaManifest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.schemas.MediaManifest;

            /**
             * Verifies a MediaManifest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a MediaManifest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns MediaManifest
             */
            public static fromObject(object: { [k: string]: any }): vco.schemas.MediaManifest;

            /**
             * Creates a plain object from a MediaManifest message. Also converts values to other types if specified.
             * @param message MediaManifest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.schemas.MediaManifest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this MediaManifest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for MediaManifest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}

export const MediaManifest: typeof vco.schemas.MediaManifest;
