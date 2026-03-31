/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["vco-schemas-social/repost"] || ($protobuf.roots["vco-schemas-social/repost"] = {});

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

        schemas.Repost = (function() {

            /**
             * Properties of a Repost.
             * @memberof vco.schemas
             * @interface IRepost
             * @property {string|null} [schema] Repost schema
             * @property {Uint8Array|null} [originalPostCid] Repost originalPostCid
             * @property {Uint8Array|null} [originalAuthorCid] Repost originalAuthorCid
             * @property {string|null} [commentary] Repost commentary
             * @property {number|Long|null} [timestampMs] Repost timestampMs
             */

            /**
             * Constructs a new Repost.
             * @memberof vco.schemas
             * @classdesc Represents a Repost.
             * @implements IRepost
             * @constructor
             * @param {vco.schemas.IRepost=} [properties] Properties to set
             */
            function Repost(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Repost schema.
             * @member {string} schema
             * @memberof vco.schemas.Repost
             * @instance
             */
            Repost.prototype.schema = "";

            /**
             * Repost originalPostCid.
             * @member {Uint8Array} originalPostCid
             * @memberof vco.schemas.Repost
             * @instance
             */
            Repost.prototype.originalPostCid = $util.newBuffer([]);

            /**
             * Repost originalAuthorCid.
             * @member {Uint8Array} originalAuthorCid
             * @memberof vco.schemas.Repost
             * @instance
             */
            Repost.prototype.originalAuthorCid = $util.newBuffer([]);

            /**
             * Repost commentary.
             * @member {string} commentary
             * @memberof vco.schemas.Repost
             * @instance
             */
            Repost.prototype.commentary = "";

            /**
             * Repost timestampMs.
             * @member {number|Long} timestampMs
             * @memberof vco.schemas.Repost
             * @instance
             */
            Repost.prototype.timestampMs = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Creates a new Repost instance using the specified properties.
             * @function create
             * @memberof vco.schemas.Repost
             * @static
             * @param {vco.schemas.IRepost=} [properties] Properties to set
             * @returns {vco.schemas.Repost} Repost instance
             */
            Repost.create = function create(properties) {
                return new Repost(properties);
            };

            /**
             * Encodes the specified Repost message. Does not implicitly {@link vco.schemas.Repost.verify|verify} messages.
             * @function encode
             * @memberof vco.schemas.Repost
             * @static
             * @param {vco.schemas.IRepost} message Repost message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Repost.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.schema != null && Object.hasOwnProperty.call(message, "schema"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.schema);
                if (message.originalPostCid != null && Object.hasOwnProperty.call(message, "originalPostCid"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.originalPostCid);
                if (message.originalAuthorCid != null && Object.hasOwnProperty.call(message, "originalAuthorCid"))
                    writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.originalAuthorCid);
                if (message.commentary != null && Object.hasOwnProperty.call(message, "commentary"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.commentary);
                if (message.timestampMs != null && Object.hasOwnProperty.call(message, "timestampMs"))
                    writer.uint32(/* id 5, wireType 0 =*/40).int64(message.timestampMs);
                return writer;
            };

            /**
             * Encodes the specified Repost message, length delimited. Does not implicitly {@link vco.schemas.Repost.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.schemas.Repost
             * @static
             * @param {vco.schemas.IRepost} message Repost message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Repost.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Repost message from the specified reader or buffer.
             * @function decode
             * @memberof vco.schemas.Repost
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.schemas.Repost} Repost
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Repost.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.Repost();
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
                            message.originalPostCid = reader.bytes();
                            break;
                        }
                    case 3: {
                            message.originalAuthorCid = reader.bytes();
                            break;
                        }
                    case 4: {
                            message.commentary = reader.string();
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
             * Decodes a Repost message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.schemas.Repost
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.schemas.Repost} Repost
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Repost.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Repost message.
             * @function verify
             * @memberof vco.schemas.Repost
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Repost.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.schema != null && message.hasOwnProperty("schema"))
                    if (!$util.isString(message.schema))
                        return "schema: string expected";
                if (message.originalPostCid != null && message.hasOwnProperty("originalPostCid"))
                    if (!(message.originalPostCid && typeof message.originalPostCid.length === "number" || $util.isString(message.originalPostCid)))
                        return "originalPostCid: buffer expected";
                if (message.originalAuthorCid != null && message.hasOwnProperty("originalAuthorCid"))
                    if (!(message.originalAuthorCid && typeof message.originalAuthorCid.length === "number" || $util.isString(message.originalAuthorCid)))
                        return "originalAuthorCid: buffer expected";
                if (message.commentary != null && message.hasOwnProperty("commentary"))
                    if (!$util.isString(message.commentary))
                        return "commentary: string expected";
                if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                    if (!$util.isInteger(message.timestampMs) && !(message.timestampMs && $util.isInteger(message.timestampMs.low) && $util.isInteger(message.timestampMs.high)))
                        return "timestampMs: integer|Long expected";
                return null;
            };

            /**
             * Creates a Repost message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.schemas.Repost
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.schemas.Repost} Repost
             */
            Repost.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.schemas.Repost)
                    return object;
                let message = new $root.vco.schemas.Repost();
                if (object.schema != null)
                    message.schema = String(object.schema);
                if (object.originalPostCid != null)
                    if (typeof object.originalPostCid === "string")
                        $util.base64.decode(object.originalPostCid, message.originalPostCid = $util.newBuffer($util.base64.length(object.originalPostCid)), 0);
                    else if (object.originalPostCid.length >= 0)
                        message.originalPostCid = object.originalPostCid;
                if (object.originalAuthorCid != null)
                    if (typeof object.originalAuthorCid === "string")
                        $util.base64.decode(object.originalAuthorCid, message.originalAuthorCid = $util.newBuffer($util.base64.length(object.originalAuthorCid)), 0);
                    else if (object.originalAuthorCid.length >= 0)
                        message.originalAuthorCid = object.originalAuthorCid;
                if (object.commentary != null)
                    message.commentary = String(object.commentary);
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
             * Creates a plain object from a Repost message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.schemas.Repost
             * @static
             * @param {vco.schemas.Repost} message Repost
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Repost.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.schema = "";
                    if (options.bytes === String)
                        object.originalPostCid = "";
                    else {
                        object.originalPostCid = [];
                        if (options.bytes !== Array)
                            object.originalPostCid = $util.newBuffer(object.originalPostCid);
                    }
                    if (options.bytes === String)
                        object.originalAuthorCid = "";
                    else {
                        object.originalAuthorCid = [];
                        if (options.bytes !== Array)
                            object.originalAuthorCid = $util.newBuffer(object.originalAuthorCid);
                    }
                    object.commentary = "";
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.timestampMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.timestampMs = options.longs === String ? "0" : 0;
                }
                if (message.schema != null && message.hasOwnProperty("schema"))
                    object.schema = message.schema;
                if (message.originalPostCid != null && message.hasOwnProperty("originalPostCid"))
                    object.originalPostCid = options.bytes === String ? $util.base64.encode(message.originalPostCid, 0, message.originalPostCid.length) : options.bytes === Array ? Array.prototype.slice.call(message.originalPostCid) : message.originalPostCid;
                if (message.originalAuthorCid != null && message.hasOwnProperty("originalAuthorCid"))
                    object.originalAuthorCid = options.bytes === String ? $util.base64.encode(message.originalAuthorCid, 0, message.originalAuthorCid.length) : options.bytes === Array ? Array.prototype.slice.call(message.originalAuthorCid) : message.originalAuthorCid;
                if (message.commentary != null && message.hasOwnProperty("commentary"))
                    object.commentary = message.commentary;
                if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                    if (typeof message.timestampMs === "number")
                        object.timestampMs = options.longs === String ? String(message.timestampMs) : message.timestampMs;
                    else
                        object.timestampMs = options.longs === String ? $util.Long.prototype.toString.call(message.timestampMs) : options.longs === Number ? new $util.LongBits(message.timestampMs.low >>> 0, message.timestampMs.high >>> 0).toNumber() : message.timestampMs;
                return object;
            };

            /**
             * Converts this Repost to JSON.
             * @function toJSON
             * @memberof vco.schemas.Repost
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Repost.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Repost
             * @function getTypeUrl
             * @memberof vco.schemas.Repost
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Repost.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.schemas.Repost";
            };

            return Repost;
        })();

        return schemas;
    })();

    return vco;
})();

export { $root as default };

export const Repost = vco.schemas.Repost;
