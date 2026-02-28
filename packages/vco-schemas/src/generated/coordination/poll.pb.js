/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["vco-schemas-coordination/poll"] || ($protobuf.roots["vco-schemas-coordination/poll"] = {});

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

        schemas.Poll = (function() {

            /**
             * Properties of a Poll.
             * @memberof vco.schemas
             * @interface IPoll
             * @property {string|null} [schema] Poll schema
             * @property {string|null} [question] Poll question
             * @property {Array.<string>|null} [options] Poll options
             * @property {number|Long|null} [closesAtMs] Poll closesAtMs
             * @property {number|Long|null} [timestampMs] Poll timestampMs
             */

            /**
             * Constructs a new Poll.
             * @memberof vco.schemas
             * @classdesc Represents a Poll.
             * @implements IPoll
             * @constructor
             * @param {vco.schemas.IPoll=} [properties] Properties to set
             */
            function Poll(properties) {
                this.options = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Poll schema.
             * @member {string} schema
             * @memberof vco.schemas.Poll
             * @instance
             */
            Poll.prototype.schema = "";

            /**
             * Poll question.
             * @member {string} question
             * @memberof vco.schemas.Poll
             * @instance
             */
            Poll.prototype.question = "";

            /**
             * Poll options.
             * @member {Array.<string>} options
             * @memberof vco.schemas.Poll
             * @instance
             */
            Poll.prototype.options = $util.emptyArray;

            /**
             * Poll closesAtMs.
             * @member {number|Long} closesAtMs
             * @memberof vco.schemas.Poll
             * @instance
             */
            Poll.prototype.closesAtMs = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Poll timestampMs.
             * @member {number|Long} timestampMs
             * @memberof vco.schemas.Poll
             * @instance
             */
            Poll.prototype.timestampMs = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Creates a new Poll instance using the specified properties.
             * @function create
             * @memberof vco.schemas.Poll
             * @static
             * @param {vco.schemas.IPoll=} [properties] Properties to set
             * @returns {vco.schemas.Poll} Poll instance
             */
            Poll.create = function create(properties) {
                return new Poll(properties);
            };

            /**
             * Encodes the specified Poll message. Does not implicitly {@link vco.schemas.Poll.verify|verify} messages.
             * @function encode
             * @memberof vco.schemas.Poll
             * @static
             * @param {vco.schemas.IPoll} message Poll message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Poll.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.schema != null && Object.hasOwnProperty.call(message, "schema"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.schema);
                if (message.question != null && Object.hasOwnProperty.call(message, "question"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.question);
                if (message.options != null && message.options.length)
                    for (let i = 0; i < message.options.length; ++i)
                        writer.uint32(/* id 3, wireType 2 =*/26).string(message.options[i]);
                if (message.closesAtMs != null && Object.hasOwnProperty.call(message, "closesAtMs"))
                    writer.uint32(/* id 4, wireType 0 =*/32).int64(message.closesAtMs);
                if (message.timestampMs != null && Object.hasOwnProperty.call(message, "timestampMs"))
                    writer.uint32(/* id 5, wireType 0 =*/40).int64(message.timestampMs);
                return writer;
            };

            /**
             * Encodes the specified Poll message, length delimited. Does not implicitly {@link vco.schemas.Poll.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.schemas.Poll
             * @static
             * @param {vco.schemas.IPoll} message Poll message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Poll.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Poll message from the specified reader or buffer.
             * @function decode
             * @memberof vco.schemas.Poll
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.schemas.Poll} Poll
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Poll.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.Poll();
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
                            message.question = reader.string();
                            break;
                        }
                    case 3: {
                            if (!(message.options && message.options.length))
                                message.options = [];
                            message.options.push(reader.string());
                            break;
                        }
                    case 4: {
                            message.closesAtMs = reader.int64();
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
             * Decodes a Poll message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.schemas.Poll
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.schemas.Poll} Poll
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Poll.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Poll message.
             * @function verify
             * @memberof vco.schemas.Poll
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Poll.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.schema != null && message.hasOwnProperty("schema"))
                    if (!$util.isString(message.schema))
                        return "schema: string expected";
                if (message.question != null && message.hasOwnProperty("question"))
                    if (!$util.isString(message.question))
                        return "question: string expected";
                if (message.options != null && message.hasOwnProperty("options")) {
                    if (!Array.isArray(message.options))
                        return "options: array expected";
                    for (let i = 0; i < message.options.length; ++i)
                        if (!$util.isString(message.options[i]))
                            return "options: string[] expected";
                }
                if (message.closesAtMs != null && message.hasOwnProperty("closesAtMs"))
                    if (!$util.isInteger(message.closesAtMs) && !(message.closesAtMs && $util.isInteger(message.closesAtMs.low) && $util.isInteger(message.closesAtMs.high)))
                        return "closesAtMs: integer|Long expected";
                if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                    if (!$util.isInteger(message.timestampMs) && !(message.timestampMs && $util.isInteger(message.timestampMs.low) && $util.isInteger(message.timestampMs.high)))
                        return "timestampMs: integer|Long expected";
                return null;
            };

            /**
             * Creates a Poll message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.schemas.Poll
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.schemas.Poll} Poll
             */
            Poll.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.schemas.Poll)
                    return object;
                let message = new $root.vco.schemas.Poll();
                if (object.schema != null)
                    message.schema = String(object.schema);
                if (object.question != null)
                    message.question = String(object.question);
                if (object.options) {
                    if (!Array.isArray(object.options))
                        throw TypeError(".vco.schemas.Poll.options: array expected");
                    message.options = [];
                    for (let i = 0; i < object.options.length; ++i)
                        message.options[i] = String(object.options[i]);
                }
                if (object.closesAtMs != null)
                    if ($util.Long)
                        (message.closesAtMs = $util.Long.fromValue(object.closesAtMs)).unsigned = false;
                    else if (typeof object.closesAtMs === "string")
                        message.closesAtMs = parseInt(object.closesAtMs, 10);
                    else if (typeof object.closesAtMs === "number")
                        message.closesAtMs = object.closesAtMs;
                    else if (typeof object.closesAtMs === "object")
                        message.closesAtMs = new $util.LongBits(object.closesAtMs.low >>> 0, object.closesAtMs.high >>> 0).toNumber();
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
             * Creates a plain object from a Poll message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.schemas.Poll
             * @static
             * @param {vco.schemas.Poll} message Poll
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Poll.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.options = [];
                if (options.defaults) {
                    object.schema = "";
                    object.question = "";
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.closesAtMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.closesAtMs = options.longs === String ? "0" : 0;
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.timestampMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.timestampMs = options.longs === String ? "0" : 0;
                }
                if (message.schema != null && message.hasOwnProperty("schema"))
                    object.schema = message.schema;
                if (message.question != null && message.hasOwnProperty("question"))
                    object.question = message.question;
                if (message.options && message.options.length) {
                    object.options = [];
                    for (let j = 0; j < message.options.length; ++j)
                        object.options[j] = message.options[j];
                }
                if (message.closesAtMs != null && message.hasOwnProperty("closesAtMs"))
                    if (typeof message.closesAtMs === "number")
                        object.closesAtMs = options.longs === String ? String(message.closesAtMs) : message.closesAtMs;
                    else
                        object.closesAtMs = options.longs === String ? $util.Long.prototype.toString.call(message.closesAtMs) : options.longs === Number ? new $util.LongBits(message.closesAtMs.low >>> 0, message.closesAtMs.high >>> 0).toNumber() : message.closesAtMs;
                if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                    if (typeof message.timestampMs === "number")
                        object.timestampMs = options.longs === String ? String(message.timestampMs) : message.timestampMs;
                    else
                        object.timestampMs = options.longs === String ? $util.Long.prototype.toString.call(message.timestampMs) : options.longs === Number ? new $util.LongBits(message.timestampMs.low >>> 0, message.timestampMs.high >>> 0).toNumber() : message.timestampMs;
                return object;
            };

            /**
             * Converts this Poll to JSON.
             * @function toJSON
             * @memberof vco.schemas.Poll
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Poll.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Poll
             * @function getTypeUrl
             * @memberof vco.schemas.Poll
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Poll.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.schemas.Poll";
            };

            return Poll;
        })();

        return schemas;
    })();

    return vco;
})();

export { $root as default };

export const Poll = vco.schemas.Poll;
