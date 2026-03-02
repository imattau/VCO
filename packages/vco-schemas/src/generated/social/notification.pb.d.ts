import $protobuf from "protobufjs/minimal.js";
/** Namespace vco. */
export namespace vco {

    /** Namespace schemas. */
    namespace schemas {

        /** Properties of a Notification. */
        interface INotification {

            /** Notification schema */
            schema?: (string|null);

            /** Notification type */
            type?: (vco.schemas.Notification.Type|null);

            /** Notification actorCid */
            actorCid?: (Uint8Array|null);

            /** Notification targetCid */
            targetCid?: (Uint8Array|null);

            /** Notification summary */
            summary?: (string|null);

            /** Notification timestampMs */
            timestampMs?: (number|Long|null);
        }

        /** Represents a Notification. */
        class Notification implements INotification {

            /**
             * Constructs a new Notification.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.schemas.INotification);

            /** Notification schema. */
            public schema: string;

            /** Notification type. */
            public type: vco.schemas.Notification.Type;

            /** Notification actorCid. */
            public actorCid: Uint8Array;

            /** Notification targetCid. */
            public targetCid: Uint8Array;

            /** Notification summary. */
            public summary: string;

            /** Notification timestampMs. */
            public timestampMs: (number|Long);

            /**
             * Creates a new Notification instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Notification instance
             */
            public static create(properties?: vco.schemas.INotification): vco.schemas.Notification;

            /**
             * Encodes the specified Notification message. Does not implicitly {@link vco.schemas.Notification.verify|verify} messages.
             * @param message Notification message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.schemas.INotification, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Notification message, length delimited. Does not implicitly {@link vco.schemas.Notification.verify|verify} messages.
             * @param message Notification message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.schemas.INotification, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Notification message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Notification
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.schemas.Notification;

            /**
             * Decodes a Notification message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Notification
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.schemas.Notification;

            /**
             * Verifies a Notification message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Notification message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Notification
             */
            public static fromObject(object: { [k: string]: any }): vco.schemas.Notification;

            /**
             * Creates a plain object from a Notification message. Also converts values to other types if specified.
             * @param message Notification
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.schemas.Notification, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Notification to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Notification
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace Notification {

            /** Type enum. */
            enum Type {
                UNKNOWN = 0,
                DM = 1,
                POST_REPLY = 2,
                REACTION = 3,
                FOLLOW = 4
            }
        }
    }
}

export const Notification: typeof vco.schemas.Notification;
