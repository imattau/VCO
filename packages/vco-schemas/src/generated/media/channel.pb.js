/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["vco-schemas-media/channel"] || ($protobuf.roots["vco-schemas-media/channel"] = {});

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

        schemas.MediaChannel = (function() {

            /**
             * Properties of a MediaChannel.
             * @memberof vco.schemas
             * @interface IMediaChannel
             * @property {string|null} [schema] MediaChannel schema
             * @property {string|null} [name] MediaChannel name
             * @property {string|null} [author] MediaChannel author
             * @property {string|null} [bio] MediaChannel bio
             * @property {Uint8Array|null} [avatarCid] MediaChannel avatarCid
             * @property {Uint8Array|null} [latestItemCid] MediaChannel latestItemCid
             * @property {Array.<string>|null} [categories] MediaChannel categories
             * @property {boolean|null} [isLive] MediaChannel isLive
             */

            /**
             * Constructs a new MediaChannel.
             * @memberof vco.schemas
             * @classdesc Represents a MediaChannel.
             * @implements IMediaChannel
             * @constructor
             * @param {vco.schemas.IMediaChannel=} [properties] Properties to set
             */
            function MediaChannel(properties) {
                this.categories = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * MediaChannel schema.
             * @member {string} schema
             * @memberof vco.schemas.MediaChannel
             * @instance
             */
            MediaChannel.prototype.schema = "";

            /**
             * MediaChannel name.
             * @member {string} name
             * @memberof vco.schemas.MediaChannel
             * @instance
             */
            MediaChannel.prototype.name = "";

            /**
             * MediaChannel author.
             * @member {string} author
             * @memberof vco.schemas.MediaChannel
             * @instance
             */
            MediaChannel.prototype.author = "";

            /**
             * MediaChannel bio.
             * @member {string} bio
             * @memberof vco.schemas.MediaChannel
             * @instance
             */
            MediaChannel.prototype.bio = "";

            /**
             * MediaChannel avatarCid.
             * @member {Uint8Array} avatarCid
             * @memberof vco.schemas.MediaChannel
             * @instance
             */
            MediaChannel.prototype.avatarCid = $util.newBuffer([]);

            /**
             * MediaChannel latestItemCid.
             * @member {Uint8Array} latestItemCid
             * @memberof vco.schemas.MediaChannel
             * @instance
             */
            MediaChannel.prototype.latestItemCid = $util.newBuffer([]);

            /**
             * MediaChannel categories.
             * @member {Array.<string>} categories
             * @memberof vco.schemas.MediaChannel
             * @instance
             */
            MediaChannel.prototype.categories = $util.emptyArray;

            /**
             * MediaChannel isLive.
             * @member {boolean} isLive
             * @memberof vco.schemas.MediaChannel
             * @instance
             */
            MediaChannel.prototype.isLive = false;

            /**
             * Creates a new MediaChannel instance using the specified properties.
             * @function create
             * @memberof vco.schemas.MediaChannel
             * @static
             * @param {vco.schemas.IMediaChannel=} [properties] Properties to set
             * @returns {vco.schemas.MediaChannel} MediaChannel instance
             */
            MediaChannel.create = function create(properties) {
                return new MediaChannel(properties);
            };

            /**
             * Encodes the specified MediaChannel message. Does not implicitly {@link vco.schemas.MediaChannel.verify|verify} messages.
             * @function encode
             * @memberof vco.schemas.MediaChannel
             * @static
             * @param {vco.schemas.IMediaChannel} message MediaChannel message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            MediaChannel.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.schema != null && Object.hasOwnProperty.call(message, "schema"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.schema);
                if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
                if (message.author != null && Object.hasOwnProperty.call(message, "author"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.author);
                if (message.bio != null && Object.hasOwnProperty.call(message, "bio"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.bio);
                if (message.avatarCid != null && Object.hasOwnProperty.call(message, "avatarCid"))
                    writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.avatarCid);
                if (message.latestItemCid != null && Object.hasOwnProperty.call(message, "latestItemCid"))
                    writer.uint32(/* id 6, wireType 2 =*/50).bytes(message.latestItemCid);
                if (message.categories != null && message.categories.length)
                    for (let i = 0; i < message.categories.length; ++i)
                        writer.uint32(/* id 7, wireType 2 =*/58).string(message.categories[i]);
                if (message.isLive != null && Object.hasOwnProperty.call(message, "isLive"))
                    writer.uint32(/* id 8, wireType 0 =*/64).bool(message.isLive);
                return writer;
            };

            /**
             * Encodes the specified MediaChannel message, length delimited. Does not implicitly {@link vco.schemas.MediaChannel.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.schemas.MediaChannel
             * @static
             * @param {vco.schemas.IMediaChannel} message MediaChannel message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            MediaChannel.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a MediaChannel message from the specified reader or buffer.
             * @function decode
             * @memberof vco.schemas.MediaChannel
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.schemas.MediaChannel} MediaChannel
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            MediaChannel.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.MediaChannel();
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
                            message.author = reader.string();
                            break;
                        }
                    case 4: {
                            message.bio = reader.string();
                            break;
                        }
                    case 5: {
                            message.avatarCid = reader.bytes();
                            break;
                        }
                    case 6: {
                            message.latestItemCid = reader.bytes();
                            break;
                        }
                    case 7: {
                            if (!(message.categories && message.categories.length))
                                message.categories = [];
                            message.categories.push(reader.string());
                            break;
                        }
                    case 8: {
                            message.isLive = reader.bool();
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
             * Decodes a MediaChannel message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.schemas.MediaChannel
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.schemas.MediaChannel} MediaChannel
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            MediaChannel.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a MediaChannel message.
             * @function verify
             * @memberof vco.schemas.MediaChannel
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            MediaChannel.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.schema != null && message.hasOwnProperty("schema"))
                    if (!$util.isString(message.schema))
                        return "schema: string expected";
                if (message.name != null && message.hasOwnProperty("name"))
                    if (!$util.isString(message.name))
                        return "name: string expected";
                if (message.author != null && message.hasOwnProperty("author"))
                    if (!$util.isString(message.author))
                        return "author: string expected";
                if (message.bio != null && message.hasOwnProperty("bio"))
                    if (!$util.isString(message.bio))
                        return "bio: string expected";
                if (message.avatarCid != null && message.hasOwnProperty("avatarCid"))
                    if (!(message.avatarCid && typeof message.avatarCid.length === "number" || $util.isString(message.avatarCid)))
                        return "avatarCid: buffer expected";
                if (message.latestItemCid != null && message.hasOwnProperty("latestItemCid"))
                    if (!(message.latestItemCid && typeof message.latestItemCid.length === "number" || $util.isString(message.latestItemCid)))
                        return "latestItemCid: buffer expected";
                if (message.categories != null && message.hasOwnProperty("categories")) {
                    if (!Array.isArray(message.categories))
                        return "categories: array expected";
                    for (let i = 0; i < message.categories.length; ++i)
                        if (!$util.isString(message.categories[i]))
                            return "categories: string[] expected";
                }
                if (message.isLive != null && message.hasOwnProperty("isLive"))
                    if (typeof message.isLive !== "boolean")
                        return "isLive: boolean expected";
                return null;
            };

            /**
             * Creates a MediaChannel message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.schemas.MediaChannel
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.schemas.MediaChannel} MediaChannel
             */
            MediaChannel.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.schemas.MediaChannel)
                    return object;
                let message = new $root.vco.schemas.MediaChannel();
                if (object.schema != null)
                    message.schema = String(object.schema);
                if (object.name != null)
                    message.name = String(object.name);
                if (object.author != null)
                    message.author = String(object.author);
                if (object.bio != null)
                    message.bio = String(object.bio);
                if (object.avatarCid != null)
                    if (typeof object.avatarCid === "string")
                        $util.base64.decode(object.avatarCid, message.avatarCid = $util.newBuffer($util.base64.length(object.avatarCid)), 0);
                    else if (object.avatarCid.length >= 0)
                        message.avatarCid = object.avatarCid;
                if (object.latestItemCid != null)
                    if (typeof object.latestItemCid === "string")
                        $util.base64.decode(object.latestItemCid, message.latestItemCid = $util.newBuffer($util.base64.length(object.latestItemCid)), 0);
                    else if (object.latestItemCid.length >= 0)
                        message.latestItemCid = object.latestItemCid;
                if (object.categories) {
                    if (!Array.isArray(object.categories))
                        throw TypeError(".vco.schemas.MediaChannel.categories: array expected");
                    message.categories = [];
                    for (let i = 0; i < object.categories.length; ++i)
                        message.categories[i] = String(object.categories[i]);
                }
                if (object.isLive != null)
                    message.isLive = Boolean(object.isLive);
                return message;
            };

            /**
             * Creates a plain object from a MediaChannel message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.schemas.MediaChannel
             * @static
             * @param {vco.schemas.MediaChannel} message MediaChannel
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            MediaChannel.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.categories = [];
                if (options.defaults) {
                    object.schema = "";
                    object.name = "";
                    object.author = "";
                    object.bio = "";
                    if (options.bytes === String)
                        object.avatarCid = "";
                    else {
                        object.avatarCid = [];
                        if (options.bytes !== Array)
                            object.avatarCid = $util.newBuffer(object.avatarCid);
                    }
                    if (options.bytes === String)
                        object.latestItemCid = "";
                    else {
                        object.latestItemCid = [];
                        if (options.bytes !== Array)
                            object.latestItemCid = $util.newBuffer(object.latestItemCid);
                    }
                    object.isLive = false;
                }
                if (message.schema != null && message.hasOwnProperty("schema"))
                    object.schema = message.schema;
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.author != null && message.hasOwnProperty("author"))
                    object.author = message.author;
                if (message.bio != null && message.hasOwnProperty("bio"))
                    object.bio = message.bio;
                if (message.avatarCid != null && message.hasOwnProperty("avatarCid"))
                    object.avatarCid = options.bytes === String ? $util.base64.encode(message.avatarCid, 0, message.avatarCid.length) : options.bytes === Array ? Array.prototype.slice.call(message.avatarCid) : message.avatarCid;
                if (message.latestItemCid != null && message.hasOwnProperty("latestItemCid"))
                    object.latestItemCid = options.bytes === String ? $util.base64.encode(message.latestItemCid, 0, message.latestItemCid.length) : options.bytes === Array ? Array.prototype.slice.call(message.latestItemCid) : message.latestItemCid;
                if (message.categories && message.categories.length) {
                    object.categories = [];
                    for (let j = 0; j < message.categories.length; ++j)
                        object.categories[j] = message.categories[j];
                }
                if (message.isLive != null && message.hasOwnProperty("isLive"))
                    object.isLive = message.isLive;
                return object;
            };

            /**
             * Converts this MediaChannel to JSON.
             * @function toJSON
             * @memberof vco.schemas.MediaChannel
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            MediaChannel.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for MediaChannel
             * @function getTypeUrl
             * @memberof vco.schemas.MediaChannel
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            MediaChannel.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.schemas.MediaChannel";
            };

            return MediaChannel;
        })();

        return schemas;
    })();

    return vco;
})();

export { $root as default };

export const MediaChannel = vco.schemas.MediaChannel;
