/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["vco-schemas-social/report"] || ($protobuf.roots["vco-schemas-social/report"] = {});

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

        schemas.Report = (function() {

            /**
             * Properties of a Report.
             * @memberof vco.schemas
             * @interface IReport
             * @property {string|null} [schema] Report schema
             * @property {Uint8Array|null} [targetCid] Report targetCid
             * @property {vco.schemas.ReportReason|null} [reason] Report reason
             * @property {string|null} [detail] Report detail
             * @property {Uint8Array|null} [proofOfHarmCid] Report proofOfHarmCid
             * @property {number|Long|null} [timestampMs] Report timestampMs
             */

            /**
             * Constructs a new Report.
             * @memberof vco.schemas
             * @classdesc Represents a Report.
             * @implements IReport
             * @constructor
             * @param {vco.schemas.IReport=} [properties] Properties to set
             */
            function Report(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Report schema.
             * @member {string} schema
             * @memberof vco.schemas.Report
             * @instance
             */
            Report.prototype.schema = "";

            /**
             * Report targetCid.
             * @member {Uint8Array} targetCid
             * @memberof vco.schemas.Report
             * @instance
             */
            Report.prototype.targetCid = $util.newBuffer([]);

            /**
             * Report reason.
             * @member {vco.schemas.ReportReason} reason
             * @memberof vco.schemas.Report
             * @instance
             */
            Report.prototype.reason = 0;

            /**
             * Report detail.
             * @member {string} detail
             * @memberof vco.schemas.Report
             * @instance
             */
            Report.prototype.detail = "";

            /**
             * Report proofOfHarmCid.
             * @member {Uint8Array} proofOfHarmCid
             * @memberof vco.schemas.Report
             * @instance
             */
            Report.prototype.proofOfHarmCid = $util.newBuffer([]);

            /**
             * Report timestampMs.
             * @member {number|Long} timestampMs
             * @memberof vco.schemas.Report
             * @instance
             */
            Report.prototype.timestampMs = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Creates a new Report instance using the specified properties.
             * @function create
             * @memberof vco.schemas.Report
             * @static
             * @param {vco.schemas.IReport=} [properties] Properties to set
             * @returns {vco.schemas.Report} Report instance
             */
            Report.create = function create(properties) {
                return new Report(properties);
            };

            /**
             * Encodes the specified Report message. Does not implicitly {@link vco.schemas.Report.verify|verify} messages.
             * @function encode
             * @memberof vco.schemas.Report
             * @static
             * @param {vco.schemas.IReport} message Report message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Report.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.schema != null && Object.hasOwnProperty.call(message, "schema"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.schema);
                if (message.targetCid != null && Object.hasOwnProperty.call(message, "targetCid"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.targetCid);
                if (message.reason != null && Object.hasOwnProperty.call(message, "reason"))
                    writer.uint32(/* id 3, wireType 0 =*/24).int32(message.reason);
                if (message.detail != null && Object.hasOwnProperty.call(message, "detail"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.detail);
                if (message.proofOfHarmCid != null && Object.hasOwnProperty.call(message, "proofOfHarmCid"))
                    writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.proofOfHarmCid);
                if (message.timestampMs != null && Object.hasOwnProperty.call(message, "timestampMs"))
                    writer.uint32(/* id 6, wireType 0 =*/48).int64(message.timestampMs);
                return writer;
            };

            /**
             * Encodes the specified Report message, length delimited. Does not implicitly {@link vco.schemas.Report.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.schemas.Report
             * @static
             * @param {vco.schemas.IReport} message Report message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Report.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Report message from the specified reader or buffer.
             * @function decode
             * @memberof vco.schemas.Report
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.schemas.Report} Report
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Report.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.Report();
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
                            message.targetCid = reader.bytes();
                            break;
                        }
                    case 3: {
                            message.reason = reader.int32();
                            break;
                        }
                    case 4: {
                            message.detail = reader.string();
                            break;
                        }
                    case 5: {
                            message.proofOfHarmCid = reader.bytes();
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
             * Decodes a Report message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.schemas.Report
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.schemas.Report} Report
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Report.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Report message.
             * @function verify
             * @memberof vco.schemas.Report
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Report.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.schema != null && message.hasOwnProperty("schema"))
                    if (!$util.isString(message.schema))
                        return "schema: string expected";
                if (message.targetCid != null && message.hasOwnProperty("targetCid"))
                    if (!(message.targetCid && typeof message.targetCid.length === "number" || $util.isString(message.targetCid)))
                        return "targetCid: buffer expected";
                if (message.reason != null && message.hasOwnProperty("reason"))
                    switch (message.reason) {
                    default:
                        return "reason: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                        break;
                    }
                if (message.detail != null && message.hasOwnProperty("detail"))
                    if (!$util.isString(message.detail))
                        return "detail: string expected";
                if (message.proofOfHarmCid != null && message.hasOwnProperty("proofOfHarmCid"))
                    if (!(message.proofOfHarmCid && typeof message.proofOfHarmCid.length === "number" || $util.isString(message.proofOfHarmCid)))
                        return "proofOfHarmCid: buffer expected";
                if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                    if (!$util.isInteger(message.timestampMs) && !(message.timestampMs && $util.isInteger(message.timestampMs.low) && $util.isInteger(message.timestampMs.high)))
                        return "timestampMs: integer|Long expected";
                return null;
            };

            /**
             * Creates a Report message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.schemas.Report
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.schemas.Report} Report
             */
            Report.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.schemas.Report)
                    return object;
                let message = new $root.vco.schemas.Report();
                if (object.schema != null)
                    message.schema = String(object.schema);
                if (object.targetCid != null)
                    if (typeof object.targetCid === "string")
                        $util.base64.decode(object.targetCid, message.targetCid = $util.newBuffer($util.base64.length(object.targetCid)), 0);
                    else if (object.targetCid.length >= 0)
                        message.targetCid = object.targetCid;
                switch (object.reason) {
                default:
                    if (typeof object.reason === "number") {
                        message.reason = object.reason;
                        break;
                    }
                    break;
                case "OTHER":
                case 0:
                    message.reason = 0;
                    break;
                case "SPAM":
                case 1:
                    message.reason = 1;
                    break;
                case "VIOLENCE":
                case 2:
                    message.reason = 2;
                    break;
                case "HARASSMENT":
                case 3:
                    message.reason = 3;
                    break;
                case "MALWARE":
                case 4:
                    message.reason = 4;
                    break;
                case "INTELLECTUAL_PROPERTY":
                case 5:
                    message.reason = 5;
                    break;
                case "MISINFORMATION":
                case 6:
                    message.reason = 6;
                    break;
                }
                if (object.detail != null)
                    message.detail = String(object.detail);
                if (object.proofOfHarmCid != null)
                    if (typeof object.proofOfHarmCid === "string")
                        $util.base64.decode(object.proofOfHarmCid, message.proofOfHarmCid = $util.newBuffer($util.base64.length(object.proofOfHarmCid)), 0);
                    else if (object.proofOfHarmCid.length >= 0)
                        message.proofOfHarmCid = object.proofOfHarmCid;
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
             * Creates a plain object from a Report message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.schemas.Report
             * @static
             * @param {vco.schemas.Report} message Report
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Report.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.schema = "";
                    if (options.bytes === String)
                        object.targetCid = "";
                    else {
                        object.targetCid = [];
                        if (options.bytes !== Array)
                            object.targetCid = $util.newBuffer(object.targetCid);
                    }
                    object.reason = options.enums === String ? "OTHER" : 0;
                    object.detail = "";
                    if (options.bytes === String)
                        object.proofOfHarmCid = "";
                    else {
                        object.proofOfHarmCid = [];
                        if (options.bytes !== Array)
                            object.proofOfHarmCid = $util.newBuffer(object.proofOfHarmCid);
                    }
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.timestampMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.timestampMs = options.longs === String ? "0" : 0;
                }
                if (message.schema != null && message.hasOwnProperty("schema"))
                    object.schema = message.schema;
                if (message.targetCid != null && message.hasOwnProperty("targetCid"))
                    object.targetCid = options.bytes === String ? $util.base64.encode(message.targetCid, 0, message.targetCid.length) : options.bytes === Array ? Array.prototype.slice.call(message.targetCid) : message.targetCid;
                if (message.reason != null && message.hasOwnProperty("reason"))
                    object.reason = options.enums === String ? $root.vco.schemas.ReportReason[message.reason] === undefined ? message.reason : $root.vco.schemas.ReportReason[message.reason] : message.reason;
                if (message.detail != null && message.hasOwnProperty("detail"))
                    object.detail = message.detail;
                if (message.proofOfHarmCid != null && message.hasOwnProperty("proofOfHarmCid"))
                    object.proofOfHarmCid = options.bytes === String ? $util.base64.encode(message.proofOfHarmCid, 0, message.proofOfHarmCid.length) : options.bytes === Array ? Array.prototype.slice.call(message.proofOfHarmCid) : message.proofOfHarmCid;
                if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                    if (typeof message.timestampMs === "number")
                        object.timestampMs = options.longs === String ? String(message.timestampMs) : message.timestampMs;
                    else
                        object.timestampMs = options.longs === String ? $util.Long.prototype.toString.call(message.timestampMs) : options.longs === Number ? new $util.LongBits(message.timestampMs.low >>> 0, message.timestampMs.high >>> 0).toNumber() : message.timestampMs;
                return object;
            };

            /**
             * Converts this Report to JSON.
             * @function toJSON
             * @memberof vco.schemas.Report
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Report.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Report
             * @function getTypeUrl
             * @memberof vco.schemas.Report
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Report.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.schemas.Report";
            };

            return Report;
        })();

        /**
         * ReportReason enum.
         * @name vco.schemas.ReportReason
         * @enum {number}
         * @property {number} OTHER=0 OTHER value
         * @property {number} SPAM=1 SPAM value
         * @property {number} VIOLENCE=2 VIOLENCE value
         * @property {number} HARASSMENT=3 HARASSMENT value
         * @property {number} MALWARE=4 MALWARE value
         * @property {number} INTELLECTUAL_PROPERTY=5 INTELLECTUAL_PROPERTY value
         * @property {number} MISINFORMATION=6 MISINFORMATION value
         */
        schemas.ReportReason = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "OTHER"] = 0;
            values[valuesById[1] = "SPAM"] = 1;
            values[valuesById[2] = "VIOLENCE"] = 2;
            values[valuesById[3] = "HARASSMENT"] = 3;
            values[valuesById[4] = "MALWARE"] = 4;
            values[valuesById[5] = "INTELLECTUAL_PROPERTY"] = 5;
            values[valuesById[6] = "MISINFORMATION"] = 6;
            return values;
        })();

        return schemas;
    })();

    return vco;
})();

export { $root as default };

export const Report = vco.schemas.Report;
export const ReportReason = vco.schemas.ReportReason;
