import $protobuf from "protobufjs/minimal.js";
/** Namespace vco. */
export namespace vco {

    /** Namespace schemas. */
    namespace schemas {

        /** Properties of an Offer. */
        interface IOffer {

            /** Offer schema */
            schema?: (string|null);

            /** Offer listingCid */
            listingCid?: (Uint8Array|null);

            /** Offer offerSats */
            offerSats?: (number|Long|null);

            /** Offer message */
            message?: (string|null);

            /** Offer timestampMs */
            timestampMs?: (number|Long|null);
        }

        /** Represents an Offer. */
        class Offer implements IOffer {

            /**
             * Constructs a new Offer.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.schemas.IOffer);

            /** Offer schema. */
            public schema: string;

            /** Offer listingCid. */
            public listingCid: Uint8Array;

            /** Offer offerSats. */
            public offerSats: (number|Long);

            /** Offer message. */
            public message: string;

            /** Offer timestampMs. */
            public timestampMs: (number|Long);

            /**
             * Creates a new Offer instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Offer instance
             */
            public static create(properties?: vco.schemas.IOffer): vco.schemas.Offer;

            /**
             * Encodes the specified Offer message. Does not implicitly {@link vco.schemas.Offer.verify|verify} messages.
             * @param message Offer message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.schemas.IOffer, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Offer message, length delimited. Does not implicitly {@link vco.schemas.Offer.verify|verify} messages.
             * @param message Offer message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.schemas.IOffer, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Offer message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Offer
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.schemas.Offer;

            /**
             * Decodes an Offer message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Offer
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.schemas.Offer;

            /**
             * Verifies an Offer message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Offer message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Offer
             */
            public static fromObject(object: { [k: string]: any }): vco.schemas.Offer;

            /**
             * Creates a plain object from an Offer message. Also converts values to other types if specified.
             * @param message Offer
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.schemas.Offer, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Offer to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Offer
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}

export const Offer: typeof vco.schemas.Offer;
