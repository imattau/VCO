/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["vco-schemas-marketplace/listing"] || ($protobuf.roots["vco-schemas-marketplace/listing"] = {});

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

        schemas.Listing = (function() {

            /**
             * Properties of a Listing.
             * @memberof vco.schemas
             * @interface IListing
             * @property {string|null} [schema] Listing schema
             * @property {string|null} [title] Listing title
             * @property {string|null} [description] Listing description
             * @property {number|Long|null} [priceSats] Listing priceSats
             * @property {Array.<Uint8Array>|null} [mediaCids] Listing mediaCids
             * @property {number|Long|null} [expiryMs] Listing expiryMs
             * @property {Uint8Array|null} [previousCid] Listing previousCid
             */

            /**
             * Constructs a new Listing.
             * @memberof vco.schemas
             * @classdesc Represents a Listing.
             * @implements IListing
             * @constructor
             * @param {vco.schemas.IListing=} [properties] Properties to set
             */
            function Listing(properties) {
                this.mediaCids = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Listing schema.
             * @member {string} schema
             * @memberof vco.schemas.Listing
             * @instance
             */
            Listing.prototype.schema = "";

            /**
             * Listing title.
             * @member {string} title
             * @memberof vco.schemas.Listing
             * @instance
             */
            Listing.prototype.title = "";

            /**
             * Listing description.
             * @member {string} description
             * @memberof vco.schemas.Listing
             * @instance
             */
            Listing.prototype.description = "";

            /**
             * Listing priceSats.
             * @member {number|Long} priceSats
             * @memberof vco.schemas.Listing
             * @instance
             */
            Listing.prototype.priceSats = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Listing mediaCids.
             * @member {Array.<Uint8Array>} mediaCids
             * @memberof vco.schemas.Listing
             * @instance
             */
            Listing.prototype.mediaCids = $util.emptyArray;

            /**
             * Listing expiryMs.
             * @member {number|Long} expiryMs
             * @memberof vco.schemas.Listing
             * @instance
             */
            Listing.prototype.expiryMs = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Listing previousCid.
             * @member {Uint8Array} previousCid
             * @memberof vco.schemas.Listing
             * @instance
             */
            Listing.prototype.previousCid = $util.newBuffer([]);

            /**
             * Creates a new Listing instance using the specified properties.
             * @function create
             * @memberof vco.schemas.Listing
             * @static
             * @param {vco.schemas.IListing=} [properties] Properties to set
             * @returns {vco.schemas.Listing} Listing instance
             */
            Listing.create = function create(properties) {
                return new Listing(properties);
            };

            /**
             * Encodes the specified Listing message. Does not implicitly {@link vco.schemas.Listing.verify|verify} messages.
             * @function encode
             * @memberof vco.schemas.Listing
             * @static
             * @param {vco.schemas.IListing} message Listing message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Listing.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.schema != null && Object.hasOwnProperty.call(message, "schema"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.schema);
                if (message.title != null && Object.hasOwnProperty.call(message, "title"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.title);
                if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
                if (message.priceSats != null && Object.hasOwnProperty.call(message, "priceSats"))
                    writer.uint32(/* id 4, wireType 0 =*/32).int64(message.priceSats);
                if (message.mediaCids != null && message.mediaCids.length)
                    for (let i = 0; i < message.mediaCids.length; ++i)
                        writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.mediaCids[i]);
                if (message.expiryMs != null && Object.hasOwnProperty.call(message, "expiryMs"))
                    writer.uint32(/* id 6, wireType 0 =*/48).int64(message.expiryMs);
                if (message.previousCid != null && Object.hasOwnProperty.call(message, "previousCid"))
                    writer.uint32(/* id 7, wireType 2 =*/58).bytes(message.previousCid);
                return writer;
            };

            /**
             * Encodes the specified Listing message, length delimited. Does not implicitly {@link vco.schemas.Listing.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.schemas.Listing
             * @static
             * @param {vco.schemas.IListing} message Listing message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Listing.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Listing message from the specified reader or buffer.
             * @function decode
             * @memberof vco.schemas.Listing
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.schemas.Listing} Listing
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Listing.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.Listing();
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
                            message.title = reader.string();
                            break;
                        }
                    case 3: {
                            message.description = reader.string();
                            break;
                        }
                    case 4: {
                            message.priceSats = reader.int64();
                            break;
                        }
                    case 5: {
                            if (!(message.mediaCids && message.mediaCids.length))
                                message.mediaCids = [];
                            message.mediaCids.push(reader.bytes());
                            break;
                        }
                    case 6: {
                            message.expiryMs = reader.int64();
                            break;
                        }
                    case 7: {
                            message.previousCid = reader.bytes();
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
             * Decodes a Listing message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.schemas.Listing
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.schemas.Listing} Listing
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Listing.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Listing message.
             * @function verify
             * @memberof vco.schemas.Listing
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Listing.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.schema != null && message.hasOwnProperty("schema"))
                    if (!$util.isString(message.schema))
                        return "schema: string expected";
                if (message.title != null && message.hasOwnProperty("title"))
                    if (!$util.isString(message.title))
                        return "title: string expected";
                if (message.description != null && message.hasOwnProperty("description"))
                    if (!$util.isString(message.description))
                        return "description: string expected";
                if (message.priceSats != null && message.hasOwnProperty("priceSats"))
                    if (!$util.isInteger(message.priceSats) && !(message.priceSats && $util.isInteger(message.priceSats.low) && $util.isInteger(message.priceSats.high)))
                        return "priceSats: integer|Long expected";
                if (message.mediaCids != null && message.hasOwnProperty("mediaCids")) {
                    if (!Array.isArray(message.mediaCids))
                        return "mediaCids: array expected";
                    for (let i = 0; i < message.mediaCids.length; ++i)
                        if (!(message.mediaCids[i] && typeof message.mediaCids[i].length === "number" || $util.isString(message.mediaCids[i])))
                            return "mediaCids: buffer[] expected";
                }
                if (message.expiryMs != null && message.hasOwnProperty("expiryMs"))
                    if (!$util.isInteger(message.expiryMs) && !(message.expiryMs && $util.isInteger(message.expiryMs.low) && $util.isInteger(message.expiryMs.high)))
                        return "expiryMs: integer|Long expected";
                if (message.previousCid != null && message.hasOwnProperty("previousCid"))
                    if (!(message.previousCid && typeof message.previousCid.length === "number" || $util.isString(message.previousCid)))
                        return "previousCid: buffer expected";
                return null;
            };

            /**
             * Creates a Listing message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.schemas.Listing
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.schemas.Listing} Listing
             */
            Listing.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.schemas.Listing)
                    return object;
                let message = new $root.vco.schemas.Listing();
                if (object.schema != null)
                    message.schema = String(object.schema);
                if (object.title != null)
                    message.title = String(object.title);
                if (object.description != null)
                    message.description = String(object.description);
                if (object.priceSats != null)
                    if ($util.Long)
                        (message.priceSats = $util.Long.fromValue(object.priceSats)).unsigned = false;
                    else if (typeof object.priceSats === "string")
                        message.priceSats = parseInt(object.priceSats, 10);
                    else if (typeof object.priceSats === "number")
                        message.priceSats = object.priceSats;
                    else if (typeof object.priceSats === "object")
                        message.priceSats = new $util.LongBits(object.priceSats.low >>> 0, object.priceSats.high >>> 0).toNumber();
                if (object.mediaCids) {
                    if (!Array.isArray(object.mediaCids))
                        throw TypeError(".vco.schemas.Listing.mediaCids: array expected");
                    message.mediaCids = [];
                    for (let i = 0; i < object.mediaCids.length; ++i)
                        if (typeof object.mediaCids[i] === "string")
                            $util.base64.decode(object.mediaCids[i], message.mediaCids[i] = $util.newBuffer($util.base64.length(object.mediaCids[i])), 0);
                        else if (object.mediaCids[i].length >= 0)
                            message.mediaCids[i] = object.mediaCids[i];
                }
                if (object.expiryMs != null)
                    if ($util.Long)
                        (message.expiryMs = $util.Long.fromValue(object.expiryMs)).unsigned = false;
                    else if (typeof object.expiryMs === "string")
                        message.expiryMs = parseInt(object.expiryMs, 10);
                    else if (typeof object.expiryMs === "number")
                        message.expiryMs = object.expiryMs;
                    else if (typeof object.expiryMs === "object")
                        message.expiryMs = new $util.LongBits(object.expiryMs.low >>> 0, object.expiryMs.high >>> 0).toNumber();
                if (object.previousCid != null)
                    if (typeof object.previousCid === "string")
                        $util.base64.decode(object.previousCid, message.previousCid = $util.newBuffer($util.base64.length(object.previousCid)), 0);
                    else if (object.previousCid.length >= 0)
                        message.previousCid = object.previousCid;
                return message;
            };

            /**
             * Creates a plain object from a Listing message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.schemas.Listing
             * @static
             * @param {vco.schemas.Listing} message Listing
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Listing.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.mediaCids = [];
                if (options.defaults) {
                    object.schema = "";
                    object.title = "";
                    object.description = "";
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.priceSats = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.priceSats = options.longs === String ? "0" : 0;
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.expiryMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.expiryMs = options.longs === String ? "0" : 0;
                    if (options.bytes === String)
                        object.previousCid = "";
                    else {
                        object.previousCid = [];
                        if (options.bytes !== Array)
                            object.previousCid = $util.newBuffer(object.previousCid);
                    }
                }
                if (message.schema != null && message.hasOwnProperty("schema"))
                    object.schema = message.schema;
                if (message.title != null && message.hasOwnProperty("title"))
                    object.title = message.title;
                if (message.description != null && message.hasOwnProperty("description"))
                    object.description = message.description;
                if (message.priceSats != null && message.hasOwnProperty("priceSats"))
                    if (typeof message.priceSats === "number")
                        object.priceSats = options.longs === String ? String(message.priceSats) : message.priceSats;
                    else
                        object.priceSats = options.longs === String ? $util.Long.prototype.toString.call(message.priceSats) : options.longs === Number ? new $util.LongBits(message.priceSats.low >>> 0, message.priceSats.high >>> 0).toNumber() : message.priceSats;
                if (message.mediaCids && message.mediaCids.length) {
                    object.mediaCids = [];
                    for (let j = 0; j < message.mediaCids.length; ++j)
                        object.mediaCids[j] = options.bytes === String ? $util.base64.encode(message.mediaCids[j], 0, message.mediaCids[j].length) : options.bytes === Array ? Array.prototype.slice.call(message.mediaCids[j]) : message.mediaCids[j];
                }
                if (message.expiryMs != null && message.hasOwnProperty("expiryMs"))
                    if (typeof message.expiryMs === "number")
                        object.expiryMs = options.longs === String ? String(message.expiryMs) : message.expiryMs;
                    else
                        object.expiryMs = options.longs === String ? $util.Long.prototype.toString.call(message.expiryMs) : options.longs === Number ? new $util.LongBits(message.expiryMs.low >>> 0, message.expiryMs.high >>> 0).toNumber() : message.expiryMs;
                if (message.previousCid != null && message.hasOwnProperty("previousCid"))
                    object.previousCid = options.bytes === String ? $util.base64.encode(message.previousCid, 0, message.previousCid.length) : options.bytes === Array ? Array.prototype.slice.call(message.previousCid) : message.previousCid;
                return object;
            };

            /**
             * Converts this Listing to JSON.
             * @function toJSON
             * @memberof vco.schemas.Listing
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Listing.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Listing
             * @function getTypeUrl
             * @memberof vco.schemas.Listing
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Listing.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.schemas.Listing";
            };

            return Listing;
        })();

        return schemas;
    })();

    return vco;
})();

export { $root as default };

export const Listing = vco.schemas.Listing;
