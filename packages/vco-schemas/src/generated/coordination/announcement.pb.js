/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["vco-schemas-coordination/announcement"] || ($protobuf.roots["vco-schemas-coordination/announcement"] = {});

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

        schemas.Announcement = (function() {

            /**
             * Properties of an Announcement.
             * @memberof vco.schemas
             * @interface IAnnouncement
             * @property {string|null} [schema] Announcement schema
             * @property {string|null} [content] Announcement content
             * @property {string|null} [priority] Announcement priority
             * @property {Array.<Uint8Array>|null} [mediaCids] Announcement mediaCids
             * @property {number|Long|null} [timestampMs] Announcement timestampMs
             */

            /**
             * Constructs a new Announcement.
             * @memberof vco.schemas
             * @classdesc Represents an Announcement.
             * @implements IAnnouncement
             * @constructor
             * @param {vco.schemas.IAnnouncement=} [properties] Properties to set
             */
            function Announcement(properties) {
                this.mediaCids = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Announcement schema.
             * @member {string} schema
             * @memberof vco.schemas.Announcement
             * @instance
             */
            Announcement.prototype.schema = "";

            /**
             * Announcement content.
             * @member {string} content
             * @memberof vco.schemas.Announcement
             * @instance
             */
            Announcement.prototype.content = "";

            /**
             * Announcement priority.
             * @member {string} priority
             * @memberof vco.schemas.Announcement
             * @instance
             */
            Announcement.prototype.priority = "";

            /**
             * Announcement mediaCids.
             * @member {Array.<Uint8Array>} mediaCids
             * @memberof vco.schemas.Announcement
             * @instance
             */
            Announcement.prototype.mediaCids = $util.emptyArray;

            /**
             * Announcement timestampMs.
             * @member {number|Long} timestampMs
             * @memberof vco.schemas.Announcement
             * @instance
             */
            Announcement.prototype.timestampMs = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Creates a new Announcement instance using the specified properties.
             * @function create
             * @memberof vco.schemas.Announcement
             * @static
             * @param {vco.schemas.IAnnouncement=} [properties] Properties to set
             * @returns {vco.schemas.Announcement} Announcement instance
             */
            Announcement.create = function create(properties) {
                return new Announcement(properties);
            };

            /**
             * Encodes the specified Announcement message. Does not implicitly {@link vco.schemas.Announcement.verify|verify} messages.
             * @function encode
             * @memberof vco.schemas.Announcement
             * @static
             * @param {vco.schemas.IAnnouncement} message Announcement message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Announcement.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.schema != null && Object.hasOwnProperty.call(message, "schema"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.schema);
                if (message.content != null && Object.hasOwnProperty.call(message, "content"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.content);
                if (message.priority != null && Object.hasOwnProperty.call(message, "priority"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.priority);
                if (message.mediaCids != null && message.mediaCids.length)
                    for (let i = 0; i < message.mediaCids.length; ++i)
                        writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.mediaCids[i]);
                if (message.timestampMs != null && Object.hasOwnProperty.call(message, "timestampMs"))
                    writer.uint32(/* id 5, wireType 0 =*/40).int64(message.timestampMs);
                return writer;
            };

            /**
             * Encodes the specified Announcement message, length delimited. Does not implicitly {@link vco.schemas.Announcement.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.schemas.Announcement
             * @static
             * @param {vco.schemas.IAnnouncement} message Announcement message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Announcement.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an Announcement message from the specified reader or buffer.
             * @function decode
             * @memberof vco.schemas.Announcement
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.schemas.Announcement} Announcement
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Announcement.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.Announcement();
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
                            message.priority = reader.string();
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
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an Announcement message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.schemas.Announcement
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.schemas.Announcement} Announcement
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Announcement.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Announcement message.
             * @function verify
             * @memberof vco.schemas.Announcement
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Announcement.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.schema != null && message.hasOwnProperty("schema"))
                    if (!$util.isString(message.schema))
                        return "schema: string expected";
                if (message.content != null && message.hasOwnProperty("content"))
                    if (!$util.isString(message.content))
                        return "content: string expected";
                if (message.priority != null && message.hasOwnProperty("priority"))
                    if (!$util.isString(message.priority))
                        return "priority: string expected";
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
                return null;
            };

            /**
             * Creates an Announcement message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.schemas.Announcement
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.schemas.Announcement} Announcement
             */
            Announcement.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.schemas.Announcement)
                    return object;
                let message = new $root.vco.schemas.Announcement();
                if (object.schema != null)
                    message.schema = String(object.schema);
                if (object.content != null)
                    message.content = String(object.content);
                if (object.priority != null)
                    message.priority = String(object.priority);
                if (object.mediaCids) {
                    if (!Array.isArray(object.mediaCids))
                        throw TypeError(".vco.schemas.Announcement.mediaCids: array expected");
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
                return message;
            };

            /**
             * Creates a plain object from an Announcement message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.schemas.Announcement
             * @static
             * @param {vco.schemas.Announcement} message Announcement
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Announcement.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.mediaCids = [];
                if (options.defaults) {
                    object.schema = "";
                    object.content = "";
                    object.priority = "";
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.timestampMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.timestampMs = options.longs === String ? "0" : 0;
                }
                if (message.schema != null && message.hasOwnProperty("schema"))
                    object.schema = message.schema;
                if (message.content != null && message.hasOwnProperty("content"))
                    object.content = message.content;
                if (message.priority != null && message.hasOwnProperty("priority"))
                    object.priority = message.priority;
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
                return object;
            };

            /**
             * Converts this Announcement to JSON.
             * @function toJSON
             * @memberof vco.schemas.Announcement
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Announcement.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Announcement
             * @function getTypeUrl
             * @memberof vco.schemas.Announcement
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Announcement.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.schemas.Announcement";
            };

            return Announcement;
        })();

        return schemas;
    })();

    return vco;
})();

export { $root as default };

export const Announcement = vco.schemas.Announcement;
