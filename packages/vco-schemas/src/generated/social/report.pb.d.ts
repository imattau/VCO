import $protobuf from "protobufjs/minimal.js";
/** Namespace vco. */
export namespace vco {

    /** Namespace schemas. */
    namespace schemas {

        /** Properties of a Report. */
        interface IReport {

            /** Report schema */
            schema?: (string|null);

            /** Report targetCid */
            targetCid?: (Uint8Array|null);

            /** Report reason */
            reason?: (vco.schemas.ReportReason|null);

            /** Report detail */
            detail?: (string|null);

            /** Report proofOfHarmCid */
            proofOfHarmCid?: (Uint8Array|null);

            /** Report timestampMs */
            timestampMs?: (number|Long|null);
        }

        /** Represents a Report. */
        class Report implements IReport {

            /**
             * Constructs a new Report.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.schemas.IReport);

            /** Report schema. */
            public schema: string;

            /** Report targetCid. */
            public targetCid: Uint8Array;

            /** Report reason. */
            public reason: vco.schemas.ReportReason;

            /** Report detail. */
            public detail: string;

            /** Report proofOfHarmCid. */
            public proofOfHarmCid: Uint8Array;

            /** Report timestampMs. */
            public timestampMs: (number|Long);

            /**
             * Creates a new Report instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Report instance
             */
            public static create(properties?: vco.schemas.IReport): vco.schemas.Report;

            /**
             * Encodes the specified Report message. Does not implicitly {@link vco.schemas.Report.verify|verify} messages.
             * @param message Report message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.schemas.IReport, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Report message, length delimited. Does not implicitly {@link vco.schemas.Report.verify|verify} messages.
             * @param message Report message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.schemas.IReport, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Report message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Report
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.schemas.Report;

            /**
             * Decodes a Report message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Report
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.schemas.Report;

            /**
             * Verifies a Report message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Report message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Report
             */
            public static fromObject(object: { [k: string]: any }): vco.schemas.Report;

            /**
             * Creates a plain object from a Report message. Also converts values to other types if specified.
             * @param message Report
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.schemas.Report, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Report to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Report
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** ReportReason enum. */
        enum ReportReason {
            OTHER = 0,
            SPAM = 1,
            VIOLENCE = 2,
            HARASSMENT = 3,
            MALWARE = 4,
            INTELLECTUAL_PROPERTY = 5,
            MISINFORMATION = 6
        }
    }
}

export const Report: typeof vco.schemas.Report;
export const ReportReason: typeof vco.schemas.ReportReason;
