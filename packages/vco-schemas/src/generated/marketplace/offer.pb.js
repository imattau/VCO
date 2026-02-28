/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["vco-schemas-marketplace/offer"] || ($protobuf.roots["vco-schemas-marketplace/offer"] = {});

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

        schemas.Offer = (function() {

            /**
             * Properties of an Offer.
             * @memberof vco.schemas
             * @interface IOffer
             * @property {string|null} [schema] Offer schema
             * @property {Uint8Array|null} [listingCid] Offer listingCid
             * @property {number|Long|null} [offerSats] Offer offerSats
             * @property {string|null} [message] Offer message
             * @property {number|Long|null} [timestampMs] Offer timestampMs
             */

            /**
             * Constructs a new Offer.
             * @memberof vco.schemas
             * @classdesc Represents an Offer.
             * @implements IOffer
             * @constructor
             * @param {vco.schemas.IOffer=} [properties] Properties to set
             */
            function Offer(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Offer schema.
             * @member {string} schema
             * @memberof vco.schemas.Offer
             * @instance
             */
            Offer.prototype.schema = "";

            /**
             * Offer listingCid.
             * @member {Uint8Array} listingCid
             * @memberof vco.schemas.Offer
             * @instance
             */
            Offer.prototype.listingCid = $util.newBuffer([]);

            /**
             * Offer offerSats.
             * @member {number|Long} offerSats
             * @memberof vco.schemas.Offer
             * @instance
             */
            Offer.prototype.offerSats = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Offer message.
             * @member {string} message
             * @memberof vco.schemas.Offer
             * @instance
             */
            Offer.prototype.message = "";

            /**
             * Offer timestampMs.
             * @member {number|Long} timestampMs
             * @memberof vco.schemas.Offer
             * @instance
             */
            Offer.prototype.timestampMs = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Creates a new Offer instance using the specified properties.
             * @function create
             * @memberof vco.schemas.Offer
             * @static
             * @param {vco.schemas.IOffer=} [properties] Properties to set
             * @returns {vco.schemas.Offer} Offer instance
             */
            Offer.create = function create(properties) {
                return new Offer(properties);
            };

            /**
             * Encodes the specified Offer message. Does not implicitly {@link vco.schemas.Offer.verify|verify} messages.
             * @function encode
             * @memberof vco.schemas.Offer
             * @static
             * @param {vco.schemas.IOffer} message Offer message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Offer.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.schema != null && Object.hasOwnProperty.call(message, "schema"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.schema);
                if (message.listingCid != null && Object.hasOwnProperty.call(message, "listingCid"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.listingCid);
                if (message.offerSats != null && Object.hasOwnProperty.call(message, "offerSats"))
                    writer.uint32(/* id 3, wireType 0 =*/24).int64(message.offerSats);
                if (message.message != null && Object.hasOwnProperty.call(message, "message"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.message);
                if (message.timestampMs != null && Object.hasOwnProperty.call(message, "timestampMs"))
                    writer.uint32(/* id 5, wireType 0 =*/40).int64(message.timestampMs);
                return writer;
            };

            /**
             * Encodes the specified Offer message, length delimited. Does not implicitly {@link vco.schemas.Offer.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.schemas.Offer
             * @static
             * @param {vco.schemas.IOffer} message Offer message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Offer.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an Offer message from the specified reader or buffer.
             * @function decode
             * @memberof vco.schemas.Offer
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.schemas.Offer} Offer
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Offer.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.Offer();
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
                            message.listingCid = reader.bytes();
                            break;
                        }
                    case 3: {
                            message.offerSats = reader.int64();
                            break;
                        }
                    case 4: {
                            message.message = reader.string();
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
             * Decodes an Offer message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.schemas.Offer
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.schemas.Offer} Offer
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Offer.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Offer message.
             * @function verify
             * @memberof vco.schemas.Offer
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Offer.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.schema != null && message.hasOwnProperty("schema"))
                    if (!$util.isString(message.schema))
                        return "schema: string expected";
                if (message.listingCid != null && message.hasOwnProperty("listingCid"))
                    if (!(message.listingCid && typeof message.listingCid.length === "number" || $util.isString(message.listingCid)))
                        return "listingCid: buffer expected";
                if (message.offerSats != null && message.hasOwnProperty("offerSats"))
                    if (!$util.isInteger(message.offerSats) && !(message.offerSats && $util.isInteger(message.offerSats.low) && $util.isInteger(message.offerSats.high)))
                        return "offerSats: integer|Long expected";
                if (message.message != null && message.hasOwnProperty("message"))
                    if (!$util.isString(message.message))
                        return "message: string expected";
                if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                    if (!$util.isInteger(message.timestampMs) && !(message.timestampMs && $util.isInteger(message.timestampMs.low) && $util.isInteger(message.timestampMs.high)))
                        return "timestampMs: integer|Long expected";
                return null;
            };

            /**
             * Creates an Offer message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.schemas.Offer
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.schemas.Offer} Offer
             */
            Offer.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.schemas.Offer)
                    return object;
                let message = new $root.vco.schemas.Offer();
                if (object.schema != null)
                    message.schema = String(object.schema);
                if (object.listingCid != null)
                    if (typeof object.listingCid === "string")
                        $util.base64.decode(object.listingCid, message.listingCid = $util.newBuffer($util.base64.length(object.listingCid)), 0);
                    else if (object.listingCid.length >= 0)
                        message.listingCid = object.listingCid;
                if (object.offerSats != null)
                    if ($util.Long)
                        (message.offerSats = $util.Long.fromValue(object.offerSats)).unsigned = false;
                    else if (typeof object.offerSats === "string")
                        message.offerSats = parseInt(object.offerSats, 10);
                    else if (typeof object.offerSats === "number")
                        message.offerSats = object.offerSats;
                    else if (typeof object.offerSats === "object")
                        message.offerSats = new $util.LongBits(object.offerSats.low >>> 0, object.offerSats.high >>> 0).toNumber();
                if (object.message != null)
                    message.message = String(object.message);
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
             * Creates a plain object from an Offer message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.schemas.Offer
             * @static
             * @param {vco.schemas.Offer} message Offer
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Offer.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.schema = "";
                    if (options.bytes === String)
                        object.listingCid = "";
                    else {
                        object.listingCid = [];
                        if (options.bytes !== Array)
                            object.listingCid = $util.newBuffer(object.listingCid);
                    }
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.offerSats = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.offerSats = options.longs === String ? "0" : 0;
                    object.message = "";
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.timestampMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.timestampMs = options.longs === String ? "0" : 0;
                }
                if (message.schema != null && message.hasOwnProperty("schema"))
                    object.schema = message.schema;
                if (message.listingCid != null && message.hasOwnProperty("listingCid"))
                    object.listingCid = options.bytes === String ? $util.base64.encode(message.listingCid, 0, message.listingCid.length) : options.bytes === Array ? Array.prototype.slice.call(message.listingCid) : message.listingCid;
                if (message.offerSats != null && message.hasOwnProperty("offerSats"))
                    if (typeof message.offerSats === "number")
                        object.offerSats = options.longs === String ? String(message.offerSats) : message.offerSats;
                    else
                        object.offerSats = options.longs === String ? $util.Long.prototype.toString.call(message.offerSats) : options.longs === Number ? new $util.LongBits(message.offerSats.low >>> 0, message.offerSats.high >>> 0).toNumber() : message.offerSats;
                if (message.message != null && message.hasOwnProperty("message"))
                    object.message = message.message;
                if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                    if (typeof message.timestampMs === "number")
                        object.timestampMs = options.longs === String ? String(message.timestampMs) : message.timestampMs;
                    else
                        object.timestampMs = options.longs === String ? $util.Long.prototype.toString.call(message.timestampMs) : options.longs === Number ? new $util.LongBits(message.timestampMs.low >>> 0, message.timestampMs.high >>> 0).toNumber() : message.timestampMs;
                return object;
            };

            /**
             * Converts this Offer to JSON.
             * @function toJSON
             * @memberof vco.schemas.Offer
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Offer.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Offer
             * @function getTypeUrl
             * @memberof vco.schemas.Offer
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Offer.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.schemas.Offer";
            };

            return Offer;
        })();

        return schemas;
    })();

    return vco;
})();

export { $root as default };

export const Offer = vco.schemas.Offer;
