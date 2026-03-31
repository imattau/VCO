import $protobuf from "protobufjs/minimal.js";
/** Namespace vco. */
export namespace vco {

    /** Namespace schemas. */
    namespace schemas {

        /** Properties of a Repost. */
        interface IRepost {

            /** Repost schema */
            schema?: (string|null);

            /** Repost originalPostCid */
            originalPostCid?: (Uint8Array|null);

            /** Repost originalAuthorCid */
            originalAuthorCid?: (Uint8Array|null);

            /** Repost commentary */
            commentary?: (string|null);

            /** Repost timestampMs */
            timestampMs?: (number|Long|null);
        }

        /** Represents a Repost. */
        class Repost implements IRepost {

            /**
             * Constructs a new Repost.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.schemas.IRepost);

            /** Repost schema. */
            public schema: string;

            /** Repost originalPostCid. */
            public originalPostCid: Uint8Array;

            /** Repost originalAuthorCid. */
            public originalAuthorCid: Uint8Array;

            /** Repost commentary. */
            public commentary: string;

            /** Repost timestampMs. */
            public timestampMs: (number|Long);

            /**
             * Creates a new Repost instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Repost instance
             */
            public static create(properties?: vco.schemas.IRepost): vco.schemas.Repost;

            /**
             * Encodes the specified Repost message. Does not implicitly {@link vco.schemas.Repost.verify|verify} messages.
             * @param message Repost message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.schemas.IRepost, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Repost message, length delimited. Does not implicitly {@link vco.schemas.Repost.verify|verify} messages.
             * @param message Repost message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.schemas.IRepost, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Repost message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Repost
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.schemas.Repost;

            /**
             * Decodes a Repost message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Repost
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.schemas.Repost;

            /**
             * Verifies a Repost message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Repost message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Repost
             */
            public static fromObject(object: { [k: string]: any }): vco.schemas.Repost;

            /**
             * Creates a plain object from a Repost message. Also converts values to other types if specified.
             * @param message Repost
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.schemas.Repost, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Repost to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Repost
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}

export const Repost: typeof vco.schemas.Repost;
