import $protobuf from "protobufjs/minimal.js";
/** Namespace vco. */
export namespace vco {

    /** Namespace schemas. */
    namespace schemas {

        /** Properties of a SubscriptionManifest. */
        interface ISubscriptionManifest {

            /** SubscriptionManifest schema */
            schema?: (string|null);

            /** SubscriptionManifest contentCid */
            contentCid?: (Uint8Array|null);

            /** SubscriptionManifest tierName */
            tierName?: (string|null);

            /** SubscriptionManifest requirements */
            requirements?: (vco.schemas.SubscriptionManifest.IRequirement[]|null);
        }

        /** Represents a SubscriptionManifest. */
        class SubscriptionManifest implements ISubscriptionManifest {

            /**
             * Constructs a new SubscriptionManifest.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.schemas.ISubscriptionManifest);

            /** SubscriptionManifest schema. */
            public schema: string;

            /** SubscriptionManifest contentCid. */
            public contentCid: Uint8Array;

            /** SubscriptionManifest tierName. */
            public tierName: string;

            /** SubscriptionManifest requirements. */
            public requirements: vco.schemas.SubscriptionManifest.IRequirement[];

            /**
             * Creates a new SubscriptionManifest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns SubscriptionManifest instance
             */
            public static create(properties?: vco.schemas.ISubscriptionManifest): vco.schemas.SubscriptionManifest;

            /**
             * Encodes the specified SubscriptionManifest message. Does not implicitly {@link vco.schemas.SubscriptionManifest.verify|verify} messages.
             * @param message SubscriptionManifest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.schemas.ISubscriptionManifest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified SubscriptionManifest message, length delimited. Does not implicitly {@link vco.schemas.SubscriptionManifest.verify|verify} messages.
             * @param message SubscriptionManifest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.schemas.ISubscriptionManifest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a SubscriptionManifest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns SubscriptionManifest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.schemas.SubscriptionManifest;

            /**
             * Decodes a SubscriptionManifest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns SubscriptionManifest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.schemas.SubscriptionManifest;

            /**
             * Verifies a SubscriptionManifest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a SubscriptionManifest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns SubscriptionManifest
             */
            public static fromObject(object: { [k: string]: any }): vco.schemas.SubscriptionManifest;

            /**
             * Creates a plain object from a SubscriptionManifest message. Also converts values to other types if specified.
             * @param message SubscriptionManifest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.schemas.SubscriptionManifest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this SubscriptionManifest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for SubscriptionManifest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace SubscriptionManifest {

            /** Properties of a Requirement. */
            interface IRequirement {

                /** Requirement type */
                type?: (number|null);

                /** Requirement contractRef */
                contractRef?: (Uint8Array|null);

                /** Requirement zkpCircuitId */
                zkpCircuitId?: (number|null);
            }

            /** Represents a Requirement. */
            class Requirement implements IRequirement {

                /**
                 * Constructs a new Requirement.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: vco.schemas.SubscriptionManifest.IRequirement);

                /** Requirement type. */
                public type: number;

                /** Requirement contractRef. */
                public contractRef: Uint8Array;

                /** Requirement zkpCircuitId. */
                public zkpCircuitId: number;

                /**
                 * Creates a new Requirement instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Requirement instance
                 */
                public static create(properties?: vco.schemas.SubscriptionManifest.IRequirement): vco.schemas.SubscriptionManifest.Requirement;

                /**
                 * Encodes the specified Requirement message. Does not implicitly {@link vco.schemas.SubscriptionManifest.Requirement.verify|verify} messages.
                 * @param message Requirement message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: vco.schemas.SubscriptionManifest.IRequirement, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Requirement message, length delimited. Does not implicitly {@link vco.schemas.SubscriptionManifest.Requirement.verify|verify} messages.
                 * @param message Requirement message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: vco.schemas.SubscriptionManifest.IRequirement, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Requirement message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Requirement
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.schemas.SubscriptionManifest.Requirement;

                /**
                 * Decodes a Requirement message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Requirement
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.schemas.SubscriptionManifest.Requirement;

                /**
                 * Verifies a Requirement message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Requirement message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Requirement
                 */
                public static fromObject(object: { [k: string]: any }): vco.schemas.SubscriptionManifest.Requirement;

                /**
                 * Creates a plain object from a Requirement message. Also converts values to other types if specified.
                 * @param message Requirement
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: vco.schemas.SubscriptionManifest.Requirement, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Requirement to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for Requirement
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }
        }
    }
}

export const SubscriptionManifest: typeof vco.schemas.SubscriptionManifest;
