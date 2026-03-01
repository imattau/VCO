import $protobuf from "protobufjs/minimal.js";
/** Namespace vco. */
export namespace vco {

    /** Namespace schemas. */
    namespace schemas {

        /** Properties of a DirectoryEntry. */
        interface IDirectoryEntry {

            /** DirectoryEntry cid */
            cid?: (Uint8Array|null);

            /** DirectoryEntry schemaUri */
            schemaUri?: (string|null);

            /** DirectoryEntry name */
            name?: (string|null);
        }

        /** Represents a DirectoryEntry. */
        class DirectoryEntry implements IDirectoryEntry {

            /**
             * Constructs a new DirectoryEntry.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.schemas.IDirectoryEntry);

            /** DirectoryEntry cid. */
            public cid: Uint8Array;

            /** DirectoryEntry schemaUri. */
            public schemaUri: string;

            /** DirectoryEntry name. */
            public name: string;

            /**
             * Creates a new DirectoryEntry instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DirectoryEntry instance
             */
            public static create(properties?: vco.schemas.IDirectoryEntry): vco.schemas.DirectoryEntry;

            /**
             * Encodes the specified DirectoryEntry message. Does not implicitly {@link vco.schemas.DirectoryEntry.verify|verify} messages.
             * @param message DirectoryEntry message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.schemas.IDirectoryEntry, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DirectoryEntry message, length delimited. Does not implicitly {@link vco.schemas.DirectoryEntry.verify|verify} messages.
             * @param message DirectoryEntry message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.schemas.IDirectoryEntry, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DirectoryEntry message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DirectoryEntry
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.schemas.DirectoryEntry;

            /**
             * Decodes a DirectoryEntry message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DirectoryEntry
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.schemas.DirectoryEntry;

            /**
             * Verifies a DirectoryEntry message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a DirectoryEntry message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns DirectoryEntry
             */
            public static fromObject(object: { [k: string]: any }): vco.schemas.DirectoryEntry;

            /**
             * Creates a plain object from a DirectoryEntry message. Also converts values to other types if specified.
             * @param message DirectoryEntry
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.schemas.DirectoryEntry, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DirectoryEntry to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for DirectoryEntry
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a Directory. */
        interface IDirectory {

            /** Directory schema */
            schema?: (string|null);

            /** Directory name */
            name?: (string|null);

            /** Directory entries */
            entries?: (vco.schemas.IDirectoryEntry[]|null);

            /** Directory previousCid */
            previousCid?: (Uint8Array|null);

            /** Directory timestampMs */
            timestampMs?: (number|Long|null);
        }

        /** Represents a Directory. */
        class Directory implements IDirectory {

            /**
             * Constructs a new Directory.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.schemas.IDirectory);

            /** Directory schema. */
            public schema: string;

            /** Directory name. */
            public name: string;

            /** Directory entries. */
            public entries: vco.schemas.IDirectoryEntry[];

            /** Directory previousCid. */
            public previousCid: Uint8Array;

            /** Directory timestampMs. */
            public timestampMs: (number|Long);

            /**
             * Creates a new Directory instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Directory instance
             */
            public static create(properties?: vco.schemas.IDirectory): vco.schemas.Directory;

            /**
             * Encodes the specified Directory message. Does not implicitly {@link vco.schemas.Directory.verify|verify} messages.
             * @param message Directory message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.schemas.IDirectory, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Directory message, length delimited. Does not implicitly {@link vco.schemas.Directory.verify|verify} messages.
             * @param message Directory message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.schemas.IDirectory, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Directory message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Directory
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.schemas.Directory;

            /**
             * Decodes a Directory message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Directory
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.schemas.Directory;

            /**
             * Verifies a Directory message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Directory message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Directory
             */
            public static fromObject(object: { [k: string]: any }): vco.schemas.Directory;

            /**
             * Creates a plain object from a Directory message. Also converts values to other types if specified.
             * @param message Directory
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.schemas.Directory, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Directory to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Directory
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}

export const DirectoryEntry: typeof vco.schemas.DirectoryEntry;
export const Directory: typeof vco.schemas.Directory;
