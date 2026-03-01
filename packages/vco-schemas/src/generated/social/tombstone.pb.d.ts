import $protobuf from "protobufjs/minimal.js";
/** Namespace vco. */
export namespace vco {

    /** Namespace schemas. */
    namespace schemas {

        /** Properties of a Tombstone. */
        interface ITombstone {

            /** Tombstone schema */
            schema?: (string|null);

            /** Tombstone targetCid */
            targetCid?: (Uint8Array|null);

            /** Tombstone reason */
            reason?: (string|null);

            /** Tombstone timestampMs */
            timestampMs?: (number|Long|null);
        }

        /** Represents a Tombstone. */
        class Tombstone implements ITombstone {

            /**
             * Constructs a new Tombstone.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.schemas.ITombstone);

            /** Tombstone schema. */
            public schema: string;

            /** Tombstone targetCid. */
            public targetCid: Uint8Array;

            /** Tombstone reason. */
            public reason: string;

            /** Tombstone timestampMs. */
            public timestampMs: (number|Long);

            /**
             * Creates a new Tombstone instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Tombstone instance
             */
            public static create(properties?: vco.schemas.ITombstone): vco.schemas.Tombstone;

            /**
             * Encodes the specified Tombstone message. Does not implicitly {@link vco.schemas.Tombstone.verify|verify} messages.
             * @param message Tombstone message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.schemas.ITombstone, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Tombstone message, length delimited. Does not implicitly {@link vco.schemas.Tombstone.verify|verify} messages.
             * @param message Tombstone message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.schemas.ITombstone, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Tombstone message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Tombstone
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.schemas.Tombstone;

            /**
             * Decodes a Tombstone message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Tombstone
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.schemas.Tombstone;

            /**
             * Verifies a Tombstone message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Tombstone message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Tombstone
             */
            public static fromObject(object: { [k: string]: any }): vco.schemas.Tombstone;

            /**
             * Creates a plain object from a Tombstone message. Also converts values to other types if specified.
             * @param message Tombstone
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.schemas.Tombstone, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Tombstone to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Tombstone
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}

export const Tombstone: typeof vco.schemas.Tombstone;
