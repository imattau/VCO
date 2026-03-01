import $protobuf from "protobufjs/minimal.js";
/** Namespace vco. */
export namespace vco {

    /** Namespace schemas. */
    namespace schemas {

        /** Properties of an Announcement. */
        interface IAnnouncement {

            /** Announcement schema */
            schema?: (string|null);

            /** Announcement content */
            content?: (string|null);

            /** Announcement priority */
            priority?: (string|null);

            /** Announcement mediaCids */
            mediaCids?: (Uint8Array[]|null);

            /** Announcement timestampMs */
            timestampMs?: (number|Long|null);
        }

        /** Represents an Announcement. */
        class Announcement implements IAnnouncement {

            /**
             * Constructs a new Announcement.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.schemas.IAnnouncement);

            /** Announcement schema. */
            public schema: string;

            /** Announcement content. */
            public content: string;

            /** Announcement priority. */
            public priority: string;

            /** Announcement mediaCids. */
            public mediaCids: Uint8Array[];

            /** Announcement timestampMs. */
            public timestampMs: (number|Long);

            /**
             * Creates a new Announcement instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Announcement instance
             */
            public static create(properties?: vco.schemas.IAnnouncement): vco.schemas.Announcement;

            /**
             * Encodes the specified Announcement message. Does not implicitly {@link vco.schemas.Announcement.verify|verify} messages.
             * @param message Announcement message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.schemas.IAnnouncement, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Announcement message, length delimited. Does not implicitly {@link vco.schemas.Announcement.verify|verify} messages.
             * @param message Announcement message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.schemas.IAnnouncement, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Announcement message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Announcement
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.schemas.Announcement;

            /**
             * Decodes an Announcement message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Announcement
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.schemas.Announcement;

            /**
             * Verifies an Announcement message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Announcement message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Announcement
             */
            public static fromObject(object: { [k: string]: any }): vco.schemas.Announcement;

            /**
             * Creates a plain object from an Announcement message. Also converts values to other types if specified.
             * @param message Announcement
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.schemas.Announcement, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Announcement to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Announcement
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}

export const Announcement: typeof vco.schemas.Announcement;
