import $protobuf from "protobufjs/minimal.js";
/** Namespace vco. */
export namespace vco {

    /** Namespace schemas. */
    namespace schemas {

        /** Properties of a SequenceManifest. */
        interface ISequenceManifest {

            /** SequenceManifest schema */
            schema?: (string|null);

            /** SequenceManifest chunkCids */
            chunkCids?: (Uint8Array[]|null);

            /** SequenceManifest totalSize */
            totalSize?: (number|Long|null);

            /** SequenceManifest mimeType */
            mimeType?: (string|null);

            /** SequenceManifest previousManifest */
            previousManifest?: (Uint8Array|null);
        }

        /** Represents a SequenceManifest. */
        class SequenceManifest implements ISequenceManifest {

            /**
             * Constructs a new SequenceManifest.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.schemas.ISequenceManifest);

            /** SequenceManifest schema. */
            public schema: string;

            /** SequenceManifest chunkCids. */
            public chunkCids: Uint8Array[];

            /** SequenceManifest totalSize. */
            public totalSize: (number|Long);

            /** SequenceManifest mimeType. */
            public mimeType: string;

            /** SequenceManifest previousManifest. */
            public previousManifest: Uint8Array;

            /**
             * Creates a new SequenceManifest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns SequenceManifest instance
             */
            public static create(properties?: vco.schemas.ISequenceManifest): vco.schemas.SequenceManifest;

            /**
             * Encodes the specified SequenceManifest message. Does not implicitly {@link vco.schemas.SequenceManifest.verify|verify} messages.
             * @param message SequenceManifest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.schemas.ISequenceManifest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified SequenceManifest message, length delimited. Does not implicitly {@link vco.schemas.SequenceManifest.verify|verify} messages.
             * @param message SequenceManifest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.schemas.ISequenceManifest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a SequenceManifest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns SequenceManifest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.schemas.SequenceManifest;

            /**
             * Decodes a SequenceManifest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns SequenceManifest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.schemas.SequenceManifest;

            /**
             * Verifies a SequenceManifest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a SequenceManifest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns SequenceManifest
             */
            public static fromObject(object: { [k: string]: any }): vco.schemas.SequenceManifest;

            /**
             * Creates a plain object from a SequenceManifest message. Also converts values to other types if specified.
             * @param message SequenceManifest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.schemas.SequenceManifest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this SequenceManifest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for SequenceManifest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}

export const SequenceManifest: typeof vco.schemas.SequenceManifest;
