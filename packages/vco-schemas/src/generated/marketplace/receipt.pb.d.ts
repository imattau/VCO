import $protobuf from "protobufjs/minimal.js";
/** Namespace vco. */
export namespace vco {

    /** Namespace schemas. */
    namespace schemas {

        /** Properties of a Receipt. */
        interface IReceipt {

            /** Receipt schema */
            schema?: (string|null);

            /** Receipt listingCid */
            listingCid?: (Uint8Array|null);

            /** Receipt offerCid */
            offerCid?: (Uint8Array|null);

            /** Receipt txId */
            txId?: (string|null);

            /** Receipt timestampMs */
            timestampMs?: (number|Long|null);
        }

        /** Represents a Receipt. */
        class Receipt implements IReceipt {

            /**
             * Constructs a new Receipt.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.schemas.IReceipt);

            /** Receipt schema. */
            public schema: string;

            /** Receipt listingCid. */
            public listingCid: Uint8Array;

            /** Receipt offerCid. */
            public offerCid: Uint8Array;

            /** Receipt txId. */
            public txId: string;

            /** Receipt timestampMs. */
            public timestampMs: (number|Long);

            /**
             * Creates a new Receipt instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Receipt instance
             */
            public static create(properties?: vco.schemas.IReceipt): vco.schemas.Receipt;

            /**
             * Encodes the specified Receipt message. Does not implicitly {@link vco.schemas.Receipt.verify|verify} messages.
             * @param message Receipt message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.schemas.IReceipt, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Receipt message, length delimited. Does not implicitly {@link vco.schemas.Receipt.verify|verify} messages.
             * @param message Receipt message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.schemas.IReceipt, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Receipt message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Receipt
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.schemas.Receipt;

            /**
             * Decodes a Receipt message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Receipt
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.schemas.Receipt;

            /**
             * Verifies a Receipt message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Receipt message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Receipt
             */
            public static fromObject(object: { [k: string]: any }): vco.schemas.Receipt;

            /**
             * Creates a plain object from a Receipt message. Also converts values to other types if specified.
             * @param message Receipt
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.schemas.Receipt, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Receipt to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Receipt
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}

export const Receipt: typeof vco.schemas.Receipt;
