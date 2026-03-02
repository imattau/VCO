/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["vco-schemas-social/notification"] || ($protobuf.roots["vco-schemas-social/notification"] = {});

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

        schemas.Notification = (function() {

            /**
             * Properties of a Notification.
             * @memberof vco.schemas
             * @interface INotification
             * @property {string|null} [schema] Notification schema
             * @property {vco.schemas.Notification.Type|null} [type] Notification type
             * @property {Uint8Array|null} [actorCid] Notification actorCid
             * @property {Uint8Array|null} [targetCid] Notification targetCid
             * @property {string|null} [summary] Notification summary
             * @property {number|Long|null} [timestampMs] Notification timestampMs
             */

            /**
             * Constructs a new Notification.
             * @memberof vco.schemas
             * @classdesc Represents a Notification.
             * @implements INotification
             * @constructor
             * @param {vco.schemas.INotification=} [properties] Properties to set
             */
            function Notification(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Notification schema.
             * @member {string} schema
             * @memberof vco.schemas.Notification
             * @instance
             */
            Notification.prototype.schema = "";

            /**
             * Notification type.
             * @member {vco.schemas.Notification.Type} type
             * @memberof vco.schemas.Notification
             * @instance
             */
            Notification.prototype.type = 0;

            /**
             * Notification actorCid.
             * @member {Uint8Array} actorCid
             * @memberof vco.schemas.Notification
             * @instance
             */
            Notification.prototype.actorCid = $util.newBuffer([]);

            /**
             * Notification targetCid.
             * @member {Uint8Array} targetCid
             * @memberof vco.schemas.Notification
             * @instance
             */
            Notification.prototype.targetCid = $util.newBuffer([]);

            /**
             * Notification summary.
             * @member {string} summary
             * @memberof vco.schemas.Notification
             * @instance
             */
            Notification.prototype.summary = "";

            /**
             * Notification timestampMs.
             * @member {number|Long} timestampMs
             * @memberof vco.schemas.Notification
             * @instance
             */
            Notification.prototype.timestampMs = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Creates a new Notification instance using the specified properties.
             * @function create
             * @memberof vco.schemas.Notification
             * @static
             * @param {vco.schemas.INotification=} [properties] Properties to set
             * @returns {vco.schemas.Notification} Notification instance
             */
            Notification.create = function create(properties) {
                return new Notification(properties);
            };

            /**
             * Encodes the specified Notification message. Does not implicitly {@link vco.schemas.Notification.verify|verify} messages.
             * @function encode
             * @memberof vco.schemas.Notification
             * @static
             * @param {vco.schemas.INotification} message Notification message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Notification.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.schema != null && Object.hasOwnProperty.call(message, "schema"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.schema);
                if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.type);
                if (message.actorCid != null && Object.hasOwnProperty.call(message, "actorCid"))
                    writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.actorCid);
                if (message.targetCid != null && Object.hasOwnProperty.call(message, "targetCid"))
                    writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.targetCid);
                if (message.summary != null && Object.hasOwnProperty.call(message, "summary"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.summary);
                if (message.timestampMs != null && Object.hasOwnProperty.call(message, "timestampMs"))
                    writer.uint32(/* id 6, wireType 0 =*/48).int64(message.timestampMs);
                return writer;
            };

            /**
             * Encodes the specified Notification message, length delimited. Does not implicitly {@link vco.schemas.Notification.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.schemas.Notification
             * @static
             * @param {vco.schemas.INotification} message Notification message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Notification.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Notification message from the specified reader or buffer.
             * @function decode
             * @memberof vco.schemas.Notification
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.schemas.Notification} Notification
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Notification.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.Notification();
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
                            message.type = reader.int32();
                            break;
                        }
                    case 3: {
                            message.actorCid = reader.bytes();
                            break;
                        }
                    case 4: {
                            message.targetCid = reader.bytes();
                            break;
                        }
                    case 5: {
                            message.summary = reader.string();
                            break;
                        }
                    case 6: {
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
             * Decodes a Notification message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.schemas.Notification
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.schemas.Notification} Notification
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Notification.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Notification message.
             * @function verify
             * @memberof vco.schemas.Notification
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Notification.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.schema != null && message.hasOwnProperty("schema"))
                    if (!$util.isString(message.schema))
                        return "schema: string expected";
                if (message.type != null && message.hasOwnProperty("type"))
                    switch (message.type) {
                    default:
                        return "type: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                        break;
                    }
                if (message.actorCid != null && message.hasOwnProperty("actorCid"))
                    if (!(message.actorCid && typeof message.actorCid.length === "number" || $util.isString(message.actorCid)))
                        return "actorCid: buffer expected";
                if (message.targetCid != null && message.hasOwnProperty("targetCid"))
                    if (!(message.targetCid && typeof message.targetCid.length === "number" || $util.isString(message.targetCid)))
                        return "targetCid: buffer expected";
                if (message.summary != null && message.hasOwnProperty("summary"))
                    if (!$util.isString(message.summary))
                        return "summary: string expected";
                if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                    if (!$util.isInteger(message.timestampMs) && !(message.timestampMs && $util.isInteger(message.timestampMs.low) && $util.isInteger(message.timestampMs.high)))
                        return "timestampMs: integer|Long expected";
                return null;
            };

            /**
             * Creates a Notification message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.schemas.Notification
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.schemas.Notification} Notification
             */
            Notification.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.schemas.Notification)
                    return object;
                let message = new $root.vco.schemas.Notification();
                if (object.schema != null)
                    message.schema = String(object.schema);
                switch (object.type) {
                default:
                    if (typeof object.type === "number") {
                        message.type = object.type;
                        break;
                    }
                    break;
                case "UNKNOWN":
                case 0:
                    message.type = 0;
                    break;
                case "DM":
                case 1:
                    message.type = 1;
                    break;
                case "POST_REPLY":
                case 2:
                    message.type = 2;
                    break;
                case "REACTION":
                case 3:
                    message.type = 3;
                    break;
                case "FOLLOW":
                case 4:
                    message.type = 4;
                    break;
                }
                if (object.actorCid != null)
                    if (typeof object.actorCid === "string")
                        $util.base64.decode(object.actorCid, message.actorCid = $util.newBuffer($util.base64.length(object.actorCid)), 0);
                    else if (object.actorCid.length >= 0)
                        message.actorCid = object.actorCid;
                if (object.targetCid != null)
                    if (typeof object.targetCid === "string")
                        $util.base64.decode(object.targetCid, message.targetCid = $util.newBuffer($util.base64.length(object.targetCid)), 0);
                    else if (object.targetCid.length >= 0)
                        message.targetCid = object.targetCid;
                if (object.summary != null)
                    message.summary = String(object.summary);
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
             * Creates a plain object from a Notification message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.schemas.Notification
             * @static
             * @param {vco.schemas.Notification} message Notification
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Notification.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.schema = "";
                    object.type = options.enums === String ? "UNKNOWN" : 0;
                    if (options.bytes === String)
                        object.actorCid = "";
                    else {
                        object.actorCid = [];
                        if (options.bytes !== Array)
                            object.actorCid = $util.newBuffer(object.actorCid);
                    }
                    if (options.bytes === String)
                        object.targetCid = "";
                    else {
                        object.targetCid = [];
                        if (options.bytes !== Array)
                            object.targetCid = $util.newBuffer(object.targetCid);
                    }
                    object.summary = "";
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.timestampMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.timestampMs = options.longs === String ? "0" : 0;
                }
                if (message.schema != null && message.hasOwnProperty("schema"))
                    object.schema = message.schema;
                if (message.type != null && message.hasOwnProperty("type"))
                    object.type = options.enums === String ? $root.vco.schemas.Notification.Type[message.type] === undefined ? message.type : $root.vco.schemas.Notification.Type[message.type] : message.type;
                if (message.actorCid != null && message.hasOwnProperty("actorCid"))
                    object.actorCid = options.bytes === String ? $util.base64.encode(message.actorCid, 0, message.actorCid.length) : options.bytes === Array ? Array.prototype.slice.call(message.actorCid) : message.actorCid;
                if (message.targetCid != null && message.hasOwnProperty("targetCid"))
                    object.targetCid = options.bytes === String ? $util.base64.encode(message.targetCid, 0, message.targetCid.length) : options.bytes === Array ? Array.prototype.slice.call(message.targetCid) : message.targetCid;
                if (message.summary != null && message.hasOwnProperty("summary"))
                    object.summary = message.summary;
                if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                    if (typeof message.timestampMs === "number")
                        object.timestampMs = options.longs === String ? String(message.timestampMs) : message.timestampMs;
                    else
                        object.timestampMs = options.longs === String ? $util.Long.prototype.toString.call(message.timestampMs) : options.longs === Number ? new $util.LongBits(message.timestampMs.low >>> 0, message.timestampMs.high >>> 0).toNumber() : message.timestampMs;
                return object;
            };

            /**
             * Converts this Notification to JSON.
             * @function toJSON
             * @memberof vco.schemas.Notification
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Notification.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Notification
             * @function getTypeUrl
             * @memberof vco.schemas.Notification
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Notification.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.schemas.Notification";
            };

            /**
             * Type enum.
             * @name vco.schemas.Notification.Type
             * @enum {number}
             * @property {number} UNKNOWN=0 UNKNOWN value
             * @property {number} DM=1 DM value
             * @property {number} POST_REPLY=2 POST_REPLY value
             * @property {number} REACTION=3 REACTION value
             * @property {number} FOLLOW=4 FOLLOW value
             */
            Notification.Type = (function() {
                const valuesById = {}, values = Object.create(valuesById);
                values[valuesById[0] = "UNKNOWN"] = 0;
                values[valuesById[1] = "DM"] = 1;
                values[valuesById[2] = "POST_REPLY"] = 2;
                values[valuesById[3] = "REACTION"] = 3;
                values[valuesById[4] = "FOLLOW"] = 4;
                return values;
            })();

            return Notification;
        })();

        return schemas;
    })();

    return vco;
})();

export { $root as default };

export const Notification = vco.schemas.Notification;
