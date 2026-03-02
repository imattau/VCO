/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["vco-schemas-social/direct_message"] || ($protobuf.roots["vco-schemas-social/direct_message"] = {});

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

        schemas.DirectMessage = (function() {

            /**
             * Properties of a DirectMessage.
             * @memberof vco.schemas
             * @interface IDirectMessage
             * @property {string|null} [schema] DirectMessage schema
             * @property {Uint8Array|null} [recipientCid] DirectMessage recipientCid
             * @property {Uint8Array|null} [senderCid] DirectMessage senderCid
             * @property {Uint8Array|null} [ephemeralPubkey] DirectMessage ephemeralPubkey
             * @property {Uint8Array|null} [nonce] DirectMessage nonce
             * @property {Uint8Array|null} [encryptedPayload] DirectMessage encryptedPayload
             * @property {number|Long|null} [timestampMs] DirectMessage timestampMs
             */

            /**
             * Constructs a new DirectMessage.
             * @memberof vco.schemas
             * @classdesc Represents a DirectMessage.
             * @implements IDirectMessage
             * @constructor
             * @param {vco.schemas.IDirectMessage=} [properties] Properties to set
             */
            function DirectMessage(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * DirectMessage schema.
             * @member {string} schema
             * @memberof vco.schemas.DirectMessage
             * @instance
             */
            DirectMessage.prototype.schema = "";

            /**
             * DirectMessage recipientCid.
             * @member {Uint8Array} recipientCid
             * @memberof vco.schemas.DirectMessage
             * @instance
             */
            DirectMessage.prototype.recipientCid = $util.newBuffer([]);

            /**
             * DirectMessage senderCid.
             * @member {Uint8Array} senderCid
             * @memberof vco.schemas.DirectMessage
             * @instance
             */
            DirectMessage.prototype.senderCid = $util.newBuffer([]);

            /**
             * DirectMessage ephemeralPubkey.
             * @member {Uint8Array} ephemeralPubkey
             * @memberof vco.schemas.DirectMessage
             * @instance
             */
            DirectMessage.prototype.ephemeralPubkey = $util.newBuffer([]);

            /**
             * DirectMessage nonce.
             * @member {Uint8Array} nonce
             * @memberof vco.schemas.DirectMessage
             * @instance
             */
            DirectMessage.prototype.nonce = $util.newBuffer([]);

            /**
             * DirectMessage encryptedPayload.
             * @member {Uint8Array} encryptedPayload
             * @memberof vco.schemas.DirectMessage
             * @instance
             */
            DirectMessage.prototype.encryptedPayload = $util.newBuffer([]);

            /**
             * DirectMessage timestampMs.
             * @member {number|Long} timestampMs
             * @memberof vco.schemas.DirectMessage
             * @instance
             */
            DirectMessage.prototype.timestampMs = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Creates a new DirectMessage instance using the specified properties.
             * @function create
             * @memberof vco.schemas.DirectMessage
             * @static
             * @param {vco.schemas.IDirectMessage=} [properties] Properties to set
             * @returns {vco.schemas.DirectMessage} DirectMessage instance
             */
            DirectMessage.create = function create(properties) {
                return new DirectMessage(properties);
            };

            /**
             * Encodes the specified DirectMessage message. Does not implicitly {@link vco.schemas.DirectMessage.verify|verify} messages.
             * @function encode
             * @memberof vco.schemas.DirectMessage
             * @static
             * @param {vco.schemas.IDirectMessage} message DirectMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DirectMessage.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.schema != null && Object.hasOwnProperty.call(message, "schema"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.schema);
                if (message.recipientCid != null && Object.hasOwnProperty.call(message, "recipientCid"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.recipientCid);
                if (message.senderCid != null && Object.hasOwnProperty.call(message, "senderCid"))
                    writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.senderCid);
                if (message.ephemeralPubkey != null && Object.hasOwnProperty.call(message, "ephemeralPubkey"))
                    writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.ephemeralPubkey);
                if (message.nonce != null && Object.hasOwnProperty.call(message, "nonce"))
                    writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.nonce);
                if (message.encryptedPayload != null && Object.hasOwnProperty.call(message, "encryptedPayload"))
                    writer.uint32(/* id 6, wireType 2 =*/50).bytes(message.encryptedPayload);
                if (message.timestampMs != null && Object.hasOwnProperty.call(message, "timestampMs"))
                    writer.uint32(/* id 7, wireType 0 =*/56).int64(message.timestampMs);
                return writer;
            };

            /**
             * Encodes the specified DirectMessage message, length delimited. Does not implicitly {@link vco.schemas.DirectMessage.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.schemas.DirectMessage
             * @static
             * @param {vco.schemas.IDirectMessage} message DirectMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DirectMessage.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DirectMessage message from the specified reader or buffer.
             * @function decode
             * @memberof vco.schemas.DirectMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.schemas.DirectMessage} DirectMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DirectMessage.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.DirectMessage();
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
                            message.recipientCid = reader.bytes();
                            break;
                        }
                    case 3: {
                            message.senderCid = reader.bytes();
                            break;
                        }
                    case 4: {
                            message.ephemeralPubkey = reader.bytes();
                            break;
                        }
                    case 5: {
                            message.nonce = reader.bytes();
                            break;
                        }
                    case 6: {
                            message.encryptedPayload = reader.bytes();
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
             * Decodes a DirectMessage message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.schemas.DirectMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.schemas.DirectMessage} DirectMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DirectMessage.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a DirectMessage message.
             * @function verify
             * @memberof vco.schemas.DirectMessage
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            DirectMessage.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.schema != null && message.hasOwnProperty("schema"))
                    if (!$util.isString(message.schema))
                        return "schema: string expected";
                if (message.recipientCid != null && message.hasOwnProperty("recipientCid"))
                    if (!(message.recipientCid && typeof message.recipientCid.length === "number" || $util.isString(message.recipientCid)))
                        return "recipientCid: buffer expected";
                if (message.senderCid != null && message.hasOwnProperty("senderCid"))
                    if (!(message.senderCid && typeof message.senderCid.length === "number" || $util.isString(message.senderCid)))
                        return "senderCid: buffer expected";
                if (message.ephemeralPubkey != null && message.hasOwnProperty("ephemeralPubkey"))
                    if (!(message.ephemeralPubkey && typeof message.ephemeralPubkey.length === "number" || $util.isString(message.ephemeralPubkey)))
                        return "ephemeralPubkey: buffer expected";
                if (message.nonce != null && message.hasOwnProperty("nonce"))
                    if (!(message.nonce && typeof message.nonce.length === "number" || $util.isString(message.nonce)))
                        return "nonce: buffer expected";
                if (message.encryptedPayload != null && message.hasOwnProperty("encryptedPayload"))
                    if (!(message.encryptedPayload && typeof message.encryptedPayload.length === "number" || $util.isString(message.encryptedPayload)))
                        return "encryptedPayload: buffer expected";
                if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                    if (!$util.isInteger(message.timestampMs) && !(message.timestampMs && $util.isInteger(message.timestampMs.low) && $util.isInteger(message.timestampMs.high)))
                        return "timestampMs: integer|Long expected";
                return null;
            };

            /**
             * Creates a DirectMessage message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.schemas.DirectMessage
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.schemas.DirectMessage} DirectMessage
             */
            DirectMessage.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.schemas.DirectMessage)
                    return object;
                let message = new $root.vco.schemas.DirectMessage();
                if (object.schema != null)
                    message.schema = String(object.schema);
                if (object.recipientCid != null)
                    if (typeof object.recipientCid === "string")
                        $util.base64.decode(object.recipientCid, message.recipientCid = $util.newBuffer($util.base64.length(object.recipientCid)), 0);
                    else if (object.recipientCid.length >= 0)
                        message.recipientCid = object.recipientCid;
                if (object.senderCid != null)
                    if (typeof object.senderCid === "string")
                        $util.base64.decode(object.senderCid, message.senderCid = $util.newBuffer($util.base64.length(object.senderCid)), 0);
                    else if (object.senderCid.length >= 0)
                        message.senderCid = object.senderCid;
                if (object.ephemeralPubkey != null)
                    if (typeof object.ephemeralPubkey === "string")
                        $util.base64.decode(object.ephemeralPubkey, message.ephemeralPubkey = $util.newBuffer($util.base64.length(object.ephemeralPubkey)), 0);
                    else if (object.ephemeralPubkey.length >= 0)
                        message.ephemeralPubkey = object.ephemeralPubkey;
                if (object.nonce != null)
                    if (typeof object.nonce === "string")
                        $util.base64.decode(object.nonce, message.nonce = $util.newBuffer($util.base64.length(object.nonce)), 0);
                    else if (object.nonce.length >= 0)
                        message.nonce = object.nonce;
                if (object.encryptedPayload != null)
                    if (typeof object.encryptedPayload === "string")
                        $util.base64.decode(object.encryptedPayload, message.encryptedPayload = $util.newBuffer($util.base64.length(object.encryptedPayload)), 0);
                    else if (object.encryptedPayload.length >= 0)
                        message.encryptedPayload = object.encryptedPayload;
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
             * Creates a plain object from a DirectMessage message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.schemas.DirectMessage
             * @static
             * @param {vco.schemas.DirectMessage} message DirectMessage
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            DirectMessage.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.schema = "";
                    if (options.bytes === String)
                        object.recipientCid = "";
                    else {
                        object.recipientCid = [];
                        if (options.bytes !== Array)
                            object.recipientCid = $util.newBuffer(object.recipientCid);
                    }
                    if (options.bytes === String)
                        object.senderCid = "";
                    else {
                        object.senderCid = [];
                        if (options.bytes !== Array)
                            object.senderCid = $util.newBuffer(object.senderCid);
                    }
                    if (options.bytes === String)
                        object.ephemeralPubkey = "";
                    else {
                        object.ephemeralPubkey = [];
                        if (options.bytes !== Array)
                            object.ephemeralPubkey = $util.newBuffer(object.ephemeralPubkey);
                    }
                    if (options.bytes === String)
                        object.nonce = "";
                    else {
                        object.nonce = [];
                        if (options.bytes !== Array)
                            object.nonce = $util.newBuffer(object.nonce);
                    }
                    if (options.bytes === String)
                        object.encryptedPayload = "";
                    else {
                        object.encryptedPayload = [];
                        if (options.bytes !== Array)
                            object.encryptedPayload = $util.newBuffer(object.encryptedPayload);
                    }
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.timestampMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.timestampMs = options.longs === String ? "0" : 0;
                }
                if (message.schema != null && message.hasOwnProperty("schema"))
                    object.schema = message.schema;
                if (message.recipientCid != null && message.hasOwnProperty("recipientCid"))
                    object.recipientCid = options.bytes === String ? $util.base64.encode(message.recipientCid, 0, message.recipientCid.length) : options.bytes === Array ? Array.prototype.slice.call(message.recipientCid) : message.recipientCid;
                if (message.senderCid != null && message.hasOwnProperty("senderCid"))
                    object.senderCid = options.bytes === String ? $util.base64.encode(message.senderCid, 0, message.senderCid.length) : options.bytes === Array ? Array.prototype.slice.call(message.senderCid) : message.senderCid;
                if (message.ephemeralPubkey != null && message.hasOwnProperty("ephemeralPubkey"))
                    object.ephemeralPubkey = options.bytes === String ? $util.base64.encode(message.ephemeralPubkey, 0, message.ephemeralPubkey.length) : options.bytes === Array ? Array.prototype.slice.call(message.ephemeralPubkey) : message.ephemeralPubkey;
                if (message.nonce != null && message.hasOwnProperty("nonce"))
                    object.nonce = options.bytes === String ? $util.base64.encode(message.nonce, 0, message.nonce.length) : options.bytes === Array ? Array.prototype.slice.call(message.nonce) : message.nonce;
                if (message.encryptedPayload != null && message.hasOwnProperty("encryptedPayload"))
                    object.encryptedPayload = options.bytes === String ? $util.base64.encode(message.encryptedPayload, 0, message.encryptedPayload.length) : options.bytes === Array ? Array.prototype.slice.call(message.encryptedPayload) : message.encryptedPayload;
                if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                    if (typeof message.timestampMs === "number")
                        object.timestampMs = options.longs === String ? String(message.timestampMs) : message.timestampMs;
                    else
                        object.timestampMs = options.longs === String ? $util.Long.prototype.toString.call(message.timestampMs) : options.longs === Number ? new $util.LongBits(message.timestampMs.low >>> 0, message.timestampMs.high >>> 0).toNumber() : message.timestampMs;
                return object;
            };

            /**
             * Converts this DirectMessage to JSON.
             * @function toJSON
             * @memberof vco.schemas.DirectMessage
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DirectMessage.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for DirectMessage
             * @function getTypeUrl
             * @memberof vco.schemas.DirectMessage
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            DirectMessage.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.schemas.DirectMessage";
            };

            return DirectMessage;
        })();

        schemas.DirectMessagePayload = (function() {

            /**
             * Properties of a DirectMessagePayload.
             * @memberof vco.schemas
             * @interface IDirectMessagePayload
             * @property {string|null} [content] DirectMessagePayload content
             * @property {Array.<Uint8Array>|null} [mediaCids] DirectMessagePayload mediaCids
             */

            /**
             * Constructs a new DirectMessagePayload.
             * @memberof vco.schemas
             * @classdesc Represents a DirectMessagePayload.
             * @implements IDirectMessagePayload
             * @constructor
             * @param {vco.schemas.IDirectMessagePayload=} [properties] Properties to set
             */
            function DirectMessagePayload(properties) {
                this.mediaCids = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * DirectMessagePayload content.
             * @member {string} content
             * @memberof vco.schemas.DirectMessagePayload
             * @instance
             */
            DirectMessagePayload.prototype.content = "";

            /**
             * DirectMessagePayload mediaCids.
             * @member {Array.<Uint8Array>} mediaCids
             * @memberof vco.schemas.DirectMessagePayload
             * @instance
             */
            DirectMessagePayload.prototype.mediaCids = $util.emptyArray;

            /**
             * Creates a new DirectMessagePayload instance using the specified properties.
             * @function create
             * @memberof vco.schemas.DirectMessagePayload
             * @static
             * @param {vco.schemas.IDirectMessagePayload=} [properties] Properties to set
             * @returns {vco.schemas.DirectMessagePayload} DirectMessagePayload instance
             */
            DirectMessagePayload.create = function create(properties) {
                return new DirectMessagePayload(properties);
            };

            /**
             * Encodes the specified DirectMessagePayload message. Does not implicitly {@link vco.schemas.DirectMessagePayload.verify|verify} messages.
             * @function encode
             * @memberof vco.schemas.DirectMessagePayload
             * @static
             * @param {vco.schemas.IDirectMessagePayload} message DirectMessagePayload message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DirectMessagePayload.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.content != null && Object.hasOwnProperty.call(message, "content"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.content);
                if (message.mediaCids != null && message.mediaCids.length)
                    for (let i = 0; i < message.mediaCids.length; ++i)
                        writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.mediaCids[i]);
                return writer;
            };

            /**
             * Encodes the specified DirectMessagePayload message, length delimited. Does not implicitly {@link vco.schemas.DirectMessagePayload.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.schemas.DirectMessagePayload
             * @static
             * @param {vco.schemas.IDirectMessagePayload} message DirectMessagePayload message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DirectMessagePayload.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DirectMessagePayload message from the specified reader or buffer.
             * @function decode
             * @memberof vco.schemas.DirectMessagePayload
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.schemas.DirectMessagePayload} DirectMessagePayload
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DirectMessagePayload.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.DirectMessagePayload();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.content = reader.string();
                            break;
                        }
                    case 2: {
                            if (!(message.mediaCids && message.mediaCids.length))
                                message.mediaCids = [];
                            message.mediaCids.push(reader.bytes());
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
             * Decodes a DirectMessagePayload message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.schemas.DirectMessagePayload
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.schemas.DirectMessagePayload} DirectMessagePayload
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DirectMessagePayload.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a DirectMessagePayload message.
             * @function verify
             * @memberof vco.schemas.DirectMessagePayload
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            DirectMessagePayload.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
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
                return null;
            };

            /**
             * Creates a DirectMessagePayload message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.schemas.DirectMessagePayload
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.schemas.DirectMessagePayload} DirectMessagePayload
             */
            DirectMessagePayload.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.schemas.DirectMessagePayload)
                    return object;
                let message = new $root.vco.schemas.DirectMessagePayload();
                if (object.content != null)
                    message.content = String(object.content);
                if (object.mediaCids) {
                    if (!Array.isArray(object.mediaCids))
                        throw TypeError(".vco.schemas.DirectMessagePayload.mediaCids: array expected");
                    message.mediaCids = [];
                    for (let i = 0; i < object.mediaCids.length; ++i)
                        if (typeof object.mediaCids[i] === "string")
                            $util.base64.decode(object.mediaCids[i], message.mediaCids[i] = $util.newBuffer($util.base64.length(object.mediaCids[i])), 0);
                        else if (object.mediaCids[i].length >= 0)
                            message.mediaCids[i] = object.mediaCids[i];
                }
                return message;
            };

            /**
             * Creates a plain object from a DirectMessagePayload message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.schemas.DirectMessagePayload
             * @static
             * @param {vco.schemas.DirectMessagePayload} message DirectMessagePayload
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            DirectMessagePayload.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.mediaCids = [];
                if (options.defaults)
                    object.content = "";
                if (message.content != null && message.hasOwnProperty("content"))
                    object.content = message.content;
                if (message.mediaCids && message.mediaCids.length) {
                    object.mediaCids = [];
                    for (let j = 0; j < message.mediaCids.length; ++j)
                        object.mediaCids[j] = options.bytes === String ? $util.base64.encode(message.mediaCids[j], 0, message.mediaCids[j].length) : options.bytes === Array ? Array.prototype.slice.call(message.mediaCids[j]) : message.mediaCids[j];
                }
                return object;
            };

            /**
             * Converts this DirectMessagePayload to JSON.
             * @function toJSON
             * @memberof vco.schemas.DirectMessagePayload
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DirectMessagePayload.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for DirectMessagePayload
             * @function getTypeUrl
             * @memberof vco.schemas.DirectMessagePayload
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            DirectMessagePayload.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.schemas.DirectMessagePayload";
            };

            return DirectMessagePayload;
        })();

        return schemas;
    })();

    return vco;
})();

export { $root as default };

export const DirectMessage = vco.schemas.DirectMessage;
export const DirectMessagePayload = vco.schemas.DirectMessagePayload;
