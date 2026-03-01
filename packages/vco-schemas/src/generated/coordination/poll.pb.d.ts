import $protobuf from "protobufjs/minimal.js";
/** Namespace vco. */
export namespace vco {

    /** Namespace schemas. */
    namespace schemas {

        /** Properties of a Poll. */
        interface IPoll {

            /** Poll schema */
            schema?: (string|null);

            /** Poll question */
            question?: (string|null);

            /** Poll options */
            options?: (string[]|null);

            /** Poll closesAtMs */
            closesAtMs?: (number|Long|null);

            /** Poll timestampMs */
            timestampMs?: (number|Long|null);
        }

        /** Represents a Poll. */
        class Poll implements IPoll {

            /**
             * Constructs a new Poll.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.schemas.IPoll);

            /** Poll schema. */
            public schema: string;

            /** Poll question. */
            public question: string;

            /** Poll options. */
            public options: string[];

            /** Poll closesAtMs. */
            public closesAtMs: (number|Long);

            /** Poll timestampMs. */
            public timestampMs: (number|Long);

            /**
             * Creates a new Poll instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Poll instance
             */
            public static create(properties?: vco.schemas.IPoll): vco.schemas.Poll;

            /**
             * Encodes the specified Poll message. Does not implicitly {@link vco.schemas.Poll.verify|verify} messages.
             * @param message Poll message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.schemas.IPoll, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Poll message, length delimited. Does not implicitly {@link vco.schemas.Poll.verify|verify} messages.
             * @param message Poll message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.schemas.IPoll, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Poll message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Poll
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.schemas.Poll;

            /**
             * Decodes a Poll message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Poll
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.schemas.Poll;

            /**
             * Verifies a Poll message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Poll message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Poll
             */
            public static fromObject(object: { [k: string]: any }): vco.schemas.Poll;

            /**
             * Creates a plain object from a Poll message. Also converts values to other types if specified.
             * @param message Poll
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.schemas.Poll, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Poll to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Poll
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}

export const Poll: typeof vco.schemas.Poll;
