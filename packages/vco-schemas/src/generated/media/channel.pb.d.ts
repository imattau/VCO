import $protobuf from "protobufjs/minimal.js";
/** Namespace vco. */
export namespace vco {

    /** Namespace schemas. */
    namespace schemas {

        /** Properties of a MediaChannel. */
        interface IMediaChannel {

            /** MediaChannel schema */
            schema?: (string|null);

            /** MediaChannel name */
            name?: (string|null);

            /** MediaChannel author */
            author?: (string|null);

            /** MediaChannel bio */
            bio?: (string|null);

            /** MediaChannel avatarCid */
            avatarCid?: (Uint8Array|null);

            /** MediaChannel latestItemCid */
            latestItemCid?: (Uint8Array|null);

            /** MediaChannel categories */
            categories?: (string[]|null);

            /** MediaChannel isLive */
            isLive?: (boolean|null);
        }

        /** Represents a MediaChannel. */
        class MediaChannel implements IMediaChannel {

            /**
             * Constructs a new MediaChannel.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.schemas.IMediaChannel);

            /** MediaChannel schema. */
            public schema: string;

            /** MediaChannel name. */
            public name: string;

            /** MediaChannel author. */
            public author: string;

            /** MediaChannel bio. */
            public bio: string;

            /** MediaChannel avatarCid. */
            public avatarCid: Uint8Array;

            /** MediaChannel latestItemCid. */
            public latestItemCid: Uint8Array;

            /** MediaChannel categories. */
            public categories: string[];

            /** MediaChannel isLive. */
            public isLive: boolean;

            /**
             * Creates a new MediaChannel instance using the specified properties.
             * @param [properties] Properties to set
             * @returns MediaChannel instance
             */
            public static create(properties?: vco.schemas.IMediaChannel): vco.schemas.MediaChannel;

            /**
             * Encodes the specified MediaChannel message. Does not implicitly {@link vco.schemas.MediaChannel.verify|verify} messages.
             * @param message MediaChannel message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.schemas.IMediaChannel, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified MediaChannel message, length delimited. Does not implicitly {@link vco.schemas.MediaChannel.verify|verify} messages.
             * @param message MediaChannel message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.schemas.IMediaChannel, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a MediaChannel message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns MediaChannel
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.schemas.MediaChannel;

            /**
             * Decodes a MediaChannel message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns MediaChannel
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.schemas.MediaChannel;

            /**
             * Verifies a MediaChannel message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a MediaChannel message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns MediaChannel
             */
            public static fromObject(object: { [k: string]: any }): vco.schemas.MediaChannel;

            /**
             * Creates a plain object from a MediaChannel message. Also converts values to other types if specified.
             * @param message MediaChannel
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.schemas.MediaChannel, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this MediaChannel to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for MediaChannel
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}

export const MediaChannel: typeof vco.schemas.MediaChannel;
