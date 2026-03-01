import $protobuf from "protobufjs/minimal.js";
/** Namespace vco. */
export namespace vco {

    /** Namespace schemas. */
    namespace schemas {

        /** Properties of a Listing. */
        interface IListing {

            /** Listing schema */
            schema?: (string|null);

            /** Listing title */
            title?: (string|null);

            /** Listing description */
            description?: (string|null);

            /** Listing priceSats */
            priceSats?: (number|Long|null);

            /** Listing mediaCids */
            mediaCids?: (Uint8Array[]|null);

            /** Listing expiryMs */
            expiryMs?: (number|Long|null);

            /** Listing previousCid */
            previousCid?: (Uint8Array|null);
        }

        /** Represents a Listing. */
        class Listing implements IListing {

            /**
             * Constructs a new Listing.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.schemas.IListing);

            /** Listing schema. */
            public schema: string;

            /** Listing title. */
            public title: string;

            /** Listing description. */
            public description: string;

            /** Listing priceSats. */
            public priceSats: (number|Long);

            /** Listing mediaCids. */
            public mediaCids: Uint8Array[];

            /** Listing expiryMs. */
            public expiryMs: (number|Long);

            /** Listing previousCid. */
            public previousCid: Uint8Array;

            /**
             * Creates a new Listing instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Listing instance
             */
            public static create(properties?: vco.schemas.IListing): vco.schemas.Listing;

            /**
             * Encodes the specified Listing message. Does not implicitly {@link vco.schemas.Listing.verify|verify} messages.
             * @param message Listing message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.schemas.IListing, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Listing message, length delimited. Does not implicitly {@link vco.schemas.Listing.verify|verify} messages.
             * @param message Listing message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.schemas.IListing, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Listing message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Listing
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.schemas.Listing;

            /**
             * Decodes a Listing message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Listing
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.schemas.Listing;

            /**
             * Verifies a Listing message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Listing message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Listing
             */
            public static fromObject(object: { [k: string]: any }): vco.schemas.Listing;

            /**
             * Creates a plain object from a Listing message. Also converts values to other types if specified.
             * @param message Listing
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.schemas.Listing, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Listing to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Listing
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}

export const Listing: typeof vco.schemas.Listing;
