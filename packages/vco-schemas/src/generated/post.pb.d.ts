import $protobuf from "protobufjs/minimal.js";
/** Namespace vco. */
export namespace vco {

    /** Namespace schemas. */
    namespace schemas {

        /** Properties of a Post. */
        interface IPost {

            /** Post schema */
            schema?: (string|null);

            /** Post content */
            content?: (string|null);

            /** Post mediaCids */
            mediaCids?: (Uint8Array[]|null);

            /** Post timestampMs */
            timestampMs?: (number|Long|null);

            /** Post channelId */
            channelId?: (string|null);

            /** Post tags */
            tags?: (string[]|null);
        }

        /** Represents a Post. */
        class Post implements IPost {

            /**
             * Constructs a new Post.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.schemas.IPost);

            /** Post schema. */
            public schema: string;

            /** Post content. */
            public content: string;

            /** Post mediaCids. */
            public mediaCids: Uint8Array[];

            /** Post timestampMs. */
            public timestampMs: (number|Long);

            /** Post channelId. */
            public channelId: string;

            /** Post tags. */
            public tags: string[];

            /**
             * Creates a new Post instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Post instance
             */
            public static create(properties?: vco.schemas.IPost): vco.schemas.Post;

            /**
             * Encodes the specified Post message. Does not implicitly {@link vco.schemas.Post.verify|verify} messages.
             * @param message Post message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.schemas.IPost, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Post message, length delimited. Does not implicitly {@link vco.schemas.Post.verify|verify} messages.
             * @param message Post message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.schemas.IPost, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Post message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Post
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.schemas.Post;

            /**
             * Decodes a Post message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Post
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.schemas.Post;

            /**
             * Verifies a Post message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Post message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Post
             */
            public static fromObject(object: { [k: string]: any }): vco.schemas.Post;

            /**
             * Creates a plain object from a Post message. Also converts values to other types if specified.
             * @param message Post
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.schemas.Post, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Post to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Post
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}

export const Post: typeof vco.schemas.Post;
