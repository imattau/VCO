import $protobuf from "protobufjs/minimal.js";
/** Namespace vco. */
export namespace vco {

    /** Namespace schemas. */
    namespace schemas {

        /** Properties of a Vote. */
        interface IVote {

            /** Vote schema */
            schema?: (string|null);

            /** Vote pollCid */
            pollCid?: (Uint8Array|null);

            /** Vote optionIndex */
            optionIndex?: (number|null);

            /** Vote timestampMs */
            timestampMs?: (number|Long|null);
        }

        /** Represents a Vote. */
        class Vote implements IVote {

            /**
             * Constructs a new Vote.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.schemas.IVote);

            /** Vote schema. */
            public schema: string;

            /** Vote pollCid. */
            public pollCid: Uint8Array;

            /** Vote optionIndex. */
            public optionIndex: number;

            /** Vote timestampMs. */
            public timestampMs: (number|Long);

            /**
             * Creates a new Vote instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Vote instance
             */
            public static create(properties?: vco.schemas.IVote): vco.schemas.Vote;

            /**
             * Encodes the specified Vote message. Does not implicitly {@link vco.schemas.Vote.verify|verify} messages.
             * @param message Vote message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.schemas.IVote, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Vote message, length delimited. Does not implicitly {@link vco.schemas.Vote.verify|verify} messages.
             * @param message Vote message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.schemas.IVote, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Vote message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Vote
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.schemas.Vote;

            /**
             * Decodes a Vote message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Vote
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.schemas.Vote;

            /**
             * Verifies a Vote message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Vote message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Vote
             */
            public static fromObject(object: { [k: string]: any }): vco.schemas.Vote;

            /**
             * Creates a plain object from a Vote message. Also converts values to other types if specified.
             * @param message Vote
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.schemas.Vote, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Vote to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Vote
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}

export const Vote: typeof vco.schemas.Vote;
