/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["vco-schemas-coordination/event"] || ($protobuf.roots["vco-schemas-coordination/event"] = {});

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

        schemas.Event = (function() {

            /**
             * Properties of an Event.
             * @memberof vco.schemas
             * @interface IEvent
             * @property {string|null} [schema] Event schema
             * @property {string|null} [title] Event title
             * @property {string|null} [description] Event description
             * @property {number|Long|null} [startMs] Event startMs
             * @property {number|Long|null} [endMs] Event endMs
             * @property {string|null} [location] Event location
             * @property {Uint8Array|null} [previousCid] Event previousCid
             */

            /**
             * Constructs a new Event.
             * @memberof vco.schemas
             * @classdesc Represents an Event.
             * @implements IEvent
             * @constructor
             * @param {vco.schemas.IEvent=} [properties] Properties to set
             */
            function Event(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Event schema.
             * @member {string} schema
             * @memberof vco.schemas.Event
             * @instance
             */
            Event.prototype.schema = "";

            /**
             * Event title.
             * @member {string} title
             * @memberof vco.schemas.Event
             * @instance
             */
            Event.prototype.title = "";

            /**
             * Event description.
             * @member {string} description
             * @memberof vco.schemas.Event
             * @instance
             */
            Event.prototype.description = "";

            /**
             * Event startMs.
             * @member {number|Long} startMs
             * @memberof vco.schemas.Event
             * @instance
             */
            Event.prototype.startMs = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Event endMs.
             * @member {number|Long} endMs
             * @memberof vco.schemas.Event
             * @instance
             */
            Event.prototype.endMs = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Event location.
             * @member {string} location
             * @memberof vco.schemas.Event
             * @instance
             */
            Event.prototype.location = "";

            /**
             * Event previousCid.
             * @member {Uint8Array} previousCid
             * @memberof vco.schemas.Event
             * @instance
             */
            Event.prototype.previousCid = $util.newBuffer([]);

            /**
             * Creates a new Event instance using the specified properties.
             * @function create
             * @memberof vco.schemas.Event
             * @static
             * @param {vco.schemas.IEvent=} [properties] Properties to set
             * @returns {vco.schemas.Event} Event instance
             */
            Event.create = function create(properties) {
                return new Event(properties);
            };

            /**
             * Encodes the specified Event message. Does not implicitly {@link vco.schemas.Event.verify|verify} messages.
             * @function encode
             * @memberof vco.schemas.Event
             * @static
             * @param {vco.schemas.IEvent} message Event message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Event.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.schema != null && Object.hasOwnProperty.call(message, "schema"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.schema);
                if (message.title != null && Object.hasOwnProperty.call(message, "title"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.title);
                if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
                if (message.startMs != null && Object.hasOwnProperty.call(message, "startMs"))
                    writer.uint32(/* id 4, wireType 0 =*/32).int64(message.startMs);
                if (message.endMs != null && Object.hasOwnProperty.call(message, "endMs"))
                    writer.uint32(/* id 5, wireType 0 =*/40).int64(message.endMs);
                if (message.location != null && Object.hasOwnProperty.call(message, "location"))
                    writer.uint32(/* id 6, wireType 2 =*/50).string(message.location);
                if (message.previousCid != null && Object.hasOwnProperty.call(message, "previousCid"))
                    writer.uint32(/* id 7, wireType 2 =*/58).bytes(message.previousCid);
                return writer;
            };

            /**
             * Encodes the specified Event message, length delimited. Does not implicitly {@link vco.schemas.Event.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.schemas.Event
             * @static
             * @param {vco.schemas.IEvent} message Event message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Event.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an Event message from the specified reader or buffer.
             * @function decode
             * @memberof vco.schemas.Event
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.schemas.Event} Event
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Event.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.Event();
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
                            message.startMs = reader.int64();
                            break;
                        }
                    case 5: {
                            message.endMs = reader.int64();
                            break;
                        }
                    case 6: {
                            message.location = reader.string();
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
             * Decodes an Event message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.schemas.Event
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.schemas.Event} Event
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Event.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Event message.
             * @function verify
             * @memberof vco.schemas.Event
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Event.verify = function verify(message) {
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
                if (message.startMs != null && message.hasOwnProperty("startMs"))
                    if (!$util.isInteger(message.startMs) && !(message.startMs && $util.isInteger(message.startMs.low) && $util.isInteger(message.startMs.high)))
                        return "startMs: integer|Long expected";
                if (message.endMs != null && message.hasOwnProperty("endMs"))
                    if (!$util.isInteger(message.endMs) && !(message.endMs && $util.isInteger(message.endMs.low) && $util.isInteger(message.endMs.high)))
                        return "endMs: integer|Long expected";
                if (message.location != null && message.hasOwnProperty("location"))
                    if (!$util.isString(message.location))
                        return "location: string expected";
                if (message.previousCid != null && message.hasOwnProperty("previousCid"))
                    if (!(message.previousCid && typeof message.previousCid.length === "number" || $util.isString(message.previousCid)))
                        return "previousCid: buffer expected";
                return null;
            };

            /**
             * Creates an Event message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.schemas.Event
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.schemas.Event} Event
             */
            Event.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.schemas.Event)
                    return object;
                let message = new $root.vco.schemas.Event();
                if (object.schema != null)
                    message.schema = String(object.schema);
                if (object.title != null)
                    message.title = String(object.title);
                if (object.description != null)
                    message.description = String(object.description);
                if (object.startMs != null)
                    if ($util.Long)
                        (message.startMs = $util.Long.fromValue(object.startMs)).unsigned = false;
                    else if (typeof object.startMs === "string")
                        message.startMs = parseInt(object.startMs, 10);
                    else if (typeof object.startMs === "number")
                        message.startMs = object.startMs;
                    else if (typeof object.startMs === "object")
                        message.startMs = new $util.LongBits(object.startMs.low >>> 0, object.startMs.high >>> 0).toNumber();
                if (object.endMs != null)
                    if ($util.Long)
                        (message.endMs = $util.Long.fromValue(object.endMs)).unsigned = false;
                    else if (typeof object.endMs === "string")
                        message.endMs = parseInt(object.endMs, 10);
                    else if (typeof object.endMs === "number")
                        message.endMs = object.endMs;
                    else if (typeof object.endMs === "object")
                        message.endMs = new $util.LongBits(object.endMs.low >>> 0, object.endMs.high >>> 0).toNumber();
                if (object.location != null)
                    message.location = String(object.location);
                if (object.previousCid != null)
                    if (typeof object.previousCid === "string")
                        $util.base64.decode(object.previousCid, message.previousCid = $util.newBuffer($util.base64.length(object.previousCid)), 0);
                    else if (object.previousCid.length >= 0)
                        message.previousCid = object.previousCid;
                return message;
            };

            /**
             * Creates a plain object from an Event message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.schemas.Event
             * @static
             * @param {vco.schemas.Event} message Event
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Event.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.schema = "";
                    object.title = "";
                    object.description = "";
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.startMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.startMs = options.longs === String ? "0" : 0;
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.endMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.endMs = options.longs === String ? "0" : 0;
                    object.location = "";
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
                if (message.startMs != null && message.hasOwnProperty("startMs"))
                    if (typeof message.startMs === "number")
                        object.startMs = options.longs === String ? String(message.startMs) : message.startMs;
                    else
                        object.startMs = options.longs === String ? $util.Long.prototype.toString.call(message.startMs) : options.longs === Number ? new $util.LongBits(message.startMs.low >>> 0, message.startMs.high >>> 0).toNumber() : message.startMs;
                if (message.endMs != null && message.hasOwnProperty("endMs"))
                    if (typeof message.endMs === "number")
                        object.endMs = options.longs === String ? String(message.endMs) : message.endMs;
                    else
                        object.endMs = options.longs === String ? $util.Long.prototype.toString.call(message.endMs) : options.longs === Number ? new $util.LongBits(message.endMs.low >>> 0, message.endMs.high >>> 0).toNumber() : message.endMs;
                if (message.location != null && message.hasOwnProperty("location"))
                    object.location = message.location;
                if (message.previousCid != null && message.hasOwnProperty("previousCid"))
                    object.previousCid = options.bytes === String ? $util.base64.encode(message.previousCid, 0, message.previousCid.length) : options.bytes === Array ? Array.prototype.slice.call(message.previousCid) : message.previousCid;
                return object;
            };

            /**
             * Converts this Event to JSON.
             * @function toJSON
             * @memberof vco.schemas.Event
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Event.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Event
             * @function getTypeUrl
             * @memberof vco.schemas.Event
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Event.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.schemas.Event";
            };

            return Event;
        })();

        return schemas;
    })();

    return vco;
})();

export { $root as default };

export const Event = vco.schemas.Event;
