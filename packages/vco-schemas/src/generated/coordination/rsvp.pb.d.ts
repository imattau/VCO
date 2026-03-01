import $protobuf from "protobufjs/minimal.js";
/** Namespace vco. */
export namespace vco {

    /** Namespace schemas. */
    namespace schemas {

        /** Properties of a Rsvp. */
        interface IRsvp {

            /** Rsvp schema */
            schema?: (string|null);

            /** Rsvp eventCid */
            eventCid?: (Uint8Array|null);

            /** Rsvp status */
            status?: (string|null);

            /** Rsvp timestampMs */
            timestampMs?: (number|Long|null);
        }

        /** Represents a Rsvp. */
        class Rsvp implements IRsvp {

            /**
             * Constructs a new Rsvp.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.schemas.IRsvp);

            /** Rsvp schema. */
            public schema: string;

            /** Rsvp eventCid. */
            public eventCid: Uint8Array;

            /** Rsvp status. */
            public status: string;

            /** Rsvp timestampMs. */
            public timestampMs: (number|Long);

            /**
             * Creates a new Rsvp instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Rsvp instance
             */
            public static create(properties?: vco.schemas.IRsvp): vco.schemas.Rsvp;

            /**
             * Encodes the specified Rsvp message. Does not implicitly {@link vco.schemas.Rsvp.verify|verify} messages.
             * @param message Rsvp message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.schemas.IRsvp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Rsvp message, length delimited. Does not implicitly {@link vco.schemas.Rsvp.verify|verify} messages.
             * @param message Rsvp message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.schemas.IRsvp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Rsvp message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Rsvp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.schemas.Rsvp;

            /**
             * Decodes a Rsvp message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Rsvp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.schemas.Rsvp;

            /**
             * Verifies a Rsvp message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Rsvp message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Rsvp
             */
            public static fromObject(object: { [k: string]: any }): vco.schemas.Rsvp;

            /**
             * Creates a plain object from a Rsvp message. Also converts values to other types if specified.
             * @param message Rsvp
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.schemas.Rsvp, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Rsvp to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Rsvp
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}

export const Rsvp: typeof vco.schemas.Rsvp;
