import $protobuf from "protobufjs/minimal.js";
/** Namespace vco. */
export namespace vco {

    /** Namespace schemas. */
    namespace schemas {

        /** Properties of a RelayAdmissionPolicy. */
        interface IRelayAdmissionPolicy {

            /** RelayAdmissionPolicy schema */
            schema?: (string|null);

            /** RelayAdmissionPolicy minPowDifficulty */
            minPowDifficulty?: (number|null);

            /** RelayAdmissionPolicy acceptedPayloadTypes */
            acceptedPayloadTypes?: (number[]|null);

            /** RelayAdmissionPolicy maxEnvelopeSize */
            maxEnvelopeSize?: (number|null);

            /** RelayAdmissionPolicy storageTtlSeconds */
            storageTtlSeconds?: (number|null);

            /** RelayAdmissionPolicy requiresZkpAuth */
            requiresZkpAuth?: (boolean|null);

            /** RelayAdmissionPolicy supportsBlindRouting */
            supportsBlindRouting?: (boolean|null);
        }

        /** Represents a RelayAdmissionPolicy. */
        class RelayAdmissionPolicy implements IRelayAdmissionPolicy {

            /**
             * Constructs a new RelayAdmissionPolicy.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.schemas.IRelayAdmissionPolicy);

            /** RelayAdmissionPolicy schema. */
            public schema: string;

            /** RelayAdmissionPolicy minPowDifficulty. */
            public minPowDifficulty: number;

            /** RelayAdmissionPolicy acceptedPayloadTypes. */
            public acceptedPayloadTypes: number[];

            /** RelayAdmissionPolicy maxEnvelopeSize. */
            public maxEnvelopeSize: number;

            /** RelayAdmissionPolicy storageTtlSeconds. */
            public storageTtlSeconds: number;

            /** RelayAdmissionPolicy requiresZkpAuth. */
            public requiresZkpAuth: boolean;

            /** RelayAdmissionPolicy supportsBlindRouting. */
            public supportsBlindRouting: boolean;

            /**
             * Creates a new RelayAdmissionPolicy instance using the specified properties.
             * @param [properties] Properties to set
             * @returns RelayAdmissionPolicy instance
             */
            public static create(properties?: vco.schemas.IRelayAdmissionPolicy): vco.schemas.RelayAdmissionPolicy;

            /**
             * Encodes the specified RelayAdmissionPolicy message. Does not implicitly {@link vco.schemas.RelayAdmissionPolicy.verify|verify} messages.
             * @param message RelayAdmissionPolicy message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.schemas.IRelayAdmissionPolicy, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified RelayAdmissionPolicy message, length delimited. Does not implicitly {@link vco.schemas.RelayAdmissionPolicy.verify|verify} messages.
             * @param message RelayAdmissionPolicy message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.schemas.IRelayAdmissionPolicy, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a RelayAdmissionPolicy message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns RelayAdmissionPolicy
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.schemas.RelayAdmissionPolicy;

            /**
             * Decodes a RelayAdmissionPolicy message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns RelayAdmissionPolicy
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.schemas.RelayAdmissionPolicy;

            /**
             * Verifies a RelayAdmissionPolicy message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a RelayAdmissionPolicy message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns RelayAdmissionPolicy
             */
            public static fromObject(object: { [k: string]: any }): vco.schemas.RelayAdmissionPolicy;

            /**
             * Creates a plain object from a RelayAdmissionPolicy message. Also converts values to other types if specified.
             * @param message RelayAdmissionPolicy
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.schemas.RelayAdmissionPolicy, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this RelayAdmissionPolicy to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for RelayAdmissionPolicy
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}

export const RelayAdmissionPolicy: typeof vco.schemas.RelayAdmissionPolicy;
