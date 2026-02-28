/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["vco-schemas-manifest"] || ($protobuf.roots["vco-schemas-manifest"] = {});

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

        schemas.SequenceManifest = (function() {

            /**
             * Properties of a SequenceManifest.
             * @memberof vco.schemas
             * @interface ISequenceManifest
             * @property {string|null} [schema] SequenceManifest schema
             * @property {Array.<Uint8Array>|null} [chunkCids] SequenceManifest chunkCids
             * @property {number|Long|null} [totalSize] SequenceManifest totalSize
             * @property {string|null} [mimeType] SequenceManifest mimeType
             * @property {Uint8Array|null} [previousManifest] SequenceManifest previousManifest
             */

            /**
             * Constructs a new SequenceManifest.
             * @memberof vco.schemas
             * @classdesc Represents a SequenceManifest.
             * @implements ISequenceManifest
             * @constructor
             * @param {vco.schemas.ISequenceManifest=} [properties] Properties to set
             */
            function SequenceManifest(properties) {
                this.chunkCids = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * SequenceManifest schema.
             * @member {string} schema
             * @memberof vco.schemas.SequenceManifest
             * @instance
             */
            SequenceManifest.prototype.schema = "";

            /**
             * SequenceManifest chunkCids.
             * @member {Array.<Uint8Array>} chunkCids
             * @memberof vco.schemas.SequenceManifest
             * @instance
             */
            SequenceManifest.prototype.chunkCids = $util.emptyArray;

            /**
             * SequenceManifest totalSize.
             * @member {number|Long} totalSize
             * @memberof vco.schemas.SequenceManifest
             * @instance
             */
            SequenceManifest.prototype.totalSize = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            /**
             * SequenceManifest mimeType.
             * @member {string} mimeType
             * @memberof vco.schemas.SequenceManifest
             * @instance
             */
            SequenceManifest.prototype.mimeType = "";

            /**
             * SequenceManifest previousManifest.
             * @member {Uint8Array} previousManifest
             * @memberof vco.schemas.SequenceManifest
             * @instance
             */
            SequenceManifest.prototype.previousManifest = $util.newBuffer([]);

            /**
             * Creates a new SequenceManifest instance using the specified properties.
             * @function create
             * @memberof vco.schemas.SequenceManifest
             * @static
             * @param {vco.schemas.ISequenceManifest=} [properties] Properties to set
             * @returns {vco.schemas.SequenceManifest} SequenceManifest instance
             */
            SequenceManifest.create = function create(properties) {
                return new SequenceManifest(properties);
            };

            /**
             * Encodes the specified SequenceManifest message. Does not implicitly {@link vco.schemas.SequenceManifest.verify|verify} messages.
             * @function encode
             * @memberof vco.schemas.SequenceManifest
             * @static
             * @param {vco.schemas.ISequenceManifest} message SequenceManifest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SequenceManifest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.schema != null && Object.hasOwnProperty.call(message, "schema"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.schema);
                if (message.chunkCids != null && message.chunkCids.length)
                    for (let i = 0; i < message.chunkCids.length; ++i)
                        writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.chunkCids[i]);
                if (message.totalSize != null && Object.hasOwnProperty.call(message, "totalSize"))
                    writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.totalSize);
                if (message.mimeType != null && Object.hasOwnProperty.call(message, "mimeType"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.mimeType);
                if (message.previousManifest != null && Object.hasOwnProperty.call(message, "previousManifest"))
                    writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.previousManifest);
                return writer;
            };

            /**
             * Encodes the specified SequenceManifest message, length delimited. Does not implicitly {@link vco.schemas.SequenceManifest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.schemas.SequenceManifest
             * @static
             * @param {vco.schemas.ISequenceManifest} message SequenceManifest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SequenceManifest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a SequenceManifest message from the specified reader or buffer.
             * @function decode
             * @memberof vco.schemas.SequenceManifest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.schemas.SequenceManifest} SequenceManifest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SequenceManifest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.SequenceManifest();
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
                            if (!(message.chunkCids && message.chunkCids.length))
                                message.chunkCids = [];
                            message.chunkCids.push(reader.bytes());
                            break;
                        }
                    case 3: {
                            message.totalSize = reader.uint64();
                            break;
                        }
                    case 4: {
                            message.mimeType = reader.string();
                            break;
                        }
                    case 5: {
                            message.previousManifest = reader.bytes();
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
             * Decodes a SequenceManifest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.schemas.SequenceManifest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.schemas.SequenceManifest} SequenceManifest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SequenceManifest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a SequenceManifest message.
             * @function verify
             * @memberof vco.schemas.SequenceManifest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            SequenceManifest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.schema != null && message.hasOwnProperty("schema"))
                    if (!$util.isString(message.schema))
                        return "schema: string expected";
                if (message.chunkCids != null && message.hasOwnProperty("chunkCids")) {
                    if (!Array.isArray(message.chunkCids))
                        return "chunkCids: array expected";
                    for (let i = 0; i < message.chunkCids.length; ++i)
                        if (!(message.chunkCids[i] && typeof message.chunkCids[i].length === "number" || $util.isString(message.chunkCids[i])))
                            return "chunkCids: buffer[] expected";
                }
                if (message.totalSize != null && message.hasOwnProperty("totalSize"))
                    if (!$util.isInteger(message.totalSize) && !(message.totalSize && $util.isInteger(message.totalSize.low) && $util.isInteger(message.totalSize.high)))
                        return "totalSize: integer|Long expected";
                if (message.mimeType != null && message.hasOwnProperty("mimeType"))
                    if (!$util.isString(message.mimeType))
                        return "mimeType: string expected";
                if (message.previousManifest != null && message.hasOwnProperty("previousManifest"))
                    if (!(message.previousManifest && typeof message.previousManifest.length === "number" || $util.isString(message.previousManifest)))
                        return "previousManifest: buffer expected";
                return null;
            };

            /**
             * Creates a SequenceManifest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.schemas.SequenceManifest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.schemas.SequenceManifest} SequenceManifest
             */
            SequenceManifest.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.schemas.SequenceManifest)
                    return object;
                let message = new $root.vco.schemas.SequenceManifest();
                if (object.schema != null)
                    message.schema = String(object.schema);
                if (object.chunkCids) {
                    if (!Array.isArray(object.chunkCids))
                        throw TypeError(".vco.schemas.SequenceManifest.chunkCids: array expected");
                    message.chunkCids = [];
                    for (let i = 0; i < object.chunkCids.length; ++i)
                        if (typeof object.chunkCids[i] === "string")
                            $util.base64.decode(object.chunkCids[i], message.chunkCids[i] = $util.newBuffer($util.base64.length(object.chunkCids[i])), 0);
                        else if (object.chunkCids[i].length >= 0)
                            message.chunkCids[i] = object.chunkCids[i];
                }
                if (object.totalSize != null)
                    if ($util.Long)
                        (message.totalSize = $util.Long.fromValue(object.totalSize)).unsigned = true;
                    else if (typeof object.totalSize === "string")
                        message.totalSize = parseInt(object.totalSize, 10);
                    else if (typeof object.totalSize === "number")
                        message.totalSize = object.totalSize;
                    else if (typeof object.totalSize === "object")
                        message.totalSize = new $util.LongBits(object.totalSize.low >>> 0, object.totalSize.high >>> 0).toNumber(true);
                if (object.mimeType != null)
                    message.mimeType = String(object.mimeType);
                if (object.previousManifest != null)
                    if (typeof object.previousManifest === "string")
                        $util.base64.decode(object.previousManifest, message.previousManifest = $util.newBuffer($util.base64.length(object.previousManifest)), 0);
                    else if (object.previousManifest.length >= 0)
                        message.previousManifest = object.previousManifest;
                return message;
            };

            /**
             * Creates a plain object from a SequenceManifest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.schemas.SequenceManifest
             * @static
             * @param {vco.schemas.SequenceManifest} message SequenceManifest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            SequenceManifest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.chunkCids = [];
                if (options.defaults) {
                    object.schema = "";
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, true);
                        object.totalSize = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.totalSize = options.longs === String ? "0" : 0;
                    object.mimeType = "";
                    if (options.bytes === String)
                        object.previousManifest = "";
                    else {
                        object.previousManifest = [];
                        if (options.bytes !== Array)
                            object.previousManifest = $util.newBuffer(object.previousManifest);
                    }
                }
                if (message.schema != null && message.hasOwnProperty("schema"))
                    object.schema = message.schema;
                if (message.chunkCids && message.chunkCids.length) {
                    object.chunkCids = [];
                    for (let j = 0; j < message.chunkCids.length; ++j)
                        object.chunkCids[j] = options.bytes === String ? $util.base64.encode(message.chunkCids[j], 0, message.chunkCids[j].length) : options.bytes === Array ? Array.prototype.slice.call(message.chunkCids[j]) : message.chunkCids[j];
                }
                if (message.totalSize != null && message.hasOwnProperty("totalSize"))
                    if (typeof message.totalSize === "number")
                        object.totalSize = options.longs === String ? String(message.totalSize) : message.totalSize;
                    else
                        object.totalSize = options.longs === String ? $util.Long.prototype.toString.call(message.totalSize) : options.longs === Number ? new $util.LongBits(message.totalSize.low >>> 0, message.totalSize.high >>> 0).toNumber(true) : message.totalSize;
                if (message.mimeType != null && message.hasOwnProperty("mimeType"))
                    object.mimeType = message.mimeType;
                if (message.previousManifest != null && message.hasOwnProperty("previousManifest"))
                    object.previousManifest = options.bytes === String ? $util.base64.encode(message.previousManifest, 0, message.previousManifest.length) : options.bytes === Array ? Array.prototype.slice.call(message.previousManifest) : message.previousManifest;
                return object;
            };

            /**
             * Converts this SequenceManifest to JSON.
             * @function toJSON
             * @memberof vco.schemas.SequenceManifest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            SequenceManifest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for SequenceManifest
             * @function getTypeUrl
             * @memberof vco.schemas.SequenceManifest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            SequenceManifest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.schemas.SequenceManifest";
            };

            return SequenceManifest;
        })();

        return schemas;
    })();

    return vco;
})();

export { $root as default };

export const SequenceManifest = vco.schemas.SequenceManifest;
