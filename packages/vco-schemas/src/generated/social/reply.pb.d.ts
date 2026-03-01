import $protobuf from "protobufjs/minimal.js";
/** Namespace vco. */
export namespace vco {

    /** Namespace schemas. */
    namespace schemas {

        /** Properties of a Reply. */
        interface IReply {

            /** Reply schema */
            schema?: (string|null);

            /** Reply parentCid */
            parentCid?: (Uint8Array|null);

            /** Reply content */
            content?: (string|null);

            /** Reply mediaCids */
            mediaCids?: (Uint8Array[]|null);

            /** Reply timestampMs */
            timestampMs?: (number|Long|null);

            /** Reply channelId */
            channelId?: (string|null);

            /** Reply tags */
            tags?: (string[]|null);
        }

        /** Represents a Reply. */
        class Reply implements IReply {

            /**
             * Constructs a new Reply.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.schemas.IReply);

            /** Reply schema. */
            public schema: string;

            /** Reply parentCid. */
            public parentCid: Uint8Array;

            /** Reply content. */
            public content: string;

            /** Reply mediaCids. */
            public mediaCids: Uint8Array[];

            /** Reply timestampMs. */
            public timestampMs: (number|Long);

            /** Reply channelId. */
            public channelId: string;

            /** Reply tags. */
            public tags: string[];

            /**
             * Creates a new Reply instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Reply instance
             */
            public static create(properties?: vco.schemas.IReply): vco.schemas.Reply;

            /**
             * Encodes the specified Reply message. Does not implicitly {@link vco.schemas.Reply.verify|verify} messages.
             * @param message Reply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.schemas.IReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Reply message, length delimited. Does not implicitly {@link vco.schemas.Reply.verify|verify} messages.
             * @param message Reply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.schemas.IReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Reply message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Reply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.schemas.Reply;

            /**
             * Decodes a Reply message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Reply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.schemas.Reply;

            /**
             * Verifies a Reply message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Reply message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Reply
             */
            public static fromObject(object: { [k: string]: any }): vco.schemas.Reply;

            /**
             * Creates a plain object from a Reply message. Also converts values to other types if specified.
             * @param message Reply
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.schemas.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Reply to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Reply
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}

export const Reply: typeof vco.schemas.Reply;
