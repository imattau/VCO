import $protobuf from "protobufjs/minimal.js";
/** Namespace vco. */
export namespace vco {

    /** Namespace schemas. */
    namespace schemas {

        /** Properties of a Follow. */
        interface IFollow {

            /** Follow schema */
            schema?: (string|null);

            /** Follow subjectKey */
            subjectKey?: (Uint8Array|null);

            /** Follow action */
            action?: (string|null);

            /** Follow timestampMs */
            timestampMs?: (number|Long|null);
        }

        /** Represents a Follow. */
        class Follow implements IFollow {

            /**
             * Constructs a new Follow.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.schemas.IFollow);

            /** Follow schema. */
            public schema: string;

            /** Follow subjectKey. */
            public subjectKey: Uint8Array;

            /** Follow action. */
            public action: string;

            /** Follow timestampMs. */
            public timestampMs: (number|Long);

            /**
             * Creates a new Follow instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Follow instance
             */
            public static create(properties?: vco.schemas.IFollow): vco.schemas.Follow;

            /**
             * Encodes the specified Follow message. Does not implicitly {@link vco.schemas.Follow.verify|verify} messages.
             * @param message Follow message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.schemas.IFollow, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Follow message, length delimited. Does not implicitly {@link vco.schemas.Follow.verify|verify} messages.
             * @param message Follow message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.schemas.IFollow, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Follow message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Follow
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.schemas.Follow;

            /**
             * Decodes a Follow message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Follow
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.schemas.Follow;

            /**
             * Verifies a Follow message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Follow message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Follow
             */
            public static fromObject(object: { [k: string]: any }): vco.schemas.Follow;

            /**
             * Creates a plain object from a Follow message. Also converts values to other types if specified.
             * @param message Follow
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.schemas.Follow, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Follow to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Follow
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}

export const Follow: typeof vco.schemas.Follow;
