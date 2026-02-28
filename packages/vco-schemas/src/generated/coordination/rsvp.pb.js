/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["vco-schemas-coordination/rsvp"] || ($protobuf.roots["vco-schemas-coordination/rsvp"] = {});

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

        schemas.Rsvp = (function() {

            /**
             * Properties of a Rsvp.
             * @memberof vco.schemas
             * @interface IRsvp
             * @property {string|null} [schema] Rsvp schema
             * @property {Uint8Array|null} [eventCid] Rsvp eventCid
             * @property {string|null} [status] Rsvp status
             * @property {number|Long|null} [timestampMs] Rsvp timestampMs
             */

            /**
             * Constructs a new Rsvp.
             * @memberof vco.schemas
             * @classdesc Represents a Rsvp.
             * @implements IRsvp
             * @constructor
             * @param {vco.schemas.IRsvp=} [properties] Properties to set
             */
            function Rsvp(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Rsvp schema.
             * @member {string} schema
             * @memberof vco.schemas.Rsvp
             * @instance
             */
            Rsvp.prototype.schema = "";

            /**
             * Rsvp eventCid.
             * @member {Uint8Array} eventCid
             * @memberof vco.schemas.Rsvp
             * @instance
             */
            Rsvp.prototype.eventCid = $util.newBuffer([]);

            /**
             * Rsvp status.
             * @member {string} status
             * @memberof vco.schemas.Rsvp
             * @instance
             */
            Rsvp.prototype.status = "";

            /**
             * Rsvp timestampMs.
             * @member {number|Long} timestampMs
             * @memberof vco.schemas.Rsvp
             * @instance
             */
            Rsvp.prototype.timestampMs = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Creates a new Rsvp instance using the specified properties.
             * @function create
             * @memberof vco.schemas.Rsvp
             * @static
             * @param {vco.schemas.IRsvp=} [properties] Properties to set
             * @returns {vco.schemas.Rsvp} Rsvp instance
             */
            Rsvp.create = function create(properties) {
                return new Rsvp(properties);
            };

            /**
             * Encodes the specified Rsvp message. Does not implicitly {@link vco.schemas.Rsvp.verify|verify} messages.
             * @function encode
             * @memberof vco.schemas.Rsvp
             * @static
             * @param {vco.schemas.IRsvp} message Rsvp message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Rsvp.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.schema != null && Object.hasOwnProperty.call(message, "schema"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.schema);
                if (message.eventCid != null && Object.hasOwnProperty.call(message, "eventCid"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.eventCid);
                if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.status);
                if (message.timestampMs != null && Object.hasOwnProperty.call(message, "timestampMs"))
                    writer.uint32(/* id 4, wireType 0 =*/32).int64(message.timestampMs);
                return writer;
            };

            /**
             * Encodes the specified Rsvp message, length delimited. Does not implicitly {@link vco.schemas.Rsvp.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.schemas.Rsvp
             * @static
             * @param {vco.schemas.IRsvp} message Rsvp message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Rsvp.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Rsvp message from the specified reader or buffer.
             * @function decode
             * @memberof vco.schemas.Rsvp
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.schemas.Rsvp} Rsvp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Rsvp.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.Rsvp();
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
                            message.eventCid = reader.bytes();
                            break;
                        }
                    case 3: {
                            message.status = reader.string();
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
             * Decodes a Rsvp message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.schemas.Rsvp
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.schemas.Rsvp} Rsvp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Rsvp.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Rsvp message.
             * @function verify
             * @memberof vco.schemas.Rsvp
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Rsvp.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.schema != null && message.hasOwnProperty("schema"))
                    if (!$util.isString(message.schema))
                        return "schema: string expected";
                if (message.eventCid != null && message.hasOwnProperty("eventCid"))
                    if (!(message.eventCid && typeof message.eventCid.length === "number" || $util.isString(message.eventCid)))
                        return "eventCid: buffer expected";
                if (message.status != null && message.hasOwnProperty("status"))
                    if (!$util.isString(message.status))
                        return "status: string expected";
                if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                    if (!$util.isInteger(message.timestampMs) && !(message.timestampMs && $util.isInteger(message.timestampMs.low) && $util.isInteger(message.timestampMs.high)))
                        return "timestampMs: integer|Long expected";
                return null;
            };

            /**
             * Creates a Rsvp message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.schemas.Rsvp
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.schemas.Rsvp} Rsvp
             */
            Rsvp.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.schemas.Rsvp)
                    return object;
                let message = new $root.vco.schemas.Rsvp();
                if (object.schema != null)
                    message.schema = String(object.schema);
                if (object.eventCid != null)
                    if (typeof object.eventCid === "string")
                        $util.base64.decode(object.eventCid, message.eventCid = $util.newBuffer($util.base64.length(object.eventCid)), 0);
                    else if (object.eventCid.length >= 0)
                        message.eventCid = object.eventCid;
                if (object.status != null)
                    message.status = String(object.status);
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
             * Creates a plain object from a Rsvp message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.schemas.Rsvp
             * @static
             * @param {vco.schemas.Rsvp} message Rsvp
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Rsvp.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.schema = "";
                    if (options.bytes === String)
                        object.eventCid = "";
                    else {
                        object.eventCid = [];
                        if (options.bytes !== Array)
                            object.eventCid = $util.newBuffer(object.eventCid);
                    }
                    object.status = "";
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.timestampMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.timestampMs = options.longs === String ? "0" : 0;
                }
                if (message.schema != null && message.hasOwnProperty("schema"))
                    object.schema = message.schema;
                if (message.eventCid != null && message.hasOwnProperty("eventCid"))
                    object.eventCid = options.bytes === String ? $util.base64.encode(message.eventCid, 0, message.eventCid.length) : options.bytes === Array ? Array.prototype.slice.call(message.eventCid) : message.eventCid;
                if (message.status != null && message.hasOwnProperty("status"))
                    object.status = message.status;
                if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                    if (typeof message.timestampMs === "number")
                        object.timestampMs = options.longs === String ? String(message.timestampMs) : message.timestampMs;
                    else
                        object.timestampMs = options.longs === String ? $util.Long.prototype.toString.call(message.timestampMs) : options.longs === Number ? new $util.LongBits(message.timestampMs.low >>> 0, message.timestampMs.high >>> 0).toNumber() : message.timestampMs;
                return object;
            };

            /**
             * Converts this Rsvp to JSON.
             * @function toJSON
             * @memberof vco.schemas.Rsvp
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Rsvp.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Rsvp
             * @function getTypeUrl
             * @memberof vco.schemas.Rsvp
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Rsvp.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.schemas.Rsvp";
            };

            return Rsvp;
        })();

        return schemas;
    })();

    return vco;
})();

export { $root as default };

export const Rsvp = vco.schemas.Rsvp;
