/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["vco-schemas-marketplace/receipt"] || ($protobuf.roots["vco-schemas-marketplace/receipt"] = {});

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

        schemas.Receipt = (function() {

            /**
             * Properties of a Receipt.
             * @memberof vco.schemas
             * @interface IReceipt
             * @property {string|null} [schema] Receipt schema
             * @property {Uint8Array|null} [listingCid] Receipt listingCid
             * @property {Uint8Array|null} [offerCid] Receipt offerCid
             * @property {string|null} [txId] Receipt txId
             * @property {number|Long|null} [timestampMs] Receipt timestampMs
             */

            /**
             * Constructs a new Receipt.
             * @memberof vco.schemas
             * @classdesc Represents a Receipt.
             * @implements IReceipt
             * @constructor
             * @param {vco.schemas.IReceipt=} [properties] Properties to set
             */
            function Receipt(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Receipt schema.
             * @member {string} schema
             * @memberof vco.schemas.Receipt
             * @instance
             */
            Receipt.prototype.schema = "";

            /**
             * Receipt listingCid.
             * @member {Uint8Array} listingCid
             * @memberof vco.schemas.Receipt
             * @instance
             */
            Receipt.prototype.listingCid = $util.newBuffer([]);

            /**
             * Receipt offerCid.
             * @member {Uint8Array} offerCid
             * @memberof vco.schemas.Receipt
             * @instance
             */
            Receipt.prototype.offerCid = $util.newBuffer([]);

            /**
             * Receipt txId.
             * @member {string} txId
             * @memberof vco.schemas.Receipt
             * @instance
             */
            Receipt.prototype.txId = "";

            /**
             * Receipt timestampMs.
             * @member {number|Long} timestampMs
             * @memberof vco.schemas.Receipt
             * @instance
             */
            Receipt.prototype.timestampMs = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Creates a new Receipt instance using the specified properties.
             * @function create
             * @memberof vco.schemas.Receipt
             * @static
             * @param {vco.schemas.IReceipt=} [properties] Properties to set
             * @returns {vco.schemas.Receipt} Receipt instance
             */
            Receipt.create = function create(properties) {
                return new Receipt(properties);
            };

            /**
             * Encodes the specified Receipt message. Does not implicitly {@link vco.schemas.Receipt.verify|verify} messages.
             * @function encode
             * @memberof vco.schemas.Receipt
             * @static
             * @param {vco.schemas.IReceipt} message Receipt message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Receipt.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.schema != null && Object.hasOwnProperty.call(message, "schema"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.schema);
                if (message.listingCid != null && Object.hasOwnProperty.call(message, "listingCid"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.listingCid);
                if (message.offerCid != null && Object.hasOwnProperty.call(message, "offerCid"))
                    writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.offerCid);
                if (message.txId != null && Object.hasOwnProperty.call(message, "txId"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.txId);
                if (message.timestampMs != null && Object.hasOwnProperty.call(message, "timestampMs"))
                    writer.uint32(/* id 5, wireType 0 =*/40).int64(message.timestampMs);
                return writer;
            };

            /**
             * Encodes the specified Receipt message, length delimited. Does not implicitly {@link vco.schemas.Receipt.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.schemas.Receipt
             * @static
             * @param {vco.schemas.IReceipt} message Receipt message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Receipt.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Receipt message from the specified reader or buffer.
             * @function decode
             * @memberof vco.schemas.Receipt
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.schemas.Receipt} Receipt
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Receipt.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.Receipt();
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
                            message.offerCid = reader.bytes();
                            break;
                        }
                    case 4: {
                            message.txId = reader.string();
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
             * Decodes a Receipt message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.schemas.Receipt
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.schemas.Receipt} Receipt
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Receipt.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Receipt message.
             * @function verify
             * @memberof vco.schemas.Receipt
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Receipt.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.schema != null && message.hasOwnProperty("schema"))
                    if (!$util.isString(message.schema))
                        return "schema: string expected";
                if (message.listingCid != null && message.hasOwnProperty("listingCid"))
                    if (!(message.listingCid && typeof message.listingCid.length === "number" || $util.isString(message.listingCid)))
                        return "listingCid: buffer expected";
                if (message.offerCid != null && message.hasOwnProperty("offerCid"))
                    if (!(message.offerCid && typeof message.offerCid.length === "number" || $util.isString(message.offerCid)))
                        return "offerCid: buffer expected";
                if (message.txId != null && message.hasOwnProperty("txId"))
                    if (!$util.isString(message.txId))
                        return "txId: string expected";
                if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                    if (!$util.isInteger(message.timestampMs) && !(message.timestampMs && $util.isInteger(message.timestampMs.low) && $util.isInteger(message.timestampMs.high)))
                        return "timestampMs: integer|Long expected";
                return null;
            };

            /**
             * Creates a Receipt message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.schemas.Receipt
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.schemas.Receipt} Receipt
             */
            Receipt.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.schemas.Receipt)
                    return object;
                let message = new $root.vco.schemas.Receipt();
                if (object.schema != null)
                    message.schema = String(object.schema);
                if (object.listingCid != null)
                    if (typeof object.listingCid === "string")
                        $util.base64.decode(object.listingCid, message.listingCid = $util.newBuffer($util.base64.length(object.listingCid)), 0);
                    else if (object.listingCid.length >= 0)
                        message.listingCid = object.listingCid;
                if (object.offerCid != null)
                    if (typeof object.offerCid === "string")
                        $util.base64.decode(object.offerCid, message.offerCid = $util.newBuffer($util.base64.length(object.offerCid)), 0);
                    else if (object.offerCid.length >= 0)
                        message.offerCid = object.offerCid;
                if (object.txId != null)
                    message.txId = String(object.txId);
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
             * Creates a plain object from a Receipt message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.schemas.Receipt
             * @static
             * @param {vco.schemas.Receipt} message Receipt
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Receipt.toObject = function toObject(message, options) {
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
                    if (options.bytes === String)
                        object.offerCid = "";
                    else {
                        object.offerCid = [];
                        if (options.bytes !== Array)
                            object.offerCid = $util.newBuffer(object.offerCid);
                    }
                    object.txId = "";
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
                if (message.offerCid != null && message.hasOwnProperty("offerCid"))
                    object.offerCid = options.bytes === String ? $util.base64.encode(message.offerCid, 0, message.offerCid.length) : options.bytes === Array ? Array.prototype.slice.call(message.offerCid) : message.offerCid;
                if (message.txId != null && message.hasOwnProperty("txId"))
                    object.txId = message.txId;
                if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                    if (typeof message.timestampMs === "number")
                        object.timestampMs = options.longs === String ? String(message.timestampMs) : message.timestampMs;
                    else
                        object.timestampMs = options.longs === String ? $util.Long.prototype.toString.call(message.timestampMs) : options.longs === Number ? new $util.LongBits(message.timestampMs.low >>> 0, message.timestampMs.high >>> 0).toNumber() : message.timestampMs;
                return object;
            };

            /**
             * Converts this Receipt to JSON.
             * @function toJSON
             * @memberof vco.schemas.Receipt
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Receipt.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Receipt
             * @function getTypeUrl
             * @memberof vco.schemas.Receipt
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Receipt.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.schemas.Receipt";
            };

            return Receipt;
        })();

        return schemas;
    })();

    return vco;
})();

export { $root as default };

export const Receipt = vco.schemas.Receipt;
