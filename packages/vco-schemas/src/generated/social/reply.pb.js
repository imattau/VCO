/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["vco-schemas-social/reply"] || ($protobuf.roots["vco-schemas-social/reply"] = {});

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

        schemas.Reply = (function() {

            /**
             * Properties of a Reply.
             * @memberof vco.schemas
             * @interface IReply
             * @property {string|null} [schema] Reply schema
             * @property {Uint8Array|null} [parentCid] Reply parentCid
             * @property {string|null} [content] Reply content
             * @property {Array.<Uint8Array>|null} [mediaCids] Reply mediaCids
             * @property {number|Long|null} [timestampMs] Reply timestampMs
             * @property {string|null} [channelId] Reply channelId
             */

            /**
             * Constructs a new Reply.
             * @memberof vco.schemas
             * @classdesc Represents a Reply.
             * @implements IReply
             * @constructor
             * @param {vco.schemas.IReply=} [properties] Properties to set
             */
            function Reply(properties) {
                this.mediaCids = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Reply schema.
             * @member {string} schema
             * @memberof vco.schemas.Reply
             * @instance
             */
            Reply.prototype.schema = "";

            /**
             * Reply parentCid.
             * @member {Uint8Array} parentCid
             * @memberof vco.schemas.Reply
             * @instance
             */
            Reply.prototype.parentCid = $util.newBuffer([]);

            /**
             * Reply content.
             * @member {string} content
             * @memberof vco.schemas.Reply
             * @instance
             */
            Reply.prototype.content = "";

            /**
             * Reply mediaCids.
             * @member {Array.<Uint8Array>} mediaCids
             * @memberof vco.schemas.Reply
             * @instance
             */
            Reply.prototype.mediaCids = $util.emptyArray;

            /**
             * Reply timestampMs.
             * @member {number|Long} timestampMs
             * @memberof vco.schemas.Reply
             * @instance
             */
            Reply.prototype.timestampMs = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Reply channelId.
             * @member {string} channelId
             * @memberof vco.schemas.Reply
             * @instance
             */
            Reply.prototype.channelId = "";

            /**
             * Creates a new Reply instance using the specified properties.
             * @function create
             * @memberof vco.schemas.Reply
             * @static
             * @param {vco.schemas.IReply=} [properties] Properties to set
             * @returns {vco.schemas.Reply} Reply instance
             */
            Reply.create = function create(properties) {
                return new Reply(properties);
            };

            /**
             * Encodes the specified Reply message. Does not implicitly {@link vco.schemas.Reply.verify|verify} messages.
             * @function encode
             * @memberof vco.schemas.Reply
             * @static
             * @param {vco.schemas.IReply} message Reply message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Reply.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.schema != null && Object.hasOwnProperty.call(message, "schema"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.schema);
                if (message.parentCid != null && Object.hasOwnProperty.call(message, "parentCid"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.parentCid);
                if (message.content != null && Object.hasOwnProperty.call(message, "content"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.content);
                if (message.mediaCids != null && message.mediaCids.length)
                    for (let i = 0; i < message.mediaCids.length; ++i)
                        writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.mediaCids[i]);
                if (message.timestampMs != null && Object.hasOwnProperty.call(message, "timestampMs"))
                    writer.uint32(/* id 5, wireType 0 =*/40).int64(message.timestampMs);
                if (message.channelId != null && Object.hasOwnProperty.call(message, "channelId"))
                    writer.uint32(/* id 6, wireType 2 =*/50).string(message.channelId);
                return writer;
            };

            /**
             * Encodes the specified Reply message, length delimited. Does not implicitly {@link vco.schemas.Reply.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.schemas.Reply
             * @static
             * @param {vco.schemas.IReply} message Reply message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Reply.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Reply message from the specified reader or buffer.
             * @function decode
             * @memberof vco.schemas.Reply
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.schemas.Reply} Reply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Reply.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.Reply();
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
                            message.parentCid = reader.bytes();
                            break;
                        }
                    case 3: {
                            message.content = reader.string();
                            break;
                        }
                    case 4: {
                            if (!(message.mediaCids && message.mediaCids.length))
                                message.mediaCids = [];
                            message.mediaCids.push(reader.bytes());
                            break;
                        }
                    case 5: {
                            message.timestampMs = reader.int64();
                            break;
                        }
                    case 6: {
                            message.channelId = reader.string();
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
             * Decodes a Reply message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.schemas.Reply
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.schemas.Reply} Reply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Reply.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Reply message.
             * @function verify
             * @memberof vco.schemas.Reply
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Reply.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.schema != null && message.hasOwnProperty("schema"))
                    if (!$util.isString(message.schema))
                        return "schema: string expected";
                if (message.parentCid != null && message.hasOwnProperty("parentCid"))
                    if (!(message.parentCid && typeof message.parentCid.length === "number" || $util.isString(message.parentCid)))
                        return "parentCid: buffer expected";
                if (message.content != null && message.hasOwnProperty("content"))
                    if (!$util.isString(message.content))
                        return "content: string expected";
                if (message.mediaCids != null && message.hasOwnProperty("mediaCids")) {
                    if (!Array.isArray(message.mediaCids))
                        return "mediaCids: array expected";
                    for (let i = 0; i < message.mediaCids.length; ++i)
                        if (!(message.mediaCids[i] && typeof message.mediaCids[i].length === "number" || $util.isString(message.mediaCids[i])))
                            return "mediaCids: buffer[] expected";
                }
                if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                    if (!$util.isInteger(message.timestampMs) && !(message.timestampMs && $util.isInteger(message.timestampMs.low) && $util.isInteger(message.timestampMs.high)))
                        return "timestampMs: integer|Long expected";
                if (message.channelId != null && message.hasOwnProperty("channelId"))
                    if (!$util.isString(message.channelId))
                        return "channelId: string expected";
                return null;
            };

            /**
             * Creates a Reply message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.schemas.Reply
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.schemas.Reply} Reply
             */
            Reply.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.schemas.Reply)
                    return object;
                let message = new $root.vco.schemas.Reply();
                if (object.schema != null)
                    message.schema = String(object.schema);
                if (object.parentCid != null)
                    if (typeof object.parentCid === "string")
                        $util.base64.decode(object.parentCid, message.parentCid = $util.newBuffer($util.base64.length(object.parentCid)), 0);
                    else if (object.parentCid.length >= 0)
                        message.parentCid = object.parentCid;
                if (object.content != null)
                    message.content = String(object.content);
                if (object.mediaCids) {
                    if (!Array.isArray(object.mediaCids))
                        throw TypeError(".vco.schemas.Reply.mediaCids: array expected");
                    message.mediaCids = [];
                    for (let i = 0; i < object.mediaCids.length; ++i)
                        if (typeof object.mediaCids[i] === "string")
                            $util.base64.decode(object.mediaCids[i], message.mediaCids[i] = $util.newBuffer($util.base64.length(object.mediaCids[i])), 0);
                        else if (object.mediaCids[i].length >= 0)
                            message.mediaCids[i] = object.mediaCids[i];
                }
                if (object.timestampMs != null)
                    if ($util.Long)
                        (message.timestampMs = $util.Long.fromValue(object.timestampMs)).unsigned = false;
                    else if (typeof object.timestampMs === "string")
                        message.timestampMs = parseInt(object.timestampMs, 10);
                    else if (typeof object.timestampMs === "number")
                        message.timestampMs = object.timestampMs;
                    else if (typeof object.timestampMs === "object")
                        message.timestampMs = new $util.LongBits(object.timestampMs.low >>> 0, object.timestampMs.high >>> 0).toNumber();
                if (object.channelId != null)
                    message.channelId = String(object.channelId);
                return message;
            };

            /**
             * Creates a plain object from a Reply message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.schemas.Reply
             * @static
             * @param {vco.schemas.Reply} message Reply
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Reply.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.mediaCids = [];
                if (options.defaults) {
                    object.schema = "";
                    if (options.bytes === String)
                        object.parentCid = "";
                    else {
                        object.parentCid = [];
                        if (options.bytes !== Array)
                            object.parentCid = $util.newBuffer(object.parentCid);
                    }
                    object.content = "";
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.timestampMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.timestampMs = options.longs === String ? "0" : 0;
                    object.channelId = "";
                }
                if (message.schema != null && message.hasOwnProperty("schema"))
                    object.schema = message.schema;
                if (message.parentCid != null && message.hasOwnProperty("parentCid"))
                    object.parentCid = options.bytes === String ? $util.base64.encode(message.parentCid, 0, message.parentCid.length) : options.bytes === Array ? Array.prototype.slice.call(message.parentCid) : message.parentCid;
                if (message.content != null && message.hasOwnProperty("content"))
                    object.content = message.content;
                if (message.mediaCids && message.mediaCids.length) {
                    object.mediaCids = [];
                    for (let j = 0; j < message.mediaCids.length; ++j)
                        object.mediaCids[j] = options.bytes === String ? $util.base64.encode(message.mediaCids[j], 0, message.mediaCids[j].length) : options.bytes === Array ? Array.prototype.slice.call(message.mediaCids[j]) : message.mediaCids[j];
                }
                if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                    if (typeof message.timestampMs === "number")
                        object.timestampMs = options.longs === String ? String(message.timestampMs) : message.timestampMs;
                    else
                        object.timestampMs = options.longs === String ? $util.Long.prototype.toString.call(message.timestampMs) : options.longs === Number ? new $util.LongBits(message.timestampMs.low >>> 0, message.timestampMs.high >>> 0).toNumber() : message.timestampMs;
                if (message.channelId != null && message.hasOwnProperty("channelId"))
                    object.channelId = message.channelId;
                return object;
            };

            /**
             * Converts this Reply to JSON.
             * @function toJSON
             * @memberof vco.schemas.Reply
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Reply.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Reply
             * @function getTypeUrl
             * @memberof vco.schemas.Reply
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Reply.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.schemas.Reply";
            };

            return Reply;
        })();

        return schemas;
    })();

    return vco;
})();

export { $root as default };

export const Reply = vco.schemas.Reply;
