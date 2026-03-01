import $protobuf from "protobufjs/minimal.js";
/** Namespace vco. */
export namespace vco {

    /** Namespace schemas. */
    namespace schemas {

        /** Properties of a Reaction. */
        interface IReaction {

            /** Reaction schema */
            schema?: (string|null);

            /** Reaction targetCid */
            targetCid?: (Uint8Array|null);

            /** Reaction emoji */
            emoji?: (string|null);

            /** Reaction timestampMs */
            timestampMs?: (number|Long|null);
        }

        /** Represents a Reaction. */
        class Reaction implements IReaction {

            /**
             * Constructs a new Reaction.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.schemas.IReaction);

            /** Reaction schema. */
            public schema: string;

            /** Reaction targetCid. */
            public targetCid: Uint8Array;

            /** Reaction emoji. */
            public emoji: string;

            /** Reaction timestampMs. */
            public timestampMs: (number|Long);

            /**
             * Creates a new Reaction instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Reaction instance
             */
            public static create(properties?: vco.schemas.IReaction): vco.schemas.Reaction;

            /**
             * Encodes the specified Reaction message. Does not implicitly {@link vco.schemas.Reaction.verify|verify} messages.
             * @param message Reaction message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.schemas.IReaction, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Reaction message, length delimited. Does not implicitly {@link vco.schemas.Reaction.verify|verify} messages.
             * @param message Reaction message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.schemas.IReaction, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Reaction message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Reaction
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.schemas.Reaction;

            /**
             * Decodes a Reaction message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Reaction
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.schemas.Reaction;

            /**
             * Verifies a Reaction message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Reaction message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Reaction
             */
            public static fromObject(object: { [k: string]: any }): vco.schemas.Reaction;

            /**
             * Creates a plain object from a Reaction message. Also converts values to other types if specified.
             * @param message Reaction
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.schemas.Reaction, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Reaction to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Reaction
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}

export const Reaction: typeof vco.schemas.Reaction;
