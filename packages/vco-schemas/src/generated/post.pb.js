/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["vco-schemas-post"] || ($protobuf.roots["vco-schemas-post"] = {});

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

        schemas.Post = (function() {

            /**
             * Properties of a Post.
             * @memberof vco.schemas
             * @interface IPost
             * @property {string|null} [schema] Post schema
             * @property {string|null} [content] Post content
             * @property {Array.<Uint8Array>|null} [mediaCids] Post mediaCids
             * @property {number|Long|null} [timestampMs] Post timestampMs
             * @property {string|null} [channelId] Post channelId
             */

            /**
             * Constructs a new Post.
             * @memberof vco.schemas
             * @classdesc Represents a Post.
             * @implements IPost
             * @constructor
             * @param {vco.schemas.IPost=} [properties] Properties to set
             */
            function Post(properties) {
                this.mediaCids = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Post schema.
             * @member {string} schema
             * @memberof vco.schemas.Post
             * @instance
             */
            Post.prototype.schema = "";

            /**
             * Post content.
             * @member {string} content
             * @memberof vco.schemas.Post
             * @instance
             */
            Post.prototype.content = "";

            /**
             * Post mediaCids.
             * @member {Array.<Uint8Array>} mediaCids
             * @memberof vco.schemas.Post
             * @instance
             */
            Post.prototype.mediaCids = $util.emptyArray;

            /**
             * Post timestampMs.
             * @member {number|Long} timestampMs
             * @memberof vco.schemas.Post
             * @instance
             */
            Post.prototype.timestampMs = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Post channelId.
             * @member {string} channelId
             * @memberof vco.schemas.Post
             * @instance
             */
            Post.prototype.channelId = "";

            /**
             * Creates a new Post instance using the specified properties.
             * @function create
             * @memberof vco.schemas.Post
             * @static
             * @param {vco.schemas.IPost=} [properties] Properties to set
             * @returns {vco.schemas.Post} Post instance
             */
            Post.create = function create(properties) {
                return new Post(properties);
            };

            /**
             * Encodes the specified Post message. Does not implicitly {@link vco.schemas.Post.verify|verify} messages.
             * @function encode
             * @memberof vco.schemas.Post
             * @static
             * @param {vco.schemas.IPost} message Post message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Post.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.schema != null && Object.hasOwnProperty.call(message, "schema"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.schema);
                if (message.content != null && Object.hasOwnProperty.call(message, "content"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.content);
                if (message.mediaCids != null && message.mediaCids.length)
                    for (let i = 0; i < message.mediaCids.length; ++i)
                        writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.mediaCids[i]);
                if (message.timestampMs != null && Object.hasOwnProperty.call(message, "timestampMs"))
                    writer.uint32(/* id 4, wireType 0 =*/32).int64(message.timestampMs);
                if (message.channelId != null && Object.hasOwnProperty.call(message, "channelId"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.channelId);
                return writer;
            };

            /**
             * Encodes the specified Post message, length delimited. Does not implicitly {@link vco.schemas.Post.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.schemas.Post
             * @static
             * @param {vco.schemas.IPost} message Post message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Post.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Post message from the specified reader or buffer.
             * @function decode
             * @memberof vco.schemas.Post
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.schemas.Post} Post
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Post.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.Post();
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
                            message.content = reader.string();
                            break;
                        }
                    case 3: {
                            if (!(message.mediaCids && message.mediaCids.length))
                                message.mediaCids = [];
                            message.mediaCids.push(reader.bytes());
                            break;
                        }
                    case 4: {
                            message.timestampMs = reader.int64();
                            break;
                        }
                    case 5: {
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
             * Decodes a Post message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.schemas.Post
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.schemas.Post} Post
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Post.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Post message.
             * @function verify
             * @memberof vco.schemas.Post
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Post.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.schema != null && message.hasOwnProperty("schema"))
                    if (!$util.isString(message.schema))
                        return "schema: string expected";
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
             * Creates a Post message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.schemas.Post
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.schemas.Post} Post
             */
            Post.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.schemas.Post)
                    return object;
                let message = new $root.vco.schemas.Post();
                if (object.schema != null)
                    message.schema = String(object.schema);
                if (object.content != null)
                    message.content = String(object.content);
                if (object.mediaCids) {
                    if (!Array.isArray(object.mediaCids))
                        throw TypeError(".vco.schemas.Post.mediaCids: array expected");
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
             * Creates a plain object from a Post message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.schemas.Post
             * @static
             * @param {vco.schemas.Post} message Post
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Post.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.mediaCids = [];
                if (options.defaults) {
                    object.schema = "";
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
             * Converts this Post to JSON.
             * @function toJSON
             * @memberof vco.schemas.Post
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Post.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Post
             * @function getTypeUrl
             * @memberof vco.schemas.Post
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Post.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.schemas.Post";
            };

            return Post;
        })();

        return schemas;
    })();

    return vco;
})();

export { $root as default };

export const Post = vco.schemas.Post;
