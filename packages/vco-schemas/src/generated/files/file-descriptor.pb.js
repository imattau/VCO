/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["vco-schemas-files/file-descriptor"] || ($protobuf.roots["vco-schemas-files/file-descriptor"] = {});

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

        schemas.FileDescriptor = (function() {

            /**
             * Properties of a FileDescriptor.
             * @memberof vco.schemas
             * @interface IFileDescriptor
             * @property {string|null} [schema] FileDescriptor schema
             * @property {string|null} [name] FileDescriptor name
             * @property {string|null} [mimeType] FileDescriptor mimeType
             * @property {number|Long|null} [size] FileDescriptor size
             * @property {Uint8Array|null} [rootManifestCid] FileDescriptor rootManifestCid
             * @property {Uint8Array|null} [previousCid] FileDescriptor previousCid
             * @property {number|Long|null} [timestampMs] FileDescriptor timestampMs
             */

            /**
             * Constructs a new FileDescriptor.
             * @memberof vco.schemas
             * @classdesc Represents a FileDescriptor.
             * @implements IFileDescriptor
             * @constructor
             * @param {vco.schemas.IFileDescriptor=} [properties] Properties to set
             */
            function FileDescriptor(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * FileDescriptor schema.
             * @member {string} schema
             * @memberof vco.schemas.FileDescriptor
             * @instance
             */
            FileDescriptor.prototype.schema = "";

            /**
             * FileDescriptor name.
             * @member {string} name
             * @memberof vco.schemas.FileDescriptor
             * @instance
             */
            FileDescriptor.prototype.name = "";

            /**
             * FileDescriptor mimeType.
             * @member {string} mimeType
             * @memberof vco.schemas.FileDescriptor
             * @instance
             */
            FileDescriptor.prototype.mimeType = "";

            /**
             * FileDescriptor size.
             * @member {number|Long} size
             * @memberof vco.schemas.FileDescriptor
             * @instance
             */
            FileDescriptor.prototype.size = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            /**
             * FileDescriptor rootManifestCid.
             * @member {Uint8Array} rootManifestCid
             * @memberof vco.schemas.FileDescriptor
             * @instance
             */
            FileDescriptor.prototype.rootManifestCid = $util.newBuffer([]);

            /**
             * FileDescriptor previousCid.
             * @member {Uint8Array} previousCid
             * @memberof vco.schemas.FileDescriptor
             * @instance
             */
            FileDescriptor.prototype.previousCid = $util.newBuffer([]);

            /**
             * FileDescriptor timestampMs.
             * @member {number|Long} timestampMs
             * @memberof vco.schemas.FileDescriptor
             * @instance
             */
            FileDescriptor.prototype.timestampMs = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Creates a new FileDescriptor instance using the specified properties.
             * @function create
             * @memberof vco.schemas.FileDescriptor
             * @static
             * @param {vco.schemas.IFileDescriptor=} [properties] Properties to set
             * @returns {vco.schemas.FileDescriptor} FileDescriptor instance
             */
            FileDescriptor.create = function create(properties) {
                return new FileDescriptor(properties);
            };

            /**
             * Encodes the specified FileDescriptor message. Does not implicitly {@link vco.schemas.FileDescriptor.verify|verify} messages.
             * @function encode
             * @memberof vco.schemas.FileDescriptor
             * @static
             * @param {vco.schemas.IFileDescriptor} message FileDescriptor message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            FileDescriptor.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.schema != null && Object.hasOwnProperty.call(message, "schema"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.schema);
                if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
                if (message.mimeType != null && Object.hasOwnProperty.call(message, "mimeType"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.mimeType);
                if (message.size != null && Object.hasOwnProperty.call(message, "size"))
                    writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.size);
                if (message.rootManifestCid != null && Object.hasOwnProperty.call(message, "rootManifestCid"))
                    writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.rootManifestCid);
                if (message.previousCid != null && Object.hasOwnProperty.call(message, "previousCid"))
                    writer.uint32(/* id 6, wireType 2 =*/50).bytes(message.previousCid);
                if (message.timestampMs != null && Object.hasOwnProperty.call(message, "timestampMs"))
                    writer.uint32(/* id 7, wireType 0 =*/56).int64(message.timestampMs);
                return writer;
            };

            /**
             * Encodes the specified FileDescriptor message, length delimited. Does not implicitly {@link vco.schemas.FileDescriptor.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.schemas.FileDescriptor
             * @static
             * @param {vco.schemas.IFileDescriptor} message FileDescriptor message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            FileDescriptor.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a FileDescriptor message from the specified reader or buffer.
             * @function decode
             * @memberof vco.schemas.FileDescriptor
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.schemas.FileDescriptor} FileDescriptor
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            FileDescriptor.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.FileDescriptor();
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
                            message.mimeType = reader.string();
                            break;
                        }
                    case 4: {
                            message.size = reader.uint64();
                            break;
                        }
                    case 5: {
                            message.rootManifestCid = reader.bytes();
                            break;
                        }
                    case 6: {
                            message.previousCid = reader.bytes();
                            break;
                        }
                    case 7: {
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
             * Decodes a FileDescriptor message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.schemas.FileDescriptor
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.schemas.FileDescriptor} FileDescriptor
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            FileDescriptor.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a FileDescriptor message.
             * @function verify
             * @memberof vco.schemas.FileDescriptor
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            FileDescriptor.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.schema != null && message.hasOwnProperty("schema"))
                    if (!$util.isString(message.schema))
                        return "schema: string expected";
                if (message.name != null && message.hasOwnProperty("name"))
                    if (!$util.isString(message.name))
                        return "name: string expected";
                if (message.mimeType != null && message.hasOwnProperty("mimeType"))
                    if (!$util.isString(message.mimeType))
                        return "mimeType: string expected";
                if (message.size != null && message.hasOwnProperty("size"))
                    if (!$util.isInteger(message.size) && !(message.size && $util.isInteger(message.size.low) && $util.isInteger(message.size.high)))
                        return "size: integer|Long expected";
                if (message.rootManifestCid != null && message.hasOwnProperty("rootManifestCid"))
                    if (!(message.rootManifestCid && typeof message.rootManifestCid.length === "number" || $util.isString(message.rootManifestCid)))
                        return "rootManifestCid: buffer expected";
                if (message.previousCid != null && message.hasOwnProperty("previousCid"))
                    if (!(message.previousCid && typeof message.previousCid.length === "number" || $util.isString(message.previousCid)))
                        return "previousCid: buffer expected";
                if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                    if (!$util.isInteger(message.timestampMs) && !(message.timestampMs && $util.isInteger(message.timestampMs.low) && $util.isInteger(message.timestampMs.high)))
                        return "timestampMs: integer|Long expected";
                return null;
            };

            /**
             * Creates a FileDescriptor message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.schemas.FileDescriptor
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.schemas.FileDescriptor} FileDescriptor
             */
            FileDescriptor.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.schemas.FileDescriptor)
                    return object;
                let message = new $root.vco.schemas.FileDescriptor();
                if (object.schema != null)
                    message.schema = String(object.schema);
                if (object.name != null)
                    message.name = String(object.name);
                if (object.mimeType != null)
                    message.mimeType = String(object.mimeType);
                if (object.size != null)
                    if ($util.Long)
                        (message.size = $util.Long.fromValue(object.size)).unsigned = true;
                    else if (typeof object.size === "string")
                        message.size = parseInt(object.size, 10);
                    else if (typeof object.size === "number")
                        message.size = object.size;
                    else if (typeof object.size === "object")
                        message.size = new $util.LongBits(object.size.low >>> 0, object.size.high >>> 0).toNumber(true);
                if (object.rootManifestCid != null)
                    if (typeof object.rootManifestCid === "string")
                        $util.base64.decode(object.rootManifestCid, message.rootManifestCid = $util.newBuffer($util.base64.length(object.rootManifestCid)), 0);
                    else if (object.rootManifestCid.length >= 0)
                        message.rootManifestCid = object.rootManifestCid;
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
             * Creates a plain object from a FileDescriptor message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.schemas.FileDescriptor
             * @static
             * @param {vco.schemas.FileDescriptor} message FileDescriptor
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            FileDescriptor.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.schema = "";
                    object.name = "";
                    object.mimeType = "";
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, true);
                        object.size = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.size = options.longs === String ? "0" : 0;
                    if (options.bytes === String)
                        object.rootManifestCid = "";
                    else {
                        object.rootManifestCid = [];
                        if (options.bytes !== Array)
                            object.rootManifestCid = $util.newBuffer(object.rootManifestCid);
                    }
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
                if (message.mimeType != null && message.hasOwnProperty("mimeType"))
                    object.mimeType = message.mimeType;
                if (message.size != null && message.hasOwnProperty("size"))
                    if (typeof message.size === "number")
                        object.size = options.longs === String ? String(message.size) : message.size;
                    else
                        object.size = options.longs === String ? $util.Long.prototype.toString.call(message.size) : options.longs === Number ? new $util.LongBits(message.size.low >>> 0, message.size.high >>> 0).toNumber(true) : message.size;
                if (message.rootManifestCid != null && message.hasOwnProperty("rootManifestCid"))
                    object.rootManifestCid = options.bytes === String ? $util.base64.encode(message.rootManifestCid, 0, message.rootManifestCid.length) : options.bytes === Array ? Array.prototype.slice.call(message.rootManifestCid) : message.rootManifestCid;
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
             * Converts this FileDescriptor to JSON.
             * @function toJSON
             * @memberof vco.schemas.FileDescriptor
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            FileDescriptor.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for FileDescriptor
             * @function getTypeUrl
             * @memberof vco.schemas.FileDescriptor
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            FileDescriptor.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.schemas.FileDescriptor";
            };

            return FileDescriptor;
        })();

        return schemas;
    })();

    return vco;
})();

export { $root as default };

export const FileDescriptor = vco.schemas.FileDescriptor;
