/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["vco-schemas-social/follow"] || ($protobuf.roots["vco-schemas-social/follow"] = {});

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

        schemas.Follow = (function() {

            /**
             * Properties of a Follow.
             * @memberof vco.schemas
             * @interface IFollow
             * @property {string|null} [schema] Follow schema
             * @property {Uint8Array|null} [subjectKey] Follow subjectKey
             * @property {string|null} [action] Follow action
             * @property {number|Long|null} [timestampMs] Follow timestampMs
             */

            /**
             * Constructs a new Follow.
             * @memberof vco.schemas
             * @classdesc Represents a Follow.
             * @implements IFollow
             * @constructor
             * @param {vco.schemas.IFollow=} [properties] Properties to set
             */
            function Follow(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Follow schema.
             * @member {string} schema
             * @memberof vco.schemas.Follow
             * @instance
             */
            Follow.prototype.schema = "";

            /**
             * Follow subjectKey.
             * @member {Uint8Array} subjectKey
             * @memberof vco.schemas.Follow
             * @instance
             */
            Follow.prototype.subjectKey = $util.newBuffer([]);

            /**
             * Follow action.
             * @member {string} action
             * @memberof vco.schemas.Follow
             * @instance
             */
            Follow.prototype.action = "";

            /**
             * Follow timestampMs.
             * @member {number|Long} timestampMs
             * @memberof vco.schemas.Follow
             * @instance
             */
            Follow.prototype.timestampMs = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Creates a new Follow instance using the specified properties.
             * @function create
             * @memberof vco.schemas.Follow
             * @static
             * @param {vco.schemas.IFollow=} [properties] Properties to set
             * @returns {vco.schemas.Follow} Follow instance
             */
            Follow.create = function create(properties) {
                return new Follow(properties);
            };

            /**
             * Encodes the specified Follow message. Does not implicitly {@link vco.schemas.Follow.verify|verify} messages.
             * @function encode
             * @memberof vco.schemas.Follow
             * @static
             * @param {vco.schemas.IFollow} message Follow message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Follow.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.schema != null && Object.hasOwnProperty.call(message, "schema"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.schema);
                if (message.subjectKey != null && Object.hasOwnProperty.call(message, "subjectKey"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.subjectKey);
                if (message.action != null && Object.hasOwnProperty.call(message, "action"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.action);
                if (message.timestampMs != null && Object.hasOwnProperty.call(message, "timestampMs"))
                    writer.uint32(/* id 4, wireType 0 =*/32).int64(message.timestampMs);
                return writer;
            };

            /**
             * Encodes the specified Follow message, length delimited. Does not implicitly {@link vco.schemas.Follow.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.schemas.Follow
             * @static
             * @param {vco.schemas.IFollow} message Follow message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Follow.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Follow message from the specified reader or buffer.
             * @function decode
             * @memberof vco.schemas.Follow
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.schemas.Follow} Follow
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Follow.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.Follow();
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
                            message.subjectKey = reader.bytes();
                            break;
                        }
                    case 3: {
                            message.action = reader.string();
                            break;
                        }
                    case 4: {
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
             * Decodes a Follow message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.schemas.Follow
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.schemas.Follow} Follow
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Follow.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Follow message.
             * @function verify
             * @memberof vco.schemas.Follow
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Follow.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.schema != null && message.hasOwnProperty("schema"))
                    if (!$util.isString(message.schema))
                        return "schema: string expected";
                if (message.subjectKey != null && message.hasOwnProperty("subjectKey"))
                    if (!(message.subjectKey && typeof message.subjectKey.length === "number" || $util.isString(message.subjectKey)))
                        return "subjectKey: buffer expected";
                if (message.action != null && message.hasOwnProperty("action"))
                    if (!$util.isString(message.action))
                        return "action: string expected";
                if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                    if (!$util.isInteger(message.timestampMs) && !(message.timestampMs && $util.isInteger(message.timestampMs.low) && $util.isInteger(message.timestampMs.high)))
                        return "timestampMs: integer|Long expected";
                return null;
            };

            /**
             * Creates a Follow message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.schemas.Follow
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.schemas.Follow} Follow
             */
            Follow.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.schemas.Follow)
                    return object;
                let message = new $root.vco.schemas.Follow();
                if (object.schema != null)
                    message.schema = String(object.schema);
                if (object.subjectKey != null)
                    if (typeof object.subjectKey === "string")
                        $util.base64.decode(object.subjectKey, message.subjectKey = $util.newBuffer($util.base64.length(object.subjectKey)), 0);
                    else if (object.subjectKey.length >= 0)
                        message.subjectKey = object.subjectKey;
                if (object.action != null)
                    message.action = String(object.action);
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
             * Creates a plain object from a Follow message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.schemas.Follow
             * @static
             * @param {vco.schemas.Follow} message Follow
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Follow.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.schema = "";
                    if (options.bytes === String)
                        object.subjectKey = "";
                    else {
                        object.subjectKey = [];
                        if (options.bytes !== Array)
                            object.subjectKey = $util.newBuffer(object.subjectKey);
                    }
                    object.action = "";
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.timestampMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.timestampMs = options.longs === String ? "0" : 0;
                }
                if (message.schema != null && message.hasOwnProperty("schema"))
                    object.schema = message.schema;
                if (message.subjectKey != null && message.hasOwnProperty("subjectKey"))
                    object.subjectKey = options.bytes === String ? $util.base64.encode(message.subjectKey, 0, message.subjectKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.subjectKey) : message.subjectKey;
                if (message.action != null && message.hasOwnProperty("action"))
                    object.action = message.action;
                if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                    if (typeof message.timestampMs === "number")
                        object.timestampMs = options.longs === String ? String(message.timestampMs) : message.timestampMs;
                    else
                        object.timestampMs = options.longs === String ? $util.Long.prototype.toString.call(message.timestampMs) : options.longs === Number ? new $util.LongBits(message.timestampMs.low >>> 0, message.timestampMs.high >>> 0).toNumber() : message.timestampMs;
                return object;
            };

            /**
             * Converts this Follow to JSON.
             * @function toJSON
             * @memberof vco.schemas.Follow
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Follow.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Follow
             * @function getTypeUrl
             * @memberof vco.schemas.Follow
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Follow.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.schemas.Follow";
            };

            return Follow;
        })();

        return schemas;
    })();

    return vco;
})();

export { $root as default };

export const Follow = vco.schemas.Follow;
