/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["vco-schemas-files/directory"] || ($protobuf.roots["vco-schemas-files/directory"] = {});

export const vco = $root.vco = (() => {

    /**
     * Namespace vco.
     * @exports vco
     * @namespace
     */
    const vco = {};

    vco.schemas = (function() {

        /**
         * Namespace schemas.
         * @memberof vco
         * @namespace
         */
        const schemas = {};

        schemas.DirectoryEntry = (function() {

            /**
             * Properties of a DirectoryEntry.
             * @memberof vco.schemas
             * @interface IDirectoryEntry
             * @property {Uint8Array|null} [cid] DirectoryEntry cid
             * @property {string|null} [schemaUri] DirectoryEntry schemaUri
             * @property {string|null} [name] DirectoryEntry name
             */

            /**
             * Constructs a new DirectoryEntry.
             * @memberof vco.schemas
             * @classdesc Represents a DirectoryEntry.
             * @implements IDirectoryEntry
             * @constructor
             * @param {vco.schemas.IDirectoryEntry=} [properties] Properties to set
             */
            function DirectoryEntry(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * DirectoryEntry cid.
             * @member {Uint8Array} cid
             * @memberof vco.schemas.DirectoryEntry
             * @instance
             */
            DirectoryEntry.prototype.cid = $util.newBuffer([]);

            /**
             * DirectoryEntry schemaUri.
             * @member {string} schemaUri
             * @memberof vco.schemas.DirectoryEntry
             * @instance
             */
            DirectoryEntry.prototype.schemaUri = "";

            /**
             * DirectoryEntry name.
             * @member {string} name
             * @memberof vco.schemas.DirectoryEntry
             * @instance
             */
            DirectoryEntry.prototype.name = "";

            /**
             * Creates a new DirectoryEntry instance using the specified properties.
             * @function create
             * @memberof vco.schemas.DirectoryEntry
             * @static
             * @param {vco.schemas.IDirectoryEntry=} [properties] Properties to set
             * @returns {vco.schemas.DirectoryEntry} DirectoryEntry instance
             */
            DirectoryEntry.create = function create(properties) {
                return new DirectoryEntry(properties);
            };

            /**
             * Encodes the specified DirectoryEntry message. Does not implicitly {@link vco.schemas.DirectoryEntry.verify|verify} messages.
             * @function encode
             * @memberof vco.schemas.DirectoryEntry
             * @static
             * @param {vco.schemas.IDirectoryEntry} message DirectoryEntry message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DirectoryEntry.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.cid != null && Object.hasOwnProperty.call(message, "cid"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.cid);
                if (message.schemaUri != null && Object.hasOwnProperty.call(message, "schemaUri"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.schemaUri);
                if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.name);
                return writer;
            };

            /**
             * Encodes the specified DirectoryEntry message, length delimited. Does not implicitly {@link vco.schemas.DirectoryEntry.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.schemas.DirectoryEntry
             * @static
             * @param {vco.schemas.IDirectoryEntry} message DirectoryEntry message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DirectoryEntry.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DirectoryEntry message from the specified reader or buffer.
             * @function decode
             * @memberof vco.schemas.DirectoryEntry
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.schemas.DirectoryEntry} DirectoryEntry
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DirectoryEntry.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.DirectoryEntry();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.cid = reader.bytes();
                            break;
                        }
                    case 2: {
                            message.schemaUri = reader.string();
                            break;
                        }
                    case 3: {
                            message.name = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a DirectoryEntry message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.schemas.DirectoryEntry
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.schemas.DirectoryEntry} DirectoryEntry
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DirectoryEntry.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a DirectoryEntry message.
             * @function verify
             * @memberof vco.schemas.DirectoryEntry
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            DirectoryEntry.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.cid != null && message.hasOwnProperty("cid"))
                    if (!(message.cid && typeof message.cid.length === "number" || $util.isString(message.cid)))
                        return "cid: buffer expected";
                if (message.schemaUri != null && message.hasOwnProperty("schemaUri"))
                    if (!$util.isString(message.schemaUri))
                        return "schemaUri: string expected";
                if (message.name != null && message.hasOwnProperty("name"))
                    if (!$util.isString(message.name))
                        return "name: string expected";
                return null;
            };

            /**
             * Creates a DirectoryEntry message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.schemas.DirectoryEntry
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.schemas.DirectoryEntry} DirectoryEntry
             */
            DirectoryEntry.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.schemas.DirectoryEntry)
                    return object;
                let message = new $root.vco.schemas.DirectoryEntry();
                if (object.cid != null)
                    if (typeof object.cid === "string")
                        $util.base64.decode(object.cid, message.cid = $util.newBuffer($util.base64.length(object.cid)), 0);
                    else if (object.cid.length >= 0)
                        message.cid = object.cid;
                if (object.schemaUri != null)
                    message.schemaUri = String(object.schemaUri);
                if (object.name != null)
                    message.name = String(object.name);
                return message;
            };

            /**
             * Creates a plain object from a DirectoryEntry message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.schemas.DirectoryEntry
             * @static
             * @param {vco.schemas.DirectoryEntry} message DirectoryEntry
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            DirectoryEntry.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    if (options.bytes === String)
                        object.cid = "";
                    else {
                        object.cid = [];
                        if (options.bytes !== Array)
                            object.cid = $util.newBuffer(object.cid);
                    }
                    object.schemaUri = "";
                    object.name = "";
                }
                if (message.cid != null && message.hasOwnProperty("cid"))
                    object.cid = options.bytes === String ? $util.base64.encode(message.cid, 0, message.cid.length) : options.bytes === Array ? Array.prototype.slice.call(message.cid) : message.cid;
                if (message.schemaUri != null && message.hasOwnProperty("schemaUri"))
                    object.schemaUri = message.schemaUri;
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                return object;
            };

            /**
             * Converts this DirectoryEntry to JSON.
             * @function toJSON
             * @memberof vco.schemas.DirectoryEntry
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DirectoryEntry.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for DirectoryEntry
             * @function getTypeUrl
             * @memberof vco.schemas.DirectoryEntry
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            DirectoryEntry.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.schemas.DirectoryEntry";
            };

            return DirectoryEntry;
        })();

        schemas.Directory = (function() {

            /**
             * Properties of a Directory.
             * @memberof vco.schemas
             * @interface IDirectory
             * @property {string|null} [schema] Directory schema
             * @property {string|null} [name] Directory name
             * @property {Array.<vco.schemas.IDirectoryEntry>|null} [entries] Directory entries
             * @property {Uint8Array|null} [previousCid] Directory previousCid
             * @property {number|Long|null} [timestampMs] Directory timestampMs
             */

            /**
             * Constructs a new Directory.
             * @memberof vco.schemas
             * @classdesc Represents a Directory.
             * @implements IDirectory
             * @constructor
             * @param {vco.schemas.IDirectory=} [properties] Properties to set
             */
            function Directory(properties) {
                this.entries = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Directory schema.
             * @member {string} schema
             * @memberof vco.schemas.Directory
             * @instance
             */
            Directory.prototype.schema = "";

            /**
             * Directory name.
             * @member {string} name
             * @memberof vco.schemas.Directory
             * @instance
             */
            Directory.prototype.name = "";

            /**
             * Directory entries.
             * @member {Array.<vco.schemas.IDirectoryEntry>} entries
             * @memberof vco.schemas.Directory
             * @instance
             */
            Directory.prototype.entries = $util.emptyArray;

            /**
             * Directory previousCid.
             * @member {Uint8Array} previousCid
             * @memberof vco.schemas.Directory
             * @instance
             */
            Directory.prototype.previousCid = $util.newBuffer([]);

            /**
             * Directory timestampMs.
             * @member {number|Long} timestampMs
             * @memberof vco.schemas.Directory
             * @instance
             */
            Directory.prototype.timestampMs = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Creates a new Directory instance using the specified properties.
             * @function create
             * @memberof vco.schemas.Directory
             * @static
             * @param {vco.schemas.IDirectory=} [properties] Properties to set
             * @returns {vco.schemas.Directory} Directory instance
             */
            Directory.create = function create(properties) {
                return new Directory(properties);
            };

            /**
             * Encodes the specified Directory message. Does not implicitly {@link vco.schemas.Directory.verify|verify} messages.
             * @function encode
             * @memberof vco.schemas.Directory
             * @static
             * @param {vco.schemas.IDirectory} message Directory message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Directory.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.schema != null && Object.hasOwnProperty.call(message, "schema"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.schema);
                if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
                if (message.entries != null && message.entries.length)
                    for (let i = 0; i < message.entries.length; ++i)
                        $root.vco.schemas.DirectoryEntry.encode(message.entries[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.previousCid != null && Object.hasOwnProperty.call(message, "previousCid"))
                    writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.previousCid);
                if (message.timestampMs != null && Object.hasOwnProperty.call(message, "timestampMs"))
                    writer.uint32(/* id 5, wireType 0 =*/40).int64(message.timestampMs);
                return writer;
            };

            /**
             * Encodes the specified Directory message, length delimited. Does not implicitly {@link vco.schemas.Directory.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.schemas.Directory
             * @static
             * @param {vco.schemas.IDirectory} message Directory message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Directory.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Directory message from the specified reader or buffer.
             * @function decode
             * @memberof vco.schemas.Directory
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.schemas.Directory} Directory
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Directory.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.Directory();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.schema = reader.string();
                            break;
                        }
                    case 2: {
                            message.name = reader.string();
                            break;
                        }
                    case 3: {
                            if (!(message.entries && message.entries.length))
                                message.entries = [];
                            message.entries.push($root.vco.schemas.DirectoryEntry.decode(reader, reader.uint32()));
                            break;
                        }
                    case 4: {
                            message.previousCid = reader.bytes();
                            break;
                        }
                    case 5: {
                            message.timestampMs = reader.int64();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Directory message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.schemas.Directory
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.schemas.Directory} Directory
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Directory.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Directory message.
             * @function verify
             * @memberof vco.schemas.Directory
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Directory.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.schema != null && message.hasOwnProperty("schema"))
                    if (!$util.isString(message.schema))
                        return "schema: string expected";
                if (message.name != null && message.hasOwnProperty("name"))
                    if (!$util.isString(message.name))
                        return "name: string expected";
                if (message.entries != null && message.hasOwnProperty("entries")) {
                    if (!Array.isArray(message.entries))
                        return "entries: array expected";
                    for (let i = 0; i < message.entries.length; ++i) {
                        let error = $root.vco.schemas.DirectoryEntry.verify(message.entries[i]);
                        if (error)
                            return "entries." + error;
                    }
                }
                if (message.previousCid != null && message.hasOwnProperty("previousCid"))
                    if (!(message.previousCid && typeof message.previousCid.length === "number" || $util.isString(message.previousCid)))
                        return "previousCid: buffer expected";
                if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                    if (!$util.isInteger(message.timestampMs) && !(message.timestampMs && $util.isInteger(message.timestampMs.low) && $util.isInteger(message.timestampMs.high)))
                        return "timestampMs: integer|Long expected";
                return null;
            };

            /**
             * Creates a Directory message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.schemas.Directory
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.schemas.Directory} Directory
             */
            Directory.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.schemas.Directory)
                    return object;
                let message = new $root.vco.schemas.Directory();
                if (object.schema != null)
                    message.schema = String(object.schema);
                if (object.name != null)
                    message.name = String(object.name);
                if (object.entries) {
                    if (!Array.isArray(object.entries))
                        throw TypeError(".vco.schemas.Directory.entries: array expected");
                    message.entries = [];
                    for (let i = 0; i < object.entries.length; ++i) {
                        if (typeof object.entries[i] !== "object")
                            throw TypeError(".vco.schemas.Directory.entries: object expected");
                        message.entries[i] = $root.vco.schemas.DirectoryEntry.fromObject(object.entries[i]);
                    }
                }
                if (object.previousCid != null)
                    if (typeof object.previousCid === "string")
                        $util.base64.decode(object.previousCid, message.previousCid = $util.newBuffer($util.base64.length(object.previousCid)), 0);
                    else if (object.previousCid.length >= 0)
                        message.previousCid = object.previousCid;
                if (object.timestampMs != null)
                    if ($util.Long)
                        (message.timestampMs = $util.Long.fromValue(object.timestampMs)).unsigned = false;
                    else if (typeof object.timestampMs === "string")
                        message.timestampMs = parseInt(object.timestampMs, 10);
                    else if (typeof object.timestampMs === "number")
                        message.timestampMs = object.timestampMs;
                    else if (typeof object.timestampMs === "object")
                        message.timestampMs = new $util.LongBits(object.timestampMs.low >>> 0, object.timestampMs.high >>> 0).toNumber();
                return message;
            };

            /**
             * Creates a plain object from a Directory message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.schemas.Directory
             * @static
             * @param {vco.schemas.Directory} message Directory
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Directory.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.entries = [];
                if (options.defaults) {
                    object.schema = "";
                    object.name = "";
                    if (options.bytes === String)
                        object.previousCid = "";
                    else {
                        object.previousCid = [];
                        if (options.bytes !== Array)
                            object.previousCid = $util.newBuffer(object.previousCid);
                    }
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.timestampMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.timestampMs = options.longs === String ? "0" : 0;
                }
                if (message.schema != null && message.hasOwnProperty("schema"))
                    object.schema = message.schema;
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.entries && message.entries.length) {
                    object.entries = [];
                    for (let j = 0; j < message.entries.length; ++j)
                        object.entries[j] = $root.vco.schemas.DirectoryEntry.toObject(message.entries[j], options);
                }
                if (message.previousCid != null && message.hasOwnProperty("previousCid"))
                    object.previousCid = options.bytes === String ? $util.base64.encode(message.previousCid, 0, message.previousCid.length) : options.bytes === Array ? Array.prototype.slice.call(message.previousCid) : message.previousCid;
                if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                    if (typeof message.timestampMs === "number")
                        object.timestampMs = options.longs === String ? String(message.timestampMs) : message.timestampMs;
                    else
                        object.timestampMs = options.longs === String ? $util.Long.prototype.toString.call(message.timestampMs) : options.longs === Number ? new $util.LongBits(message.timestampMs.low >>> 0, message.timestampMs.high >>> 0).toNumber() : message.timestampMs;
                return object;
            };

            /**
             * Converts this Directory to JSON.
             * @function toJSON
             * @memberof vco.schemas.Directory
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Directory.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Directory
             * @function getTypeUrl
             * @memberof vco.schemas.Directory
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Directory.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.schemas.Directory";
            };

            return Directory;
        })();

        return schemas;
    })();

    return vco;
})();

export { $root as default };

export const DirectoryEntry = vco.schemas.DirectoryEntry;
export const Directory = vco.schemas.Directory;
