import $protobuf from "protobufjs/minimal.js";
/** Namespace vco. */
export namespace vco {

    /** Namespace schemas. */
    namespace schemas {

        /** Properties of a DirectMessage. */
        interface IDirectMessage {

            /** DirectMessage schema */
            schema?: (string|null);

            /** DirectMessage recipientCid */
            recipientCid?: (Uint8Array|null);

            /** DirectMessage senderCid */
            senderCid?: (Uint8Array|null);

            /** DirectMessage ephemeralPubkey */
            ephemeralPubkey?: (Uint8Array|null);

            /** DirectMessage nonce */
            nonce?: (Uint8Array|null);

            /** DirectMessage encryptedPayload */
            encryptedPayload?: (Uint8Array|null);

            /** DirectMessage timestampMs */
            timestampMs?: (number|Long|null);
        }

        /** Represents a DirectMessage. */
        class DirectMessage implements IDirectMessage {

            /**
             * Constructs a new DirectMessage.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.schemas.IDirectMessage);

            /** DirectMessage schema. */
            public schema: string;

            /** DirectMessage recipientCid. */
            public recipientCid: Uint8Array;

            /** DirectMessage senderCid. */
            public senderCid: Uint8Array;

            /** DirectMessage ephemeralPubkey. */
            public ephemeralPubkey: Uint8Array;

            /** DirectMessage nonce. */
            public nonce: Uint8Array;

            /** DirectMessage encryptedPayload. */
            public encryptedPayload: Uint8Array;

            /** DirectMessage timestampMs. */
            public timestampMs: (number|Long);

            /**
             * Creates a new DirectMessage instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DirectMessage instance
             */
            public static create(properties?: vco.schemas.IDirectMessage): vco.schemas.DirectMessage;

            /**
             * Encodes the specified DirectMessage message. Does not implicitly {@link vco.schemas.DirectMessage.verify|verify} messages.
             * @param message DirectMessage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.schemas.IDirectMessage, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DirectMessage message, length delimited. Does not implicitly {@link vco.schemas.DirectMessage.verify|verify} messages.
             * @param message DirectMessage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.schemas.IDirectMessage, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DirectMessage message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DirectMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.schemas.DirectMessage;

            /**
             * Decodes a DirectMessage message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DirectMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.schemas.DirectMessage;

            /**
             * Verifies a DirectMessage message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a DirectMessage message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns DirectMessage
             */
            public static fromObject(object: { [k: string]: any }): vco.schemas.DirectMessage;

            /**
             * Creates a plain object from a DirectMessage message. Also converts values to other types if specified.
             * @param message DirectMessage
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.schemas.DirectMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DirectMessage to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for DirectMessage
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a DirectMessagePayload. */
        interface IDirectMessagePayload {

            /** DirectMessagePayload content */
            content?: (string|null);

            /** DirectMessagePayload mediaCids */
            mediaCids?: (Uint8Array[]|null);
        }

        /** Represents a DirectMessagePayload. */
        class DirectMessagePayload implements IDirectMessagePayload {

            /**
             * Constructs a new DirectMessagePayload.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.schemas.IDirectMessagePayload);

            /** DirectMessagePayload content. */
            public content: string;

            /** DirectMessagePayload mediaCids. */
            public mediaCids: Uint8Array[];

            /**
             * Creates a new DirectMessagePayload instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DirectMessagePayload instance
             */
            public static create(properties?: vco.schemas.IDirectMessagePayload): vco.schemas.DirectMessagePayload;

            /**
             * Encodes the specified DirectMessagePayload message. Does not implicitly {@link vco.schemas.DirectMessagePayload.verify|verify} messages.
             * @param message DirectMessagePayload message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.schemas.IDirectMessagePayload, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DirectMessagePayload message, length delimited. Does not implicitly {@link vco.schemas.DirectMessagePayload.verify|verify} messages.
             * @param message DirectMessagePayload message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.schemas.IDirectMessagePayload, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DirectMessagePayload message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DirectMessagePayload
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.schemas.DirectMessagePayload;

            /**
             * Decodes a DirectMessagePayload message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DirectMessagePayload
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.schemas.DirectMessagePayload;

            /**
             * Verifies a DirectMessagePayload message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a DirectMessagePayload message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns DirectMessagePayload
             */
            public static fromObject(object: { [k: string]: any }): vco.schemas.DirectMessagePayload;

            /**
             * Creates a plain object from a DirectMessagePayload message. Also converts values to other types if specified.
             * @param message DirectMessagePayload
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.schemas.DirectMessagePayload, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DirectMessagePayload to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for DirectMessagePayload
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}

export const DirectMessage: typeof vco.schemas.DirectMessage;
export const DirectMessagePayload: typeof vco.schemas.DirectMessagePayload;
