import $protobuf from "protobufjs/minimal.js";
/** Namespace vco. */
export namespace vco {

    /** Namespace schemas. */
    namespace schemas {

        /** Properties of a FileDescriptor. */
        interface IFileDescriptor {

            /** FileDescriptor schema */
            schema?: (string|null);

            /** FileDescriptor name */
            name?: (string|null);

            /** FileDescriptor mimeType */
            mimeType?: (string|null);

            /** FileDescriptor size */
            size?: (number|Long|null);

            /** FileDescriptor rootManifestCid */
            rootManifestCid?: (Uint8Array|null);

            /** FileDescriptor previousCid */
            previousCid?: (Uint8Array|null);

            /** FileDescriptor timestampMs */
            timestampMs?: (number|Long|null);
        }

        /** Represents a FileDescriptor. */
        class FileDescriptor implements IFileDescriptor {

            /**
             * Constructs a new FileDescriptor.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.schemas.IFileDescriptor);

            /** FileDescriptor schema. */
            public schema: string;

            /** FileDescriptor name. */
            public name: string;

            /** FileDescriptor mimeType. */
            public mimeType: string;

            /** FileDescriptor size. */
            public size: (number|Long);

            /** FileDescriptor rootManifestCid. */
            public rootManifestCid: Uint8Array;

            /** FileDescriptor previousCid. */
            public previousCid: Uint8Array;

            /** FileDescriptor timestampMs. */
            public timestampMs: (number|Long);

            /**
             * Creates a new FileDescriptor instance using the specified properties.
             * @param [properties] Properties to set
             * @returns FileDescriptor instance
             */
            public static create(properties?: vco.schemas.IFileDescriptor): vco.schemas.FileDescriptor;

            /**
             * Encodes the specified FileDescriptor message. Does not implicitly {@link vco.schemas.FileDescriptor.verify|verify} messages.
             * @param message FileDescriptor message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.schemas.IFileDescriptor, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified FileDescriptor message, length delimited. Does not implicitly {@link vco.schemas.FileDescriptor.verify|verify} messages.
             * @param message FileDescriptor message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.schemas.IFileDescriptor, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FileDescriptor message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns FileDescriptor
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.schemas.FileDescriptor;

            /**
             * Decodes a FileDescriptor message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns FileDescriptor
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.schemas.FileDescriptor;

            /**
             * Verifies a FileDescriptor message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a FileDescriptor message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns FileDescriptor
             */
            public static fromObject(object: { [k: string]: any }): vco.schemas.FileDescriptor;

            /**
             * Creates a plain object from a FileDescriptor message. Also converts values to other types if specified.
             * @param message FileDescriptor
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.schemas.FileDescriptor, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this FileDescriptor to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for FileDescriptor
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}

export const FileDescriptor: typeof vco.schemas.FileDescriptor;
