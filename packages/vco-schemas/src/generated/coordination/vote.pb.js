/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["vco-schemas-coordination/vote"] || ($protobuf.roots["vco-schemas-coordination/vote"] = {});

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

        schemas.Vote = (function() {

            /**
             * Properties of a Vote.
             * @memberof vco.schemas
             * @interface IVote
             * @property {string|null} [schema] Vote schema
             * @property {Uint8Array|null} [pollCid] Vote pollCid
             * @property {number|null} [optionIndex] Vote optionIndex
             * @property {number|Long|null} [timestampMs] Vote timestampMs
             */

            /**
             * Constructs a new Vote.
             * @memberof vco.schemas
             * @classdesc Represents a Vote.
             * @implements IVote
             * @constructor
             * @param {vco.schemas.IVote=} [properties] Properties to set
             */
            function Vote(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Vote schema.
             * @member {string} schema
             * @memberof vco.schemas.Vote
             * @instance
             */
            Vote.prototype.schema = "";

            /**
             * Vote pollCid.
             * @member {Uint8Array} pollCid
             * @memberof vco.schemas.Vote
             * @instance
             */
            Vote.prototype.pollCid = $util.newBuffer([]);

            /**
             * Vote optionIndex.
             * @member {number} optionIndex
             * @memberof vco.schemas.Vote
             * @instance
             */
            Vote.prototype.optionIndex = 0;

            /**
             * Vote timestampMs.
             * @member {number|Long} timestampMs
             * @memberof vco.schemas.Vote
             * @instance
             */
            Vote.prototype.timestampMs = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Creates a new Vote instance using the specified properties.
             * @function create
             * @memberof vco.schemas.Vote
             * @static
             * @param {vco.schemas.IVote=} [properties] Properties to set
             * @returns {vco.schemas.Vote} Vote instance
             */
            Vote.create = function create(properties) {
                return new Vote(properties);
            };

            /**
             * Encodes the specified Vote message. Does not implicitly {@link vco.schemas.Vote.verify|verify} messages.
             * @function encode
             * @memberof vco.schemas.Vote
             * @static
             * @param {vco.schemas.IVote} message Vote message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Vote.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.schema != null && Object.hasOwnProperty.call(message, "schema"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.schema);
                if (message.pollCid != null && Object.hasOwnProperty.call(message, "pollCid"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.pollCid);
                if (message.optionIndex != null && Object.hasOwnProperty.call(message, "optionIndex"))
                    writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.optionIndex);
                if (message.timestampMs != null && Object.hasOwnProperty.call(message, "timestampMs"))
                    writer.uint32(/* id 4, wireType 0 =*/32).int64(message.timestampMs);
                return writer;
            };

            /**
             * Encodes the specified Vote message, length delimited. Does not implicitly {@link vco.schemas.Vote.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.schemas.Vote
             * @static
             * @param {vco.schemas.IVote} message Vote message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Vote.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Vote message from the specified reader or buffer.
             * @function decode
             * @memberof vco.schemas.Vote
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.schemas.Vote} Vote
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Vote.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.Vote();
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
                            message.pollCid = reader.bytes();
                            break;
                        }
                    case 3: {
                            message.optionIndex = reader.uint32();
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
             * Decodes a Vote message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.schemas.Vote
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.schemas.Vote} Vote
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Vote.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Vote message.
             * @function verify
             * @memberof vco.schemas.Vote
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Vote.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.schema != null && message.hasOwnProperty("schema"))
                    if (!$util.isString(message.schema))
                        return "schema: string expected";
                if (message.pollCid != null && message.hasOwnProperty("pollCid"))
                    if (!(message.pollCid && typeof message.pollCid.length === "number" || $util.isString(message.pollCid)))
                        return "pollCid: buffer expected";
                if (message.optionIndex != null && message.hasOwnProperty("optionIndex"))
                    if (!$util.isInteger(message.optionIndex))
                        return "optionIndex: integer expected";
                if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                    if (!$util.isInteger(message.timestampMs) && !(message.timestampMs && $util.isInteger(message.timestampMs.low) && $util.isInteger(message.timestampMs.high)))
                        return "timestampMs: integer|Long expected";
                return null;
            };

            /**
             * Creates a Vote message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.schemas.Vote
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.schemas.Vote} Vote
             */
            Vote.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.schemas.Vote)
                    return object;
                let message = new $root.vco.schemas.Vote();
                if (object.schema != null)
                    message.schema = String(object.schema);
                if (object.pollCid != null)
                    if (typeof object.pollCid === "string")
                        $util.base64.decode(object.pollCid, message.pollCid = $util.newBuffer($util.base64.length(object.pollCid)), 0);
                    else if (object.pollCid.length >= 0)
                        message.pollCid = object.pollCid;
                if (object.optionIndex != null)
                    message.optionIndex = object.optionIndex >>> 0;
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
             * Creates a plain object from a Vote message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.schemas.Vote
             * @static
             * @param {vco.schemas.Vote} message Vote
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Vote.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.schema = "";
                    if (options.bytes === String)
                        object.pollCid = "";
                    else {
                        object.pollCid = [];
                        if (options.bytes !== Array)
                            object.pollCid = $util.newBuffer(object.pollCid);
                    }
                    object.optionIndex = 0;
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.timestampMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.timestampMs = options.longs === String ? "0" : 0;
                }
                if (message.schema != null && message.hasOwnProperty("schema"))
                    object.schema = message.schema;
                if (message.pollCid != null && message.hasOwnProperty("pollCid"))
                    object.pollCid = options.bytes === String ? $util.base64.encode(message.pollCid, 0, message.pollCid.length) : options.bytes === Array ? Array.prototype.slice.call(message.pollCid) : message.pollCid;
                if (message.optionIndex != null && message.hasOwnProperty("optionIndex"))
                    object.optionIndex = message.optionIndex;
                if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                    if (typeof message.timestampMs === "number")
                        object.timestampMs = options.longs === String ? String(message.timestampMs) : message.timestampMs;
                    else
                        object.timestampMs = options.longs === String ? $util.Long.prototype.toString.call(message.timestampMs) : options.longs === Number ? new $util.LongBits(message.timestampMs.low >>> 0, message.timestampMs.high >>> 0).toNumber() : message.timestampMs;
                return object;
            };

            /**
             * Converts this Vote to JSON.
             * @function toJSON
             * @memberof vco.schemas.Vote
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Vote.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Vote
             * @function getTypeUrl
             * @memberof vco.schemas.Vote
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Vote.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.schemas.Vote";
            };

            return Vote;
        })();

        return schemas;
    })();

    return vco;
})();

export { $root as default };

export const Vote = vco.schemas.Vote;
