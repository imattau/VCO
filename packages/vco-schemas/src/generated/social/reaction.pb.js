/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["vco-schemas-social/reaction"] || ($protobuf.roots["vco-schemas-social/reaction"] = {});

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

        schemas.Reaction = (function() {

            /**
             * Properties of a Reaction.
             * @memberof vco.schemas
             * @interface IReaction
             * @property {string|null} [schema] Reaction schema
             * @property {Uint8Array|null} [targetCid] Reaction targetCid
             * @property {string|null} [emoji] Reaction emoji
             * @property {number|Long|null} [timestampMs] Reaction timestampMs
             */

            /**
             * Constructs a new Reaction.
             * @memberof vco.schemas
             * @classdesc Represents a Reaction.
             * @implements IReaction
             * @constructor
             * @param {vco.schemas.IReaction=} [properties] Properties to set
             */
            function Reaction(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Reaction schema.
             * @member {string} schema
             * @memberof vco.schemas.Reaction
             * @instance
             */
            Reaction.prototype.schema = "";

            /**
             * Reaction targetCid.
             * @member {Uint8Array} targetCid
             * @memberof vco.schemas.Reaction
             * @instance
             */
            Reaction.prototype.targetCid = $util.newBuffer([]);

            /**
             * Reaction emoji.
             * @member {string} emoji
             * @memberof vco.schemas.Reaction
             * @instance
             */
            Reaction.prototype.emoji = "";

            /**
             * Reaction timestampMs.
             * @member {number|Long} timestampMs
             * @memberof vco.schemas.Reaction
             * @instance
             */
            Reaction.prototype.timestampMs = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Creates a new Reaction instance using the specified properties.
             * @function create
             * @memberof vco.schemas.Reaction
             * @static
             * @param {vco.schemas.IReaction=} [properties] Properties to set
             * @returns {vco.schemas.Reaction} Reaction instance
             */
            Reaction.create = function create(properties) {
                return new Reaction(properties);
            };

            /**
             * Encodes the specified Reaction message. Does not implicitly {@link vco.schemas.Reaction.verify|verify} messages.
             * @function encode
             * @memberof vco.schemas.Reaction
             * @static
             * @param {vco.schemas.IReaction} message Reaction message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Reaction.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.schema != null && Object.hasOwnProperty.call(message, "schema"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.schema);
                if (message.targetCid != null && Object.hasOwnProperty.call(message, "targetCid"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.targetCid);
                if (message.emoji != null && Object.hasOwnProperty.call(message, "emoji"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.emoji);
                if (message.timestampMs != null && Object.hasOwnProperty.call(message, "timestampMs"))
                    writer.uint32(/* id 4, wireType 0 =*/32).int64(message.timestampMs);
                return writer;
            };

            /**
             * Encodes the specified Reaction message, length delimited. Does not implicitly {@link vco.schemas.Reaction.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.schemas.Reaction
             * @static
             * @param {vco.schemas.IReaction} message Reaction message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Reaction.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Reaction message from the specified reader or buffer.
             * @function decode
             * @memberof vco.schemas.Reaction
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.schemas.Reaction} Reaction
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Reaction.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.Reaction();
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
                            message.targetCid = reader.bytes();
                            break;
                        }
                    case 3: {
                            message.emoji = reader.string();
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
             * Decodes a Reaction message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.schemas.Reaction
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.schemas.Reaction} Reaction
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Reaction.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Reaction message.
             * @function verify
             * @memberof vco.schemas.Reaction
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Reaction.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.schema != null && message.hasOwnProperty("schema"))
                    if (!$util.isString(message.schema))
                        return "schema: string expected";
                if (message.targetCid != null && message.hasOwnProperty("targetCid"))
                    if (!(message.targetCid && typeof message.targetCid.length === "number" || $util.isString(message.targetCid)))
                        return "targetCid: buffer expected";
                if (message.emoji != null && message.hasOwnProperty("emoji"))
                    if (!$util.isString(message.emoji))
                        return "emoji: string expected";
                if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                    if (!$util.isInteger(message.timestampMs) && !(message.timestampMs && $util.isInteger(message.timestampMs.low) && $util.isInteger(message.timestampMs.high)))
                        return "timestampMs: integer|Long expected";
                return null;
            };

            /**
             * Creates a Reaction message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.schemas.Reaction
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.schemas.Reaction} Reaction
             */
            Reaction.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.schemas.Reaction)
                    return object;
                let message = new $root.vco.schemas.Reaction();
                if (object.schema != null)
                    message.schema = String(object.schema);
                if (object.targetCid != null)
                    if (typeof object.targetCid === "string")
                        $util.base64.decode(object.targetCid, message.targetCid = $util.newBuffer($util.base64.length(object.targetCid)), 0);
                    else if (object.targetCid.length >= 0)
                        message.targetCid = object.targetCid;
                if (object.emoji != null)
                    message.emoji = String(object.emoji);
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
             * Creates a plain object from a Reaction message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.schemas.Reaction
             * @static
             * @param {vco.schemas.Reaction} message Reaction
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Reaction.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.schema = "";
                    if (options.bytes === String)
                        object.targetCid = "";
                    else {
                        object.targetCid = [];
                        if (options.bytes !== Array)
                            object.targetCid = $util.newBuffer(object.targetCid);
                    }
                    object.emoji = "";
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.timestampMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.timestampMs = options.longs === String ? "0" : 0;
                }
                if (message.schema != null && message.hasOwnProperty("schema"))
                    object.schema = message.schema;
                if (message.targetCid != null && message.hasOwnProperty("targetCid"))
                    object.targetCid = options.bytes === String ? $util.base64.encode(message.targetCid, 0, message.targetCid.length) : options.bytes === Array ? Array.prototype.slice.call(message.targetCid) : message.targetCid;
                if (message.emoji != null && message.hasOwnProperty("emoji"))
                    object.emoji = message.emoji;
                if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                    if (typeof message.timestampMs === "number")
                        object.timestampMs = options.longs === String ? String(message.timestampMs) : message.timestampMs;
                    else
                        object.timestampMs = options.longs === String ? $util.Long.prototype.toString.call(message.timestampMs) : options.longs === Number ? new $util.LongBits(message.timestampMs.low >>> 0, message.timestampMs.high >>> 0).toNumber() : message.timestampMs;
                return object;
            };

            /**
             * Converts this Reaction to JSON.
             * @function toJSON
             * @memberof vco.schemas.Reaction
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Reaction.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Reaction
             * @function getTypeUrl
             * @memberof vco.schemas.Reaction
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Reaction.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.schemas.Reaction";
            };

            return Reaction;
        })();

        return schemas;
    })();

    return vco;
})();

export { $root as default };

export const Reaction = vco.schemas.Reaction;
